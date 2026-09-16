require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function parseCSV(csv) {
    const lines = csv.split(/\r?\n/);
    let blocks = {
        provinces: [],
        divisions: [],
        districts: [],
        tehsils: []
    };
    
    let currentBlock = null;
    let headers = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        // Remove possible BOM from the first line
        if (i === 0 && line.charCodeAt(0) === 0xFEFF) {
            line = line.substring(1);
        }
        
        const cols = line.split(',');
        const firstCol = cols[0].trim();
        
        if (firstCol === 'PROVINCE_ID') {
            currentBlock = 'provinces';
            headers = cols.map(c => c.trim());
        } else if (firstCol === 'DIVISION_ID') {
            currentBlock = 'divisions';
            headers = cols.map(c => c.trim());
        } else if (firstCol === 'DISTRICT_ID') {
            currentBlock = 'districts';
            headers = cols.map(c => c.trim());
        } else if (firstCol === 'TEHSIL_ID') {
            currentBlock = 'tehsils';
            headers = cols.map(c => c.trim());
        } else if (firstCol === 'COUNTRY_ID') {
            currentBlock = 'countries';
            headers = cols.map(c => c.trim());
        } else {
            if (currentBlock && currentBlock !== 'countries') {
                const row = {};
                cols.forEach((val, idx) => {
                    const v = val.trim();
                    row[headers[idx]] = v === '[NULL]' || v === '' ? null : v;
                });
                blocks[currentBlock].push(row);
            }
        }
    }
    return blocks;
}

