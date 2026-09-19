require('dotenv').config();
const { pool } = require('./config/db');

async function inspectSchema() {
  try {
    console.log("========================================");
    console.log("1. PPC_SERVICE_TYPES");
    console.log("========================================");
    
    const pstCols = await pool.query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'ppc_service_types'`);
    console.log("ppc_service_types Columns:\n", JSON.stringify(pstCols.rows, null, 2));
    
    const pstRows = await pool.query(`SELECT * FROM ppc_service_types`);
    console.log("ppc_service_types Rows:\n", JSON.stringify(pstRows.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectSchema();
