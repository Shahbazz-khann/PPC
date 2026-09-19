const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  const output = {};

  try {
    // 1. property_approvals full schema
    const propAppSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'property_approvals'
    `);
    output.property_approvals_schema = propAppSchema.rows;

    const propAppIndexes = await pool.query(`
      SELECT i.relname as index_name, a.attname as column_name, ix.indisunique as is_unique
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE t.oid = ix.indrelid and i.oid = ix.indexrelid and a.attrelid = t.oid and a.attnum = ANY(ix.indkey)
      and t.relkind = 'r' and t.relname = 'property_approvals'
    `);
    output.property_approvals_indexes = propAppIndexes.rows;

    // 2. approval_stages master data
    const approvalStages = await pool.query(`SELECT * FROM approval_stages ORDER BY approval_stage_id`);
    output.approval_stages = approvalStages.rows;

    // 6. employee designation relation
    const empSchema = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'designations'`);
    output.designations_schema = empSchema.rows;

    // 7. UOM relation
    const uomSchema = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'uom'`);
    output.uom_schema = uomSchema.rows;

    // 8. Location path
    const areasFk = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'areas';
    `);
    output.areas_fk = areasFk.rows;

    const societiesFk = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name 
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'societies';
    `);
    output.societies_fk = societiesFk.rows;

    const locCols = await pool.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('areas', 'societies', 'cities') AND column_name LIKE '%name%'
    `);
    output.location_columns = locCols.rows;

    // 9. Property image table
    const picTables = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'property_pict%' OR table_name LIKE 'property_doc%' OR table_name LIKE 'property_media%'
    `);
    output.media_tables = picTables.rows;
    
    if(picTables.rows.length > 0) {
       for(let t of picTables.rows) {
           const s = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [t.table_name]);
           output['schema_' + t.table_name] = s.rows;
       }
    }

    // 10. Customers schema
    const custSchema = await pool.query(`
      SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers'
    `);
    output.customers_schema = custSchema.rows;

    // 14. Missing indexes check on property_verifications
    const pvIdx = await pool.query(`
      SELECT i.relname as index_name, a.attname as column_name
      FROM pg_class t, pg_class i, pg_index ix, pg_attribute a
      WHERE t.oid = ix.indrelid and i.oid = ix.indexrelid and a.attrelid = t.oid and a.attnum = ANY(ix.indkey)
      and t.relkind = 'r' and t.relname = 'property_verifications'
    `);
    output.property_verifications_indexes = pvIdx.rows;

  } catch(e) {
    output.error = e.toString();
  }
  
  console.log(JSON.stringify(output, null, 2));
  pool.end();
}

run();
