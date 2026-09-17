require('dotenv').config({ path: './.env' });
const { pool } = require('./config/db');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ user_id: 1, user_type: 'customer' }, process.env.JWT_SECRET || 'secretkey');
const auth = { headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } };

async function run() {
    try {
        console.log("--- 1. FETCHING DEMAND TYPES ---");
        const refRes = await fetch('http://127.0.0.1:5000/api/v1/reference/property-form', auth).then(r=>r.json());
        const demandTypes = refRes.data.demandTypes;
        const saleType = demandTypes.find(d => d.demand_type_english === 'Sale');
        const rentType = demandTypes.find(d => d.demand_type_english === 'Rent');

        console.log(`Sale ID: ${saleType.demand_type_id}, Rent ID: ${rentType.demand_type_id}`);

        console.log("--- 2. SETTING PRICING ---");
        const p2 = await fetch('http://127.0.0.1:5000/api/v1/customer/properties/2/demand', {
            method: 'POST', ...auth, body: JSON.stringify({ demand_type_id: saleType.demand_type_id, demand_amount: 25000000 })
        }).then(r=>r.json());
        console.log('Property 2 Pricing:', p2.success, p2.message);

        const p3 = await fetch('http://127.0.0.1:5000/api/v1/customer/properties/3/demand', {
            method: 'POST', ...auth, body: JSON.stringify({ demand_type_id: rentType.demand_type_id, demand_amount: 150000 })
        }).then(r=>r.json());
        console.log('Property 3 Pricing:', p3.success, p3.message);

        const p6 = await fetch('http://127.0.0.1:5000/api/v1/customer/properties/6/demand', {
            method: 'POST', ...auth, body: JSON.stringify({ demand_type_id: saleType.demand_type_id, demand_amount: 45000000 })
        }).then(r=>r.json());
        console.log('Property 6 Pricing:', p6.success, p6.message);

        const p7 = await fetch('http://127.0.0.1:5000/api/v1/customer/properties/7/demand', {
            method: 'POST', ...auth, body: JSON.stringify({ demand_type_id: rentType.demand_type_id, demand_amount: 200000 })
        }).then(r=>r.json());
        console.log('Property 7 Pricing:', p7.success, p7.message);

        console.log("--- 3. APPROVAL & STATUS TRANSITIONS ---");
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const approvedStageRes = await client.query("SELECT approval_stage_id FROM approval_stages WHERE approval_stage_english = 'Approved'");
            const approvedStageId = approvedStageRes.rows[0].approval_stage_id;

            const activeStatusRes = await client.query("SELECT status_id FROM property_status_types WHERE status_english = 'Active'");
            const activeStatusId = activeStatusRes.rows[0].status_id;

            const properties = [1, 2, 3, 6, 7];

            for (const propId of properties) {
                // 1. Deactivate current approval
                await client.query(`UPDATE property_approvals SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true`, [propId]);
                
                // 2. Insert new Approved approval
                await client.query(`
                    INSERT INTO property_approvals (property_id, approval_stage_id, effective_date, created_by_user, creation_date_time, update_date_time, is_active)
                    VALUES ($1, $2, CURRENT_DATE, 1, NOW(), NOW(), true)
                `, [propId, approvedStageId]);

                // 3. Deactivate current status
                await client.query(`UPDATE property_status SET is_active = false, update_date_time = NOW() WHERE property_id = $1 AND is_active = true`, [propId]);
                
                // 4. Insert new Active status
                await client.query(`
                    INSERT INTO property_status (property_id, status_id, effective_date, created_by_user, creation_date_time, update_date_time, is_active)
                    VALUES ($1, $2, CURRENT_DATE, 1, NOW(), NOW(), true)
                `, [propId, activeStatusId]);
            }

            await client.query('COMMIT');
            console.log("Transitions completed successfully for 1, 2, 3, 6, 7.");
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        console.log("--- 4. PUBLIC API VERIFICATION ---");
        const publicSearch = await fetch('http://127.0.0.1:5000/api/v1/public/properties/search?limit=5').then(r=>r.json());
        console.log(`Public Search Count: ${publicSearch.data.length}`);
        
        const buyFilter = await fetch('http://127.0.0.1:5000/api/v1/public/properties/search?intent=Buy').then(r=>r.json());
        console.log(`Buy Filter Count: ${buyFilter.data.length}`);

        const rentFilter = await fetch('http://127.0.0.1:5000/api/v1/public/properties/search?intent=Rent').then(r=>r.json());
        console.log(`Rent Filter Count: ${rentFilter.data.length}`);

        const complexFilter = await fetch('http://127.0.0.1:5000/api/v1/public/properties/search?city=Islamabad&propertyType=House&minPrice=100000').then(r=>r.json());
        console.log(`Complex Filter Count: ${complexFilter.data.length}`);

    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

run();
