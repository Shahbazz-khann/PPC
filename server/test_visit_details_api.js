const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { user_id: 2, user_type: 'customer' },
    'your_super_secret_ppc_jwt_key_change_this',
    { expiresIn: '1h' }
);

function makeRequest(path, useAuth = true) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET',
            headers: {}
        };
        
        if (useAuth) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function runTests() {
    console.log("--- INVALID ID TESTS ---");
    const invalidIds = ['abc', '0', '-1', '1.5'];
    for (const id of invalidIds) {
        const res = await makeRequest(`/api/v1/customer/property-visits/${id}`);
        console.log(`Test ID ${id} -> Status: ${res.status}, Body: ${res.body}`);
    }

    console.log("\n--- NONEXISTENT ID TEST ---");
    const notFoundRes = await makeRequest(`/api/v1/customer/property-visits/99999`);
    console.log(`Test ID 99999 -> Status: ${notFoundRes.status}, Body: ${notFoundRes.body}`);

    console.log("\n--- UNAUTHENTICATED TEST ---");
    const unauthRes = await makeRequest(`/api/v1/customer/property-visits/99999`, false);
    console.log(`Test ID 99999 (No Auth) -> Status: ${unauthRes.status}, Body: ${unauthRes.body}`);
}

runTests();
