const http = require('http');

async function loginAndFetch() {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { user_id: 2, user_type: 'customer' },
    'your_super_secret_ppc_jwt_key_change_this',
    { expiresIn: '1h' }
  );

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/customer/property-visits',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Body: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`, e);
  });

  req.end();
}

loginAndFetch();
