require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function inspectHierarchy() {
  try {
    // 1. Find Pakistan
    const cRes = await pool.query(`SELECT * FROM countries WHERE country_english ILIKE 'Pakistan'`);
    console.log('Countries:', cRes.rows);

    if (cRes.rows.length === 0) throw new Error('Pakistan not found');
    const countryId = cRes.rows[0].country_id;

    // 2. Find Federal Capital Territory
    const pRes = await pool.query(`SELECT * FROM provinces WHERE country_id = $1 AND (province_english ILIKE '%Federal%Capital%' OR province_english ILIKE 'ISLAMABAD')`, [countryId]);
    console.log('Provinces:', pRes.rows);

    if (pRes.rows.length === 0) throw new Error('Province not found');
    const provinceId = pRes.rows[0].province_id;

    // 3. Find Division
    const divRes = await pool.query(`SELECT * FROM divisions WHERE province_id = $1`, [provinceId]);
    console.log('Divisions:', divRes.rows);
    
    if (divRes.rows.length === 0) throw new Error('Division not found');
    const divisionId = divRes.rows[0].division_id;

    // 4. Find District
    const distRes = await pool.query(`SELECT * FROM districts WHERE division_id = $1`, [divisionId]);
    console.log('Districts:', distRes.rows);
    
    if (distRes.rows.length === 0) throw new Error('District not found');
    const districtId = distRes.rows[0].district_id;

    // 5. Find Tehsils
    const tehsilRes = await pool.query(`SELECT * FROM tehsils WHERE district_id = $1`, [districtId]);
    console.log('Tehsils for Islamabad District:', tehsilRes.rows);

    // Also inspect schemas
    for (const table of ['cities', 'societies', 'areas']) {
      const colRes = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table]);
      console.log(`Schema for ${table}:`, colRes.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

inspectHierarchy();
