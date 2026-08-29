require('dotenv').config();
const { pool } = require('./config/db');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api/v1';
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_EMAIL = 'test_user_phase2a@example.com';
const TEST_PASSWORD = 'password123';

async function runTests() {
  console.log('--- STARTING PHASE 2A TESTS ---');
  let testUserJwt = null;
  let testUserId = null;

  try {
    // 0. Cleanup
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
    
    // Create Unified User
    const bcrypt = require('bcryptjs');
    const hashedPw = await bcrypt.hash(TEST_PASSWORD, 10);
    const insertUserRes = await pool.query(
      'INSERT INTO users (name, email, password, role_id, country, mobile_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
      ['Phase2a User', TEST_EMAIL, hashedPw, 5, 'USA', '1234567890']
    );
    testUserId = insertUserRes.rows[0].user_id;

    // Login to get JWT
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const loginData = await loginRes.json();
    testUserJwt = loginData.token;

    console.log('\\n[TEST 1] A new User can access all intended selling features.');
    try {
      const res = await fetch(`${API_BASE}/user/selling/properties`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (res.ok) console.log('✅ PASS: /user/selling/properties OK');
      else console.log('❌ FAIL: /user/selling/properties returned', res.status);
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 2] The same User can access all intended buying features.');
    try {
      const res = await fetch(`${API_BASE}/user/buying/transactions`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (res.ok) console.log('✅ PASS: /user/buying/transactions OK');
      else console.log('❌ FAIL: /user/buying/transactions returned', res.status);
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 3] Selling features only return the users own properties/data.');
    // The backend uses req.user.user_id = testUserId in getMyProperties
    try {
      const res = await fetch(`${API_BASE}/user/selling/properties`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      const data = await res.json();
      if (data.data && data.data.length === 0) {
        console.log('✅ PASS: User has 0 properties correctly isolated from other users.');
      } else {
        console.log('❌ FAIL: User received properties they do not own!');
      }
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 4] Buying features only return the users own requests/transactions/visits/data.');
    try {
      const res = await fetch(`${API_BASE}/user/buying/transactions`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      const data = await res.json();
      if (data.data && data.data.length === 0) {
        console.log('✅ PASS: User has 0 buying transactions correctly isolated.');
      } else {
        console.log('❌ FAIL: User received buying transactions they do not own!');
      }
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 5] A User cannot access another users private resources.');
    try {
      const res = await fetch(`${API_BASE}/user/selling/properties/1`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (res.status === 404) {
        console.log('✅ PASS: /user/selling/properties/1 returned 404 (Unauthorized)');
      } else {
        console.log('❌ FAIL: Expected 404, got', res.status);
      }
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 6] Existing Owner and Customer legacy routes still work.');
    const ownerToken = jwt.sign({ user_id: 2, role_name: 'owner' }, JWT_SECRET, { expiresIn: '1h' });
    try {
      const res = await fetch(`${API_BASE}/owner/properties/summary`, { headers: { Authorization: `Bearer ${ownerToken}` } });
      if (res.ok) console.log('✅ PASS: Legacy Owner route still works');
      else console.log('❌ FAIL: Legacy Owner route broke', res.status);
    } catch(e) { console.log('❌ FAIL:', e.message); }

    const custToken = jwt.sign({ user_id: 1, role_name: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
    try {
      const res = await fetch(`${API_BASE}/customer/transactions/summary`, { headers: { Authorization: `Bearer ${custToken}` } });
      if (res.ok) console.log('✅ PASS: Legacy Customer route still works');
      else console.log('❌ FAIL: Legacy Customer route broke', res.status);
    } catch(e) { console.log('❌ FAIL:', e.message); }

    console.log('\\n[TEST 7] Inspector and Admin remain isolated.');
    try {
      const res = await fetch(`${API_BASE}/inspector/dashboard`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (res.status === 403 || res.status === 401 || res.status === 404) {
        console.log('✅ PASS: User isolated from Inspector route (HTTP ' + res.status + ')');
      } else {
        console.log('❌ FAIL: User accessed Inspector route!', res.status);
      }
    } catch(e) { console.log('❌ FAIL:', e.message); }

  } catch (error) {
    console.error('Test script crashed:', error);
  } finally {
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
    pool.end();
  }
}

runTests();
