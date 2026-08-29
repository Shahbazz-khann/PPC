require('dotenv').config();
const { pool } = require('./config/db');

async function executeDelete() {
  const client = await pool.connect();
  try {
    // 1. BEGIN
    await client.query('BEGIN');
    
    // Check if user exists
    const userRes = await client.query('SELECT user_id, email FROM users WHERE user_id = 3');
    if (userRes.rowCount === 0) {
      throw new Error('User ID 3 not found, aborting.');
    }
    
    // 2. Capture target property IDs
    const propRes = await client.query('SELECT property_id FROM properties WHERE owner_id = 3');
    const propertyIds = propRes.rows.map(r => r.property_id);
    
    if (propertyIds.length === 0) {
      console.log('No properties to delete.');
      await client.query('ROLLBACK');
      return;
    }
    
    // Capture media URLs before deletion
    const mediaRes = await client.query(`SELECT media_url FROM property_media WHERE property_id = ANY($1)`, [propertyIds]);
    const mediaUrls = mediaRes.rows.map(r => r.media_url);
    console.log('--- MEDIA URLS TO CLEAN UP LATER ---');
    console.log(JSON.stringify(mediaUrls, null, 2));
    console.log('------------------------------------');
    
    // 3. Delete property_media rows
    const delMediaRes = await client.query(`DELETE FROM property_media WHERE property_id = ANY($1)`, [propertyIds]);
    const deletedMediaCount = delMediaRes.rowCount;
    
    // 4. Delete properties rows
    const delPropRes = await client.query('DELETE FROM properties WHERE owner_id = 3');
    const deletedPropCount = delPropRes.rowCount;
    
    // 5. Verify
    const verifyProp = await client.query('SELECT COUNT(*) FROM properties WHERE owner_id = 3');
    const verifyMedia = await client.query(`SELECT COUNT(*) FROM property_media WHERE property_id = ANY($1)`, [propertyIds]);
    
    if (parseInt(verifyProp.rows[0].count) !== 0 || parseInt(verifyMedia.rows[0].count) !== 0) {
      throw new Error(`Verification failed! Properties left: ${verifyProp.rows[0].count}, Media left: ${verifyMedia.rows[0].count}`);
    }
    
    // 6. COMMIT
    await client.query('COMMIT');
    
    console.log('--- DELETION SUMMARY ---');
    console.log(`Properties deleted: ${deletedPropCount}`);
    console.log(`Property Media rows deleted: ${deletedMediaCount}`);
    console.log(`User ID 3 still exists: Yes`);
    
  } catch (err) {
    // 7. ROLLBACK
    console.error('Error during deletion, rolling back:', err.message);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    pool.end();
  }
}

executeDelete();
