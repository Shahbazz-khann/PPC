require('dotenv').config();
const OwnerModel = require('./models/Owner/owner.model.js');
const db = require('./config/db.js');

async function test() {
    try {
        // Find an owner that has properties
        const res = await db.pool.query('SELECT owner_id FROM properties LIMIT 1');
        if (res.rowCount === 0) { console.log('No properties in db'); return; }
        const ownerId = res.rows[0].owner_id;
        console.log('Testing for owner_id:', ownerId);
        
        const dashboard = await OwnerModel.getDashboardSummary(ownerId);
        console.log('Dashboard Summary:', dashboard);
        
        const verif = await OwnerModel.getVerificationSummary(ownerId);
        console.log('Verification Summary:', verif);
    } catch(err) {
        console.error(err);
    } finally {
        db.pool.end();
    }
}
test();
