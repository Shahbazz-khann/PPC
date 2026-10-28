
const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: '1', user_type: 'employee', roles: ['admin'] }, process.env.JWT_SECRET, { expiresIn: '1h' });

async function run() {
    const r1 = await fetch('http://localhost:5000/api/v1/admin/reference/location/tehsils?status=ACTIVE', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d1 = await r1.json();
    console.log(d1);
}
run();
