const { connectDB, pool } = require('./config/db');
const OwnerModel = require('./models/Owner/owner.model');
require('dotenv').config();

async function run() {
  await connectDB();
  const ownerId = 3;

  const result = await OwnerModel.getPropertyVerificationsList(ownerId, { page: 1, limit: 10 });
  console.log('List Result:', result);
  
  process.exit(0);
}
run();
