require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function inspectSchemas() {
  const tables = ['property_types', 'marla_sizes', 'amenities'];
  
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [table]);
    
    console.log(`\n--- Schema for: ${table} ---`);
    console.table(res.rows);
  }
  
  pool.end();
}

inspectSchemas();
