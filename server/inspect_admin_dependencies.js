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

  try {
    const report = {};

    // 1. Inspect Test Admin User (user_id = 2)
    const usersRow = await client.query('SELECT user_id, user_type_id, employee_id, user_first_name, user_middle_name, user_last_name, country, email, mobile, mobile_allowed, web_allowed, is_active FROM users WHERE user_id = 2');
    report.user = usersRow.rows[0];

    // 1b. Inspect Test Admin Employee (employee_id = 1)
    const employeesRow = await client.query('SELECT employee_id, first_name, middle_name, last_name, designation_id, country_of_posting, place_of_posting, is_active FROM employees WHERE employee_id = 1');
    report.employee = employeesRow.rows[0];

    // 1c. Inspect user_role mapping (user_id = 2)
    const userRoleRow = await client.query('SELECT user_role_id, user_id, role_id, is_active FROM user_role WHERE user_id = 2');
    report.userRole = userRoleRow.rows;

    // 2. Inspect all FK references to users.user_id
    const userFkQuery = `
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users' AND ccu.column_name = 'user_id';
    `;
    const userFks = await client.query(userFkQuery);
    
    report.userFkReferences = [];
    for (const fk of userFks.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${fk.table_schema}.${fk.table_name} WHERE ${fk.column_name} = 2`);
      fk.countReferencing2 = parseInt(countRes.rows[0].count, 10);
      report.userFkReferences.push(fk);
    }

    // 3. Inspect all FK references to employees.employee_id
    const empFkQuery = `
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'employees' AND ccu.column_name = 'employee_id';
    `;
    const empFks = await client.query(empFkQuery);
    
    report.empFkReferences = [];
    for (const fk of empFks.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${fk.table_schema}.${fk.table_name} WHERE ${fk.column_name} = 1`);
      fk.countReferencing1 = parseInt(countRes.rows[0].count, 10);
      report.empFkReferences.push(fk);
    }

    // 4. Inspect user_role references
    const userRoleFkQuery = `
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'user_role' AND ccu.column_name = 'user_role_id';
    `;
    const userRoleFks = await client.query(userRoleFkQuery);
    
    report.userRoleFkReferences = [];
    for (const fk of userRoleFks.rows) {
      for (const ur of userRoleRow.rows) {
        const countRes = await client.query(`SELECT COUNT(*) FROM ${fk.table_schema}.${fk.table_name} WHERE ${fk.column_name} = ${ur.user_role_id}`);
        fk['countReferencing_' + ur.user_role_id] = parseInt(countRes.rows[0].count, 10);
      }
      report.userRoleFkReferences.push(fk);
    }

    // 5 & 7. Inspect users <-> employees relation 
    const relQuery = `
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND (
         (tc.table_name = 'users' AND ccu.table_name = 'employees') OR
         (tc.table_name = 'employees' AND ccu.table_name = 'users')
      );
    `;
    const relations = await client.query(relQuery);
    report.relationsUsersEmployees = relations.rows;

    // 8. Unique Constraints
    const uniqueQuery = `
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_name IN ('users', 'employees');
    `;
    const uniques = await client.query(uniqueQuery);
    report.uniques = uniques.rows;

    const fs = require('fs');
    fs.writeFileSync('admin_inspection.json', JSON.stringify(report, null, 2));
    console.log("Wrote admin_inspection.json");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
