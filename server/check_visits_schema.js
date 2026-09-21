require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ppc_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'property_visits'
            ORDER BY ordinal_position;
        `);
        console.log("SCHEMA for property_visits:");
        res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}) NULL: ${r.is_nullable}`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkSchema();
