const { connectDB, pool } = require('./config/db');
require('dotenv').config();

async function run() {
  await connectDB();
  const ownerId = 3;

  const query = `
    WITH latest_verifications AS (
      SELECT 
        pv.property_id,
        pv.verification_status_id,
        ROW_NUMBER() OVER (PARTITION BY pv.property_id ORDER BY pv.created_at DESC) as rn
      FROM property_verifications pv
    )
    SELECT 
      COUNT(DISTINCT p.property_id) AS total_properties,
      COUNT(DISTINCT CASE WHEN vs.name IN ('Pending', 'Under Verification', 'In Progress') OR vs.name IS NULL THEN p.property_id END) AS pending_verification,
      COUNT(DISTINCT CASE WHEN vs.name = 'Verified' THEN p.property_id END) AS verified_properties,
      COUNT(DISTINCT CASE WHEN vs.name = 'Rejected' THEN p.property_id END) AS rejected_properties
    FROM properties p
    LEFT JOIN latest_verifications lv ON p.property_id = lv.property_id AND lv.rn = 1
    LEFT JOIN verification_statuses vs ON lv.verification_status_id = vs.verification_status_id
    WHERE p.owner_id = $1 AND (p.is_deleted = FALSE OR p.is_deleted IS NULL)
  `;

  const { rows } = await pool.query(query, [ownerId]);
  console.log('Summary:', rows[0]);
  
  process.exit(0);
}
run();
