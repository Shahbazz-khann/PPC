require('dotenv').config();
const { pool } = require('../config/db');

async function checkPermissions() {
  try {
    const res = await pool.query(`
      SELECT * FROM role_page_access 
      WHERE page_key = 'PAGE_REF_CURRENCIES';
    `);
    console.log('PAGE_REF_CURRENCIES permissions in role_page_access:', res.rows);

    if (res.rows.length === 0) {
      console.log('Adding PAGE_REF_CURRENCIES access for role_id 1 (Super Admin / Admin)...');
      // Find all roles
      const rolesRes = await pool.query('SELECT role_id, role_name FROM roles;');
      console.log('Roles:', rolesRes.rows);

      for (const role of rolesRes.rows) {
        await pool.query(`
          INSERT INTO role_page_access (role_id, page_key, can_view, can_create, can_edit, can_delete)
          VALUES ($1, 'PAGE_REF_CURRENCIES', true, true, true, true)
          ON CONFLICT (role_id, page_key) DO UPDATE 
          SET can_view = true, can_create = true, can_edit = true, can_delete = true;
        `, [role.role_id]);
      }
      console.log('Permissions inserted for all roles!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Permission check error:', err);
    process.exit(1);
  }
}

checkPermissions();
