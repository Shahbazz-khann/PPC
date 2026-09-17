const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'PPC_UPDATED',
  password: '8811287512@s',
  port: 5432,
});

async function main() {
  const tables = ['currencies', 'property_demand', 'property_demand_types', 'properties'];
  for (const table of tables) {
    console.log(`\n--- ${table} ---`);
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${table}';
    `);
    console.table(res.rows);
  }

  console.log(`\n--- checking property_demand unique indexes ---`);
  const idxRes = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'property_demand';
  `);
  console.table(idxRes.rows);

  console.log(`\n--- properties table ownership ---`);
  const pRes = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name IN ('customer_id', 'property_id');
  `);
  console.table(pRes.rows);
  
  const custRes = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'customers';
  `);
  console.log(`\n--- customers ---`);
  console.table(custRes.rows);

  pool.end();
}
main();
