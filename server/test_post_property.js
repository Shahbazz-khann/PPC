require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: '8811287512@s',
});

const API_URL = 'http://localhost:5000/api/v1';

async function generateToken(email, password, role) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    return data.data ? data.data.token : null;
  } catch(e) { return null; }
}

async function runTests() {
  console.log('--- TEST: POST /api/v1/customer/properties ---');
  
  // Create test users directly in DB if they don't exist, or just fetch existing ones.
  const customerRes = await pool.query(`SELECT u.email FROM users u JOIN customers c ON u.user_id = c.user_id WHERE u.is_active = true LIMIT 1`);
  const employeeRes = await pool.query(`SELECT u.email FROM users u JOIN employees c ON u.user_id = c.user_id WHERE u.is_active = true LIMIT 1`);
  
  const customerEmail = customerRes.rowCount ? customerRes.rows[0].email : null;
  const employeeEmail = employeeRes.rowCount ? employeeRes.rows[0].email : null;
  
  if (!customerEmail) { console.log('No active customer found to test. Cannot proceed.'); process.exit(1); }
  
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('123456', 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE email IN ($2, $3)', [hash, customerEmail, employeeEmail]);
  
  const customerToken = await generateToken(customerEmail, '123456', 'customer');
  const employeeToken = employeeEmail ? await generateToken(employeeEmail, '123456', 'employee') : null;
  
  const areaRes = await pool.query('SELECT a.area_id, s.society_id, c.city_id FROM areas a JOIN societies s ON a.society_id = s.society_id JOIN cities c ON s.city_id = c.city_id WHERE a.is_active = true LIMIT 1');
  if (areaRes.rowCount === 0) { console.log('No active area found.'); process.exit(1); }
  const { area_id, society_id, city_id } = areaRes.rows[0];
  
  const validPayload = {
    area_id,
    society_id,
    city_id,
    propertyType: 1, // assuming House
    propertyDescription: 'Test property',
    amenities: ['Custom Amenity 1', 'Swimming Pool']
  };

  const makeRequest = async (token, payload) => {
    return fetch(`${API_URL}/customer/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    }).then(async r => ({ status: r.status, data: await r.json() }));
  };

  // 1. no token -> 401
  const r1 = await makeRequest(null, validPayload);
  console.log('No token:', r1.status === 401 ? 'PASS' : 'FAIL', r1.status);
  
  // 2. invalid token -> 401
  const r2 = await makeRequest('invalid.token.here', validPayload);
  console.log('Invalid token:', r2.status === 401 ? 'PASS' : 'FAIL', r2.status);
  
  // 3. Employee -> 403
  if (employeeToken) {
    const r3 = await makeRequest(employeeToken, validPayload);
    console.log('Employee token:', r3.status === 403 ? 'PASS' : 'FAIL', r3.status);
  }
  
  // 5. Missing required field -> 400
  const r5 = await makeRequest(customerToken, {});
  console.log('Missing area_id:', r5.status === 400 ? 'PASS' : 'FAIL', r5.status, r5.data);
  
  // 6. Invalid hierarchy -> 400
  const invalidPayload = { ...validPayload, city_id: 999999 };
  const r6 = await makeRequest(customerToken, invalidPayload);
  console.log('Invalid hierarchy:', r6.status === 400 ? 'PASS' : 'FAIL', r6.status, r6.data);
  
  // 7. Invalid FK -> 400
  const invalidFkPayload = { ...validPayload, area_id: 999999 };
  const r7 = await makeRequest(customerToken, invalidFkPayload);
  console.log('Invalid area_id FK:', r7.status === 400 ? 'PASS' : 'FAIL', r7.status, r7.data);

  // 8. Valid Customer -> 201
  const r8 = await makeRequest(customerToken, validPayload);
  console.log('Valid Customer:', r8.status === 201 ? 'PASS' : 'FAIL', r8.status, r8.data);
  
  if (r8.status === 201) {
    const propId = r8.data.data.property_id;
    // Check DB records
    const propRes = await pool.query('SELECT * FROM properties WHERE property_id = $1', [propId]);
    console.log('Property created:', propRes.rowCount === 1 ? 'PASS' : 'FAIL');
    
    const amRes = await pool.query('SELECT a.amenity_description FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.amenity_id WHERE pa.property_id = $1', [propId]);
    const amenities = amRes.rows.map(r => r.amenity_description);
    console.log('Amenities linked:', amenities.includes('Custom Amenity 1') && amenities.includes('Swimming Pool') ? 'PASS' : 'FAIL');
    
    const appRes = await pool.query('SELECT ast.approval_stage_english FROM property_approvals pa JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id WHERE pa.property_id = $1', [propId]);
    console.log('Pending approval created:', appRes.rowCount === 1 && appRes.rows[0].approval_stage_english === 'Pending' ? 'PASS' : 'FAIL');
    
    const statRes = await pool.query('SELECT pst.status_english FROM property_status ps JOIN property_status_types pst ON ps.status_id = pst.status_id WHERE ps.property_id = $1', [propId]);
    console.log('Inactive status created:', statRes.rowCount === 1 && statRes.rows[0].status_english === 'Inactive' ? 'PASS' : 'FAIL');
    
    // Duplicate amenities prevention test
    const validPayload2 = { ...validPayload, propertyDescription: 'Test duplicate' };
    const r9 = await makeRequest(customerToken, validPayload2);
    console.log('Duplicate amenities prevention (second creation with same tags):', r9.status === 201 ? 'PASS' : 'FAIL');
    
    // Check no duplicate amenity rows created in master table (case insensitive)
    const amCheck = await pool.query(`SELECT count(*) FROM amenities WHERE lower(amenity_description) = 'custom amenity 1'`);
    console.log('No duplicate master amenity row:', parseInt(amCheck.rows[0].count) === 1 ? 'PASS' : 'FAIL', 'count:', amCheck.rows[0].count);
  }
  
  pool.end();
}

runTests();
