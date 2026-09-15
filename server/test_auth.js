require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('JWT_SECRET not found');
    process.exit(1);
}

// Mint testing tokens
const customerToken = jwt.sign({ user_id: '1', user_type: 'Customer' }, secret, { expiresIn: '1h' });
const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';
const employeeToken = jwt.sign({ user_id: '2', user_type: 'Employee', roles: ['admin'] }, secret, { expiresIn: '1h' });
const providerToken = jwt.sign({ user_id: '3', user_type: 'Service Provider' }, secret, { expiresIn: '1h' });

async function run() {
    console.log('1. Valid Customer JWT');
    const res1 = await fetch('http://localhost:5000/api/v1/customer/properties', {
        headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log('Expected: 200, Actual:', res1.status);
    console.log('Response:', JSON.stringify(await res1.json(), null, 2));

    console.log('\n2. No token');
    const res2 = await fetch('http://localhost:5000/api/v1/customer/properties');
    console.log('Expected: 401, Actual:', res2.status);

    console.log('\n3. Invalid token');
    const res3 = await fetch('http://localhost:5000/api/v1/customer/properties', {
        headers: { 'Authorization': `Bearer ${invalidToken}` }
    });
    console.log('Expected: 401, Actual:', res3.status);

    console.log('\n4. Valid Employee JWT');
    const res4 = await fetch('http://localhost:5000/api/v1/customer/properties', {
        headers: { 'Authorization': `Bearer ${employeeToken}` }
    });
    console.log('Expected: 403, Actual:', res4.status);

    console.log('\n5. Valid Service Provider JWT');
    const res5 = await fetch('http://localhost:5000/api/v1/customer/properties', {
        headers: { 'Authorization': `Bearer ${providerToken}` }
    });
    console.log('Expected: 403, Actual:', res5.status);
}

run();
