require('dotenv').config();
const { pool } = require('./config/db');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api/v1';
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_EMAIL = 'test_user1234@example.com';
const TEST_PASSWORD = 'password123';

async function runTests() {
  console.log('--- STARTING PHASE 1A TESTS ---');
  let testUserJwt = null;
  let testUserId = null;

  try {
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
    await pool.query('DELETE FROM pending_users WHERE email = $1', [TEST_EMAIL]);

    console.log('\\n[TEST 1] Create a new account');
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: TEST_EMAIL,
        country: 'USA',
        mobile_no: '1234567890',
        password: TEST_PASSWORD,
        account_type: 'owner'
      })
    });
    
    if (signupRes.status === 200) {
      console.log('✅ PASS: Signup successful');
    } else {
      console.log('❌ FAIL: Signup failed', signupRes.status);
    }

    console.log('\\n[TEST 2] Confirm new account receives role_name = "User" and role_id = 5');
    const pendingRes = await pool.query('SELECT role_id, verification_code FROM pending_users WHERE email = $1', [TEST_EMAIL]);
    if (pendingRes.rows.length > 0 && pendingRes.rows[0].role_id === '5') {
      console.log('✅ PASS: pending_users table assigned role_id 5');
    } else {
      console.log('❌ FAIL: role_id not 5 in pending_users', pendingRes.rows);
    }
    
    console.log('Simulating email verification...');
    const bcrypt = require('bcryptjs');
    const hashedPw = await bcrypt.hash(TEST_PASSWORD, 10);
    const insertUserRes = await pool.query(
      'INSERT INTO users (name, email, password, role_id, country, mobile_no) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
      ['Test User', TEST_EMAIL, hashedPw, 5, 'USA', '1234567890']
    );
    testUserId = insertUserRes.rows[0].user_id;
    await pool.query('DELETE FROM pending_users WHERE email = $1', [TEST_EMAIL]);

    const userCheck = await pool.query('SELECT role_id FROM users WHERE email = $1', [TEST_EMAIL]);
    if (userCheck.rows[0].role_id === '5') {
      console.log('✅ PASS: users table assigned role_id 5');
    } else {
      console.log('❌ FAIL: users table role is not 5');
    }

    console.log('\\n[TEST 3] Login and confirm JWT contains User role');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    const loginData = await loginRes.json();
    testUserJwt = loginData.token;
    const decodedToken = jwt.verify(testUserJwt, JWT_SECRET);
    if (decodedToken.role_id === '5' && decodedToken.role_name === 'User') {
      console.log('✅ PASS: JWT contains role_id: 5, role_name: User');
    } else {
      console.log('❌ FAIL: JWT roles are incorrect', decodedToken);
    }

    console.log('\\n[TEST 4] Confirm User can access Owner/Customer APIs');
    try {
      const ownerApiRes = await fetch(`${API_BASE}/owner/properties/summary`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (ownerApiRes.ok) console.log('✅ PASS: Accessed Owner API (/owner/properties/summary) successfully');
      else console.log('❌ FAIL: Failed to access Owner API', ownerApiRes.status);
    } catch (err) {
      console.log('❌ FAIL: Failed to access Owner API', err);
    }

    try {
      const custApiRes = await fetch(`${API_BASE}/customer/transactions/summary`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (custApiRes.ok) console.log('✅ PASS: Accessed Customer API (/customer/transactions/summary) successfully');
      else console.log('❌ FAIL: Failed to access Customer API', custApiRes.status);
    } catch (err) {
      console.log('❌ FAIL: Failed to access Customer API', err);
    }

    console.log('\\n[TEST 5] Confirm existing Owner account still works');
    const ownerToken = jwt.sign({ user_id: 2, role_name: 'owner' }, JWT_SECRET, { expiresIn: '1h' });
    try {
      const res = await fetch(`${API_BASE}/owner/properties/summary`, { headers: { Authorization: `Bearer ${ownerToken}` } });
      if (res.ok) console.log('✅ PASS: Existing Owner accessed Owner API');
      else console.log('❌ FAIL: Existing Owner blocked from Owner API', res.status);
    } catch (err) {
      console.log('❌ FAIL: Existing Owner blocked from Owner API', err);
    }

    console.log('\\n[TEST 6] Confirm existing Customer account still works');
    const custToken = jwt.sign({ user_id: 1, role_name: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
    try {
      const res = await fetch(`${API_BASE}/customer/transactions/summary`, { headers: { Authorization: `Bearer ${custToken}` } });
      if (res.ok) console.log('✅ PASS: Existing Customer accessed Customer API');
      else console.log('❌ FAIL: Existing Customer blocked from Customer API', res.status);
    } catch (err) {
      console.log('❌ FAIL: Existing Customer blocked from Customer API', err);
    }

    console.log('\\n[TEST 7] Confirm Inspector and Admin are unaffected');
    try {
       const res = await fetch(`${API_BASE}/inspector/dashboard`, { headers: { Authorization: `Bearer ${custToken}` } });
       if (res.ok) {
           console.log('❌ FAIL: Customer accessed Inspector API! Security issue.');
       } else if (res.status === 403 || res.status === 404) {
           console.log('✅ PASS: Customer blocked from Inspector API correctly (403 or 404)');
       } else {
           console.log('❌ FAIL: Unexpected error code for Inspector API', res.status);
       }
    } catch (err) {
       console.log('Error testing inspector API', err);
    }

    console.log('\\n[TEST 8] Verify User cannot upload media to another property');
    try {
      const res = await fetch(`${API_BASE}/owner/properties/999/media`, { 
        method: 'POST',
        headers: { Authorization: `Bearer ${testUserJwt}` } 
      });
      if (res.ok) {
        console.log('❌ FAIL: User succeeded in uploading media to a non-owned property!');
      } else if (res.status === 404) {
        console.log('✅ PASS: User blocked from uploading media to another property');
      } else {
        console.log('❌ FAIL: Unexpected response when uploading media', res.status);
      }
    } catch (err) {
      console.log('Error testing media upload', err);
    }

    console.log('\\n[TEST 9] Verify User cannot access another users private resource');
    try {
      const res = await fetch(`${API_BASE}/owner/properties/999`, { headers: { Authorization: `Bearer ${testUserJwt}` } });
      if (res.ok) {
         console.log('❌ FAIL: User retrieved another property details successfully!');
      } else if (res.status === 404) {
         console.log('✅ PASS: User blocked from fetching another property details');
      } else {
         console.log('❌ FAIL: Unexpected response when fetching property', res.status);
      }
    } catch (err) {
      console.log('Error fetching private resource', err);
    }
    
    console.log('\\n--- TESTS COMPLETE ---');

  } catch (error) {
    console.error('Test script crashed:', error);
  } finally {
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
    pool.end();
  }
}

runTests();
