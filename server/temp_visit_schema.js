require('dotenv').config();
const { pool } = require('./config/db');

async function checkSchema() {
  const schemaQuery = `
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'property_visits';
  `;
  const schema = await pool.query(schemaQuery);
  console.log("Columns:\n", JSON.stringify(schema.rows, null, 2));

  const fksQuery = `
    SELECT
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
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='property_visits';
  `;
  const fks = await pool.query(fksQuery);
  console.log("Foreign Keys FROM property_visits:\n", JSON.stringify(fks.rows, null, 2));

  const reverseFksQuery = `
    SELECT
        tc.table_name,
        kcu.column_name
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='property_visits';
  `;
  const reverseFks = await pool.query(reverseFksQuery);
  console.log("Foreign Keys TO property_visits:\n", JSON.stringify(reverseFks.rows, null, 2));

  process.exit();
}
checkSchema();
