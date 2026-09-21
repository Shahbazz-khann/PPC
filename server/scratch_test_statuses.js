const { connectDB, pool } = require('./config/db');
require('dotenv').config();

async function run() {
  await connectDB();
  const { rows } = await pool.query('SELECT * FROM verification_statuses');
  console.log('Verification Statuses:', rows);
  
  const { rows: verificationCounts } = await pool.query(`
    SELECT property_id, COUNT(*) 
    FROM property_verifications 
    GROUP BY property_id
  `);
  console.log('Verifications per property:', verificationCounts);
  
  process.exit(0);
}
run();
