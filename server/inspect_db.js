const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'PPC_UPDATED',
  user: 'postgres',
  password: '8811287512@s'
});

async function run() {
  const tables = [
    'customer_requests', 'property_types', 'cities', 'societies', 'areas',
    'properties', 'uom', 'currencies', 'property_demand', 'customer_requests', 'customer_request_purposes'
  ];
  
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);
    
    console.log(`\nTable: ${table}`);
    res.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} ${r.character_maximum_length ? '('+r.character_maximum_length+')' : ''} ${r.is_nullable === 'NO' ? 'NOT NULL' : ''}`));
  }
  pool.end();
}

run();
