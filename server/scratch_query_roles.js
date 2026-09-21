require('dotenv').config();
const { pool } = require('./config/db');

pool.query(`
  SELECT * FROM roles;
`).then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
