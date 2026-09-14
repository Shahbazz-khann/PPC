const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'your_super_secret_ppc_jwt_key_change_this';

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
        const token = jwt.sign({
            user_id: 1,
            email: 'customer1@example.com',
            user_type_id: 1,
            user_type: 'Customer'
        }, JWT_SECRET, { expiresIn: '1h' });

        const endpoints = [
            '/api/v1/reference/identity-types',
            '/api/v1/reference/countries',
            '/api/v1/reference/titles',
            '/api/v1/reference/genders'
        ];

        for (const endpoint of endpoints) {
            console.log(`\n--- TEST: ${endpoint} ---`);
            const res = await makeRequest(endpoint, token);
            console.log(`Status: ${res.statusCode}`);
            console.log('Response:', JSON.stringify(res.body, null, 2));
        }

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testApi();
