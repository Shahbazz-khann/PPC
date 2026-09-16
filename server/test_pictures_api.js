/**
 * Test suite for POST /api/v1/customer/properties/:propertyId/pictures
 *
 * CLEANUP STRATEGY:
 *  - At the start: record all existing filenames in uploads/property-pictures/
 *  - After tests: delete ONLY files that were created DURING this run
 *    (files whose name starts with prop-{propertyId}- AND were NOT present before)
 *  - DB rows are always deleted via 'DELETE FROM property_pictures WHERE property_id = $1'
 *
 * This guarantees idempotent, fully-clean repeated runs.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const API = 'http://localhost:5000/api/v1';
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });

const UPLOAD_DIR = path.join(__dirname, 'uploads', 'property-pictures');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeImageBuffer() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
                      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9]);
}

function makeToken(userId, userType) {
  return jwt.sign({ user_id: userId, user_type: userType }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function buildMultipart(files) {
  const boundary = '----TestBoundary' + Date.now();
  const parts = files.map(({ name, filename, mimetype, data }) => {
    return [
      `--${boundary}`,
      `Content-Disposition: form-data; name="${name}"; filename="${filename}"`,
      `Content-Type: ${mimetype}`,
      '',
      data
    ].join('\r\n');
  });
  const body = Buffer.concat([
    Buffer.from(parts.join('\r\n') + '\r\n'),
    Buffer.from(`--${boundary}--\r\n`)
  ]);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function post(endpoint, token, files) {
  const { body, contentType } = buildMultipart(files);
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

function imgFile(n = 1, mimetype = 'image/jpeg', ext = '.jpg') {
  return Array.from({ length: n }, (_, i) => ({
    name: 'pictures',
    filename: `test${i + 1}${ext}`,
    mimetype,
    data: makeImageBuffer()
  }));
}

/** List all filenames currently in the upload directory */
function listUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) return new Set();
  return new Set(fs.readdirSync(UPLOAD_DIR));
}

/** Delete only files that exist NOW but were NOT in the pre-run snapshot */
function cleanupTestFiles(snapshotBefore) {
  if (!fs.existsSync(UPLOAD_DIR)) return { deleted: 0 };
  const current = fs.readdirSync(UPLOAD_DIR);
  let deleted = 0;
  for (const filename of current) {
    if (!snapshotBefore.has(filename)) {
      try {
        fs.unlinkSync(path.join(UPLOAD_DIR, filename));
        deleted++;
      } catch (e) {
        console.warn(`  ⚠  Could not delete test file: ${filename}`, e.message);
      }
    }
  }
  return { deleted };
}

// --------------------------------------------------------------------------
// Setup: resolve real user/property from DB
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
    'SELECT p.property_id FROM properties p WHERE p.customer_id != $1 LIMIT 1',
    [customer_id]
  );

  return {
    userId: user_id,
    customerId: customer_id,
    propertyId: property_id,
    otherPropertyId: otherProp.rows[0]?.property_id || null,
    token: makeToken(user_id, 'customer'),
    employeeToken: makeToken(99999, 'employee'),
    invalidToken: 'bad.token.value'
  };
}

