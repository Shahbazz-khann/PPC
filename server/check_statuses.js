require('dotenv').config();
const { pool } = require('./config/db');
pool.query('SELECT * FROM inspection_results')
  .then(r => console.log('RESULTS:', r.rows))
  .catch(console.error);

pool.query('SELECT * FROM inspection_statuses')
  .then(r => console.log('STATUSES:', r.rows))
  .catch(console.error)
  .finally(() => pool.end());
