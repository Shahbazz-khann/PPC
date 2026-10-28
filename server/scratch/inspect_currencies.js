require('dotenv').config();
const { pool } = require('../config/db');

async function inspectCurrencies() {
  try {
    console.log('--- SEARCHING FOR CURRENCY TABLES ---');
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (table_name ILIKE '%curr%' OR table_name ILIKE '%finance%' OR table_name ILIKE '%money%')
      ORDER BY table_name;
    `);
    console.log('Matching tables:', tablesRes.rows);

    // List all tables in public schema for complete picture
    const allTablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('All public tables count:', allTablesRes.rows.length);
    const tableNames = allTablesRes.rows.map(r => r.table_name);
    console.log('All public tables:', tableNames);

    for (const table of tablesRes.rows) {
      console.log(`\n--- COLUMNS FOR ${table.table_name} ---`);
      const colsRes = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table.table_name]);
      console.log(colsRes.rows);

      console.log(`\n--- ROWS IN ${table.table_name} ---`);
      const dataRes = await pool.query(`SELECT * FROM "${table.table_name}" LIMIT 20;`);
      console.log(`Count: ${dataRes.rows.length}`);
      console.log(dataRes.rows);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error inspecting database:', err);
    process.exit(1);
  }
}

inspectCurrencies();
