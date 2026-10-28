const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/db');

async function runMigration() {
  const migrationFile = path.join(__dirname, '001_create_role_page_access.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  console.log(`[MIGRATION] Executing: ${path.basename(migrationFile)}...`);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('[MIGRATION] Migration 001_create_role_page_access executed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[MIGRATION] Error executing migration:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
