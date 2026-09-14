const jwt = require('jsonwebtoken');
const http = require('http');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = 'your_super_secret_ppc_jwt_key_change_this';

// Dummy 1x1 JPEG image
const testJpegBuffer = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
  0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
  0x00, 0x03, 0x02, 0x02, 0x03, 0x02, 0x02, 0x03, 0x03, 0x03, 0x03, 0x04,
  0x03, 0x03, 0x04, 0x05, 0x08, 0x05, 0x05, 0x04, 0x04, 0x05, 0x0A, 0x07,
  0x07, 0x06, 0x08, 0x0C, 0x0A, 0x0C, 0x0C, 0x0B, 0x0A, 0x0B, 0x0B, 0x0D,
  0x0E, 0x12, 0x10, 0x0D, 0x0E, 0x11, 0x0E, 0x0B, 0x0B, 0x10, 0x16, 0x10,
  0x11, 0x13, 0x14, 0x15, 0x15, 0x15, 0x0C, 0x0F, 0x17, 0x18, 0x16, 0x14,
  0x18, 0x12, 0x14, 0x15, 0x14, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
  0x37, 0xFF, 0xD9
]);

const uploadFile = (pathStr, method, token, fileBuffer, filename, contentType) => {
    return new Promise((resolve, reject) => {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: pathStr,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });

        req.on('error', reject);

        req.write(`--${boundary}\r\n`);
        req.write(`Content-Disposition: form-data; name="profileImage"; filename="${filename}"\r\n`);
        req.write(`Content-Type: ${contentType}\r\n\r\n`);
        if (fileBuffer) req.write(fileBuffer);
        req.write(`\r\n--${boundary}--\r\n`);
        req.end();
    });
};

async function testUploads() {
    try {
        const token = jwt.sign({
            user_id: 1,
            email: 'customer1@example.com',
            user_type_id: 1,
            user_type: 'Customer'
        }, JWT_SECRET, { expiresIn: '1h' });

        console.log(`\n--- TEST 1: Valid JPEG Upload ---`);
        const res1 = await uploadFile('/api/v1/customer/profile-image', 'POST', token, testJpegBuffer, 'test.jpg', 'image/jpeg');
        console.log(`Status: ${res1.statusCode}`);
        console.log('Response:', res1.body);

        let bodyObj = {};
        try { bodyObj = JSON.parse(res1.body); } catch (e) {}
        
        console.log(`\n--- TEST 2: GET Profile Sync ---`);
        const options = { hostname: 'localhost', port: 5000, path: '/api/v1/customer/profile', headers: { 'Authorization': `Bearer ${token}` }};
        const res2 = await new Promise((res, rej) => http.get(options, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res({ body: d })); }).on('error', rej));
        const prof = JSON.parse(res2.body);
        console.log('Profile image URL matches:', prof.data.profile_image_url === bodyObj.data.profile_image_url);

        console.log(`\n--- TEST 3: Unsupported File Type (PDF) ---`);
        const res3 = await uploadFile('/api/v1/customer/profile-image', 'POST', token, testJpegBuffer, 'test.pdf', 'application/pdf');
        console.log(`Status: ${res3.statusCode}`);
        console.log('Response:', res3.body);
        
        console.log(`\n--- TEST 4: No File ---`);
        // Just empty body
        const res4 = await new Promise((res) => {
            const req = http.request({ hostname: 'localhost', port: 5000, path: '/api/v1/customer/profile-image', method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }, (r) => { let d = ''; r.on('data', c => d+=c); r.on('end', () => res({statusCode: r.statusCode, body: d})); });
            req.end();
        });
        console.log(`Status: ${res4.statusCode}`);
        console.log('Response:', res4.body);

        console.log(`\n--- TEST 5: Missing Token ---`);
        const res5 = await uploadFile('/api/v1/customer/profile-image', 'POST', '', testJpegBuffer, 'test.jpg', 'image/jpeg');
        console.log(`Status: ${res5.statusCode}`);
        
        console.log(`\n--- TEST 6: Invalid Token ---`);
        const res6 = await uploadFile('/api/v1/customer/profile-image', 'POST', 'INVALIDTOKEN', testJpegBuffer, 'test.jpg', 'image/jpeg');
        console.log(`Status: ${res6.statusCode}`);
        
        console.log(`\n--- TEST 7: Replace old image ---`);
        const res7 = await uploadFile('/api/v1/customer/profile-image', 'POST', token, testJpegBuffer, 'test2.jpg', 'image/jpeg');
        console.log(`Status: ${res7.statusCode}`);
        console.log('Response:', res7.body);
        // Verify old image is deleted
        if (bodyObj?.data?.profile_image_url) {
            const oldPath = path.join(__dirname, '..', bodyObj.data.profile_image_url);
            console.log('Old image exists (should be false):', fs.existsSync(oldPath));
        }
        
    } catch (e) {
        console.error(e);
    }
}
testUploads();
