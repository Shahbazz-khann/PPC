require('dotenv').config();
const { pool } = require('./config/db');
const requestsModel = require('./models/Customer/requests.model');

async function runTests() {
    console.log('--- STARTING CREATE REQUEST TESTS ---\n');
    let testUserId = 2; // Assuming a user id exists
    let testPropertyId = null;

    // 1. Get a valid user and property for testing
    const resUser = await pool.query(`
        SELECT cu.user_id, p.property_id 
        FROM properties p 
        JOIN customers cu ON p.customer_id = cu.customer_id 
        WHERE p.is_active = true LIMIT 1
    `);
    if (resUser.rowCount > 0) {
        testUserId = resUser.rows[0].user_id;
        testPropertyId = resUser.rows[0].property_id;
        console.log(`Using Test User ID: ${testUserId}, Property ID: ${testPropertyId}`);
    } else {
        console.log('No valid property found. Tests may fail.');
    }

    // Helper function
    const testCase = async (name, payload, expectSuccess) => {
        try {
            const reqId = await requestsModel.createCustomerRequest(testUserId, payload);
            console.log(`[${expectSuccess ? 'PASS' : 'FAIL'}] ${name} - Succeeded (Req ID: ${reqId})`);
            return reqId;
        } catch (e) {
            console.log(`[${!expectSuccess ? 'PASS' : 'FAIL'}] ${name} - Failed as expected: ${e.message}`);
            return null;
        }
    };

    // 2. Both purpose and service
    await testCase('Both Purpose & Service supplied', {
        requestPurposeId: 1,
        serviceId: 1,
        description: 'Test'
    }, false);

    // 3. Neither purpose nor service
    await testCase('Neither Purpose nor Service supplied', {
        description: 'Test'
    }, false);

    // 4. Missing description
    await testCase('Missing description', {
        requestPurposeId: 1,
        propertyId: testPropertyId
    }, false);

    // 5. Purchase Rejection (purpose_id 2 is usually Purchase)
    await testCase('Purchase request rejected', {
        requestPurposeId: 2,
        propertyId: testPropertyId,
        description: 'I want to purchase'
    }, false);

    // 6. Service request
    const srvRes = await pool.query('SELECT service_id FROM ppc_services WHERE is_active = true LIMIT 1');
    const validServiceId = srvRes.rows[0].service_id;
    const req1 = await testCase('Valid Service Request (no property)', {
        serviceId: validServiceId,
        description: 'Fix my sink'
    }, true);

    // 7. Renovation request (purpose_id 4 is usually Renovation)
    const req2 = await testCase('Valid Renovation Request', {
        requestPurposeId: 4,
        propertyId: testPropertyId,
        description: 'Renovate the kitchen'
    }, true);

    // 8. Verify DB inserts
    if (req1 && req2) {
        console.log('\n--- VERIFYING DB INSERTS ---');
        const dbRes = await pool.query(`
            SELECT cr.request_id, cr.request_description, st.request_status_english
            FROM customer_requests cr
            JOIN customer_request_status_history sh ON cr.request_id = sh.request_id
            JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
            WHERE cr.request_id IN ($1, $2)
        `, [req1, req2]);
        console.log('Inserted Rows:', dbRes.rows);

        // Cleanup
        await pool.query('DELETE FROM customer_request_status_history WHERE request_id IN ($1, $2)', [req1, req2]);
        await pool.query('DELETE FROM customer_requests WHERE request_id IN ($1, $2)', [req1, req2]);
        console.log('Cleanup completed.');
    }

    pool.end();
}

runTests();
