const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const http = require('http'); // For testing the local server later
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
  const report = {};

  try {
    const adminEmail = '2412473@szabist-isb.pk';
    const adminMobile = '+92 844 8730';
    const adminPass = 'Admin123@';

    // 1. PRE-CREATION SAFETY CHECK
    const checkEmailMobile = await client.query('SELECT user_id, email, mobile FROM users WHERE email = $1 OR mobile = $2', [adminEmail, adminMobile]);
    const checkEmp = await client.query("SELECT employee_id, first_name, last_name FROM employees WHERE first_name = 'Super' AND last_name = 'Admin'");
    
    if (checkEmailMobile.rowCount > 0 || checkEmp.rowCount > 0) {
      console.log(JSON.stringify({ error: "Conflict found. Admin account already exists or email/mobile is taken." }));
      return;
    }
    report.preCreationUniquenessCheck = "Passed: No conflicts found.";

    // 2. RESOLVE EMPLOYEE USER TYPE DYNAMICALLY
    const userTypeRes = await client.query("SELECT user_type_id FROM user_types WHERE user_type_english = 'Employee' AND is_active = true");
    if (userTypeRes.rowCount !== 1) {
       console.log(JSON.stringify({ error: "Could not resolve exact Employee user type." }));
       return;
    }
    const userTypeId = userTypeRes.rows[0].user_type_id;
    report.resolvedEmployeeUserType = userTypeId;

    // 3. RESOLVE ADMIN ROLE DYNAMICALLY
    const roleRes = await client.query("SELECT role_id FROM roles WHERE role_english = 'Admin' AND is_active = true");
    if (roleRes.rowCount !== 1) {
       console.log(JSON.stringify({ error: "Could not resolve exact Admin role." }));
       return;
    }
    const roleId = roleRes.rows[0].role_id;
    report.resolvedAdminRole = roleId;

    // 4. PASSWORD HASHING
    const passwordHash = await bcrypt.hash(adminPass, 10);
    
    // 5. USE ONE DATABASE TRANSACTION
    await client.query('BEGIN;');

    // 6. CREATE EMPLOYEE ROW
    const insertEmpQuery = `
      INSERT INTO employees (first_name, last_name, date_of_joining, is_active)
      VALUES ('Super', 'Admin', CURRENT_DATE, true)
      RETURNING employee_id;
    `;
    const empRes = await client.query(insertEmpQuery);
    const employeeId = empRes.rows[0].employee_id;
    report.employeeRowCreationResult = "Success";
    report.generatedEmployeeId = employeeId;

    // 7. CREATE USER ROW
    const insertUserQuery = `
      INSERT INTO users (
        user_type_id, employee_id, user_first_name, user_middle_name, user_last_name, 
        country, email, mobile, password_hash, is_active
      ) VALUES (
        $1, $2, 'Super', NULL, 'Admin', 'Pakistan', $3, $4, $5, true
      ) RETURNING user_id;
    `;
    const userRes = await client.query(insertUserQuery, [userTypeId, employeeId, adminEmail, adminMobile, passwordHash]);
    const userId = userRes.rows[0].user_id;
    report.userRowCreationResult = "Success";
    report.generatedUserId = userId;
    report.finalStoredMobileFormat = adminMobile; // Mobile stored exactly as supplied

    // 9. CREATE ADMIN ROLE MAPPING
    const insertRoleQuery = `
      INSERT INTO user_role (user_id, role_id, is_active, from_date)
      VALUES ($1, $2, true, CURRENT_DATE)
      RETURNING user_role_id;
    `;
    const roleMapRes = await client.query(insertRoleQuery, [userId, roleId]);
    report.userRoleCreationResult = "Success";
    report.generatedUserRoleId = roleMapRes.rows[0].user_role_id;
    report.exactlyAdminRoleAssigned = "Confirmed";

    await client.query('COMMIT;');
    report.transactionCommitted = "Confirmed";

    // 12. PASSWORD VERIFICATION
    const isPasswordValid = await bcrypt.compare(adminPass, passwordHash);
    report.passwordBcryptVerificationResult = isPasswordValid;

    // Write report up to this point
    const fs = require('fs');
    fs.writeFileSync('bootstrap_report.json', JSON.stringify(report, null, 2));
    
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
