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
        const columnsToCheck = ['property_locations', 'marla_sizes'];
        for (const table of columnsToCheck) {
            console.log(`\n--- ${table} ---`);
            const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
            res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
