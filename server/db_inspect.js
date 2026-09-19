const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function inspectDb() {
  const output = {};

  try {
    // 1. All verification related tables
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%verif%' OR table_name ILIKE '%approv%' OR table_name ILIKE '%status%' OR table_name ILIKE 'properties%' OR table_name ILIKE '%employee%');
    `);
    output.tables = tablesRes.rows.map(r => r.table_name);

    // 2. property_verifications schema
    const schemaRes = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'property_verifications';
    `);
    output.schema = schemaRes.rows;

    // 3. Indexes
    const indexRes = await pool.query(`
      SELECT
          i.relname as index_name,
          a.attname as column_name,
          ix.indisunique as is_unique,
          pg_get_expr(ix.indpred, ix.indrelid) as partial_condition
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE t.oid = ix.indrelid
        and i.oid = ix.indexrelid
        and a.attrelid = t.oid
        and a.attnum = ANY(ix.indkey)
        and t.relkind = 'r'
        and t.relname = 'property_verifications'
    `);
    output.indexes = indexRes.rows;

    // 4. FKs FROM property_verifications
    const fkFromRes = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name, 
             ccu.table_name AS referenced_table, ccu.column_name AS referenced_column,
             rc.update_rule, rc.delete_rule, c.is_nullable
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc ON rc.constraint_name = tc.constraint_name
      JOIN information_schema.columns AS c ON c.table_name = tc.table_name AND c.column_name = kcu.column_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'property_verifications';
    `);
    output.fk_from = fkFromRes.rows;

    // 5. FKs TO property_verifications
    const fkToRes = await pool.query(`
      SELECT tc.table_name AS source_table, kcu.column_name AS source_column, 
             ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'property_verifications';
    `);
    output.fk_to = fkToRes.rows;

    // 6. Data
    const countRes = await pool.query(`SELECT COUNT(*) FROM property_verifications;`);
    output.count = countRes.rows[0].count;
    
    if (output.count > 0) {
      const sampleRes = await pool.query(`SELECT * FROM property_verifications LIMIT 3;`);
      output.sample = sampleRes.rows;
    }

    // 7. PK for property_verifications
    const pkRes = await pool.query(`
        SELECT kcu.column_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'property_verifications' 
          AND tc.constraint_type = 'PRIMARY KEY';
    `);
    output.pk = pkRes.rows;
    
    // Check property PK
    const pkPropRes = await pool.query(`
        SELECT kcu.column_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'properties' 
          AND tc.constraint_type = 'PRIMARY KEY';
    `);
    output.prop_pk = pkPropRes.rows;

    // Relationships schema (to trace customer path if properties exist)
    const propFkRes = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name, 
             ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'properties';
    `);
    output.prop_fk = propFkRes.rows;

    console.log(JSON.stringify(output, null, 2));

  } catch (err) {
    console.error("Error inspecting DB:", err);
  } finally {
    pool.end();
  }
}

inspectDb();
