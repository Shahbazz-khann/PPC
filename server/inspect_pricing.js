require('dotenv').config();
const { pool } = require('./config/db');
async function run() {
  const getTableInfo = async (table) => {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [table]);
    return res.rows;
  };
  const getConstraints = async (table) => {
    const res = await pool.query(`
      SELECT tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints tc 
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name 
      LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name 
      WHERE tc.table_name = $1
    `, [table]);
    return res.rows;
  };
  const getRowCount = async (table) => {
    try {
      const res = await pool.query(`SELECT count(*) FROM ` + table);
      return res.rows[0].count;
    } catch(e) { return -1; }
  };
  const getRows = async (query) => {
    try {
      const res = await pool.query(query);
      return res.rows;
    } catch(e) { return e.message; }
  };

  console.log('--- SCHEMA ---');
  for (const t of ['property_demand', 'property_demand_types', 'currencies']) {
    console.log('\nTable:', t);
    console.log('Columns:', await getTableInfo(t));
    console.log('Constraints:', await getConstraints(t));
    console.log('Row Count:', await getRowCount(t));
  }
  
  console.log('\n--- LIVE DATA ---');
  console.log('Demand Types:', await getRows('SELECT * FROM property_demand_types'));
  console.log('Currencies:', await getRows('SELECT * FROM currencies'));
  console.log('Property Demand Records:', await getRows('SELECT * FROM property_demand LIMIT 10'));

  process.exit(0);
}
run();
