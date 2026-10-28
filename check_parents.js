const { pool } = require('./server/config/db');

async function checkSchema() {
  try {
    const dRows = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'districts';`);
    console.log("Districts:", dRows.rows.map(r => r.column_name));
    
    const divRows = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'divisions';`);
    console.log("Divisions:", divRows.rows.map(r => r.column_name));
    
    const pRows = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'provinces';`);
    console.log("Provinces:", pRows.rows.map(r => r.column_name));
    
    const cRows = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'countries';`);
    console.log("Countries:", cRows.rows.map(r => r.column_name));

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkSchema();
