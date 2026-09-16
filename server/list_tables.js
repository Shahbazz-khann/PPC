const { Pool } = require('pg');
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });
pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'").then(res => {
  console.log(res.rows.map(r => r.table_name).join(', '));
  pool.end();
});
