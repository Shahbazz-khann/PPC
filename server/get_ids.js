const { Pool } = require('pg');
const pool = new Pool({ password: '8811287512@s', user: 'postgres', database: 'PPC_UPDATED' });
async function getIds() {
  const c = await pool.query("SELECT country_id FROM countries WHERE country_english ILIKE 'Pakistan'");
  const p = await pool.query("SELECT province_id FROM provinces WHERE province_english ILIKE '%Federal%' AND country_id = $1", [c.rows[0].country_id]);
  const div = await pool.query("SELECT division_id FROM divisions WHERE division_english ILIKE '%Islamabad%' AND province_id = $1", [p.rows[0].province_id]);
  const dist = await pool.query("SELECT district_id FROM districts WHERE district_english ILIKE '%Islamabad%' AND division_id = $1", [div.rows[0].division_id]);
  const teh = await pool.query("SELECT tehsil_id FROM tehsils WHERE tehsil_english ILIKE '%Islamabad%' AND district_id = $1", [dist.rows[0].district_id]);
  const city = await pool.query("SELECT city_id FROM cities WHERE city_english ILIKE '%Islamabad%' AND tehsil_id = $1", [teh.rows[0].tehsil_id]);
  const soc = await pool.query("SELECT society_id FROM societies WHERE society_english ILIKE '%DHA%' AND city_id = $1", [city.rows[0].city_id]);
  const area = await pool.query("SELECT area_id FROM areas WHERE area_english ILIKE '%Sector W%' AND society_id = $1", [soc.rows[0].society_id]);
  
  console.log({
    country: c.rows[0].country_id,
    province: p.rows[0].province_id,
    division: div.rows[0].division_id,
    district: dist.rows[0].district_id,
    tehsil: teh.rows[0].tehsil_id,
    city: city.rows[0].city_id,
    society: soc.rows[0].society_id,
    area: area.rows[0]?.area_id
  });
  
  // also get property type and use
  const t = await pool.query("SELECT property_type_id FROM property_types LIMIT 1");
  const u = await pool.query("SELECT property_use_id FROM property_uses LIMIT 1");
  console.log({ type: t.rows[0].property_type_id, use: u.rows[0].property_use_id });
  pool.end();
}
getIds().catch(console.error);
