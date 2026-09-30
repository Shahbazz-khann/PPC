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
    // 1. user_types
    const userTypesSchema = await getTableSchema('user_types');
    const userTypesRows = await client.query('SELECT * FROM user_types;');
    
    // 2. roles
    const rolesSchema = await getTableSchema('roles');
    let rolesRows = { rows: [] };
    if (rolesSchema.length > 0) {
      rolesRows = await client.query('SELECT * FROM roles;');
    } else {
      console.log("TABLE 'roles' does NOT exist!");
    }

    // 3. users
    const usersSchema = await getTableSchema('users');

    // 5. employees
    const employeesSchema = await getTableSchema('employees');

    // 6. user_role
    // Check if table is user_roles or user_role or users_roles
    let userRoleSchema = await getTableSchema('user_role');
    let actualUserRoleTable = 'user_role';
    if (userRoleSchema.length === 0) {
      userRoleSchema = await getTableSchema('user_roles');
      actualUserRoleTable = 'user_roles';
    }
    if (userRoleSchema.length === 0) {
      userRoleSchema = await getTableSchema('users_roles');
      actualUserRoleTable = 'users_roles';
    }

    // 7. designations
    const designationsSchema = await getTableSchema('designations');
    let designationsRows = { rows: [] };
    if (designationsSchema.length > 0) {
       designationsRows = await client.query('SELECT * FROM designations;');
    }

    // 9. Existing internal accounts
    let existingAccounts = { rows: [] };
    // Will run query after getting schema
    
    console.log(JSON.stringify({
      userTypesSchema,
      userTypesRows: userTypesRows.rows,
      rolesSchema,
      rolesRows: rolesRows.rows,
      usersSchema,
      employeesSchema,
      actualUserRoleTable,
      userRoleSchema,
      designationsSchema,
      designationsRows: designationsRows.rows
    }, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
