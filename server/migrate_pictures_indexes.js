const { Pool } = require('pg');
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });

async function run() {
  const client = await pool.connect();
  try {
    // 1. Index on property_id for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_property_pictures_property_id
      ON property_pictures(property_id);
    `);
    console.log('✅  idx_property_pictures_property_id created (or already existed)');

    // 2. Check for any existing duplicate active display_order before adding constraint
    const dups = await client.query(`
      SELECT property_id, display_order, COUNT(*) 
      FROM property_pictures 
      WHERE is_active = true 
      GROUP BY property_id, display_order 
      HAVING COUNT(*) > 1
    `);
    if (dups.rowCount > 0) {
      console.warn('⚠️  Duplicate active display_order values found — skipping unique constraint:');
      console.warn(dups.rows);
    } else {
      // 3. Partial unique index: no two ACTIVE pictures for the same property can share display_order
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_property_pictures_active_display_order
        ON property_pictures(property_id, display_order)
        WHERE is_active = true;
      `);
      console.log('✅  uq_property_pictures_active_display_order unique partial index created (or already existed)');
    }

    // 4. Confirm both indexes exist
    const idx = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'property_pictures'
      ORDER BY indexname;
    `);
    console.log('\n=== All indexes on property_pictures ===');
    idx.rows.forEach(r => console.log(' •', r.indexname, ':', r.indexdef));

  } finally {
    client.release();
    pool.end();
  }
}

run().catch(console.error);
