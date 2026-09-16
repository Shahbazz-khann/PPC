const { Pool } = require('pg');
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='marla_sizes'").then(res => {
  console.log(res.rows.map(r => r.column_name).join(', '));
  pool.end();
});
