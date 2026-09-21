require('dotenv').config();
const { pool } = require('./config/db');
pool.query("SELECT user_id FROM users WHERE role_id = (SELECT role_id FROM roles WHERE name = 'owner') LIMIT 1")
  .then(r => { console.log("Owner ID:", r.rows[0].user_id); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
