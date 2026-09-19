const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD });
async function run() {
  const q1 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'societies'`);
  const q2 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'cities'`);
  const q3 = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'property_types'`);
  console.log(JSON.stringify({societies: q1.rows, cities: q2.rows, property_types: q3.rows}));
  pool.end();
}
run();
