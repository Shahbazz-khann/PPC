require('dotenv').config();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const API = 'http://localhost:5000/api/v1';

const PIC_DIR = path.join(__dirname, 'uploads', 'property-pictures');
const VID_DIR = path.join(__dirname, 'uploads', 'property-videos');

// Helper to make files
function makeFile(sizeBytes, type) {
    return new Blob([Buffer.alloc(sizeBytes, 0x00)], { type });
}

async function runTests() {
    const user_id = 1;
    const token = jwt.sign({ user_id, user_type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const propertyId = 6; // using an existing property

    console.log('--- 1. Testing 7 pictures ---');
    const form7 = new FormData();
    for (let i = 0; i < 7; i++) {
        form7.append('pictures', makeFile(1024, 'image/jpeg'), `pic${i}.jpg`);
    }

    const res7 = await fetch(`${API}/customer/properties/${propertyId}/pictures`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form7
    });
    console.log('Status:', res7.status);
    console.log('Body:', await res7.json());

    console.log('\n--- 2. Testing picture > 5MB ---');
    const formBigPic = new FormData();
    // 6MB picture
    formBigPic.append('pictures', makeFile(6 * 1024 * 1024, 'image/jpeg'), 'bigpic.jpg');

    const resBigPic = await fetch(`${API}/customer/properties/${propertyId}/pictures`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formBigPic
    });
    console.log('Status:', resBigPic.status);
    console.log('Body:', await resBigPic.json());

    console.log('\n--- 3. Testing video > 50MB ---');
    const formBigVid = new FormData();
    // 51MB video
    formBigVid.append('video', makeFile(51 * 1024 * 1024, 'video/mp4'), 'bigvid.mp4');

    const resBigVid = await fetch(`${API}/customer/properties/${propertyId}/video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formBigVid
    });
    console.log('Status:', resBigVid.status);
    console.log('Body:', await resBigVid.json());

    console.log('\n--- 4. Filesystem check ---');
    const pics = fs.readdirSync(PIC_DIR);
    const vids = fs.readdirSync(VID_DIR);
    console.log('Pictures in dir:', pics.filter(p => p.includes('bigpic') || p.includes('pic')).length);
    console.log('Videos in dir:', vids.filter(v => v.includes('bigvid')).length);
}

runTests().catch(console.error);
