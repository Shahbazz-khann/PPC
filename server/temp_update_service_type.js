require('dotenv').config();
const { pool } = require('./config/db');

async function updateServiceType() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log("Updating service type...");
        
        // Find the existing row
        const findRes = await client.query(`SELECT service_type_id FROM ppc_service_types WHERE service_type_english = 'Electrical & HVAC'`);
        if (findRes.rows.length === 0) {
            console.log("Error: 'Electrical & HVAC' not found. It might have already been updated.");
        } else {
            const typeId = findRes.rows[0].service_type_id;
            
            // Perform the update
            await client.query(`
                UPDATE ppc_service_types 
                SET service_type_english = 'Electrical & AC Services',
                    service_type_abb = 'EAC'
                WHERE service_type_id = $1
            `, [typeId]);
            console.log(`Successfully updated service type ID ${typeId}.`);
        }

        await client.query('COMMIT');
        
        // Verification checks
        console.log("\n========================================");
        console.log("VERIFICATION REPORT");
        console.log("========================================");
        
        // All service types
        const types = await client.query(`SELECT service_type_english, service_type_abb FROM ppc_service_types ORDER BY service_type_id`);
        console.log("\nCurrent ppc_service_types:");
        types.rows.forEach((r, i) => {
            console.log(`${i+1}. ${r.service_type_english} | ${r.service_type_abb}`);
        });
        
        // Mapped services for the updated type
        const mapped = await client.query(`
            SELECT s.service_english, t.service_type_english
            FROM ppc_services s
            JOIN ppc_service_types t ON s.service_type_id = t.service_type_id
            WHERE t.service_type_english = 'Electrical & AC Services'
        `);
        console.log("\nServices mapped to 'Electrical & AC Services':");
        mapped.rows.forEach(r => {
            console.log(`- ${r.service_english} -> ${r.service_type_english}`);
        });

        // Row counts
        const typeCount = await client.query(`SELECT count(*) FROM ppc_service_types`);
        const serviceCount = await client.query(`SELECT count(*) FROM ppc_services`);
        console.log(`\nFinal service-type count: ${typeCount.rows[0].count}`);
        console.log(`Final service count: ${serviceCount.rows[0].count}`);
        
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Failed to update.", e);
    } finally {
        client.release();
        await pool.end();
    }
}

updateServiceType();