// --------------------------------------------------------------------------
// Tests
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

  // ── PRE-RUN SNAPSHOT ──────────────────────────────────────────────────────
  // Capture ALL filenames that exist BEFORE this test run starts.
  // We will ONLY delete files that appear AFTER this snapshot.
  const filesSnapshot = listUploadDir();
  console.log(`Pre-run snapshot: ${filesSnapshot.size} existing file(s) in upload dir (will not be touched)\n`);

  // ── DB CLEANUP ────────────────────────────────────────────────────────────
  // Remove any leftover picture rows for this test property from previous runs.
  const deleted = await pool.query('DELETE FROM property_pictures WHERE property_id = $1', [ctx.propertyId]);
  if (deleted.rowCount > 0) {
    console.log(`  ℹ️   Cleared ${deleted.rowCount} leftover DB row(s) from previous run\n`);
  }

  // ------------------------------------------------------------------
  // AUTH / SECURITY TESTS
  // ------------------------------------------------------------------
  console.log('--- AUTH / SECURITY ---');
  let r;

  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, null, imgFile());
  check('No token → 401', r.status === 401, `status=${r.status}`);

  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.invalidToken, imgFile());
  check('Invalid token → 401', r.status === 401, `status=${r.status}`);

  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.employeeToken, imgFile());
  check('Employee token → 403', r.status === 403, `status=${r.status}`);

  // ------------------------------------------------------------------
  // PROPERTY ID VALIDATION
  // ------------------------------------------------------------------
  console.log('\n--- PROPERTY ID VALIDATION ---');

  r = await post(`/customer/properties/abc/pictures`, ctx.token, imgFile());
  check('Non-numeric propertyId → 400', r.status === 400, `status=${r.status}`);

  r = await post(`/customer/properties/-1/pictures`, ctx.token, imgFile());
  check('Negative propertyId → 400', r.status === 400, `status=${r.status}`);

  r = await post(`/customer/properties/0/pictures`, ctx.token, imgFile());
  check('Zero propertyId → 400', r.status === 400, `status=${r.status}`);

  // ------------------------------------------------------------------
  // OWNERSHIP TESTS  (rejected BEFORE files are written)
  // ------------------------------------------------------------------
  console.log('\n--- OWNERSHIP ---');

  if (ctx.otherPropertyId) {
    const filesBefore = listUploadDir().size;
    r = await post(`/customer/properties/${ctx.otherPropertyId}/pictures`, ctx.token, imgFile());
    check("Other customer's property → 403", r.status === 403, `status=${r.status} msg=${r.data.message}`);
    const filesAfter = listUploadDir().size;
    check('No files written for ownership rejection', filesAfter === filesBefore,
          `before=${filesBefore} after=${filesAfter}`);
  } else {
    console.log('  ℹ️   Skipping cross-ownership test (only one customer in DB)');
  }

  // ------------------------------------------------------------------
  // FILE VALIDATION
  // ------------------------------------------------------------------
  console.log('\n--- FILE VALIDATION ---');

  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(1, 'application/pdf', '.pdf'));
  check('Unsupported MIME type (PDF) → 400', r.status === 400, `msg=${r.data.message}`);

  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(7));
  check('7 pictures in one request → 400', r.status === 400, `msg=${r.data.message}`);

  // ------------------------------------------------------------------
  // VALID UPLOADS
  // ------------------------------------------------------------------
  console.log('\n--- VALID UPLOADS ---');

  // 3 pictures → empty property
  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(3));
  check('Upload 3 pictures → 201', r.status === 201, `status=${r.status}`);
  if (r.status === 201) {
    const pics = r.data.data.pictures;
    check('Returned 3 pictures', pics.length === 3, `length=${pics.length}`);
    check('First picture display_order = 1', pics[0].display_order == 1, `order=${pics[0].display_order}`);
    check('Second picture display_order = 2', pics[1].display_order == 2, `order=${pics[1].display_order}`);
    check('Third picture display_order = 3', pics[2].display_order == 3, `order=${pics[2].display_order}`);
    check('Picture URLs contain /uploads/property-pictures/',
          pics[0].picture_url.includes('/uploads/property-pictures/'), `url=${pics[0].picture_url}`);
    check('property_id matches', String(r.data.data.property_id) === String(ctx.propertyId));
  }

  // +2 → total 5
  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(2));
  check('Append 2 more (total 5) → 201', r.status === 201, `status=${r.status}`);
  if (r.status === 201) {
    const pics = r.data.data.pictures;
    check('2nd batch starts at display_order = 4', pics[0].display_order == 4, `order=${pics[0].display_order}`);
    check('2nd batch ends at display_order = 5', pics[1].display_order == 5, `order=${pics[1].display_order}`);
  }

  // +1 → total exactly 6
  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(1));
  check('Upload 1 more (total exactly 6) → 201', r.status === 201, `status=${r.status}`);

  // +1 → would be 7, must reject
  r = await post(`/customer/properties/${ctx.propertyId}/pictures`, ctx.token, imgFile(1));
  check('Upload when already at 6 → 400', r.status === 400, `status=${r.status}`);
  check('Limit message includes "6"', r.data.message?.includes('6'), `msg=${r.data.message}`);

  // ------------------------------------------------------------------
  // DB VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n--- DB VERIFICATION ---');

  const dbPics = await pool.query(
    'SELECT * FROM property_pictures WHERE property_id = $1 AND is_active = true ORDER BY display_order',
    [ctx.propertyId]
  );
  check('DB has exactly 6 active pictures', dbPics.rowCount === 6, `count=${dbPics.rowCount}`);
  check('display_order sequence 1–6', dbPics.rows.every((r, i) => parseInt(r.display_order) === i + 1));
  check('created_by_user is set', dbPics.rows.every(r => r.created_by_user != null));
  check('gps_coordinates is NULL', dbPics.rows.every(r => r.gps_coordinates === null));
  check('url_used is NULL', dbPics.rows.every(r => r.url_used === null));
  check('picture_description is NULL', dbPics.rows.every(r => r.picture_description === null));

  // ------------------------------------------------------------------
  // ROLLBACK / NO ORPHAN ROWS
  // ------------------------------------------------------------------
  console.log('\n--- ROLLBACK TEST ---');
  const afterReject = await pool.query(
    'SELECT COUNT(*) FROM property_pictures WHERE property_id = $1 AND is_active = true',
    [ctx.propertyId]
  );
  check('Count stays at 6 after rejected request', afterReject.rows[0].count == 6);

  // ------------------------------------------------------------------
  // NO DUPLICATE DISPLAY_ORDER
  // ------------------------------------------------------------------
  console.log('\n--- DUPLICATE DISPLAY_ORDER ---');
  const dupCheck = await pool.query(`
    SELECT property_id, display_order, count(*) 
    FROM property_pictures 
    WHERE is_active = true 
    GROUP BY property_id, display_order 
    HAVING count(*) > 1
  `);
  check('No duplicate active display_order values', dupCheck.rowCount === 0);

  // ------------------------------------------------------------------
  // FILESYSTEM CHECK  (only counting files created by this run)
  // ------------------------------------------------------------------
  console.log('\n--- FILESYSTEM ---');
  const filesCreatedThisRun = fs.existsSync(UPLOAD_DIR)
    ? fs.readdirSync(UPLOAD_DIR).filter(f => !filesSnapshot.has(f) && f.startsWith(`prop-${ctx.propertyId}-`))
    : [];
  check('Exactly 6 new physical files created this run', filesCreatedThisRun.length === 6,
        `found=${filesCreatedThisRun.length}`);

  // ------------------------------------------------------------------
  // POST-RUN CLEANUP  (DB rows + physical files)
  // ------------------------------------------------------------------
  console.log('\n--- CLEANUP ---');

  // Delete DB rows for this test property
  const dbClean = await pool.query('DELETE FROM property_pictures WHERE property_id = $1', [ctx.propertyId]);
  check(`DB cleanup: deleted ${dbClean.rowCount} row(s)`, dbClean.rowCount === 6, `deleted=${dbClean.rowCount}`);

  // Delete ONLY files created during this run (identified by snapshot diff)
  const { deleted: fsDeleted } = cleanupTestFiles(filesSnapshot);
  check(`Filesystem cleanup: deleted ${fsDeleted} test file(s)`, fsDeleted === 6, `deleted=${fsDeleted}`);

  // Verify upload dir is back to pre-run state
  const filesAfterCleanup = listUploadDir().size;
  check('Upload dir restored to pre-run state', filesAfterCleanup === filesSnapshot.size,
        `pre-run=${filesSnapshot.size} after-cleanup=${filesAfterCleanup}`);

  // ------------------------------------------------------------------
  // RESULTS
  // ------------------------------------------------------------------
  console.log(`\n============================`);
  console.log(`PASS: ${pass}  |  FAIL: ${fail}`);
  console.log(`============================\n`);

  pool.end();
}

runTests().catch(err => { console.error(err); pool.end(); });
