require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: 'PPC_UPDATED',
  user: 'postgres',
  password: '8811287512@s',
});

const API_URL = 'http://localhost:5000/api/v1';

async function generateToken(email, userId, role) {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'test_secret';
  return jwt.sign({ user_id: userId, email, user_type: role }, secret, { expiresIn: '1h' });
}

async function runTests() {
  console.log('--- TEST: E2E POST Property Verification ---');
  
  // Get the real customer email
  const customerRes = await pool.query(`SELECT u.email, u.user_id FROM users u JOIN customers c ON u.user_id = c.user_id WHERE u.is_active = true LIMIT 1`);
  if (customerRes.rowCount === 0) { console.log('No active customer found to test. Cannot proceed.'); process.exit(1); }
  const customerEmail = customerRes.rows[0].email;
  const userId = customerRes.rows[0].user_id;

  const customerToken = await generateToken(customerEmail, userId, 'customer');
  if (!customerToken) { console.log('Failed to login and get token.'); process.exit(1); }

  // 1. Get exact Islamabad hierarchy IDs
  // Pakistan -> FEDERAL CAPITAL TERRITORY -> FEDERAL CAPITAL TERRITORY -> ISLAMABAD -> ISLAMABAD -> Islamabad -> DHA -> Sector W
  const locationQuery = `
    SELECT 
      co.country_id, co.country_english,
      p.province_id, p.province_english,
      dv.division_id, dv.division_english,
      d.district_id, d.district_english,
      t.tehsil_id, t.tehsil_english,
      c.city_id, c.city_english,
      s.society_id, s.society_english,
      a.area_id, a.area_english
    FROM areas a
    JOIN societies s ON a.society_id = s.society_id
    JOIN cities c ON s.city_id = c.city_id
    JOIN tehsils t ON c.tehsil_id = t.tehsil_id
    JOIN districts d ON t.district_id = d.district_id
    JOIN divisions dv ON d.division_id = dv.division_id
    JOIN provinces p ON dv.province_id = p.province_id
    JOIN countries co ON p.country_id = co.country_id
    WHERE 
      co.country_id = 2 
      AND p.province_english ILIKE '%FEDERAL CAPITAL TERRITORY%'
      AND c.city_english ILIKE 'Islamabad'
      AND s.society_english ILIKE '%DHA%'
      AND a.area_english ILIKE '%Sector W%'
    LIMIT 1
  `;
  
  const locRes = await pool.query(locationQuery);
  if (locRes.rowCount === 0) { console.log('Could not find the exact Islamabad -> DHA -> Sector W hierarchy in DB.'); process.exit(1); }
  const loc = locRes.rows[0];
  console.log('Location Hierarchy Discovered:', loc);

  // 2. Capture exact payload sent by browser mapping
  const validPayload = {
    propertyType: 1, // House
    propertyUse: null,
    
    country_id: loc.country_id,
    province_id: loc.province_id,
    division_id: loc.division_id,
    district_id: loc.district_id,
    tehsil_id: loc.tehsil_id,
    city_id: loc.city_id,
    society_id: loc.society_id,
    area_id: loc.area_id,
    
    propertyLocation: null,
    
    propertySize: 500,
    sizeUom: null,
    marlaSize: null,
    
    areaMarla: null,
    areaKanal: null,
    areaAcre: null,
    areaSqFt: 4500,
    areaSqYard: 500,
    
    propertySizeFront: 50,
    propertySizeBack: 50,
    propertySizeLeft: 90,
    propertySizeRight: 90,
    
    coveredAreaSqFt: 3000,
    openAreaSqFt: 1500,
    
    rooms: 4,
    bathrooms: 4,
    floors: 2,
    lounges: 1,
    kitchens: 1,
    drawingRooms: 1,
    
    roadFrontFt: 40,
    roadBackFt: null,
    roadLeftFt: null,
    roadRightFt: null,
    
    swimmingPool: false,
    mediaRoom: false,
    solarInstalled: false,
    solarCapacity: null,
    electricMeters: 1,
    gasMeters: 1,
    
    propertyDescription: 'End-to-End Test Property in Sector W',
    
    amenities: ['E2E Custom Amenity 1', 'E2E Custom Amenity 2']
  };

  const makeRequest = async (endpoint, token, payload = null, method = 'POST') => {
    return fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...(payload ? { body: JSON.stringify(payload) } : {})
    }).then(async r => ({ status: r.status, data: await r.json() }));
  };

  // 3. Verify POST response
  const rCreate = await makeRequest('/customer/properties', customerToken, validPayload, 'POST');
  console.log('Create Property Response Status:', rCreate.status);
  console.log('Create Property Response Body:', JSON.stringify(rCreate.data, null, 2));

  if (rCreate.status !== 201) {
    console.log('Failed to create property. Exiting.');
    process.exit(1);
  }

  const propId = rCreate.data.data.property_id;

  // 4. Verify DB records
  console.log('\\n--- DB Verification ---');
  const propRes = await pool.query('SELECT * FROM properties WHERE property_id = $1', [propId]);
  const pData = propRes.rows[0];
  console.log('Property stored correctly?', 
    pData.area_id === loc.area_id && 
    pData.property_description === validPayload.propertyDescription &&
    pData.property_media_room === validPayload.mediaRoom
  );
  console.log(`DB saved area_id: ${pData.area_id}, expected: ${loc.area_id}`);

  const amRes = await pool.query('SELECT a.amenity_description FROM property_amenities pa JOIN amenities a ON pa.amenity_id = a.amenity_id WHERE pa.property_id = $1', [propId]);
  console.log('Amenities linked correctly?', amRes.rowCount === 2);

  const appRes = await pool.query('SELECT ast.approval_stage_english FROM property_approvals pa JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id WHERE pa.property_id = $1 AND pa.is_active = true', [propId]);
  console.log('Property Approval exactly one row? stage=Pending?', appRes.rowCount === 1 && appRes.rows[0].approval_stage_english === 'Pending');

  const statRes = await pool.query('SELECT pst.status_english FROM property_status ps JOIN property_status_types pst ON ps.status_id = pst.status_id WHERE ps.property_id = $1 AND ps.is_active = true', [propId]);
  console.log('Property Status exactly one row? status=Inactive?', statRes.rowCount === 1 && statRes.rows[0].status_english === 'Inactive');

  // 5. Verify existing frontend APIs
  console.log('\\n--- GET API Verification ---');
  const rProps = await makeRequest('/customer/properties', customerToken, null, 'GET');
  const propsList = rProps.data.data || [];
  const foundInList = propsList.some(p => parseInt(p.property_id) === parseInt(propId));
  console.log('Appears in GET /customer/properties?', foundInList);
  
  const rDashProps = await makeRequest('/customer/dashboard/properties', customerToken, null, 'GET');
  const dashPropsList = rDashProps.data.data || [];
  const foundInDashList = dashPropsList.some(p => parseInt(p.property_id) === parseInt(propId));
  console.log('Appears in GET /customer/dashboard/properties?', foundInDashList);

  const rDashSum = await makeRequest('/customer/dashboard/summary', customerToken, null, 'GET');
  console.log('Dashboard summary metrics:', rDashSum.data.data);
  // Total properties should be > 0.
  
  pool.end();
}

runTests();
