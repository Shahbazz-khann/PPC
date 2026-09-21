require('dotenv').config();
const { pool } = require('./config/db');
pool.query("SELECT owner_id FROM properties WHERE property_id = 20")
  .then(r => { console.log("Owner ID of property 20:", r.rows[0]?.owner_id); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
