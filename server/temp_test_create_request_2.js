require('dotenv').config();
const { pool } = require('./config/db');
const requestsModel = require('./models/Customer/requests.model');

async function runTests() {
    console.log('--- STARTING SECURITY TESTS ---\n');
    let testUserId = 1; // Assuming a user id exists
    let testPropertyId = 2; // Real property id

    const testCase = async (name, payload, expectSuccess) => {
        try {
            const reqId = await requestsModel.createCustomerRequest(testUserId, payload);
            console.log(`[${expectSuccess ? 'PASS' : 'FAIL'}] ${name} - Succeeded (Req ID: ${reqId})`);
            await pool.query('DELETE FROM customer_request_status_history WHERE request_id = $1', [reqId]);
            await pool.query('DELETE FROM customer_requests WHERE request_id = $1', [reqId]);
            return reqId;
        } catch (e) {
            console.log(`[${!expectSuccess ? 'PASS' : 'FAIL'}] ${name} - Failed as expected: ${e.message}`);
            return null;
        }
    };

    // Foreign Property
    await testCase('Foreign Property', {
        requestPurposeId: 4,
        propertyId: 9999,
        description: 'foreign'
    }, false);

    // Sale Demand Check (assuming property 2 doesn't have a sale demand)
    await testCase('Sale without Sale Demand', {
        requestPurposeId: 1, // Sale
        propertyId: testPropertyId,
        description: 'Test sale'
    }, false);

    pool.end();
}

runTests();
