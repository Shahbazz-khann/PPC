require('dotenv').config();
const { pool } = require('./config/db');

async function checkProperties() {
  const query = `
    SELECT 
      p.property_id, 
      c.customer_id, 
      ast.approval_stage_english AS approval, 
      pst.status_english AS status, 
      pdt.demand_type_english AS demand_type, 
      COALESCE(pd.final_amount, pd.demand_amount) AS price, 
      (SELECT COUNT(*) FROM property_pictures pp WHERE pp.property_id = p.property_id AND pp.is_active = true) AS pic_count, 
      (SELECT COUNT(*) FROM property_videos pv WHERE pv.property_id = p.property_id AND pv.is_active = true) AS vid_count 
    FROM properties p 
    JOIN customers c ON p.customer_id = c.customer_id 
    LEFT JOIN property_approvals pa ON p.property_id = pa.property_id AND pa.is_active = true 
    LEFT JOIN approval_stages ast ON pa.approval_stage_id = ast.approval_stage_id 
    LEFT JOIN property_status ps ON p.property_id = ps.property_id AND ps.is_active = true 
    LEFT JOIN property_status_types pst ON ps.status_id = pst.status_id 
    LEFT JOIN property_demand pd ON p.property_id = pd.property_id AND pd.is_active = true 
    LEFT JOIN property_demand_types pdt ON pd.demand_type_id = pdt.demand_type_id 
    WHERE p.property_id IN (1, 2, 3, 6, 7, 8)
  `;
  try {
    const r = await pool.query(query);
    console.table(r.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkProperties();
