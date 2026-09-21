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
    console.log("=== property_visits schema ===");
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default, is_identity
      FROM information_schema.columns 
      WHERE table_name = 'property_visits'
    `);
    console.table(cols.rows);

    console.log("\n=== Constraints (PK, UNIQUE, CHECK) ===");
    const constraints = await client.query(`
      SELECT tc.constraint_type, tc.constraint_name, kcu.column_name, cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'property_visits'
    `);
    console.table(constraints.rows);

    console.log("\n=== Foreign Keys ===");
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
        AND tc.table_name = 'property_visits'
    `);
    console.table(fks.rows);

    console.log("\n=== Child Tables Referencing property_visits ===");
    const childTables = await client.query(`
      SELECT
        tc.table_name AS referencing_table,
        kcu.column_name AS referencing_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'property_visits'
    `);
    console.table(childTables.rows);

    console.log("\n=== Search for Visit Status Tables ===");
    const statusTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%visit%status%'
    `);
    console.table(statusTables.rows);

    console.log("\n=== Indexes ===");
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'property_visits'
    `);
    console.table(indexes.rows);

    console.log("\n=== Row Count ===");
    const countRes = await client.query(`SELECT COUNT(*) FROM property_visits`);
    console.log(`Count: ${countRes.rows[0].count}`);

  } catch (err) {
    if (err.message.includes('relation "property_visits" does not exist')) {
        console.log("Table property_visits does not exist!");
    } else {
        console.error(err);
    }
  } finally {
    client.release();
    pool.end();
  }
}

run();
