const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'your_super_secret_ppc_jwt_key_change_this'; // From .env

const makeRequest = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {}
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(data || '{}')
                });
            });
        });
        
        req.on('error', (e) => reject(e));
        req.end();
    });
};

async function testApi() {
    try {
        console.log('--- TEST 1: Valid Token (Customer 1) ---');
        const tokenUser1 = jwt.sign({
            user_id: 1,
            email: 'customer1@example.com',
            user_type_id: 1,
            user_type: 'Customer'
        }, JWT_SECRET, { expiresIn: '1h' });
        
        const res1 = await makeRequest('/api/v1/customer/profile', tokenUser1);
        console.log(`Status: ${res1.statusCode}`);
        console.log('Response:', JSON.stringify(res1.body, null, 2));

        console.log('\n--- TEST 2: Valid Token (Customer 2) ---');
        const tokenUser3 = jwt.sign({
            user_id: 3, // Assuming user 3 is Customer 2 based on previous comparison
            email: 'customer2@example.com',
            user_type_id: 1,
            user_type: 'Customer'
        }, JWT_SECRET, { expiresIn: '1h' });
        
        const res3 = await makeRequest('/api/v1/customer/profile', tokenUser3);
        console.log(`Status: ${res3.statusCode}`);
        console.log('Response:', JSON.stringify(res3.body, null, 2));
        
        console.log('\n--- TEST 3: Missing Token ---');
        const resMissing = await makeRequest('/api/v1/customer/profile', null);
        console.log(`Status: ${resMissing.statusCode}`);
        console.log('Response:', JSON.stringify(resMissing.body, null, 2));
        
        console.log('\n--- TEST 4: Invalid Token ---');
        const resInvalid = await makeRequest('/api/v1/customer/profile', 'invalid_token_xyz');
        console.log(`Status: ${resInvalid.statusCode}`);
        console.log('Response:', JSON.stringify(resInvalid.body, null, 2));
        
        console.log('\n--- TEST 5: User without Customer profile ---');
        const tokenUser99 = jwt.sign({
            user_id: 9999,
            email: 'nouser@example.com',
            user_type_id: 1,
            user_type: 'Customer'
        }, JWT_SECRET, { expiresIn: '1h' });
        
        const resNotFound = await makeRequest('/api/v1/customer/profile', tokenUser99);
        console.log(`Status: ${resNotFound.statusCode}`);
        console.log('Response:', JSON.stringify(resNotFound.body, null, 2));

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testApi();
