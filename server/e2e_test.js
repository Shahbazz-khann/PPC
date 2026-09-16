const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API = 'http://localhost:5000/api/v1';
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });

const PIC_UPLOAD_DIR = path.join(__dirname, 'uploads', 'property-pictures');
const VID_UPLOAD_DIR = path.join(__dirname, 'uploads', 'property-videos');

// --- Synthetic Files ---
function makeImage() {
  return new Blob([Buffer.alloc(1024, 0x00)], { type: 'image/jpeg' });
}
function makeVideo() {
  return new Blob([Buffer.alloc(1024, 0x00)], { type: 'video/mp4' });
}

async function getLiveIds() {
  // Try to find DHA Islamabad Sector W, fallback to first available
  const loc = await pool.query(`
    SELECT c.country_id, p.province_id, d.division_id, dt.district_id,
           t.tehsil_id, ci.city_id, s.society_id, a.area_id
    FROM areas a
    JOIN societies s ON a.society_id = s.society_id
    JOIN cities ci ON s.city_id = ci.city_id
    JOIN tehsils t ON ci.tehsil_id = t.tehsil_id
    JOIN districts dt ON t.district_id = dt.district_id
    JOIN divisions d ON dt.division_id = d.division_id
    JOIN provinces p ON d.province_id = p.province_id
    JOIN countries c ON p.country_id = c.country_id
    WHERE ci.city_english ILIKE '%Islamabad%' AND s.society_english ILIKE '%DHA%' AND a.area_english ILIKE '%Sector W%'
    LIMIT 1
  `);
  
  const ids = loc.rowCount > 0 ? loc.rows[0] : (await pool.query(`
    SELECT c.country_id, p.province_id, d.division_id, dt.district_id,
           t.tehsil_id, ci.city_id, s.society_id, a.area_id
    FROM areas a
    JOIN societies s ON a.society_id = s.society_id
    JOIN cities ci ON s.city_id = ci.city_id
    JOIN tehsils t ON ci.tehsil_id = t.tehsil_id
    JOIN districts dt ON t.district_id = dt.district_id
    JOIN divisions d ON dt.division_id = d.division_id
    JOIN provinces p ON d.province_id = p.province_id
    JOIN countries c ON p.country_id = c.country_id
    LIMIT 1
  `)).rows[0];

  const type = await pool.query('SELECT property_type_id FROM property_types LIMIT 1');
  const use = await pool.query('SELECT property_use_id FROM property_use LIMIT 1');
  const uom = await pool.query("SELECT uom_id FROM uom LIMIT 1");
  const marla = await pool.query("SELECT marla_id FROM marla_sizes LIMIT 1");
  
  return { 
    ...ids, 
    type_id: type.rows[0].property_type_id, 
    use_id: use.rows[0].property_use_id,
    uom_id: uom.rows[0].uom_id,
    marla_id: marla.rows[0].marla_id
  };
}

