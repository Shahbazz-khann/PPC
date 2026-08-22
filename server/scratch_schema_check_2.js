require('dotenv').config();
const { pool } = require('./config/db');

async function checkSerial() {
  try {
    const query = `
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'user_id';
    `;
    const res = await pool.query(query);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSerial();
