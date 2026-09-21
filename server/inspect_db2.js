const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'PPC_UPDATED',
  user: 'postgres',
  password: '8811287512@s'
});

async function run() {
  try {
    // 2. Numeric precision/scale
    console.log("=== NUMERIC PRECISION/SCALE ===");
    const res2 = await pool.query(`
      SELECT table_name, column_name, data_type, numeric_precision, numeric_scale 
      FROM information_schema.columns 
      WHERE (table_name = 'property_demand' AND column_name = 'demand_amount')
         OR (table_name = 'properties' AND column_name = 'property_size')
    `);
    console.table(res2.rows);

    // 3. PK generation convention
    console.log("\n=== PK GENERATION CONVENTION ===");
    const res3 = await pool.query(`
      SELECT table_name, column_name, column_default, is_identity, identity_generation 
      FROM information_schema.columns 
      WHERE table_name IN ('customer_requests', 'properties', 'property_demand', 'cities')
        AND column_name LIKE '%_id'
    `);
    console.table(res3.rows);

    // 4. Currencies
    console.log("\n=== CURRENCIES ===");
    const res4 = await pool.query(`SELECT * FROM currencies LIMIT 5`);
    console.table(res4.rows);

    // 6. FK delete behavior
    console.log("\n=== FK DELETE BEHAVIOR ===");
    const res6 = await pool.query(`
      SELECT
        tc.table_name, kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule, rc.delete_rule
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('customer_request_status_history', 'property_demand', 'properties', 'customer_requests')
    `);
    console.table(res6.rows);

    // 7 & 8. created_by_user and Audit timestamps
    console.log("\n=== AUDIT COLUMNS ===");
    const res7 = await pool.query(`
      SELECT table_name, column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('customer_requests', 'property_demand')
        AND column_name IN ('creation_date_time', 'update_date_time', 'created_by_user', 'is_active')
    `);
    console.table(res7.rows);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
