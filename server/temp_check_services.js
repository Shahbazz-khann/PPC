require('dotenv').config();
const { pool } = require('./config/db');

async function checkServices() {
    try {
        const types = await pool.query('SELECT * FROM ppc_service_types');
        console.log("Current ppc_service_types:\n", JSON.stringify(types.rows, null, 2));

        const services = await pool.query('SELECT * FROM ppc_services');
        console.log("\nCurrent ppc_services:\n", JSON.stringify(services.rows, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
checkServices();
