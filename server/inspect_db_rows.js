const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function run() {
  await client.connect();

  async function getTableSchema(tableName) {
    const res = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [tableName]);
    return res.rows;
  }

  try {
    const usersSchema = await getTableSchema('users');
    
    // fetch employee accounts
    const employeeAccounts = await client.query(`
      SELECT *
      FROM users u
      JOIN user_types ut ON u.user_type_id = ut.user_type_id
      WHERE ut.user_type_english ILIKE '%employee%'
    `);

    const userRoleMapping = await client.query('SELECT * FROM user_role;');

    const fs = require('fs');
    fs.writeFileSync('db_rows.json', JSON.stringify({
      usersSchema,
      employeeAccounts: employeeAccounts.rows,
      userRoleMapping: userRoleMapping.rows
    }, null, 2));

    console.log("Wrote db_rows.json");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
