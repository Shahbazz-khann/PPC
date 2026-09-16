/**
 * Test suite for POST /api/v1/customer/properties/:propertyId/video
 *
 * CLEANUP STRATEGY:
 *  - Pre-run snapshot of uploads/property-videos/ filenames
 *  - Post-run: delete only files added during this run (snapshot diff)
 *  - DB rows deleted by property_id before and after tests
 *
 * Synthetic video buffers used — Multer uses Content-Type from the
 * multipart header, not magic bytes, so we just set video/mp4.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const API = 'http://localhost:5000/api/v1';
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });

const VIDEO_UPLOAD_DIR = path.join(__dirname, 'uploads', 'property-videos');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

// Minimal synthetic MP4-like buffer (Multer uses Content-Type, not magic bytes)
function makeMp4Buffer(sizeBytes = 1024) {
  return Buffer.alloc(sizeBytes, 0x00);
}

function makeToken(userId, userType) {
  return jwt.sign({ user_id: userId, user_type: userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function buildMultipart(fieldName, filename, mimetype, data) {
  const boundary = '----TestVideoBoundary' + Date.now();
  const header = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"`,
    `Content-Type: ${mimetype}`,
    '',
    ''
  ].join('\r\n');
  const footer = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([Buffer.from(header), data, Buffer.from(footer)]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function postVideo(endpoint, token, { filename = 'test.mp4', mimetype = 'video/mp4', sizeBytes = 1024 } = {}) {
  const { body, contentType } = buildMultipart('video', filename, mimetype, makeMp4Buffer(sizeBytes));
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': contentType
    },
    body
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function listDir(dir) {
  if (!fs.existsSync(dir)) return new Set();
  return new Set(fs.readdirSync(dir));
}

function cleanupTestFiles(dir, snapshotBefore) {
  if (!fs.existsSync(dir)) return 0;
  let deleted = 0;
  for (const f of fs.readdirSync(dir)) {
    if (!snapshotBefore.has(f)) {
      try { fs.unlinkSync(path.join(dir, f)); deleted++; } catch (_) {}
    }
  }
  return deleted;
}

// --------------------------------------------------------------------------
// Setup
// --------------------------------------------------------------------------
async function setup() {
  const cust = await pool.query(`
    SELECT u.user_id, c.customer_id 
    FROM users u JOIN customers c ON u.user_id = c.user_id 
    WHERE u.is_active = true LIMIT 1
  `);
  if (cust.rowCount === 0) throw new Error('No active customer found');
  const { user_id, customer_id } = cust.rows[0];

  const prop = await pool.query(
    'SELECT property_id FROM properties WHERE customer_id = $1 LIMIT 1',
    [customer_id]
  );
  if (prop.rowCount === 0) throw new Error('No property found for customer');
  const property_id = prop.rows[0].property_id;

  const otherProp = await pool.query(
    'SELECT property_id FROM properties WHERE customer_id != $1 LIMIT 1',
    [customer_id]
  );

  return {
    userId: user_id,
    customerId: customer_id,
    propertyId: property_id,
    otherPropertyId: otherProp.rows[0]?.property_id || null,
    token: makeToken(user_id, 'customer'),
    employeeToken: makeToken(99999, 'employee'),
    invalidToken: 'bad.token.invalid'
  };
}

// --------------------------------------------------------------------------
// Test runner
// --------------------------------------------------------------------------
let pass = 0, fail = 0;
function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    pass++;
  } else {
    console.log(`  ❌  FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    fail++;
  }
}

async function runTests() {
  const ctx = await setup();
  console.log(`\nTest context: userId=${ctx.userId}, customerId=${ctx.customerId}, propertyId=${ctx.propertyId}\n`);

  // Pre-run snapshot
  const snapshot = listDir(VIDEO_UPLOAD_DIR);
  console.log(`Pre-run snapshot: ${snapshot.size} file(s) in video upload dir\n`);

  // DB cleanup from previous runs
  const prev = await pool.query('DELETE FROM property_videos WHERE property_id = $1', [ctx.propertyId]);
  if (prev.rowCount > 0) console.log(`  ℹ️   Cleared ${prev.rowCount} leftover video row(s)\n`);

  let r;

  // ------------------------------------------------------------------
  // AUTH / SECURITY
  // ------------------------------------------------------------------
  console.log('--- AUTH / SECURITY ---');

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, null);
  check('No token → 401', r.status === 401, `status=${r.status}`);

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.invalidToken);
  check('Invalid token → 401', r.status === 401, `status=${r.status}`);

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.employeeToken);
  check('Employee token → 403', r.status === 403, `status=${r.status}`);

  // ------------------------------------------------------------------
  // PROPERTY ID VALIDATION
  // ------------------------------------------------------------------
  console.log('\n--- PROPERTY ID VALIDATION ---');

  r = await postVideo(`/customer/properties/abc/video`, ctx.token);
  check('Non-numeric propertyId → 400', r.status === 400, `status=${r.status}`);

  r = await postVideo(`/customer/properties/-5/video`, ctx.token);
  check('Negative propertyId → 400', r.status === 400, `status=${r.status}`);

  r = await postVideo(`/customer/properties/0/video`, ctx.token);
  check('Zero propertyId → 400', r.status === 400, `status=${r.status}`);

  // ------------------------------------------------------------------
  // OWNERSHIP  (rejected BEFORE Multer writes file)
  // ------------------------------------------------------------------
  console.log('\n--- OWNERSHIP ---');

  if (ctx.otherPropertyId) {
    const before = listDir(VIDEO_UPLOAD_DIR).size;
    r = await postVideo(`/customer/properties/${ctx.otherPropertyId}/video`, ctx.token);
    check("Other customer's property → 403", r.status === 403, `status=${r.status}`);
    const after = listDir(VIDEO_UPLOAD_DIR).size;
    check('No file written for ownership rejection', after === before, `before=${before} after=${after}`);
  } else {
    console.log('  ℹ️   Skipping cross-ownership test (only one customer in DB)');
  }

  // ------------------------------------------------------------------
  // FILE VALIDATION
  // ------------------------------------------------------------------
  console.log('\n--- FILE VALIDATION ---');

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.token,
      { filename: 'test.avi', mimetype: 'video/avi' });
  check('Non-MP4 MIME type → 400', r.status === 400, `msg=${r.data.message}`);

  // 51 MB synthetic buffer — triggers LIMIT_FILE_SIZE
  const MB51 = 51 * 1024 * 1024;
  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.token,
      { filename: 'big.mp4', mimetype: 'video/mp4', sizeBytes: MB51 });
  check('File over 50 MB → 400', r.status === 400, `msg=${r.data.message}`);

  // Ensure no files were written by the rejected file-validation attempts
  check('No files written by rejected file-type/size requests',
        listDir(VIDEO_UPLOAD_DIR).size === snapshot.size,
        `expected=${snapshot.size} actual=${listDir(VIDEO_UPLOAD_DIR).size}`);

  // ------------------------------------------------------------------
  // VALID UPLOAD
  // ------------------------------------------------------------------
  console.log('\n--- VALID UPLOAD ---');

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.token,
      { filename: 'property.mp4', mimetype: 'video/mp4', sizeBytes: 512 * 1024 }); // 512 KB
  check('Valid MP4 under 50 MB → 201', r.status === 201, `status=${r.status} msg=${r.data.message}`);

  if (r.status === 201) {
    const vid = r.data.data.video;
    check('Response contains property_video_id', !!vid.property_video_id, `id=${vid.property_video_id}`);
    check('Response video_url contains /uploads/property-videos/', vid.video_url.includes('/uploads/property-videos/'));
    check('Response display_order = 1', vid.display_order == 1, `order=${vid.display_order}`);
    check('Response property_id matches', String(r.data.data.property_id) === String(ctx.propertyId));
  }

  // ------------------------------------------------------------------
  // ONE-VIDEO LIMIT
  // ------------------------------------------------------------------
  console.log('\n--- ONE-VIDEO LIMIT ---');

  r = await postVideo(`/customer/properties/${ctx.propertyId}/video`, ctx.token,
      { filename: 'second.mp4', mimetype: 'video/mp4', sizeBytes: 256 * 1024 });
  check('Second video for same property → 400', r.status === 400, `status=${r.status}`);
  check('Limit message returned', r.data.message?.includes('1'), `msg=${r.data.message}`);

  // Confirm only 1 video row in DB
  const dbVids = await pool.query(
    'SELECT * FROM property_videos WHERE property_id = $1 AND is_active = true ORDER BY display_order',
    [ctx.propertyId]
  );
  check('Exactly 1 active video row in DB', dbVids.rowCount === 1, `count=${dbVids.rowCount}`);
  check('DB display_order = 1', dbVids.rows[0]?.display_order == 1);
  check('DB created_by_user is set', dbVids.rows[0]?.created_by_user != null);
  check('DB video_url contains /uploads/property-videos/', dbVids.rows[0]?.video_url.includes('/uploads/property-videos/'));
  check('DB gps_coordinates is NULL', dbVids.rows[0]?.gps_coordinates === null);
  check('DB url_used is NULL', dbVids.rows[0]?.url_used === null);
  check('DB video_description is NULL', dbVids.rows[0]?.video_description === null);

  // ------------------------------------------------------------------
  // FILESYSTEM CHECK
  // ------------------------------------------------------------------
  console.log('\n--- FILESYSTEM ---');

  const newFiles = fs.existsSync(VIDEO_UPLOAD_DIR)
    ? fs.readdirSync(VIDEO_UPLOAD_DIR).filter(f => !snapshot.has(f) && f.startsWith(`prop-vid-${ctx.propertyId}-`))
    : [];
  check('Exactly 1 physical video file created this run', newFiles.length === 1, `found=${newFiles.length}`);

  // ------------------------------------------------------------------
  // NO ORPHAN FILES AFTER REJECTED REQUEST
  // ------------------------------------------------------------------
  console.log('\n--- ROLLBACK / NO ORPHAN CHECK ---');

  // The rejected "second video" request should have been stopped BEFORE Multer
  // by the DB-level one-video limit — verify file count didn't increase from the rejection
  const totalNewFiles = fs.existsSync(VIDEO_UPLOAD_DIR)
    ? fs.readdirSync(VIDEO_UPLOAD_DIR).filter(f => !snapshot.has(f)).length
    : 0;
  check('No orphan files from rejected second-upload attempt', totalNewFiles === 1,
        `total new files=${totalNewFiles}`);

  // ------------------------------------------------------------------
  // POST-RUN CLEANUP
  // ------------------------------------------------------------------
  console.log('\n--- CLEANUP ---');

  const dbClean = await pool.query('DELETE FROM property_videos WHERE property_id = $1', [ctx.propertyId]);
  check(`DB cleanup: deleted ${dbClean.rowCount} row(s)`, dbClean.rowCount === 1, `deleted=${dbClean.rowCount}`);

  const fsDeleted = cleanupTestFiles(VIDEO_UPLOAD_DIR, snapshot);
  check(`Filesystem cleanup: deleted ${fsDeleted} video file(s)`, fsDeleted === 1, `deleted=${fsDeleted}`);

  const afterCleanup = listDir(VIDEO_UPLOAD_DIR).size;
  check('Upload dir restored to pre-run state', afterCleanup === snapshot.size,
        `pre=${snapshot.size} after=${afterCleanup}`);

  // ------------------------------------------------------------------
  // RESULTS
  // ------------------------------------------------------------------
  console.log(`\n============================`);
  console.log(`PASS: ${pass}  |  FAIL: ${fail}`);
  console.log(`============================\n`);

  pool.end();
}

runTests().catch(err => { console.error(err); pool.end(); });
