require('dotenv').config();
const { pool } = require('./config/db');

async function inspect() {
  try {
    const totalPropsRes = await pool.query(`SELECT COUNT(*) as cnt FROM properties;`);
    const totalProps = totalPropsRes.rows[0].cnt;
    console.log("Total properties:", totalProps);

    const nullAreaRes = await pool.query(`SELECT COUNT(*) as cnt FROM properties WHERE area_id IS NULL;`);
    const nullArea = nullAreaRes.rows[0].cnt;
    console.log("Properties with area_id NULL:", nullArea);

    const inconsistentRes = await pool.query(`
      SELECT COUNT(*) as cnt
      FROM properties p
      JOIN areas a ON p.area_id = a.area_id
      JOIN societies s ON a.society_id = s.society_id
      JOIN cities c ON s.city_id = c.city_id
      JOIN tehsils t ON c.tehsil_id = t.tehsil_id
      JOIN districts d ON t.district_id = d.district_id
      WHERE (p.society_id IS NOT NULL AND p.society_id != a.society_id)
         OR (p.property_tehsil_id IS NOT NULL AND p.property_tehsil_id != t.tehsil_id)
         OR (p.property_district_id IS NOT NULL AND p.property_district_id != d.district_id);
    `);
    const inconsistent = inconsistentRes.rows[0].cnt;
    console.log("Inconsistent records:", inconsistent);

    const fksRes = await pool.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'properties'
      AND kcu.column_name IN ('area_id', 'society_id', 'property_tehsil_id', 'property_district_id');
    `);
    console.log("FK Constraints:");
    console.table(fksRes.rows);

  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

inspect();
