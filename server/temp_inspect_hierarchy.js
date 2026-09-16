require('dotenv').config();
const { pool } = require('./config/db');

async function inspect() {
  try {
    const tables = ['countries', 'provinces', 'divisions', 'districts', 'tehsils', 'cities', 'societies', 'areas', 'properties'];
    const tablesList = tables.map(t => `'${t}'`).join(',');

    const colsQuery = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name IN (${tablesList})
      ORDER BY table_name, ordinal_position;
    `;

    const fksQuery = `
      SELECT
          tc.table_name,
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
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN (${tablesList});
    `;

    const pksQuery = `
      SELECT
          tc.table_name,
          kcu.column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_name IN (${tablesList});
    `;

    const [colsRes, fksRes, pksRes] = await Promise.all([
      pool.query(colsQuery),
      pool.query(fksQuery),
      pool.query(pksQuery)
    ]);

    console.log("=== COLUMNS ===");
    console.table(colsRes.rows);

    console.log("=== FOREIGN KEYS ===");
    console.table(fksRes.rows);

    console.log("=== PRIMARY KEYS ===");
    console.table(pksRes.rows);

  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

inspect();
