require('dotenv').config();
const { pool } = require('./config/db');

pool.query(`
  SELECT table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name IN ('conversations', 'conversation_participants', 'messages')
  ORDER BY table_name, ordinal_position;
`).then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
