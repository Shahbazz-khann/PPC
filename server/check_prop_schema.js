require('dotenv').config();
const { pool } = require('./config/db');

async function checkSchema() {
    try {
        const types = await pool.query("SELECT * FROM property_types");
        console.log("TYPES:", types.rows);
        
        const verifSchema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'property_verifications'
        `);
        console.log("VERIFICATIONS SCHEMA:", verifSchema.rows);
        
        const propSchema = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties'
        `);
        console.log("PROPERTIES SCHEMA:", propSchema.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkSchema();
