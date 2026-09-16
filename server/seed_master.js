require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedMasterData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Seed property_types
    const propertyTypes = ['House', 'Villa', 'Plot'];
    for (const pt of propertyTypes) {
      await client.query(`
        INSERT INTO property_types (property_type_description, property_type_urdu, property_type_abb, is_active)
        VALUES ($1, NULL, NULL, true)
        ON CONFLICT DO NOTHING
      `, [pt]);
    }
    
    // 2. Seed marla_sizes
    const marlaSizes = [220, 272];
    for (const ms of marlaSizes) {
      await client.query(`
        INSERT INTO marla_sizes (marla_size_sqft, is_active)
        VALUES ($1, true)
        ON CONFLICT DO NOTHING
      `, [ms]);
    }
    
    await client.query('COMMIT');
    
    // Verification
    const ptCount = await client.query('SELECT COUNT(*) FROM property_types');
    const msCount = await client.query('SELECT COUNT(*) FROM marla_sizes');
    const amCount = await client.query('SELECT COUNT(*) FROM amenities');
    
    console.log('--- DB Verification ---');
    console.log('property_types count:', ptCount.rows[0].count);
    console.log('marla_sizes count:', msCount.rows[0].count);
    console.log('amenities count:', amCount.rows[0].count);
    
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', e);
  } finally {
    client.release();
    pool.end();
  }
}

seedMasterData();
