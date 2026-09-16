require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verify() {
  const client = await pool.connect();
  try {
    console.log("=== Location DB Verification ===");

    // 1. Row counts
    const counts = {};
    for (const table of ['countries', 'provinces', 'divisions', 'districts', 'tehsils']) {
      counts[table] = (await client.query("SELECT COUNT(*) FROM " + table)).rows[0].count;
    }
    console.log("1. Row Counts:", counts);

    // 2. Pakistan Check
    const pakRes = await client.query("SELECT * FROM countries WHERE country_english = 'Pakistan'");
    console.log("2. Pakistan Occurrences:", pakRes.rowCount);
    if (pakRes.rowCount > 0) {
      console.log("   Live Pakistan country_id:", pakRes.rows[0].country_id);
    }
    const liveCountryId = pakRes.rows[0].country_id;

    // 3. Provinces point to Pakistan
    const provCheck = await client.query("SELECT COUNT(*) FROM provinces WHERE country_id != $1", [liveCountryId]);
    console.log("3. Provinces NOT pointing to Pakistan:", provCheck.rows[0].count);

    // 4. Orphan checks
    const orphanDivs = await client.query("SELECT COUNT(*) FROM divisions WHERE province_id IS NULL");
    const orphanDists = await client.query("SELECT COUNT(*) FROM districts WHERE division_id IS NULL");
    const orphanTehsils = await client.query("SELECT COUNT(*) FROM tehsils WHERE district_id IS NULL");
    console.log("4. Orphan Checks:");
    console.log("   Orphan Divisions:", orphanDivs.rows[0].count);
    console.log("   Orphan Districts:", orphanDists.rows[0].count);
    console.log("   Orphan Tehsils:", orphanTehsils.rows[0].count);

    // 5. Duplicates, Nulls, Inactive
    console.log("5. Duplicate/Inactive/Null Checks:");
    const dupProv = await client.query("SELECT country_id, province_english, COUNT(*) FROM provinces GROUP BY country_id, province_english HAVING COUNT(*) > 1");
    const dupDiv = await client.query("SELECT province_id, division_english, COUNT(*) FROM divisions GROUP BY province_id, division_english HAVING COUNT(*) > 1");
    const dupDist = await client.query("SELECT division_id, district_english, COUNT(*) FROM districts GROUP BY division_id, district_english HAVING COUNT(*) > 1");
    const dupTehsil = await client.query("SELECT district_id, tehsil_english, COUNT(*) FROM tehsils GROUP BY district_id, tehsil_english HAVING COUNT(*) > 1");
    console.log("   Duplicates (Provinces/Divisions/Districts/Tehsils):", dupProv.rowCount, dupDiv.rowCount, dupDist.rowCount, dupTehsil.rowCount);

    const inactiveCounts = {};
    for (const table of ['provinces', 'divisions', 'districts', 'tehsils']) {
      inactiveCounts[table] = (await client.query("SELECT COUNT(*) FROM " + table + " WHERE is_active = false")).rows[0].count;
    }
    console.log("   Inactive Rows:", inactiveCounts);

    // 6. Sample Hierarchies
    console.log("6. Sample Hierarchies:");
    const queryHierarchy = async (provName) => {
      const q = "SELECT p.province_english, div.division_english, d.district_english, t.tehsil_english FROM provinces p JOIN divisions div ON div.province_id = p.province_id JOIN districts d ON d.division_id = div.division_id JOIN tehsils t ON t.district_id = d.district_id WHERE p.province_english = $1 LIMIT 3";
      const res = await client.query(q, [provName]);
      console.log("   -- " + provName + " --");
      res.rows.forEach(r => {
        console.log("   " + r.province_english + " -> " + r.division_english + " -> " + r.district_english + " -> " + r.tehsil_english);
      });
    };
    
    // Also explicitly get Lahore District tehsils to satisfy "Lahore Division -> Lahore District -> related Tehsils"
    const lahoreQ = "SELECT p.province_english, div.division_english, d.district_english, t.tehsil_english FROM provinces p JOIN divisions div ON div.province_id = p.province_id JOIN districts d ON d.division_id = div.division_id JOIN tehsils t ON t.district_id = d.district_id WHERE d.district_english = 'LAHORE' LIMIT 3";
    console.log("   -- Punjab (Lahore Specific) --");
    (await client.query(lahoreQ)).rows.forEach(r => {
        console.log("   " + r.province_english + " -> " + r.division_english + " -> " + r.district_english + " -> " + r.tehsil_english);
    });

    await queryHierarchy('SINDH');
    await queryHierarchy('KHYBER PAKHTUNKHWA');
    await queryHierarchy('BALOCHISTAN');

    // 7. PK/FK Constraints
    console.log("7. Checking Constraints:");
    const constraintsQ = "SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name IN ('provinces', 'divisions', 'districts', 'tehsils');";
    const constraints = await client.query(constraintsQ);
    constraints.rows.forEach(r => {
      console.log("   FK: " + r.table_name + "." + r.column_name + " -> " + r.foreign_table_name + "." + r.foreign_column_name);
    });

  } catch (err) {
    console.error("Error during verification:", err);
  } finally {
    client.release();
    pool.end();
  }
}

verify();