async function run() {
    let client;
    try {
        console.log("Reading CSV data...");
        const rawData = fs.readFileSync(path.join(__dirname, 'data.csv'), 'utf8');
        console.log("Parsing CSV data...");
        const data = parseCSV(rawData);
        
        console.log("Parsed rows: Provinces(" + data.provinces.length + "), Divisions(" + data.divisions.length + "), Districts(" + data.districts.length + "), Tehsils(" + data.tehsils.length + ")");
        
        client = await pool.connect();
        
        // 1. Confirm tables are empty
        const tables = ['provinces', 'divisions', 'districts', 'tehsils'];
        for (const t of tables) {
            const count = (await client.query("SELECT COUNT(*) FROM " + t)).rows[0].count;
            if (parseInt(count) > 0) {
                throw new Error("Table " + t + " is not empty (contains " + count + " rows). Aborting.");
            }
        }
        
        // 2. Find Pakistan country_id
        const pakRes = await client.query("SELECT country_id FROM countries WHERE country_english = 'Pakistan'");
        if (pakRes.rows.length === 0) {
            throw new Error("Pakistan not found in countries table");
        }
        const liveCountryId = pakRes.rows[0].country_id;
        console.log("Found Pakistan in DB with country_id: " + liveCountryId);

        // 3. Begin transaction
        await client.query('BEGIN');
        
        const mappedProvinces = {}; // source_id -> live_id
        const mappedDivisions = {};
        const mappedDistricts = {};
        
        // 4. Insert Provinces
        for (const p of data.provinces) {
            const res = await client.query(
                "INSERT INTO provinces (province_english, province_urdu, country_id, is_active, province_abb) VALUES ($1, $2, $3, $4, $5) RETURNING province_id",
                [
                p.PROVINCE_NAME,
                p.PROVINCE_NAME_URDU || null,
                liveCountryId,
                p.RECORD_ACTIVE_STATUS === '1',
                p.province_abb || null
                ]
            );
            mappedProvinces[p.PROVINCE_ID] = res.rows[0].province_id;
        }
        console.log("Inserted " + Object.keys(mappedProvinces).length + " provinces.");
        
        // 5. Insert Divisions
        let divInserted = 0;
        for (const d of data.divisions) {
            if (!mappedProvinces[d.PROVINCE_ID]) {
                throw new Error("Province mapping not found for source province_id " + d.PROVINCE_ID);
            }
            const res = await client.query(
                "INSERT INTO divisions (division_english, division_urdu, province_id, is_active, division_abb) VALUES ($1, $2, $3, $4, $5) RETURNING division_id",
                [
                d.DIVISION_NAME,
                d.DIVISION_NAME_URDU || null,
                mappedProvinces[d.PROVINCE_ID],
                d.RECORD_ACTIVE_STATUS === '1',
                null // d.division_abb
                ]
            );
            mappedDivisions[d.DIVISION_ID] = res.rows[0].division_id;
            divInserted++;
        }
        console.log("Inserted " + divInserted + " divisions.");
        
        // 6. Insert Districts
        let distInserted = 0;
        for (const d of data.districts) {
            if (!mappedDivisions[d.DIVISION_ID]) {
                throw new Error("Division mapping not found for source division_id " + d.DIVISION_ID);
            }
            const res = await client.query(
                "INSERT INTO districts (district_english, district_urdu, division_id, is_active, district_abb) VALUES ($1, $2, $3, $4, $5) RETURNING district_id",
                [
                d.DISTRICT_NAME,
                d.DISTRICT_NAME_URDU || null,
                mappedDivisions[d.DIVISION_ID],
                d.RECORD_ACTIVE_STATUS === '1',
                null
                ]
            );
            mappedDistricts[d.DISTRICT_ID] = res.rows[0].district_id;
            distInserted++;
        }
        console.log("Inserted " + distInserted + " districts.");
        
        // 7. Insert Tehsils
        let tehsilInserted = 0;
        for (const t of data.tehsils) {
            if (!mappedDistricts[t.DISTRICT_ID]) {
                throw new Error("District mapping not found for source district_id " + t.DISTRICT_ID + " for tehsil " + t.TEHSIL_NAME);
            }
            const res = await client.query(
                "INSERT INTO tehsils (tehsil_english, tehsil_urdu, district_id, is_active, tehsil_abb) VALUES ($1, $2, $3, $4, $5) RETURNING tehsil_id",
                [
                t.TEHSIL_NAME,
                t.TEHSIL_NAME_URDU || null,
                mappedDistricts[t.DISTRICT_ID],
                t.RECORD_ACTIVE_STATUS === '1',
                null
                ]
            );
            tehsilInserted++;
        }
        console.log("Inserted " + tehsilInserted + " tehsils.");

        // 8. Verifications
        const pCount = (await client.query('SELECT COUNT(*) FROM provinces')).rows[0].count;
        const divCount = (await client.query('SELECT COUNT(*) FROM divisions')).rows[0].count;
        const distCount = (await client.query('SELECT COUNT(*) FROM districts')).rows[0].count;
        const tCount = (await client.query('SELECT COUNT(*) FROM tehsils')).rows[0].count;

        console.log("DB Counts: Provinces(" + pCount + "), Divisions(" + divCount + "), Districts(" + distCount + "), Tehsils(" + tCount + ")");

        if (pCount != 9 || divCount != 43 || distCount != 186 || tCount != 554) {
            throw new Error("Row count mismatch! Expected 9/43/186/554.");
        }

        const orphanDivs = (await client.query('SELECT COUNT(*) FROM divisions WHERE province_id IS NULL')).rows[0].count;
        const orphanDists = (await client.query('SELECT COUNT(*) FROM districts WHERE division_id IS NULL')).rows[0].count;
        const orphanTehsils = (await client.query('SELECT COUNT(*) FROM tehsils WHERE district_id IS NULL')).rows[0].count;
        const nonPakProvinces = (await client.query("SELECT COUNT(*) FROM provinces WHERE country_id != " + liveCountryId)).rows[0].count;

        console.log("Orphans: Divisions(" + orphanDivs + "), Districts(" + orphanDists + "), Tehsils(" + orphanTehsils + ")");
        console.log("Provinces not belonging to Pakistan: " + nonPakProvinces);

        if (parseInt(orphanDivs) > 0 || parseInt(orphanDists) > 0 || parseInt(orphanTehsils) > 0 || parseInt(nonPakProvinces) > 0) {
            throw new Error("Orphan validation failed.");
        }

        // Sample Hierarchy Check
        console.log("\\n--- Sample Hierarchy Check (Punjab -> Lahore) ---");
        const sampleQuery = "SELECT p.province_english, div.division_english, d.district_english, t.tehsil_english FROM provinces p JOIN divisions div ON div.province_id = p.province_id JOIN districts d ON d.division_id = div.division_id JOIN tehsils t ON t.district_id = d.district_id WHERE p.province_english = 'PUNJAB' AND div.division_english = 'Lahore Division' ORDER BY d.district_english, t.tehsil_english LIMIT 5;";
        
        const sampleRes = await client.query(sampleQuery);
        console.table(sampleRes.rows);

        await client.query('COMMIT');
        console.log("Transaction COMMITTED successfully.");

    } catch (e) {
        if (client) {
            await client.query('ROLLBACK');
            console.log("Transaction ROLLBACK executed.");
        }
        console.error("Error occurred:", e.message);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}
run();
