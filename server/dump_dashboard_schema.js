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
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        const tables = res.rows.map(r => r.table_name);
        console.log('--- ALL TABLES ---');
        console.log(tables.join(', '));
        
        const targetTables = tables.filter(t => 
            t.includes('propert') || 
            t.includes('request') || 
            t.includes('service') || 
            t.includes('status') || 
            t.includes('customer') ||
            t.includes('demand') ||
            t.includes('purpose')
        );

        for (const table of targetTables) {
            console.log(`\n--- TABLE: ${table} ---`);
            const cols = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
