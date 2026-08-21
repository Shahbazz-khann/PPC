require('dotenv').config();
const { pool } = require('./config/db');
pool.query(`
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name IN ('property_verifications', 'property_visits', 'transactions', 'invoices', 'visit_statuses', 'verification_statuses', 'transaction_statuses', 'invoice_statuses', 'commission_records')
`).then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
