require('dotenv').config();
const { pool } = require('./config/db');
const customerModel = require('./models/Customer/customer.model');

async function runTests() {
    let mockUserId = null;
    let mockCustomerId = null;
    let mockPropertyId = null;
    let demandTypeSale = null;
    let demandTypeRent = null;
    
    try {
        console.log('--- Starting tests ---');
        
        // Setup mock data
        console.log('1. Setting up mock data...');
        const userRes = await pool.query(`INSERT INTO users (user_type_id, user_first_name, user_last_name, email, mobile, country, password_hash, is_active) VALUES (1, 'Test', 'User', 'test_demand@test.com', '9999999999', 'Pakistan', 'hash', true) RETURNING user_id`);
        mockUserId = userRes.rows[0].user_id;

        const custRes = await pool.query(`INSERT INTO customers (user_id, customer_first_name, customer_last_name, country_id, date_of_registration, mobile_allowed, web_allowed, is_active, creation_date_time, update_date_time) VALUES ($1, 'Test', 'Cust', 1, NOW(), true, true, true, NOW(), NOW()) RETURNING customer_id`, [mockUserId]);
        mockCustomerId = custRes.rows[0].customer_id;

        const propRes = await pool.query(`INSERT INTO properties (customer_id, area_id, property_type_id, property_use_id, property_location_id, property_size, property_size_uom, property_marla_size_id, creation_date_time, update_date_time, is_active) VALUES ($1, 1, 1, 1, 1, 10, 1, 1, NOW(), NOW(), true) RETURNING property_id`, [mockCustomerId]);
        mockPropertyId = propRes.rows[0].property_id;

        // Ensure Sale and Rent exist in demand types
        const dt1 = await pool.query(`SELECT demand_type_id FROM property_demand_types WHERE demand_type_english = 'Sale' AND is_active = true`);
        if (dt1.rowCount > 0) demandTypeSale = dt1.rows[0].demand_type_id;
        else {
            const i1 = await pool.query(`INSERT INTO property_demand_types (demand_type_english, is_active) VALUES ('Sale', true) RETURNING demand_type_id`);
            demandTypeSale = i1.rows[0].demand_type_id;
        }

        const dt2 = await pool.query(`SELECT demand_type_id FROM property_demand_types WHERE demand_type_english = 'Rent' AND is_active = true`);
        if (dt2.rowCount > 0) demandTypeRent = dt2.rows[0].demand_type_id;
        else {
            const i2 = await pool.query(`INSERT INTO property_demand_types (demand_type_english, is_active) VALUES ('Rent', true) RETURNING demand_type_id`);
            demandTypeRent = i2.rows[0].demand_type_id;
        }

        // Test 1: First demand (Sale)
        console.log('Test 1: First demand (Sale) - 50,000,000');
        const res1 = await customerModel.addPropertyDemand(mockPropertyId, mockCustomerId, mockUserId, demandTypeSale, 50000000);
        console.log('Result:', res1);
        if (Number(res1.demand_amount) !== 50000000 || res1.discount_amount !== null || Number(res1.final_amount) !== 50000000) throw new Error('Test 1 failed');

        // Test 2: Price Reduction (Sale)
        console.log('Test 2: Price Reduction (Sale) - 45,000,000');
        const res2 = await customerModel.addPropertyDemand(mockPropertyId, mockCustomerId, mockUserId, demandTypeSale, 45000000);
        console.log('Result:', res2);
        if (Number(res2.demand_amount) !== 50000000 || Number(res2.discount_amount) !== 5000000 || Number(res2.discount_percent) !== 10 || Number(res2.final_amount) !== 45000000) throw new Error('Test 2 failed');

        // Verify EXACTLY one active demand
        const c1 = await pool.query('SELECT COUNT(*) AS cnt FROM property_demand WHERE property_id = $1 AND is_active = true', [mockPropertyId]);
        if (parseInt(c1.rows[0].cnt) !== 1) throw new Error('More than one active demand after Test 2');

        // Test 3: Price Increase (Sale)
        console.log('Test 3: Price Increase (Sale) - 48,000,000');
        const res3 = await customerModel.addPropertyDemand(mockPropertyId, mockCustomerId, mockUserId, demandTypeSale, 48000000);
        console.log('Result:', res3);
        if (Number(res3.demand_amount) !== 48000000 || res3.discount_amount !== null || Number(res3.final_amount) !== 48000000) throw new Error('Test 3 failed');

        // Test 4: Same Price (Sale)
        console.log('Test 4: Same Price (Sale) - 48,000,000');
        const res4 = await customerModel.addPropertyDemand(mockPropertyId, mockCustomerId, mockUserId, demandTypeSale, 48000000);
        console.log('Result:', res4);
        if (Number(res4.demand_amount) !== 48000000 || res4.discount_amount !== null || Number(res4.final_amount) !== 48000000) throw new Error('Test 4 failed');

        // Test 5: Switch to Rent
        console.log('Test 5: Switch to Rent - 150,000');
        const res5 = await customerModel.addPropertyDemand(mockPropertyId, mockCustomerId, mockUserId, demandTypeRent, 150000);
        console.log('Result:', res5);
        if (Number(res5.demand_amount) !== 150000 || res5.discount_amount !== null || Number(res5.final_amount) !== 150000) throw new Error('Test 5 failed');

        // Check history
        console.log('Test 6: Check history retention');
        const hist = await pool.query('SELECT demand_id, is_active FROM property_demand WHERE property_id = $1 ORDER BY demand_id', [mockPropertyId]);
        console.log('History rows:', hist.rows);
        if (hist.rows.length !== 5) throw new Error('Expected 5 history rows');
        if (hist.rows.filter(r => r.is_active).length !== 1) throw new Error('Expected exactly 1 active history row');
        
        // Test 7: Unauthorized Access
        console.log('Test 7: Unauthorized Access');
        try {
            await customerModel.addPropertyDemand(mockPropertyId, 9999999, mockUserId, demandTypeSale, 1000);
            throw new Error('Should have failed unauthorized');
        } catch (e) {
            console.log('Caught expected error:', e.message);
            if (e.statusCode !== 403) throw new Error('Expected 403');
        }

        console.log('--- All tests passed! ---');

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        console.log('Cleaning up...');
        if (mockPropertyId) await pool.query(`DELETE FROM property_demand WHERE property_id = $1`, [mockPropertyId]);
        if (mockPropertyId) await pool.query(`DELETE FROM properties WHERE property_id = $1`, [mockPropertyId]);
        if (mockCustomerId) await pool.query(`DELETE FROM customers WHERE customer_id = $1`, [mockCustomerId]);
        if (mockUserId) await pool.query(`DELETE FROM users WHERE user_id = $1`, [mockUserId]);
        pool.end();
    }
}

runTests();
