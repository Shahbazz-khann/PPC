require('dotenv').config();
const { pool } = require('./config/db');

async function insertRole() {
  try {
    const result = await pool.query("INSERT INTO roles (role_name) VALUES ('User') RETURNING *");
    console.log('Inserted Role:', result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      console.log('Role User already exists.');
    } else {
      console.error('Error:', error);
    }
  } finally {
    pool.end();
  }
}

insertRole();
