require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seedIslamabad() {
  const client = await pool.connect();
  let insertedCityId, insertedSocietyId, insertedAreaId;

  try {
    await client.query('BEGIN');
    
    // Tehsil ID resolved from previous inspection
    const tehsilId = 197;

    // 1. Insert/Get City
    let cityRes = await client.query(`SELECT city_id FROM cities WHERE tehsil_id = $1 AND city_english ILIKE 'Islamabad'`, [tehsilId]);
    if (cityRes.rows.length > 0) {
      insertedCityId = cityRes.rows[0].city_id;
      console.log('City Islamabad already exists, ID:', insertedCityId);
    } else {
      cityRes = await client.query(`
        INSERT INTO cities (city_english, city_urdu, city_abb, tehsil_id, is_active)
        VALUES ('Islamabad', NULL, NULL, $1, true)
        RETURNING city_id
      `, [tehsilId]);
      insertedCityId = cityRes.rows[0].city_id;
      console.log('Inserted City Islamabad, ID:', insertedCityId);
    }

    // 2. Insert/Get Society
    let societyRes = await client.query(`SELECT society_id FROM societies WHERE city_id = $1 AND society_english ILIKE 'DHA'`, [insertedCityId]);
    if (societyRes.rows.length > 0) {
      insertedSocietyId = societyRes.rows[0].society_id;
      console.log('Society DHA already exists, ID:', insertedSocietyId);
    } else {
      societyRes = await client.query(`
        INSERT INTO societies (society_english, society_urdu, society_abb, city_id, is_active)
        VALUES ('DHA', NULL, NULL, $1, true)
        RETURNING society_id
      `, [insertedCityId]);
      insertedSocietyId = societyRes.rows[0].society_id;
      console.log('Inserted Society DHA, ID:', insertedSocietyId);
    }

    // 3. Insert/Get Area
    let areaRes = await client.query(`SELECT area_id FROM areas WHERE society_id = $1 AND area_english ILIKE 'Sector W'`, [insertedSocietyId]);
    if (areaRes.rows.length > 0) {
      insertedAreaId = areaRes.rows[0].area_id;
      console.log('Area Sector W already exists, ID:', insertedAreaId);
    } else {
      areaRes = await client.query(`
        INSERT INTO areas (area_english, area_urdu, area_abb, society_id, is_active)
        VALUES ('Sector W', NULL, NULL, $1, true)
        RETURNING area_id
      `, [insertedSocietyId]);
      insertedAreaId = areaRes.rows[0].area_id;
      console.log('Inserted Area Sector W, ID:', insertedAreaId);
    }

    await client.query('COMMIT');
    console.log('TRANSACTION COMMITTED');

    // Verification
    console.log('\\n--- Verification ---');
    const verifyQ = await client.query(`
      SELECT 
        a.area_english,
        s.society_english,
        c.city_english,
        t.tehsil_english
      FROM areas a
      JOIN societies s ON a.society_id = s.society_id
      JOIN cities c ON s.city_id = c.city_id
      JOIN tehsils t ON c.tehsil_id = t.tehsil_id
      WHERE a.area_id = $1
    `, [insertedAreaId]);

    console.log('Full Hierarchy Row:');
    console.table(verifyQ.rows);
    if (verifyQ.rows.length === 1 && verifyQ.rows[0].tehsil_english === 'ISLAMABAD') {
      console.log('FK Relationships Validated: TRUE');
    } else {
      console.log('FK Relationships Validated: FALSE');
    }

    console.log('\\nREPORT:');
    console.log('- Resolved Tehsil:', tehsilId);
    console.log('- Inserted city_id:', insertedCityId);
    console.log('- Inserted society_id:', insertedSocietyId);
    console.log('- Inserted area_id:', insertedAreaId);
    console.log('- Final transaction status: SUCCESS');

  } catch(e) {
    await client.query('ROLLBACK');
    console.error('TRANSACTION FAILED & ROLLED BACK', e);
  } finally {
    client.release();
    pool.end();
  }
}

seedIslamabad();
