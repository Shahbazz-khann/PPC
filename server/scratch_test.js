const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api/v1/admin/reference/property/property-use';
const JWT_SECRET = 'your_super_secret_ppc_jwt_key_change_this';

// Helper to generate tokens
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

const adminToken = generateToken({ user_type: 'admin' });
const customerToken = generateToken({ user_type: 'customer' });
const employeeToken = generateToken({ user_type: 'employee', roles: ['inspector'] });

async function req(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

const reqAdmin = (url, method, body) => req(url, { method, headers: { Authorization: `Bearer ${adminToken}` }, body: body ? JSON.stringify(body) : undefined });
const reqCustomer = (url, method, body) => req(url, { method, headers: { Authorization: `Bearer ${customerToken}` }, body: body ? JSON.stringify(body) : undefined });
const reqEmp = (url, method, body) => req(url, { method, headers: { Authorization: `Bearer ${employeeToken}` }, body: body ? JSON.stringify(body) : undefined });
const reqUnauth = (url, method, body) => req(url, { method, body: body ? JSON.stringify(body) : undefined });

async function runTests() {
  const results = {};
  let tempIds = [];
  const ts = Date.now();

  try {
    // 1. Unauthenticated
    let res = await reqUnauth(`${API_BASE}/1`, 'PUT', {});
    results.unauth = res.status;

    // 2. Customer Forbidden
    res = await reqCustomer(`${API_BASE}/1`, 'PUT', {});
    results.customer = res.status;

    // 3. Employee Forbidden
    res = await reqEmp(`${API_BASE}/1`, 'PUT', {});
    results.employee = res.status;

    // CREATE TEMP ROWS FOR TESTING
    let rowA = await reqAdmin(API_BASE, 'POST', {
      property_use_description: `Test Use A ${ts}`,
      property_use_urdu: 'Urdu A',
      property_use_abb: 'TUA'
    });
    if (rowA.status !== 201) throw new Error("Failed to create rowA: " + JSON.stringify(rowA));
    tempIds.push(rowA.data.data.property_use_id);
    const idA = rowA.data.data.property_use_id;

    let rowB = await reqAdmin(API_BASE, 'POST', {
      property_use_description: `Test Use B ${ts}`
    });
    if (rowB.status !== 201) throw new Error("Failed to create rowB: " + JSON.stringify(rowB));
    tempIds.push(rowB.data.data.property_use_id);
    const idB = rowB.data.data.property_use_id;

    // 4. Valid ID, Valid Payload (Admin Success)
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `Test Use A ${ts} Updated`,
      property_use_urdu: 'Urdu A Updated',
      property_use_abb: 'TUAU',
      is_active: false
    });
    results.validIdSuccess = res.status;

    // 5. Valid nonexistent ID (404)
    res = await reqAdmin(`${API_BASE}/999999999`, 'PUT', {
      property_use_description: `Does not exist ${ts}`,
      is_active: true
    });
    results.nonexistentId = res.status;

    // 6. Invalid IDs
    const invalidIds = ['0', '-1', 'abc', '1.5'];
    results.invalidIds = {};
    for (const iId of invalidIds) {
      res = await reqAdmin(`${API_BASE}/${iId}`, 'PUT', {
        property_use_description: 'Invalid ID Test',
        is_active: true
      });
      results.invalidIds[iId] = res.status;
    }

    // 7. No-change edit
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `Test Use A ${ts} Updated`,
      property_use_urdu: 'Urdu A Updated',
      property_use_abb: 'TUAU',
      is_active: false
    });
    results.noChangeEdit = res.status;

    // 8. Case-only self edit
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `TEST USE A ${ts} UPDATED`,
      is_active: true
    });
    results.caseOnlySelfEdit = res.status;

    // 9. Duplicate other row test
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `Test Use B ${ts}`,
      is_active: true
    });
    results.duplicateOtherRow = res.status;

    // 10. Status boolean test
    results.statusTest = {};
    const invalidStatuses = ['true', 'false', 1, 0];
    for (const st of invalidStatuses) {
      res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
        property_use_description: 'Status test',
        is_active: st
      });
      results.statusTest[st] = res.status;
    }

    // 11. Exact length boundary / Whitespace normalization
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `   Trimmed Test Use ${ts}   `,
      is_active: true
    });
    results.whitespaceNormalization = res.data.data.property_use_description === `Trimmed Test Use ${ts}`;

    // Length limit tests
    const string150 = 'a'.repeat(150);
    const string151 = 'a'.repeat(151);
    
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: string150,
      is_active: true
    });
    results.exactLength = res.status;

    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: string151,
      is_active: true
    });
    results.aboveExactLength = res.status;

    // Client ID override
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_id: '9999',
      property_use_description: `Client ID Override Test ${ts}`,
      is_active: true
    });
    results.clientIdOverride = res.data.data.property_use_id === idA;

    // SQL-like input
    res = await reqAdmin(`${API_BASE}/${idA}`, 'PUT', {
      property_use_description: `Robert'); DROP TABLE Students;-- ${ts}`,
      is_active: true
    });
    results.sqlLikeInput = res.data.data.property_use_description === `Robert'); DROP TABLE Students;-- ${ts}`;

    // 12. GET/CREATE Regression
    res = await reqAdmin(API_BASE, 'GET');
    results.getRegression = res.status === 200;

    res = await reqAdmin(API_BASE, 'POST', {
      property_use_description: `Test Use Regression ${ts}`
    });
    results.createRegression = res.status === 201;
    tempIds.push(res.data.data.property_use_id);


  } catch (err) {
    console.error("Test execution error:", err.message);
  } finally {
    // Cleanup Temp Rows from DB using pg
    const { Pool } = require('pg');
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'PPC_UPDATED',
      user: 'postgres',
      password: '8811287512@s',
    });
    
    if (tempIds.length > 0) {
      try {
        await pool.query(`DELETE FROM property_use WHERE property_use_id = ANY($1::int[])`, [tempIds]);
        console.log(`Cleaned up temp rows: ${tempIds.join(', ')}`);
      } catch (cleanErr) {
        console.error("Cleanup error:", cleanErr);
      }
    }
    await pool.end();
  }

  console.log("RESULTS JSON:");
  console.log(JSON.stringify(results, null, 2));
}

runTests();
