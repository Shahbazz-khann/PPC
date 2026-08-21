require('dotenv').config();
const { pool } = require('./config/db');

async function run() {
  const tables = ['invoices', 'commission_records', 'payments', 'invoice_statuses', 'payment_statuses'];
  
  for (const table of tables) {
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}';`);
    console.log(`\n--- ${table} ---`);
    console.log(res.rows);
  }
  process.exit(0);
}

run().catch(console.error);
