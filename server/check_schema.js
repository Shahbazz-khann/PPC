require('dotenv').config();
const { pool } = require('./config/db');
const fs = require('fs');
pool.query(`
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name IN ('inspections', 'inspection_reports', 'property_visits', 'properties', 'inspection_results', 'inspection_statuses', 'users', 'property_media')
`).then(r => {
  fs.writeFileSync('schema_out.txt', JSON.stringify(r.rows, null, 2), 'utf-8');
}).catch(console.error).finally(() => pool.end());
