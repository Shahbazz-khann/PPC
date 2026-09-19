const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD });

async function testApi() {
    try {
        // 1. Get a random user who has properties
        const userRes = await pool.query(`
            SELECT u.user_id, u.email 
            FROM users u
            JOIN customers c ON c.user_id = u.user_id
            JOIN properties p ON p.customer_id = c.customer_id
            LIMIT 1
        `);
        
        let userId;
        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].user_id;
            console.log(`Testing with user_id: ${userId}`);
        } else {
            console.log("No customer with properties found. Let's just find ANY customer.");
            const anyCust = await pool.query(`SELECT user_id FROM customers LIMIT 1`);
            if (anyCust.rows.length > 0) {
                userId = anyCust.rows[0].user_id;
                console.log(`Testing with customer user_id: ${userId}`);
            } else {
                console.log("No customers found at all in DB.");
                process.exit(1);
            }
        }

        // 2. Generate a token
        const token = jwt.sign(
            { user_id: userId, user_type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Function to test an endpoint
        const testEndpoint = async (propertyId, description) => {
            console.log(`\n--- Testing: ${description} (Property ID: ${propertyId}) ---`);
            const response = await fetch(`http://localhost:5000/api/v1/customer/verification-reports/${propertyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log("HTTP Status:", response.status);
            console.log("Response Body:", JSON.stringify(data, null, 2));
        };

        // 3. Make HTTP requests
        await testEndpoint('6', 'Owned property (Valid, Pending, No Verification)');
        await testEndpoint('99999', 'Non-existent property (Secure 404)');
        await testEndpoint('abc', 'Invalid property ID format');
        await testEndpoint('1.5', 'Invalid property ID format (Decimal)');
        await testEndpoint('0', 'Invalid property ID format (Zero)');

    } catch (err) {
        console.error("Test error:", err);
    } finally {
        pool.end();
    }
}

testApi();
