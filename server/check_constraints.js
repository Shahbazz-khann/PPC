require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkConstraints() {
  const res = await pool.query(`
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'property_amenities'::regclass AND contype = 'u';
  `);
  console.log(res.rows);
  pool.end();
}
checkConstraints();
