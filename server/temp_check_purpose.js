require('dotenv').config();
const { pool } = require('./config/db');

async function checkCols() {
    try {
        const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'property_types'`);
        console.log("property_types columns:", res.rows.map(r => r.column_name));
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
checkCols();
