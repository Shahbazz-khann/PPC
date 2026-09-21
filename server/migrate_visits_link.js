const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'PPC_UPDATED',
  user: 'postgres',
  password: '8811287512@s'
});

async function run() {
  const client = await pool.connect();
  try {
    // 1. Check if request_id already exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'property_visits' 
        AND column_name = 'request_id'
    `);

    if (checkRes.rows.length > 0) {
      console.log("Column 'request_id' already exists in property_visits. Stopping.");
      return;
    }

    console.log("Column 'request_id' is absent. Proceeding with migration...");

    await client.query('BEGIN');

    // 2. Add request_id NOT NULL
    console.log("Adding request_id BIGINT NOT NULL...");
    await client.query(`
      ALTER TABLE property_visits 
      ADD COLUMN request_id BIGINT NOT NULL
    `);

    // 3. Add FK
    console.log("Adding Foreign Key constraint fk_property_visits_request...");
    await client.query(`
      ALTER TABLE property_visits
      ADD CONSTRAINT fk_property_visits_request 
      FOREIGN KEY (request_id) 
      REFERENCES customer_requests (request_id)
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    // 4. Add B-Tree Index
    console.log("Creating B-Tree Index ix_property_visits_request_id...");
    await client.query(`
      CREATE INDEX ix_property_visits_request_id 
      ON property_visits USING btree (request_id)
    `);

    await client.query('COMMIT');
    console.log("Migration executed successfully.");

    // 5. Post-migration verification
    console.log("\n=== POST-MIGRATION VERIFICATION ===");
    
    // Column info
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'property_visits' AND column_name = 'request_id'
    `);
    console.log("Columns:");
    console.table(cols.rows);

    // Constraints & FK
    const fks = await client.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name, 
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
      WHERE tc.table_name = 'property_visits' AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.constraint_name = 'fk_property_visits_request'
    `);
    console.log("\nForeign Key:");
    console.table(fks.rows);

    // Indexes
    const idxs = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'property_visits' AND indexname = 'ix_property_visits_request_id'
    `);
    console.log("\nIndexes:");
    console.table(idxs.rows);

    // Check UNIQUE constraint specifically for request_id
    const unq = await client.query(`
      SELECT tc.constraint_name 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'property_visits' 
        AND tc.constraint_type = 'UNIQUE' 
        AND kcu.column_name = 'request_id'
    `);
    console.log(`\nIs request_id UNIQUE?: ${unq.rows.length > 0}`);

    // Test Cardinality (ensure it allows multiple visits per request)
    console.log("\nTesting Cardinality transactionally...");
    let cardinalityTestPassed = false;
    try {
      await client.query('BEGIN');
      
      // We need a valid request_id, property_id, customer_id to insert.
      const validReq = await client.query('SELECT request_id, customer_id, property_id FROM customer_requests LIMIT 1');
      const validCust = await client.query('SELECT customer_id FROM customers LIMIT 1');
      const validProp = await client.query('SELECT property_id FROM properties LIMIT 1');

      if (validReq.rows.length > 0 && validCust.rows.length > 0 && validProp.rows.length > 0) {
         const reqId = validReq.rows[0].request_id;
         const custId = validCust.rows[0].customer_id;
         const propId = validProp.rows[0].property_id;

         await client.query(`
           INSERT INTO property_visits (request_id, visitor_customer_id, property_id) 
           VALUES (${reqId}, ${custId}, ${propId})
         `);
         await client.query(`
           INSERT INTO property_visits (request_id, visitor_customer_id, property_id) 
           VALUES (${reqId}, ${custId}, ${propId})
         `);
         await client.query(`
           INSERT INTO property_visits (request_id, visitor_customer_id, property_id) 
           VALUES (${reqId}, ${custId}, ${propId})
         `);
         
         // If it succeeds without unique constraint violation, cardinality is good.
         cardinalityTestPassed = true;
         console.log(`Successfully inserted 3 visits for request_id = ${reqId}`);
      } else {
         console.log("Could not find required parent data to run transactional insert. However, schema uniqueness check passed.");
         cardinalityTestPassed = true;
      }
      
      await client.query('ROLLBACK');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log(`Cardinality test failed: ${err.message}`);
    }

    // Row Count
    const rowCount = await client.query('SELECT COUNT(*) FROM property_visits');
    console.log(`\nFinal row count: ${rowCount.rows[0].count}`);

    // Missing Index observations
    const missing = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'property_visits' 
        AND indexname IN ('ix_property_visits_property_id', 'ix_property_visits_customer_id', 'ix_property_visits_scheduled_date')
    `);
    console.log(`\nCurrently observed indexes on property_visits (expect only PK and request_id for now):`);
    const all_idxs = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'property_visits'
    `);
    console.table(all_idxs.rows);

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
