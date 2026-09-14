require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, port: process.env.DB_PORT });

async function run() {
    try {
        const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'approval_stages'`);
        console.log('approval_stages:', res.rows.map(r => r.column_name).join(', '));
        
        const req = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_requests'`);
        console.log('customer_requests:', req.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
