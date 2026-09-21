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
    // 1. Check if table exists
    const checkRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'customer_request_property_requirements'
      );
    `);
    
    const exists = checkRes.rows[0].exists;
    console.log(`Table exists: ${exists}`);

    if (exists) {
      console.log("Table already exists. Stopping.");
      return;
    }

    // 2. Create table
    console.log("Creating table...");
    await client.query(`
      CREATE TABLE customer_request_property_requirements (
          requirement_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          request_id BIGINT NOT NULL,
          property_type_id BIGINT NULL,
          
          city_id BIGINT NOT NULL,
          society_id BIGINT NULL,
          area_id BIGINT NULL,
          
          minimum_budget NUMERIC NULL,
          maximum_budget NUMERIC NULL,
          budget_currency_id BIGINT NULL,
          
          minimum_size NUMERIC NULL,
          maximum_size NUMERIC NULL,
          size_uom_id BIGINT NULL,
          
          minimum_rooms INTEGER NULL,
          minimum_bathrooms INTEGER NULL,
          
          creation_date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          update_date_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
          created_by_user BIGINT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,

          CONSTRAINT uq_crpr_request_id UNIQUE (request_id),
          
          CONSTRAINT fk_crpr_request FOREIGN KEY (request_id) 
              REFERENCES customer_requests (request_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_prop_type FOREIGN KEY (property_type_id) 
              REFERENCES property_types (property_type_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_city FOREIGN KEY (city_id) 
              REFERENCES cities (city_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_society FOREIGN KEY (society_id) 
              REFERENCES societies (society_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_area FOREIGN KEY (area_id) 
              REFERENCES areas (area_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_currency FOREIGN KEY (budget_currency_id) 
              REFERENCES currencies (currency_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_uom FOREIGN KEY (size_uom_id) 
              REFERENCES uom (uom_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
          CONSTRAINT fk_crpr_created_by FOREIGN KEY (created_by_user) 
              REFERENCES users (user_id) ON DELETE NO ACTION ON UPDATE NO ACTION,

          -- Location hierarchy completeness
          CONSTRAINT chk_crpr_hierarchy CHECK (area_id IS NULL OR society_id IS NOT NULL),

          -- Budget checks
          CONSTRAINT chk_crpr_min_budget CHECK (minimum_budget >= 0),
          CONSTRAINT chk_crpr_max_budget CHECK (maximum_budget >= 0),
          CONSTRAINT chk_crpr_budget_range CHECK (
              minimum_budget IS NULL OR maximum_budget IS NULL OR minimum_budget <= maximum_budget
          ),
          CONSTRAINT chk_crpr_currency_req CHECK (
              (minimum_budget IS NULL AND maximum_budget IS NULL AND budget_currency_id IS NULL)
              OR 
              ((minimum_budget IS NOT NULL OR maximum_budget IS NOT NULL) AND budget_currency_id IS NOT NULL)
          ),
          
          -- Size checks
          CONSTRAINT chk_crpr_min_size CHECK (minimum_size >= 0),
          CONSTRAINT chk_crpr_max_size CHECK (maximum_size >= 0),
          CONSTRAINT chk_crpr_size_range CHECK (
              minimum_size IS NULL OR maximum_size IS NULL OR minimum_size <= maximum_size
          ),
          CONSTRAINT chk_crpr_uom_req CHECK (
              (minimum_size IS NULL AND maximum_size IS NULL AND size_uom_id IS NULL)
              OR 
              ((minimum_size IS NOT NULL OR maximum_size IS NOT NULL) AND size_uom_id IS NOT NULL)
          ),

          -- Room constraints
          CONSTRAINT chk_crpr_min_rooms CHECK (minimum_rooms >= 0),
          CONSTRAINT chk_crpr_min_baths CHECK (minimum_bathrooms >= 0)
      );
    `);
    console.log("Table created successfully.");

    // 3. Inspect columns
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default, is_identity
      FROM information_schema.columns 
      WHERE table_name = 'customer_request_property_requirements'
    `);
    console.log("\nColumns:");
    console.table(cols.rows);

    // Inspect FKs
    const fks = await client.query(`
      SELECT
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
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'customer_request_property_requirements'
    `);
    console.log("\nForeign Keys:");
    console.table(fks.rows);

    // Inspect Checks
    const checks = await client.query(`
      SELECT tc.constraint_name, cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'customer_request_property_requirements'
        AND tc.constraint_type = 'CHECK'
    `);
    console.log("\nCheck Constraints:");
    console.table(checks.rows);
    
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'customer_request_property_requirements'
    `);
    console.log("\nIndexes:");
    console.table(indexes.rows);

    // 4. Test Constraints Transactionally
    console.log("\nTesting constraints transactionally...");
    
    // Helper to test a scenario
    const testScenario = async (desc, sql, expectFail) => {
      let failed = false;
      let errorMsg = '';
      try {
        await client.query('SAVEPOINT test_sp');
        await client.query(sql);
        await client.query('ROLLBACK TO SAVEPOINT test_sp');
      } catch (err) {
        failed = true;
        errorMsg = err.message;
        await client.query('ROLLBACK TO SAVEPOINT test_sp');
      }
      
      const success = (failed === expectFail);
      console.log(`[${success ? 'PASS' : 'FAIL'}] ${desc}`);
      if (!success) {
        console.log(`  Expected fail: ${expectFail}, Actually failed: ${failed}. Error: ${errorMsg}`);
      }
    };
    
    await client.query('BEGIN');
    
    // Note: To test inserts properly, we need valid FKs for request_id and city_id.
    // Instead of doing actual inserts which might be tricky if we don't know existing IDs,
    // we can trust the schema definition. We will verify the check constraints exist.
    // If you want me to insert mock data, we could fetch 1 valid request and city.
    const validRequest = await client.query(`SELECT request_id FROM customer_requests LIMIT 1`);
    const validCity = await client.query(`SELECT city_id FROM cities LIMIT 1`);
    
    if (validRequest.rows.length > 0 && validCity.rows.length > 0) {
      const rid = validRequest.rows[0].request_id;
      const cid = validCity.rows[0].city_id;
      
      const baseInsert = `INSERT INTO customer_request_property_requirements (request_id, city_id`;
      
      await testScenario('A. city_id NULL', `INSERT INTO customer_request_property_requirements (request_id) VALUES (${rid})`, true);
      await testScenario('B. min budget > max budget', `${baseInsert}, minimum_budget, maximum_budget, budget_currency_id) VALUES (${rid}, ${cid}, 200, 100, 1)`, true);
      await testScenario('C. budget without currency', `${baseInsert}, minimum_budget) VALUES (${rid}, ${cid}, 100)`, true);
      await testScenario('D. currency without budget', `${baseInsert}, budget_currency_id) VALUES (${rid}, ${cid}, 1)`, true);
      await testScenario('E. size without UOM', `${baseInsert}, minimum_size) VALUES (${rid}, ${cid}, 10)`, true);
      await testScenario('F. UOM without size', `${baseInsert}, size_uom_id) VALUES (${rid}, ${cid}, 1)`, true);
      await testScenario('G. min size > max size', `${baseInsert}, minimum_size, maximum_size, size_uom_id) VALUES (${rid}, ${cid}, 20, 10, 1)`, true);
      await testScenario('H. negative min rooms', `${baseInsert}, minimum_rooms) VALUES (${rid}, ${cid}, -1)`, true);
      await testScenario('I. negative min baths', `${baseInsert}, minimum_bathrooms) VALUES (${rid}, ${cid}, -1)`, true);
      await testScenario('J. area_id without society_id', `${baseInsert}, area_id) VALUES (${rid}, ${cid}, 1)`, true);
      await testScenario('K. duplicate request_id', `${baseInsert}) VALUES (${rid}, ${cid}); ${baseInsert}) VALUES (${rid}, ${cid});`, true);
    } else {
      console.log("Could not find valid request_id or city_id to run insert tests. Skipping insert tests.");
    }
    
    await client.query('ROLLBACK'); // Ensure no test data remains

    // Final count
    const countRes = await client.query(`SELECT COUNT(*) FROM customer_request_property_requirements`);
    console.log(`\nFinal row count in table: ${countRes.rows[0].count}`);

  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
