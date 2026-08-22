require('dotenv').config();
const { pool } = require('./config/db');

async function checkSchema() {
  try {
    const query = `
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('users', 'properties', 'inspections', 'property_visits')
        AND column_name IN ('user_id', 'property_id', 'inspection_id', 'visit_id');
    `;
    const res = await pool.query(query);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
