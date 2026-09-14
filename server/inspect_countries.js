const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'PPC_UPDATED',
    user: 'postgres',
    password: '8811287512@s'
});

async function run() {
    let output = '';
    
    const printTable = (data) => {
        if (!data || data.length === 0) {
            output += 'No data\n';
            return;
        }
        const keys = Object.keys(data[0]);
        output += keys.join(' | ') + '\n';
        output += keys.map(k => '---').join('-|-') + '\n';
        for (const row of data) {
            output += keys.map(k => String(row[k])).join(' | ') + '\n';
        }
    };

    try {
        // 1. Schema
        output += `\n--- 1. SCHEMA: countries ---\n`;
        const schema = await pool.query(`
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'countries'
            ORDER BY ordinal_position;
        `);
        printTable(schema.rows);
        
        output += `\n--- CONSTRAINTS FOR countries ---\n`;
        const constraints = await pool.query(`
            SELECT
                tc.constraint_name, 
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                LEFT JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.table_name = 'countries';
        `);
        printTable(constraints.rows);

        // 2. Records
        output += `\n--- 2. RECORDS: countries ---\n`;
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total, 
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as inactive
            FROM countries;
        `);
        printTable(stats.rows);
        
        const activeRecords = await pool.query(`SELECT * FROM countries WHERE is_active = true`);
        output += `\nActive Countries List:\n`;
        printTable(activeRecords.rows);

        // 3 & 4. Customers Relationship and Current Values
        output += `\n--- 3 & 4. CUSTOMER COUNTRY ---\n`;
        const customerOrphans = await pool.query(`
            SELECT c.customer_id, c.country_id 
            FROM customers c 
            LEFT JOIN countries co ON c.country_id = co.country_id 
            WHERE co.country_id IS NULL;
        `);
        output += `Orphaned Customer country_id records: ${customerOrphans.rows.length}\n`;

        const customerValues = await pool.query(`
            SELECT c.customer_id, c.country_id, co.country_english 
            FROM customers c 
            JOIN countries co ON c.country_id = co.country_id;
        `);
        output += `Valid Customer Country Mappings:\n`;
        printTable(customerValues.rows);

        // 5. Compare with users.country
        output += `\n--- 5. COMPARE USERS vs CUSTOMERS ---\n`;
        const comparison = await pool.query(`
            SELECT 
                c.customer_id, 
                u.user_id,
                u.country as user_country, 
                c.country_id as customer_country_id,
                co.country_english as customer_country_resolved,
                (u.country = co.country_english) as is_match
            FROM customers c
            JOIN users u ON c.user_id = u.user_id
            LEFT JOIN countries co ON c.country_id = co.country_id;
        `);
        printTable(comparison.rows);

        fs.writeFileSync('c:/Users/FT/.gemini/antigravity-ide/brain/a5027323-da89-4c06-b366-a1720c163dd7/scratch/countries_inspection.txt', output, 'utf8');

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
