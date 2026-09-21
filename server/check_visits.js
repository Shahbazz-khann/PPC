require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ppc_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function checkRows() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM property_visits;');
        console.log('Row count:', res.rows[0].count);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkRows();
