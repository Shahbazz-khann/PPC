require('dotenv').config();
const { pool } = require('../config/db');

async function grantCurrenciesAccess() {
  try {
    await pool.query(`
      UPDATE role_page_access 
      SET can_access = true 
      WHERE page_key = 'PAGE_REF_CURRENCIES';
    `);
    const check = await pool.query(`
      SELECT * FROM role_page_access WHERE page_key = 'PAGE_REF_CURRENCIES';
    `);
    console.log('Updated role_page_access:', check.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

grantCurrenciesAccess();
