require('dotenv').config();
const { pool } = require('./config/db');

pool.query(`
  SELECT table_name, column_name, data_type, character_maximum_length, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name IN ('users', 'properties', 'inspections', 'property_visits')
    AND column_name IN ('user_id', 'property_id', 'inspection_id', 'visit_id');
`).then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
