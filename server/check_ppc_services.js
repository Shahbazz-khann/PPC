require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ppc_db',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function checkServices() {
    try {
        const query = `
            SELECT service_id, service_type_id, service_english, service_urdu, service_abb, is_active
            FROM ppc_services
            WHERE is_active = true
            ORDER BY service_id ASC
        `;
        const res = await pool.query(query);
        console.log("ACTIVE PPC SERVICES:");
        res.rows.forEach(r => console.log(`- [${r.service_id}] ${r.service_english} (Type: ${r.service_type_id})`));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkServices();
