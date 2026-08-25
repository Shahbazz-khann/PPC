require('dotenv').config();
const { pool } = require('./config/db');
pool.query("INSERT INTO property_media (property_id, uploaded_by, media_type_id, media_status_id, media_url, is_primary, is_deleted) VALUES (20, 1, 1, 1, '/uploads/test.jpg', false, FALSE) RETURNING *")
  .then(r => { console.log(r.rows); pool.end(); })
  .catch(e => { console.error("POSTGRES ERROR:", e.message); pool.end(); });
