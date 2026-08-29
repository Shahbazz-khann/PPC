const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'PPC_MYDATABASE', password: 'Shabaz@123', port: 5432 });

async function run() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'properties'");
    console.log('Columns:', res.rows.map(r => r.column_name));
    
    const types = await pool.query("SELECT * FROM property_purposes");
    console.log('Purposes:', types.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
