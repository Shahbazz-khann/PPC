const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: '8811287512@s', host: 'localhost', database: 'PPC_UPDATED' });

async function seedPKR() {
  try {
    const res = await pool.query(`SELECT currency_id FROM currencies WHERE currency_code = 'PKR'`);
    if (res.rows.length === 0) {
      await pool.query(`
        INSERT INTO currencies (currency_english, currency_code, is_active)
        VALUES ('Pakistani Rupee', 'PKR', true)
      `);
      console.log('PKR seeded successfully.');
    } else {
      console.log('PKR already exists.');
    }
  } catch (e) {
    console.error('Error seeding PKR:', e);
  } finally {
    pool.end();
  }
}

seedPKR();
