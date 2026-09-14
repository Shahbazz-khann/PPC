const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = 'your_super_secret_ppc_jwt_key_change_this';

const makeRequest = (path, method, body, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        body: data ? JSON.parse(data) : {}
                    });
                } catch(e) {
                    resolve({
                        statusCode: res.statusCode,
                        body: data
                    });
                }
            });
        });
        
        req.on('error', (e) => reject(e));
        if (body) {
            req.write(JSON.stringify(body));
        }
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

        const validPayload = {
            customer_title_id: 1,
            first_name: "Test",
            middle_name: "Customer",
            last_name: "User",
            gender_id: 1,
            identity_type_id: 1,
            identity_number: "35202-1111111-1",
            country_id: 2,
            mobile: "+923001234567"
        };

        console.log(`\n--- TEST 1: Successful Update ---`);
        const res1 = await makeRequest('/api/v1/customer/profile', 'PUT', validPayload, token);
        console.log(`Status: ${res1.statusCode}`);
        console.log('Response:', JSON.stringify(res1.body, null, 2));

        console.log(`\n--- TEST 2: GET Profile Synchronization ---`);
        const res2 = await makeRequest('/api/v1/customer/profile', 'GET', null, token);
        console.log(`Status: ${res2.statusCode}`);
        console.log('Matched Name:', res2.body.data.first_name === "Test" && res2.body.data.last_name === "User");

        console.log(`\n--- TEST 3: /auth/me Synchronization ---`);
        const res3 = await makeRequest('/api/v1/auth/me', 'GET', null, token);
        console.log(`Status: ${res3.statusCode}`);
        console.log('User first_name:', res3.body.data.user_first_name);
        console.log('User mobile:', res3.body.data.mobile);
        console.log('User country:', res3.body.data.country);

        console.log(`\n--- TEST 4: Invalid Reference ID ---`);
        const invalidPayload = { ...validPayload, country_id: 9999 };
        const res4 = await makeRequest('/api/v1/customer/profile', 'PUT', invalidPayload, token);
        console.log(`Status: ${res4.statusCode}`);
        console.log('Response:', JSON.stringify(res4.body, null, 2));

        console.log(`\n--- TEST 5: Null Gender ---`);
        const nullGenderPayload = { ...validPayload, gender_id: "" };
        const res5 = await makeRequest('/api/v1/customer/profile', 'PUT', nullGenderPayload, token);
        console.log(`Status: ${res5.statusCode}`);
        console.log('Response:', JSON.stringify(res5.body, null, 2));

    } catch (err) {
        console.error('Test Failed:', err);
    }
}

testApi();