async function runE2E() {
  console.log('--- STARTING REAL E2E VERIFICATION ---');
  
  // 1. Get Live Customer & Location IDs
  const cust = await pool.query(`SELECT u.user_id, c.customer_id FROM users u JOIN customers c ON u.user_id = c.user_id WHERE u.is_active = true LIMIT 1`);
  if (cust.rowCount === 0) throw new Error('No active customer');
  const user_id = cust.rows[0].user_id;
  const token = jwt.sign({ user_id, user_type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const ids = await getLiveIds();

  console.log(`Using Location: Country ${ids.country_id} -> Province ${ids.province_id} -> Div ${ids.division_id} -> Dist ${ids.district_id} -> Tehsil ${ids.tehsil_id} -> City ${ids.city_id} -> Soc ${ids.society_id} -> Area ${ids.area_id}`);

  // ----------------------------------------------------------------
  // 1. POST /customer/properties (Create Property)
  // ----------------------------------------------------------------
  console.log('\n1. Creating Property...');
  const propertyPayload = {
    propertyType: ids.type_id,
    propertyUse: ids.use_id,
    country_id: ids.country_id,
    province_id: ids.province_id,
    division_id: ids.division_id,
    district_id: ids.district_id,
    tehsil_id: ids.tehsil_id,
    city_id: ids.city_id,
    society_id: ids.society_id,
    area_id: ids.area_id,
    propertySize: 10,
    sizeUom: ids.uom_id,
    marlaSize: ids.marla_id,
    areaMarla: 10,
    rooms: 4,
    propertyDescription: 'E2E Test Property',
    amenities: ['Custom Amenity 1', 'Custom Amenity 2']
  };

  const propRes = await fetch(`${API}/customer/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(propertyPayload)
  });
  const propData = await propRes.json();
  if (!propRes.ok) throw new Error('Property creation failed: ' + JSON.stringify(propData));
  
  const propertyId = propData.data.property_id;
  console.log(`✅ Property Created. property_id: ${propertyId}`);

  // ----------------------------------------------------------------
  // 2. POST /customer/properties/:propertyId/pictures
  // ----------------------------------------------------------------
  console.log('\n2. Uploading Pictures...');
  const picForm = new FormData();
  picForm.append('pictures', makeImage(), 'pic1.jpg');
  picForm.append('pictures', makeImage(), 'pic2.jpg');
  
  const picRes = await fetch(`${API}/customer/properties/${propertyId}/pictures`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // NO Content-Type so browser/node sets multipart boundary
    body: picForm
  });
  const picData = await picRes.json();
  if (!picRes.ok) throw new Error('Picture upload failed: ' + JSON.stringify(picData));
  console.log(`✅ Pictures Uploaded. Status: 201`);

  // ----------------------------------------------------------------
  // 3. POST /customer/properties/:propertyId/video
  // ----------------------------------------------------------------
  console.log('\n3. Uploading Video...');
  const vidForm = new FormData();
  vidForm.append('video', makeVideo(), 'vid1.mp4');
  
  const vidRes = await fetch(`${API}/customer/properties/${propertyId}/video`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: vidForm
  });
  const vidData = await vidRes.json();
  if (!vidRes.ok) throw new Error('Video upload failed: ' + JSON.stringify(vidData));
  console.log(`✅ Video Uploaded. Status: 201`);

  // ----------------------------------------------------------------
  // 4. VERIFY DB STATE
  // ----------------------------------------------------------------
  console.log('\n4. Verifying LIVE DB...');
  const dbProp = await pool.query('SELECT * FROM properties WHERE property_id = $1', [propertyId]);
  console.log(`   - properties: ${dbProp.rowCount} property found`);

  const dbApp = await pool.query("SELECT * FROM property_approvals WHERE property_id = $1 AND is_active = true", [propertyId]);
  console.log(`   - property_approvals: ${dbApp.rowCount} active row(s) (Status ID: ${dbApp.rows[0]?.approval_status_id})`);

  const dbStat = await pool.query("SELECT * FROM property_status WHERE property_id = $1 AND is_active = true", [propertyId]);
  console.log(`   - property_status: ${dbStat.rowCount} active row(s) (Status ID: ${dbStat.rows[0]?.status_id})`);

  const dbPics = await pool.query('SELECT * FROM property_pictures WHERE property_id = $1 AND is_active = true ORDER BY display_order', [propertyId]);
  console.log(`   - property_pictures: ${dbPics.rowCount} active row(s)`);
  dbPics.rows.forEach(r => console.log(`      -> ID: ${r.property_picture_id}, Order: ${r.display_order}, URL: ${r.picture_url}`));

  const dbVids = await pool.query('SELECT * FROM property_videos WHERE property_id = $1 AND is_active = true', [propertyId]);
  console.log(`   - property_videos: ${dbVids.rowCount} active row(s)`);
  dbVids.rows.forEach(r => console.log(`      -> ID: ${r.property_video_id}, Order: ${r.display_order}, URL: ${r.video_url}`));

  // ----------------------------------------------------------------
  // 5. VERIFY FILESYSTEM
  // ----------------------------------------------------------------
  console.log('\n5. Verifying Filesystem...');
  const picUrls = dbPics.rows.map(r => r.picture_url);
  picUrls.forEach(url => {
    const filename = url.split('/').pop();
    const exists = fs.existsSync(path.join(PIC_UPLOAD_DIR, filename));
    console.log(`   - Picture file ${filename} exists: ${exists}`);
  });
  const vidUrls = dbVids.rows.map(r => r.video_url);
  vidUrls.forEach(url => {
    const filename = url.split('/').pop();
    const exists = fs.existsSync(path.join(VID_UPLOAD_DIR, filename));
    console.log(`   - Video file ${filename} exists: ${exists}`);
  });

  // ----------------------------------------------------------------
  // 6. VERIFY FRONTEND ROUTES
  // ----------------------------------------------------------------
  console.log('\n6. Verifying Frontend Endpoints...');
  const myPropRes = await fetch(`${API}/customer/properties`, { headers: { 'Authorization': `Bearer ${token}` }});
  const myPropData = await myPropRes.json();
  const foundInMyProp = myPropData.data.find(p => String(p.property_id) === String(propertyId));
  console.log(`   - Found in /customer/properties: ${!!foundInMyProp}`);
  if (foundInMyProp) console.log(`      -> image_url: ${foundInMyProp.image_url}`);

  const dashRes = await fetch(`${API}/customer/dashboard/properties`, { headers: { 'Authorization': `Bearer ${token}` }});
  const dashData = await dashRes.json();
  const foundInDash = (dashData.data.pending || []).find(p => String(p.property_id) === String(propertyId));
  console.log(`   - Found in /customer/dashboard/properties (pending): ${!!foundInDash}`);
  if (foundInDash) console.log(`      -> primary_picture_url: ${foundInDash.primary_picture_url}`);

  // ----------------------------------------------------------------
  // 7. VERIFY PARTIAL FAILURE (Validation bypass test)
  // ----------------------------------------------------------------
  console.log('\n7. Verifying Partial Failure (creating property, failing video)...');
  const propRes2 = await fetch(`${API}/customer/properties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(propertyPayload)
  });
  const propertyId2 = (await propRes2.json()).data.property_id;
  
  // Try uploading second video to propertyId (should fail because MAX 1)
  const vidFormFail = new FormData();
  vidFormFail.append('video', makeVideo(), 'vid2.mp4');
  const vidResFail = await fetch(`${API}/customer/properties/${propertyId}/video`, { // existing property with video
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: vidFormFail
  });
  console.log(`   - Second video upload on first property returned status: ${vidResFail.status} (expected 400)`);
  
  // Try uploading invalid video to propertyId2
  const badVidForm = new FormData();
  badVidForm.append('video', new Blob([Buffer.alloc(10)], { type: 'application/pdf' }), 'bad.pdf');
  const badVidRes = await fetch(`${API}/customer/properties/${propertyId2}/video`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: badVidForm
  });
  console.log(`   - Invalid video upload on second property returned status: ${badVidRes.status} (expected 400)`);
  
  // Verify propertyId2 still exists despite video failure
  const p2Exists = await pool.query('SELECT * FROM properties WHERE property_id = $1', [propertyId2]);
  console.log(`   - Partial failure: Property ${propertyId2} remains created: ${p2Exists.rowCount === 1}`);

  pool.end();
  console.log('\n=== E2E TEST COMPLETE ===');
}

runE2E().catch(err => { console.error(err); pool.end(); });
