require('dotenv').config();
const { getCities, getSocieties, getAreas } = require('./controller/Customer/ProfileReference/profileReference.controller');

async function mockReqRes(method, query) {
  return new Promise((resolve) => {
    const req = { query };
    const res = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) {
        resolve({ status: this.statusCode, data });
      }
    };
    const next = (err) => { resolve({ error: err }); };
    
    method(req, res, next);
  });
}

async function runTests() {
  const tests = [
    { name: 'GET cities?tehsil_id=197', method: getCities, query: { tehsil_id: '197' } },
    { name: 'GET cities?tehsil_id=197&search=isla', method: getCities, query: { tehsil_id: '197', search: 'isla' } },
    { name: 'GET societies?city_id=1', method: getSocieties, query: { city_id: '1' } },
    { name: 'GET societies?city_id=1&search=dh', method: getSocieties, query: { city_id: '1', search: 'dh' } },
    { name: 'GET areas?society_id=1', method: getAreas, query: { society_id: '1' } },
    { name: 'GET areas?society_id=1&search=sector', method: getAreas, query: { society_id: '1', search: 'sector' } },
    { name: 'Missing parent ID (cities)', method: getCities, query: {} },
    { name: 'Invalid parent ID (societies?city_id=abc)', method: getSocieties, query: { city_id: 'abc' } },
    { name: 'Valid parent with no children (cities?tehsil_id=99999)', method: getCities, query: { tehsil_id: '99999' } },
    { name: 'Search with no match (areas?society_id=1&search=xyz)', method: getAreas, query: { society_id: '1', search: 'xyz' } },
  ];

  for (const t of tests) {
    console.log(`\\n--- Test: ${t.name} ---`);
    const result = await mockReqRes(t.method, t.query);
    console.log('Status:', result.status || 'ERROR');
    console.log('Data:', JSON.stringify(result.data || result.error, null, 2));
  }
  
  // Close pool
  const { pool } = require('./config/db');
  pool.end();
}

runTests();
