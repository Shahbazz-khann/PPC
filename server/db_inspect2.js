const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  const emp = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees'`);
  const app = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'property_approvals'`);
  const prop = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties'`);
  const stages = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'approval_stages'`);
  
  const appFk = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name, 
             ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'property_approvals';
  `);

  const output = {
    employees: emp.rows,
    property_approvals: app.rows,
    approval_stages: stages.rows,
    properties: prop.rows,
    property_approvals_fk: appFk.rows
  };
  console.log(JSON.stringify(output, null, 2));
  pool.end();
}
run();
