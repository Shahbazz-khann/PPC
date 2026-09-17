require('dotenv').config();
const { pool } = require('./config/db');

async function runE2E() {
    console.log("=== STARTING E2E VERIFICATION ===");
    
    const userId = 1;
    const customerId = 1;
    const propertyId = 1;

    console.log(`Using existing property ${propertyId} for customer ${customerId}`);

    // Clear existing demands for this property to start fresh
    await pool.query(`DELETE FROM property_demand WHERE property_id = $1`, [propertyId]);

    console.log(`Created property ${propertyId} for customer ${customerId}`);

    // Generate JWT token for this user to hit the API
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ user_id: userId, user_type: 'customer' }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' });
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 2. Fetch reference API
    console.log("1. Verifying /api/v1/reference/property-form");
    let res = await fetch('http://127.0.0.1:5000/api/v1/reference/property-form', { headers });
    let refBody = await res.json();
    const demandTypes = refBody.data.demandTypes;
    console.log("Demand Types:", demandTypes);
    const saleType = demandTypes.find(d => d.demand_type_english === 'Sale').demand_type_id;
    const rentType = demandTypes.find(d => d.demand_type_english === 'Rent').demand_type_id;

    // 3. Initial Sale: 50,000,000
    console.log(`2. Initial Sale: 50,000,000 (Sale ID: ${saleType})`);
    res = await fetch(`http://127.0.0.1:5000/api/v1/customer/properties/${propertyId}/demand`, {
        method: 'POST', headers, body: JSON.stringify({ demand_type_id: saleType, demand_amount: 50000000 })
    });
    console.log("Initial Response:", await res.json());

    let dbCheck = await pool.query(`SELECT * FROM property_demand WHERE property_id = $1 ORDER BY demand_id`, [propertyId]);
    console.log("DB after Initial:", dbCheck.rows);

    // 4. Reduce price to: 45,000,000
    console.log("3. Reduce price to 45,000,000");
    res = await fetch(`http://127.0.0.1:5000/api/v1/customer/properties/${propertyId}/demand`, {
        method: 'POST', headers, body: JSON.stringify({ demand_type_id: saleType, demand_amount: 45000000 })
    });
    console.log("Reduce Response:", await res.json());
    dbCheck = await pool.query(`SELECT * FROM property_demand WHERE property_id = $1 ORDER BY demand_id`, [propertyId]);
    console.log("DB after Reduce:", dbCheck.rows);

    // 5. Increase price to: 48,000,000
    console.log("4. Increase price to 48,000,000");
    res = await fetch(`http://127.0.0.1:5000/api/v1/customer/properties/${propertyId}/demand`, {
        method: 'POST', headers, body: JSON.stringify({ demand_type_id: saleType, demand_amount: 48000000 })
    });
    console.log("Increase Response:", await res.json());
    dbCheck = await pool.query(`SELECT * FROM property_demand WHERE property_id = $1 ORDER BY demand_id`, [propertyId]);
    console.log("DB after Increase:", dbCheck.rows);

    // 6. Change Sale -> Rent
    console.log("5. Change Sale -> Rent (150,000)");
    res = await fetch(`http://127.0.0.1:5000/api/v1/customer/properties/${propertyId}/demand`, {
        method: 'POST', headers, body: JSON.stringify({ demand_type_id: rentType, demand_amount: 150000 })
    });
    console.log("Rent Response:", await res.json());
    dbCheck = await pool.query(`SELECT * FROM property_demand WHERE property_id = $1 ORDER BY demand_id`, [propertyId]);
    console.log("DB after Rent Switch:", dbCheck.rows);

    // Verify exactly one is_active = true
    const activeDemands = await pool.query(`SELECT * FROM property_demand WHERE property_id = $1 AND is_active = true`, [propertyId]);
    console.log("Active demands count:", activeDemands.rowCount);

    // Cleanup test data
    await pool.query(`DELETE FROM property_demand WHERE property_id = $1`, [propertyId]);
    
    await pool.end();
}

runE2E().catch(console.error);
