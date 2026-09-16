require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'property_use' ORDER BY ordinal_position")
  .then(res => {
    console.log("Cols:", res.rows.map(r => r.column_name + ' (' + r.data_type + ')').join(', '));
    return pool.query("SELECT * FROM property_use");
  })
  .then(r => {
    console.log('Rows:', r.rowCount);
    if(r.rowCount > 0) console.log('Sample:', r.rows[0]);
  })
  .finally(() => pool.end());
