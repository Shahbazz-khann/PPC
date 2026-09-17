require('dotenv').config();
const { pool } = require('./config/db');

async function inspect() {
    try {
        const res = await pool.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('properties', 'areas', 'property_use', 'property_location_types', 'amenities', 'property_amenities')
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
inspect();
