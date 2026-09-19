require('dotenv').config();
const { pool } = require('./config/db');
const requestsModel = require('./models/Customer/requests.model');

async function runTests() {
    console.log('--- STARTING SERVICE + PROPERTY TEST ---\n');
    let testUserId = 1; // Existing customer
    
    // Find an owned property
    const propRes = await pool.query('SELECT property_id, customer_id FROM properties WHERE customer_id = (SELECT customer_id FROM customers WHERE user_id = $1) LIMIT 1', [testUserId]);
    if (propRes.rows.length === 0) {
        console.log('No property found for user');
        process.exit(1);
    }
    const testPropertyId = propRes.rows[0].property_id;

    // Find a service
    const srvRes = await pool.query('SELECT service_id FROM ppc_services WHERE is_active = true LIMIT 1');
    const validServiceId = srvRes.rows[0].service_id;

    console.log(`Using Service ID: ${validServiceId}, Property ID: ${testPropertyId}`);

    // Create Request
    let reqId;
    try {
        reqId = await requestsModel.createCustomerRequest(testUserId, {
            serviceId: validServiceId,
            propertyId: testPropertyId,
            description: 'Fix my sink with property'
        });
        console.log(`[PASS] Created Service Request (ID: ${reqId})`);
    } catch (e) {
        console.log(`[FAIL] Failed to create: ${e.message}`);
        process.exit(1);
    }

    // Verify DB
    const dbRes = await pool.query(`
        SELECT service_id, property_id, request_purpose_id 
        FROM customer_requests 
        WHERE request_id = $1
    `, [reqId]);
    console.log('Inserted row:', dbRes.rows[0]);

    // Cleanup
    await pool.query('DELETE FROM customer_request_status_history WHERE request_id = $1', [reqId]);
    await pool.query('DELETE FROM customer_requests WHERE request_id = $1', [reqId]);
    console.log('Cleanup completed.');

    pool.end();
}

runTests();
