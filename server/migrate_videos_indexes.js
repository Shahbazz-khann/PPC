const { Pool } = require('pg');
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });

async function run() {
  const client = await pool.connect();
  try {
    // 1. Check for existing duplicates before adding constraint
    const dups = await client.query(`
      SELECT property_id, COUNT(*) 
      FROM property_videos 
      WHERE is_active = true 
      GROUP BY property_id 
      HAVING COUNT(*) > 1
    `);

    if (dups.rowCount > 0) {
      console.warn('⚠️  Existing active duplicate videos found — skipping unique constraint:');
      console.warn(dups.rows);
    } else {
      // 2. Index on property_id for fast lookups
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_property_videos_property_id
        ON property_videos(property_id);
      `);
      console.log('✅  idx_property_videos_property_id created (or already existed)');

      // 3. Partial unique index: only one ACTIVE video per property
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_property_videos_one_active
        ON property_videos(property_id)
        WHERE is_active = true;
      `);
      console.log('✅  uq_property_videos_one_active unique partial index created (or already existed)');
    }

    // 4. Confirm all indexes
    const idx = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'property_videos'
      ORDER BY indexname;
    `);
    console.log('\n=== All indexes on property_videos ===');
    idx.rows.forEach(r => console.log(' •', r.indexname, ':', r.indexdef));

  } finally {
    client.release();
    pool.end();
  }
}

run().catch(console.error);
