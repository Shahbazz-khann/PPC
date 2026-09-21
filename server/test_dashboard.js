require('dotenv').config();
const OwnerModel = require('./models/Owner/owner.model.js');
const db = require('./config/db.js');

async function test() {
    try {
        const ownerId = 14; // the one I tested before, which had 1 property and 0 pending
        const dashboard = await OwnerModel.getDashboardSummary(ownerId);
        console.log('New Dashboard Summary for owner_id 14:', dashboard);
    } catch(err) {
        console.error(err);
    } finally {
        db.pool.end();
    }
}
test();
