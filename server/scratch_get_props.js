require('dotenv').config();
const { pool } = require('./config/db');
pool.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'properties';
`).then(r => { console.log(r.rows); pool.end(); });
