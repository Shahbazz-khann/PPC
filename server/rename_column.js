require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function renameColumn() {
  const client = await pool.connect();
  try {
    await client.query('ALTER TABLE properties RENAME COLUMN property_swimming_media_room TO property_media_room');
    console.log('Successfully renamed column property_swimming_media_room to property_media_room');
  } catch (e) {
    console.error('Error renaming column:', e);
  } finally {
    client.release();
    pool.end();
  }
}

renameColumn();
