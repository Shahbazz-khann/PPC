require('dotenv').config();
const jwt = require('jsonwebtoken');
const { pool } = require('./config/db');

const API = 'http://localhost:5000/api/v1';
const SECRET = process.env.JWT_SECRET;

function makeToken(userId, role) {
    return jwt.sign({ user_id: userId, user_type: role }, SECRET, { expiresIn: '1h' });
}

async function req(endpoint, token, method = 'GET') {
    const r = await fetch(`${API}${endpoint}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
    });
    return { status: r.status, body: await r.json() };
}

async function run() {
    const pass = [];
    const fail = [];

    function check(name, cond, detail = '') {
        if (cond) {
            pass.push(`  ✅ ${name}`);
        } else {
            fail.push(`  ❌ ${name}${detail ? ' | ' + detail : ''}`);
        }
    }

    // --- Get real user IDs ---
    const custRes = await pool.query(`
        SELECT u.user_id, c.customer_id
        FROM users u
        JOIN customers c ON u.user_id = c.user_id
        WHERE u.is_active = true
        LIMIT 1
    `);
    if (custRes.rowCount === 0) { console.error('No active customer'); process.exit(1); }
    const { user_id: custUserId, customer_id: custCustomerId } = custRes.rows[0];

    // Property 6 belongs to customer_id 1 / user_id 1 (confirmed from DB)
    const ownedPropertyId = 6;

    // Get a property that does NOT belong to this customer (if any), else use 9999
    const otherPropRes = await pool.query(
        `SELECT property_id FROM properties WHERE customer_id <> $1 LIMIT 1`,
        [custCustomerId]
    );
    const otherPropertyId = otherPropRes.rowCount > 0 ? otherPropRes.rows[0].property_id : 9999;

    const custToken  = makeToken(custUserId, 'customer');
    const empToken   = makeToken(9998, 'employee');
    const spToken    = makeToken(9999, 'service_provider');

    console.log(`Testing with custUserId=${custUserId}, ownedPropertyId=${ownedPropertyId}`);

    // 1. Owner property → 200
    const r1 = await req(`/customer/properties/${ownedPropertyId}`, custToken);
    check('Owner property → 200', r1.status === 200, `got ${r1.status}`);
    check('success flag true', r1.body.success === true);
    check('data.property exists', !!r1.body.data?.property);
    check('data.location exists', !!r1.body.data?.location);
    check('data.pictures is array', Array.isArray(r1.body.data?.pictures));
    check('data.amenities is array', Array.isArray(r1.body.data?.amenities));
    check('data.video key exists', 'video' in (r1.body.data || {}));
    check('data.approval key exists', 'approval' in (r1.body.data || {}));
    check('data.status key exists', 'status' in (r1.body.data || {}));
    check('data.demand key exists', 'demand' in (r1.body.data || {}));

    // 2. Location hierarchy for property 6 (Islamabad → DHA → Sector W)
    const loc = r1.body.data?.location;
    check('location.country_english = Pakistan', loc?.country_english === 'Pakistan', loc?.country_english);
    check('location.city_english = Islamabad', loc?.city_english === 'Islamabad', loc?.city_english);
    check('location.society_english = DHA', loc?.society_english === 'DHA', loc?.society_english);
    check('location.area_english = Sector W', loc?.area_english === 'Sector W', loc?.area_english);

    // 3. Approval exists + is Pending
    const appr = r1.body.data?.approval;
    check('approval not null', appr !== null, JSON.stringify(appr));
    check('approval.approval_stage = Pending', appr?.approval_stage === 'Pending', appr?.approval_stage);

    // 4. Status exists + is Inactive
    const stat = r1.body.data?.status;
    check('status not null', stat !== null, JSON.stringify(stat));
    check('status.status = Inactive', stat?.status === 'Inactive', stat?.status);

    // 5. Demand null (no demand seeded)
    check('demand is null', r1.body.data?.demand === null, JSON.stringify(r1.body.data?.demand));

    // 6. Pictures for property 6 (has 1 picture uploaded earlier)
    const pics = r1.body.data?.pictures || [];
    check('property 6 has ≥1 picture', pics.length >= 1, `got ${pics.length}`);
    if (pics.length > 1) {
        check('pictures ordered by display_order ASC', pics[0].display_order <= pics[1].display_order);
    }
    if (pics.length > 0) {
        check('picture has picture_url', !!pics[0].picture_url);
        check('picture has display_order', pics[0].display_order !== undefined);
    }

    // 7. Video — property 6 has a real video from earlier E2E run
    const vid = r1.body.data?.video;
    const videoIsValidOrNull = vid === null || (vid && typeof vid.video_url === 'string' && vid.display_order !== undefined);
    check('video is null or valid object with video_url + display_order', videoIsValidOrNull, JSON.stringify(vid));

    // 8. Amenities
    const amens = r1.body.data?.amenities || [];
    // property 6 was created with amenities in E2E test
    check('amenities is array', Array.isArray(amens));

    // 9. Another customer's property → 404
    if (otherPropertyId !== 9999) {
        const r2 = await req(`/customer/properties/${otherPropertyId}`, custToken);
        check("Another customer's property → 404", r2.status === 404, `got ${r2.status}`);
    } else {
        pass.push("  ⏭  Skip: no other-customer property in DB");
    }

    // 10. Invalid propertyId → 400
    const r3 = await req(`/customer/properties/abc`, custToken);
    check('Invalid propertyId (abc) → 400', r3.status === 400, `got ${r3.status}`);
    const r3b = await req(`/customer/properties/0`, custToken);
    check('Invalid propertyId (0) → 400', r3b.status === 400, `got ${r3b.status}`);
    const r3c = await req(`/customer/properties/-1`, custToken);
    check('Invalid propertyId (-1) → 400', r3c.status === 400, `got ${r3c.status}`);

    // 11. Nonexistent property → 404
    const r4 = await req(`/customer/properties/99999`, custToken);
    check('Nonexistent property → 404', r4.status === 404, `got ${r4.status}`);

    // 12. Employee → 403
    const r5 = await req(`/customer/properties/${ownedPropertyId}`, empToken);
    check('Employee → 403', r5.status === 403, `got ${r5.status}`);

    // 13. Service Provider → 403
    const r6 = await req(`/customer/properties/${ownedPropertyId}`, spToken);
    check('Service Provider → 403', r6.status === 403, `got ${r6.status}`);

    // 14. No token → 401
    const r7 = await fetch(`${API}/customer/properties/${ownedPropertyId}`);
    const r7b = await r7.json();
    check('No token → 401', r7.status === 401, `got ${r7.status}`);

    // 15. formatted_id shape
    const fmtId = r1.body.data?.property?.formatted_id;
    check('formatted_id starts with PRP-', fmtId?.startsWith('PRP-'), fmtId);

    // --- Summary ---
    console.log(`\n=== TEST RESULTS (${pass.length + fail.length} total) ===`);
    console.log(`\nPASSED (${pass.length}):`);
    pass.forEach(p => console.log(p));
    if (fail.length > 0) {
        console.log(`\nFAILED (${fail.length}):`);
        fail.forEach(f => console.log(f));
    } else {
        console.log('\nAll tests passed!');
    }

    console.log('\n--- Full response for property 6 ---');
    console.log(JSON.stringify(r1.body, null, 2));

    process.exit(fail.length > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
