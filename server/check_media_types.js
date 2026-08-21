require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
  try {
    const res = await pool.query('SELECT * FROM media_types');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
