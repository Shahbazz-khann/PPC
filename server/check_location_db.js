require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
    try {
        const tables = [
            'countries', 'provinces', 'divisions', 'districts', 'tehsils',
            'cities', 'societies', 'areas', 'property_locations'
        ];

        console.log("=== SCHEMA & ROW COUNTS ===");
        for (const table of tables) {
            console.log(`\n--- TABLE: ${table} ---`);
            
            // Check if table exists
            const tableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `, [table]);

            if (!tableExists.rows[0].exists) {
                console.log(`  [MISSING] Table does not exist.`);
                continue;
            }

            // Get row count
            const countRes = await pool.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`  Row count: ${countRes.rows[0].count}`);

            // Get columns
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            
            console.log(`  Columns:`);
            res.rows.forEach(r => console.log(`    ${r.column_name}: ${r.data_type}`));
            
            // Get constraints / FKs
            const fkRes = await pool.query(`
                SELECT
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1;
            `, [table]);

            if (fkRes.rows.length > 0) {
                console.log(`  Foreign Keys:`);
                fkRes.rows.forEach(r => console.log(`    ${r.column_name} -> ${r.foreign_table_name}(${r.foreign_column_name})`));
            } else {
                console.log(`  Foreign Keys: None`);
            }
            
            // Output sample rows if any exist
            if (parseInt(countRes.rows[0].count) > 0) {
                const sampleRes = await pool.query(`SELECT * FROM ${table} LIMIT 2`);
                console.log(`  Sample data: ${JSON.stringify(sampleRes.rows)}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
