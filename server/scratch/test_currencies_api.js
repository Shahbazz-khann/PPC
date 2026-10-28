require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testCurrenciesAPI() {
  try {
    const token = jwt.sign(
      { id: 14, user_id: 14, email: '2412473@szabist-isb.pk', role: 'admin', user_type: 'employee' },
      process.env.JWT_SECRET || 'ppc_secret_key_12345',
      { expiresIn: '1h' }
    );
    console.log('Testing GET http://localhost:5000/api/v1/admin/reference/finance/currencies...');

    const res = await fetch('http://localhost:5000/api/v1/admin/reference/finance/currencies', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    console.log('Status:', res.status);
    console.log('Success:', data.success);
    console.log('Total currencies returned:', data.data ? data.data.length : 0);
    console.log('First 3 currencies:');
    console.log(data.data ? data.data.slice(0, 3) : data);

    process.exit(0);
  } catch (err) {
    console.error('API Error:', err.message);
    process.exit(1);
  }
}

testCurrenciesAPI();
