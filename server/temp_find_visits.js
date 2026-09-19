require('dotenv').config();
const { pool } = require('./config/db');
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%report%' OR table_name LIKE '%inspect%' OR table_name LIKE '%verif%')")
  .then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(e => console.log(e.message))
  .finally(() => process.exit());
