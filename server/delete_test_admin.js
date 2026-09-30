const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkReferences(client) {
  // Check users references
  const userFkQuery = `
      SELECT tc.table_schema, tc.table_name, kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users' AND ccu.column_name = 'user_id'
        AND tc.table_name != 'user_role';
  `;
  const userFks = await client.query(userFkQuery);
  for (const fk of userFks.rows) {
    const countRes = await client.query(`SELECT COUNT(*) FROM ${fk.table_schema}.${fk.table_name} WHERE ${fk.column_name} = 2`);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return `NEW REFERENCE FOUND in ${fk.table_schema}.${fk.table_name}.${fk.column_name}`;
    }
  }

  // Check employees references
  const empFkQuery = `
      SELECT tc.table_schema, tc.table_name, kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'employees' AND ccu.column_name = 'employee_id'
        AND tc.table_name != 'users';
  `;
  const empFks = await client.query(empFkQuery);
  for (const fk of empFks.rows) {
    const countRes = await client.query(`SELECT COUNT(*) FROM ${fk.table_schema}.${fk.table_name} WHERE ${fk.column_name} = 1`);
    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return `NEW REFERENCE FOUND in ${fk.table_schema}.${fk.table_name}.${fk.column_name}`;
    }
  }
  return null;
}

async function run() {
  await client.connect();

  const report = {};

  try {
    // 1. REVERIFY BEFORE DELETE
    const refIssue = await checkReferences(client);
    if (refIssue) {
      console.log(JSON.stringify({ error: refIssue }));
      return;
    }
    report.preDeleteSafetyCheck = "Passed: No new references found.";

    // 2. USE ONE TRANSACTION
    await client.query('BEGIN;');

    const resUserRole = await client.query('DELETE FROM user_role WHERE user_id = 2 RETURNING *;');
    const resUsers = await client.query("DELETE FROM users WHERE user_id = 2 AND employee_id = 1 AND email = 'testadmin@ppc.com' RETURNING *;");
    const resEmployees = await client.query('DELETE FROM employees WHERE employee_id = 1 RETURNING *;');

    // 3. VERIFY EXPECTED ROW COUNTS
    if (resUserRole.rowCount !== 1 || resUsers.rowCount !== 1 || resEmployees.rowCount !== 1) {
      await client.query('ROLLBACK;');
      console.log(JSON.stringify({
        error: "Row count mismatch.",
        rows: {
          user_role: resUserRole.rowCount,
          users: resUsers.rowCount,
          employees: resEmployees.rowCount
        }
      }));
      return;
    }

    await client.query('COMMIT;');

    report.user_role_deleted = resUserRole.rowCount;
    report.users_deleted = resUsers.rowCount;
    report.employees_deleted = resEmployees.rowCount;
    report.transactionExecutionResult = "COMMIT successful";

    // 5. POST-DELETE VERIFICATION
    const verifyUser = await client.query('SELECT * FROM users WHERE user_id = 2;');
    const verifyEmp = await client.query('SELECT * FROM employees WHERE employee_id = 1;');
    const verifyUr = await client.query('SELECT * FROM user_role WHERE user_id = 2;');

    report.postDeleteVerification = {
      users: verifyUser.rowCount,
      employees: verifyEmp.rowCount,
      user_role: verifyUr.rowCount
    };

    // 6 & 7. VERIFY MASTER DATA
    const roleAdmin = await client.query("SELECT * FROM roles WHERE role_id = 3 AND role_english = 'Admin';");
    const typeEmployee = await client.query("SELECT * FROM user_types WHERE user_type_id = 2 AND user_type_english = 'Employee';");
    
    report.adminRoleActive = roleAdmin.rowCount === 1 && roleAdmin.rows[0].is_active;
    report.employeeTypeActive = typeEmployee.rowCount === 1 && typeEmployee.rows[0].is_active;

    // 8. VERIFY UNIQUE VALUES FREED
    const emailCheck = await client.query("SELECT * FROM users WHERE email = 'testadmin@ppc.com';");
    const mobileCheck = await client.query("SELECT * FROM users WHERE mobile = '+923009999001';");
    
    report.uniqueValuesFreed = emailCheck.rowCount === 0 && mobileCheck.rowCount === 0;

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    await client.query('ROLLBACK;');
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
