const {Pool}=require('pg');
const p=new Pool({password:'8811287512@s',user:'postgres',database:'PPC_UPDATED'});
Promise.all([
  p.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='property_videos' ORDER BY ordinal_position"),
  p.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c WHERE conrelid='property_videos'::regclass"),
  p.query("SELECT indexname, indexdef FROM pg_indexes WHERE tablename='property_videos'"),
  p.query('SELECT COUNT(*) FROM property_videos')
]).then(([cols, cons, idx, cnt]) => {
  console.log('=== Columns ==='); cols.rows.forEach(r=>console.log(JSON.stringify(r)));
  console.log('=== Constraints ==='); cons.rows.forEach(r=>console.log(JSON.stringify(r)));
  console.log('=== Indexes ==='); idx.rows.forEach(r=>console.log(JSON.stringify(r)));
  console.log('=== Row count ===', cnt.rows[0].count);
}).catch(console.error).finally(()=>p.end());
