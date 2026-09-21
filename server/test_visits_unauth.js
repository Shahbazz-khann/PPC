const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/customer/property-visits',
  method: 'GET'
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
