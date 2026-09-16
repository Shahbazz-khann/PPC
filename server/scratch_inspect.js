const {Pool}=require('pg');
const p=new Pool({password:'8811287512@s',user:'postgres',database:'PPC_UPDATED'});
Promise.all([
  p.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name ILIKE '%config%' OR table_name ILIKE '%setting%' OR table_name ILIKE '%limit%')"),
  p.query('SELECT property_id, customer_id FROM properties LIMIT 5')
]).then(([cfg, props]) => {
  console.log('Config-like tables:', JSON.stringify(cfg.rows));
  console.log('Sample properties:', JSON.stringify(props.rows));
}).catch(console.error).finally(()=>p.end());
