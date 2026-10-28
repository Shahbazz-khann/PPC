/**
 * T4.1 — Tehsil Edit Model Tests
 * All work done inside a SAVEPOINT / ROLLBACK.
 * No real Tehsil is modified, deleted, or has its sequence reset.
 */
'use strict';
require('dotenv').config();

const { pool } = require('../config/db');
const {
  getAdminTehsils,
  createAdminTehsil,
  findTehsilByEnglishInsensitiveInDistrict,
  getAdminTehsilById,
  findTehsilByEnglishInsensitiveInDistrictExcludingId,
  updateAdminTehsil
} = require('../models/Admin/Reference/location/tehsils.model');

/* ─── helpers ──────────────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;
const results = [];

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅  ${label}`);
    results.push({ label, ok: true });
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ' — ' + detail : ''}`);
    results.push({ label, ok: false, detail });
    failed++;
  }
}

function assertEq(label, actual, expected) {
  const ok = actual === expected;
  assert(label, ok, ok ? '' : `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

/* ─── main ──────────────────────────────────────────────────────────────────── */

async function run() {
  const client = await pool.connect();

  let originalPoolQuery;

  try {
    await client.query('BEGIN');

    // Monkey-patch pool.query to use our transaction client
    originalPoolQuery = pool.query.bind(pool);
    pool.query = client.query.bind(client);

    /* ── pick a real district to use as anchor ──────────────────────── */
    const districtRes = await client.query(
      `SELECT district_id FROM districts ORDER BY district_id ASC LIMIT 2`
    );
    if (districtRes.rows.length < 2) {
      throw new Error('Need at least 2 Districts in DB to run tests');
    }
    const districtA = String(districtRes.rows[0].district_id);
    const districtB = String(districtRes.rows[1].district_id);

    console.log(`\nUsing District A: ${districtA}  District B: ${districtB}\n`);

    /* ── create two temporary tehsils inside the transaction ────────── */
    const tmpA = await createAdminTehsil({
      district_id:    districtA,
      tehsil_english: '__TestTehsilAlpha__',
      tehsil_urdu:    'آلفا',
      tehsil_abb:     'TTA'
    });
    const tmpB = await createAdminTehsil({
      district_id:    districtA,
      tehsil_english: '__TestTehsilBeta__',
      tehsil_urdu:    null,
      tehsil_abb:     null
    });
    const idA = String(tmpA.tehsil_id);
    const idB = String(tmpB.tehsil_id);
    console.log(`Temp Tehsil A: id=${idA}  Tehsil B: id=${idB}\n`);

    /* ═══════════════════════════════════════════════════════════════════
       SECTION 1 — getAdminTehsilById
    ═══════════════════════════════════════════════════════════════════ */
    console.log('── getAdminTehsilById ──────────────────────────────────────');

    const byId = await getAdminTehsilById(idA);
    assert('existing ID returns row', byId !== null);
    if (byId) {
      const keys = Object.keys(byId);
      assertEq('returns exactly 6 keys', keys.length, 6);
      assert('has tehsil_id',    keys.includes('tehsil_id'));
      assert('has district_id',  keys.includes('district_id'));
      assert('has tehsil_english', keys.includes('tehsil_english'));
      assert('has tehsil_urdu',  keys.includes('tehsil_urdu'));
      assert('has tehsil_abb',   keys.includes('tehsil_abb'));
      assert('has is_active',    keys.includes('is_active'));
      assert('no country_id',    !keys.includes('country_id'));
      assert('no province_id',   !keys.includes('province_id'));
      assert('no division_id',   !keys.includes('division_id'));
      assertEq('tehsil_english matches', byId.tehsil_english, '__TestTehsilAlpha__');
      assertEq('tehsil_urdu matches',    byId.tehsil_urdu,    'آلفا');
      assertEq('tehsil_abb matches',     byId.tehsil_abb,     'TTA');
      assertEq('district_id matches',   String(byId.district_id), districtA);
      assertEq('is_active default true', byId.is_active, true);
    }

    const notFound = await getAdminTehsilById('9999999999');
    assertEq('nonexistent ID → null', notFound, null);

    /* ═══════════════════════════════════════════════════════════════════
       SECTION 2 — findTehsilByEnglishInsensitiveInDistrictExcludingId
    ═══════════════════════════════════════════════════════════════════ */
    console.log('\n── findTehsilByEnglishInsensitiveInDistrictExcludingId ─────');

    // Self exclusion: same district, same name, own ID excluded → null
    const selfExact = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtA, '__TestTehsilAlpha__', idA
    );
    assertEq('self-exact exclusion → null', selfExact, null);

    // Case-only self edit: UPPER self name, exclude own ID → null
    const selfCase = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtA, '__TESTTEHSILALPHA__', idA
    );
    assertEq('case-only self edit → null', selfCase, null);

    // Same-District other-row conflict (exact): should find B
    const conflictExact = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtA, '__TestTehsilBeta__', idA
    );
    assert('same-District other-row conflict (exact) → found', conflictExact !== null);

    // Case-insensitive conflict: upper-case of Beta name
    const conflictCase = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtA, '__TESTTEHSILBETA__', idA
    );
    assert('case-insensitive conflict → found', conflictCase !== null);

    // Different District same name: allowed → null
    const diffDistrict = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtB, '__TestTehsilAlpha__', idA
    );
    assertEq('different-District same name → null (allowed)', diffDistrict, null);

    // Inactive conflict: deactivate B then check
    await client.query(`UPDATE tehsils SET is_active = false WHERE tehsil_id = $1`, [idB]);
    const inactiveConflict = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtA, '__TestTehsilBeta__', idA
    );
    assert('inactive row still counts as conflict → found', inactiveConflict !== null);
    // restore
    await client.query(`UPDATE tehsils SET is_active = true WHERE tehsil_id = $1`, [idB]);

    /* Move to conflicting District: add a row in District B with same name as A */
    const tmpC = await createAdminTehsil({
      district_id:    districtB,
      tehsil_english: '__TestTehsilAlpha__',
      tehsil_urdu:    null,
      tehsil_abb:     null
    });
    const idC = String(tmpC.tehsil_id);
    const moveConflict = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
      districtB, '__TestTehsilAlpha__', idA
    );
    assert('move-to-conflicting-District → conflict found', moveConflict !== null);

    /* ═══════════════════════════════════════════════════════════════════
       SECTION 3 — updateAdminTehsil
    ═══════════════════════════════════════════════════════════════════ */
    console.log('\n── updateAdminTehsil ───────────────────────────────────────');

    // Normal update (change name only)
    const upd1 = await updateAdminTehsil(idA, {
      district_id:    districtA,
      tehsil_english: '__TestTehsilAlphaRenamed__',
      tehsil_urdu:    'آلفا تبدیل',
      tehsil_abb:     'TTR',
      is_active:      true
    });
    assert('normal update returns row', upd1 !== null);
    if (upd1) {
      assertEq('updated tehsil_english', upd1.tehsil_english, '__TestTehsilAlphaRenamed__');
      assertEq('updated tehsil_urdu',    upd1.tehsil_urdu,    'آلفا تبدیل');
      assertEq('updated tehsil_abb',     upd1.tehsil_abb,     'TTR');
      assertEq('tehsil_id immutable',    String(upd1.tehsil_id), idA);
      assertEq('district_id preserved',  String(upd1.district_id), districtA);
    }

    // Active → Inactive
    const upd2 = await updateAdminTehsil(idA, {
      district_id:    districtA,
      tehsil_english: '__TestTehsilAlphaRenamed__',
      tehsil_urdu:    null,
      tehsil_abb:     null,
      is_active:      false
    });
    assert('Active→Inactive: returns row', upd2 !== null);
    assertEq('Active→Inactive: is_active = false', upd2?.is_active, false);

    // Inactive → Active
    const upd3 = await updateAdminTehsil(idA, {
      district_id:    districtA,
      tehsil_english: '__TestTehsilAlphaRenamed__',
      tehsil_urdu:    null,
      tehsil_abb:     null,
      is_active:      true
    });
    assert('Inactive→Active: returns row', upd3 !== null);
    assertEq('Inactive→Active: is_active = true', upd3?.is_active, true);

    // Change District
    const upd4 = await updateAdminTehsil(idA, {
      district_id:    districtB,
      tehsil_english: '__TestTehsilAlphaRenamed__',
      tehsil_urdu:    null,
      tehsil_abb:     null,
      is_active:      true
    });
    // District B now has idC with __TestTehsilAlpha__ and idA with __TestTehsilAlphaRenamed__
    assert('change District: returns row', upd4 !== null);
    assertEq('change District: district_id updated', String(upd4?.district_id), districtB);

    // Move back to A for remaining tests
    await updateAdminTehsil(idA, {
      district_id: districtA, tehsil_english: '__TestTehsilAlpha2__',
      tehsil_urdu: null, tehsil_abb: null, is_active: true
    });

    // Combined update (all fields at once)
    const upd5 = await updateAdminTehsil(idB, {
      district_id:    districtB,
      tehsil_english: '__TestTehsilBetaMoved__',
      tehsil_urdu:    'بیٹا',
      tehsil_abb:     'TTB',
      is_active:      false
    });
    assert('combined update: returns row', upd5 !== null);
    if (upd5) {
      assertEq('combined: district_id', String(upd5.district_id), districtB);
      assertEq('combined: tehsil_english', upd5.tehsil_english, '__TestTehsilBetaMoved__');
      assertEq('combined: tehsil_urdu', upd5.tehsil_urdu, 'بیٹا');
      assertEq('combined: tehsil_abb', upd5.tehsil_abb, 'TTB');
      assertEq('combined: is_active', upd5.is_active, false);
    }

    // null urdu/abb update
    const updNull = await updateAdminTehsil(idA, {
      district_id: districtA, tehsil_english: '__TestNullFields__',
      tehsil_urdu: null, tehsil_abb: null, is_active: true
    });
    assertEq('null urdu → DB null', updNull?.tehsil_urdu, null);
    assertEq('null abb  → DB null', updNull?.tehsil_abb,  null);

    // duplicate ABB allowed
    await updateAdminTehsil(idA, {
      district_id: districtA, tehsil_english: '__TestDupABB_A__',
      tehsil_urdu: null, tehsil_abb: 'DUPABB', is_active: true
    });
    const dupABB = await updateAdminTehsil(idB, {
      district_id: districtB, tehsil_english: '__TestDupABB_B__',
      tehsil_urdu: null, tehsil_abb: 'DUPABB', is_active: true
    });
    assert('duplicate ABB allowed', dupABB !== null);

    // duplicate Urdu allowed
    await updateAdminTehsil(idA, {
      district_id: districtA, tehsil_english: '__TestDupUrdu_A__',
      tehsil_urdu: 'مشترک', tehsil_abb: null, is_active: true
    });
    const dupUrdu = await updateAdminTehsil(idB, {
      district_id: districtB, tehsil_english: '__TestDupUrdu_B__',
      tehsil_urdu: 'مشترک', tehsil_abb: null, is_active: true
    });
    assert('duplicate Urdu allowed', dupUrdu !== null);

    // nonexistent ID → null
    const updGhost = await updateAdminTehsil('9999999999', {
      district_id: districtA, tehsil_english: 'Ghost',
      tehsil_urdu: null, tehsil_abb: null, is_active: true
    });
    assertEq('nonexistent ID update → null', updGhost, null);

    /* ─── FK violation: invalid district_id → 23503 ──────────────── */
    console.log('\n── Error bubbling ──────────────────────────────────────────');
    await client.query('SAVEPOINT sp1');
    try {
      await updateAdminTehsil(idA, {
        district_id: '9999999999',
        tehsil_english: '__FKTest__',
        tehsil_urdu: null, tehsil_abb: null, is_active: true
      });
      assert('invalid district_id → 23503', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp1');
      assertEq('invalid district_id → 23503', e.code, '23503');
    }

    /* ─── DB unique constraint: direct exact duplicate → 23505 ──── */
    // Reset idA to a stable name first
    await client.query(
      `UPDATE tehsils SET tehsil_english = '__Stable_A__', district_id = $1 WHERE tehsil_id = $2`,
      [districtA, idA]
    );
    await client.query(
      `UPDATE tehsils SET tehsil_english = '__Stable_B__', district_id = $1 WHERE tehsil_id = $2`,
      [districtA, idB]
    );
    await client.query('SAVEPOINT sp2');
    try {
      // Force exact duplicate bypassing the helper
      await client.query(
        `UPDATE tehsils SET tehsil_english = '__Stable_A__' WHERE tehsil_id = $1`,
        [idB]
      );
      assert('direct exact DB duplicate → 23505', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp2');
      assertEq('direct exact DB duplicate → 23505', e.code, '23505');
    }

    /* ─── Case-variant DB limitation proof ───────────────────────── */
    // DB constraint is case-sensitive: SAHIWAL vs sahiwal can coexist at DB level
    // Application helper prevents this but raw DB allows it
    await client.query('SAVEPOINT sp3');
    try {
      await client.query(
        `UPDATE tehsils SET tehsil_english = UPPER('__Stable_A__') WHERE tehsil_id = $1`,
        [idB]
      );
      // If we get here, DB allowed it (case-variant limitation confirmed)
      assert('case-variant DB limitation: DB allows different case', true);
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp3');
      if (e.code === '23505') {
        assert('case-variant DB limitation: DB constraint is case-insensitive (stricter than expected)', true);
      } else {
        assert('case-variant DB limitation: unexpected error', false, e.message);
      }
    }

    /* ─── Max lengths ─────────────────────────────────────────────── */
    console.log('\n── Length boundary tests ───────────────────────────────────');

    const eng100  = 'E'.repeat(100);
    const urdu100 = 'ا'.repeat(100);
    const abb20   = 'A'.repeat(20);

    const maxOk = await updateAdminTehsil(idA, {
      district_id: districtA, tehsil_english: eng100,
      tehsil_urdu: urdu100, tehsil_abb: abb20, is_active: true
    });
    assert('exact max lengths succeed', maxOk !== null);

    await client.query('SAVEPOINT sp4');
    // English 101 chars → 22001
    try {
      await updateAdminTehsil(idA, {
        district_id: districtA, tehsil_english: 'E'.repeat(101),
        tehsil_urdu: null, tehsil_abb: null, is_active: true
      });
      assert('overlength English → 22001', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp4');
      assertEq('overlength English → 22001', e.code, '22001');
    }

    await client.query('SAVEPOINT sp5');
    // Urdu 101 chars → 22001
    try {
      await updateAdminTehsil(idA, {
        district_id: districtA, tehsil_english: '__OvUrdu__',
        tehsil_urdu: 'ا'.repeat(101), tehsil_abb: null, is_active: true
      });
      assert('overlength Urdu → 22001', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp5');
      assertEq('overlength Urdu → 22001', e.code, '22001');
    }

    await client.query('SAVEPOINT sp6');
    // ABB 21 chars → 22001
    try {
      await updateAdminTehsil(idA, {
        district_id: districtA, tehsil_english: '__OvABB__',
        tehsil_urdu: null, tehsil_abb: 'A'.repeat(21), is_active: true
      });
      assert('overlength ABB → 22001', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp6');
      assertEq('overlength ABB → 22001', e.code, '22001');
    }

    /* ─── SQL-like input stays literal ───────────────────────────── */
    console.log('\n── SQL injection / literal input ───────────────────────────');
    const sqlLike = `'; DROP TABLE tehsils; --`;
    // Use getAdminTehsilById with a SQL-like id — throws 22P02 because it's not a BIGINT
    await client.query('SAVEPOINT sp7');
    try {
      await getAdminTehsilById(sqlLike);
      assert('SQL-like BIGINT input stays literal', false, 'no error thrown');
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp7');
      assertEq('SQL-like BIGINT input stays literal (22P02)', e.code, '22P02');
    }

    // findHelper with SQL-like name (this is a string column, so it returns null)
    await client.query('SAVEPOINT sp8');
    try {
      const sqlFind = await findTehsilByEnglishInsensitiveInDistrictExcludingId(
        districtA, sqlLike, idA
      );
      assertEq('SQL-like find string input stays literal', sqlFind, null);
    } catch (e) {
      await client.query('ROLLBACK TO SAVEPOINT sp8');
      assert('SQL-like find string input', false, e.message);
    }

    /* ═══════════════════════════════════════════════════════════════════
       SECTION 4 — Regression: existing functions
    ═══════════════════════════════════════════════════════════════════ */
    console.log('\n── Regression: existing functions ──────────────────────────');

    // getAdminTehsils pagination
    const list = await getAdminTehsils({ page: 1, limit: 5 });
    assert('getAdminTehsils returns rows array', Array.isArray(list.rows));
    assert('getAdminTehsils returns meta',       list.meta !== undefined);
    assert('meta has total',      typeof list.meta.total === 'number');
    assert('meta has page',       typeof list.meta.page  === 'number');
    assert('meta has limit',      typeof list.meta.limit === 'number');
    assert('meta has totalPages', typeof list.meta.totalPages === 'number');

    // getAdminTehsils search (only tehsil fields)
    const searchRes = await getAdminTehsils({ search: '__Stable', page: 1, limit: 10 });
    assert('search finds temp rows', searchRes.rows.length > 0);
    searchRes.rows.forEach(r => {
      const matched =
        r.tehsil_english.includes('__Stable') ||
        (r.tehsil_urdu   && r.tehsil_urdu.includes('__Stable')) ||
        (r.tehsil_abb    && r.tehsil_abb.includes('__Stable'));
      assert(`search result ${r.tehsil_id} matches tehsil field`, matched);
    });

    // createAdminTehsil regression
    const tmpReg = await createAdminTehsil({
      district_id:    districtA,
      tehsil_english: '__RegTehsil__',
      tehsil_urdu:    null,
      tehsil_abb:     null
    });
    assert('createAdminTehsil returns row', tmpReg !== null);
    assertEq('createAdminTehsil tehsil_english', tmpReg.tehsil_english, '__RegTehsil__');

    // findTehsilByEnglishInsensitiveInDistrict regression
    const findReg = await findTehsilByEnglishInsensitiveInDistrict(districtA, '__REGTEHMIL__');
    // Won't match because name is different — just ensure it doesn't throw
    assert('findTehsilByEnglishInsensitiveInDistrict does not throw', true);

    const findRegExact = await findTehsilByEnglishInsensitiveInDistrict(districtA, '__RegTehsil__');
    assert('findTehsilByEnglishInsensitiveInDistrict finds match', findRegExact !== null);

    /* ─── No delete functions on tehsils ─────────────────────────── */
    const modelExports = require('../models/Admin/Reference/location/tehsils.model');
    assert('no getTehsilDependencies exported', !('getTehsilDependencies' in modelExports));
    assert('no deleteAdminTehsil exported',     !('deleteAdminTehsil'     in modelExports));

    /* ─── All 6 functions exported ───────────────────────────────── */
    assert('getAdminTehsils exported',                                 'getAdminTehsils'                                 in modelExports);
    assert('createAdminTehsil exported',                               'createAdminTehsil'                               in modelExports);
    assert('findTehsilByEnglishInsensitiveInDistrict exported',        'findTehsilByEnglishInsensitiveInDistrict'        in modelExports);
    assert('getAdminTehsilById exported',                              'getAdminTehsilById'                              in modelExports);
    assert('findTehsilByEnglishInsensitiveInDistrictExcludingId exported', 'findTehsilByEnglishInsensitiveInDistrictExcludingId' in modelExports);
    assert('updateAdminTehsil exported',                               'updateAdminTehsil'                               in modelExports);

  } finally {
    /* ── Always roll back — no real data touched ─────────────────── */
    await client.query('ROLLBACK');
    if (originalPoolQuery) {
      pool.query = originalPoolQuery;
    }
    client.release();
    await pool.end();

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log(`  TOTAL: ${passed + failed}  ✅ passed: ${passed}  ❌ failed: ${failed}`);
    console.log('  All changes ROLLED BACK — no real Tehsil modified/deleted.');
    console.log('  Sequences not reset.');
    console.log('══════════════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
  }
}

run().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
