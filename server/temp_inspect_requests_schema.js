require('dotenv').config();
const { pool } = require('./config/db');

async function inspectSchema() {
  try {
    console.log("========================================");
    console.log("2. CUSTOMER_REQUESTS EXACT LIVE SCHEMA");
    console.log("========================================");
    
    // Columns
    const colsRes = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'customer_requests'
      ORDER BY ordinal_position;
    `);
    console.log("Columns:\n", JSON.stringify(colsRes.rows, null, 2));

    // PK and constraints
    const constRes = await pool.query(`
      SELECT conname, contype, pg_get_constraintdef(c.oid) AS definition
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'customer_requests';
    `);
    console.log("\nConstraints:\n", JSON.stringify(constRes.rows, null, 2));

    // Indexes
    const idxRes = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'customer_requests';
    `);
    console.log("\nIndexes:\n", JSON.stringify(idxRes.rows, null, 2));

    const countRes = await pool.query(`SELECT count(*) FROM customer_requests;`);
    console.log("\nRow Count: ", countRes.rows[0].count);

    if (parseInt(countRes.rows[0].count) > 0) {
        const sampleRes = await pool.query(`SELECT * FROM customer_requests LIMIT 3;`);
        console.log("\nSample Rows:\n", JSON.stringify(sampleRes.rows, null, 2));
    }

    console.log("\n========================================");
    console.log("3. ALL FOREIGN KEY RELATIONSHIPS");
    console.log("========================================");

    // FKs FROM customer_requests
    const fkFromRes = await pool.query(`
      SELECT
          tc.constraint_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='customer_requests';
    `);
    console.log("FKs FROM customer_requests:\n", JSON.stringify(fkFromRes.rows, null, 2));

    // FKs TO customer_requests
    const fkToRes = await pool.query(`
      SELECT
          tc.constraint_name,
          tc.table_name AS referencing_table_name,
          kcu.column_name AS referencing_column_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='customer_requests';
    `);
    console.log("FKs TO customer_requests:\n", JSON.stringify(fkToRes.rows, null, 2));

    console.log("\n========================================");
    console.log("4. PROPERTY REQUEST MASTER (property_purposes)");
    console.log("========================================");
    const purposeColsRes = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'property_purposes';
    `);
    console.log("property_purposes Columns:\n", JSON.stringify(purposeColsRes.rows, null, 2));
    
    try {
        const purposeRowsRes = await pool.query(`SELECT * FROM property_purposes;`);
        console.log("property_purposes Rows:\n", JSON.stringify(purposeRowsRes.rows, null, 2));
    } catch (e) { console.log("Failed to query property_purposes rows:", e.message); }

    console.log("\n========================================");
    console.log("5. PPC SERVICE REQUEST MASTER (ppc_services)");
    console.log("========================================");
    const serviceColsRes = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'ppc_services';
    `);
    console.log("ppc_services Columns:\n", JSON.stringify(serviceColsRes.rows, null, 2));
    
    try {
        const serviceRowsRes = await pool.query(`SELECT * FROM ppc_services;`);
        console.log("ppc_services Rows:\n", JSON.stringify(serviceRowsRes.rows, null, 2));
    } catch (e) { console.log("Failed to query ppc_services rows:", e.message); }

    console.log("\n========================================");
    console.log("6. REQUEST STATUS — CRITICAL");
    console.log("========================================");
    
    const tablesRes = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (
            table_name ILIKE '%status%' OR 
            table_name ILIKE '%request%' OR 
            table_name ILIKE '%history%' OR 
            table_name ILIKE '%workflow%' OR 
            table_name ILIKE '%assignment%'
        );
    `);
    console.log("Tables matching keywords (status/request/history/workflow/assignment):\n", JSON.stringify(tablesRes.rows, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

inspectSchema();
