const { pool } = require('../../config/db');

/**
 * Retrieves a paginated list of users for the Admin User Management Directory.
 * Unified account directory supporting Customers, Employees, and Service Providers.
 *
 * @param {Object} options
 * @param {string} [options.search] - Free-text search on Full Name, Email, or Mobile.
 * @param {string} [options.userTypeId] - Raw user_type_id to filter by.
 * @param {string} [options.roleId] - Raw role_id string, or 'no-role' sentinel.
 * @param {string} [options.status] - 'all', 'active', or 'inactive' (based on users.is_active).
 * @param {number} [options.page=1] - 1-based page number.
 * @param {number} [options.limit=10] - Number of records per page.
 * @returns {Promise<{ rows: Array<Object>, meta: { total: number, page: number, limit: number, totalPages: number } }>}
 */
const getAdminUsers = async (options = {}) => {
  const {
    search,
    userTypeId,
    roleId,
    status,
    page = 1,
    limit = 10,
  } = options;

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
  const offset = (parsedPage - 1) * parsedLimit;

  const whereConditions = [];
  const params = [];

  // 1. Free-Text Search: Full Name, Email, Mobile only (case-insensitive)
  if (search && typeof search === 'string' && search.trim() !== '') {
    const searchIndex = params.length + 1;
    whereConditions.push(`(
      TRIM(CONCAT_WS(' ', u.user_first_name, u.user_middle_name, u.user_last_name)) ILIKE $${searchIndex}
      OR u.email ILIKE $${searchIndex}
      OR u.mobile ILIKE $${searchIndex}
    )`);
    params.push(`%${search.trim()}%`);
  }

  // 2. User Type Filter (dynamic by user_type_id)
  if (userTypeId && typeof userTypeId === 'string' && userTypeId.trim() !== '') {
    const typeIndex = params.length + 1;
    whereConditions.push(`u.user_type_id = $${typeIndex}`);
    params.push(userTypeId.trim());
  }

  // 3. Role Filter (active-role semantics matching auth.model.js)
  if (roleId && typeof roleId === 'string' && roleId.trim() !== '') {
    const cleanRoleId = roleId.trim();
    if (cleanRoleId === 'no-role') {
      // Users with zero active roles
      whereConditions.push(`NOT EXISTS (
        SELECT 1
        FROM user_role urf
        JOIN roles rf ON urf.role_id = rf.role_id
        WHERE urf.user_id = u.user_id
          AND urf.is_active = true
          AND rf.is_active = true
          AND (urf.from_date IS NULL OR urf.from_date <= CURRENT_DATE)
          AND (urf.to_date IS NULL OR urf.to_date >= CURRENT_DATE)
      )`);
    } else {
      // Users with at least one active mapping for this role
      const roleIndex = params.length + 1;
      whereConditions.push(`EXISTS (
        SELECT 1
        FROM user_role urf
        JOIN roles rf ON urf.role_id = rf.role_id
        WHERE urf.user_id = u.user_id
          AND rf.role_id = $${roleIndex}
          AND urf.is_active = true
          AND rf.is_active = true
          AND (urf.from_date IS NULL OR urf.from_date <= CURRENT_DATE)
          AND (urf.to_date IS NULL OR urf.to_date >= CURRENT_DATE)
      )`);
      params.push(cleanRoleId);
    }
  }

  // 4. Status Filter (users.is_active only)
  if (status === 'active') {
    whereConditions.push('u.is_active = true');
  } else if (status === 'inactive') {
    whereConditions.push('u.is_active = false');
  }
  // If 'all' or undefined, no is_active condition is added

  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Count total matching users (distinct accounts)
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM users u
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  // Pagination parameters
  const limitIndex = params.length + 1;
  const offsetIndex = params.length + 2;
  const queryParams = [...params, parsedLimit, offset];

  // Data Query with explicit safe projections only
  const dataQuery = `
    SELECT
      u.user_id,
      u.user_first_name,
      u.user_middle_name,
      u.user_last_name,
      TRIM(CONCAT_WS(' ', u.user_first_name, u.user_middle_name, u.user_last_name)) AS full_name,
      u.email,
      u.mobile,
      u.user_type_id,
      ut.user_type_english,
      u.employee_id,
      c.customer_id,
      u.is_active,
      u.date_of_registration,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object('role_id', r.role_id::text, 'role_name', r.role_english)
            ORDER BY r.role_id ASC
          ),
          '[]'::json
        )
        FROM user_role ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = u.user_id
          AND ur.is_active = true
          AND r.is_active = true
          AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
          AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE)
      ) AS active_roles,
      (
        SELECT string_agg(r.role_english, ', ' ORDER BY r.role_id ASC)
        FROM user_role ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = u.user_id
          AND ur.is_active = true
          AND r.is_active = true
          AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
          AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE)
      ) AS active_role_names
    FROM users u
    LEFT JOIN user_types ut ON u.user_type_id = ut.user_type_id
    LEFT JOIN customers c ON c.user_id = u.user_id
    ${whereClause}
    ORDER BY u.date_of_registration DESC, u.user_id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
  `;

  const { rows } = await pool.query(dataQuery, queryParams);

  return {
    rows,
    meta: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

/**
 * Retrieves a single user by user_id for Admin Management.
 */
const getAdminUserById = async (userId) => {
  const query = `
    SELECT
      u.user_id,
      u.user_first_name,
      u.user_middle_name,
      u.user_last_name,
      TRIM(CONCAT_WS(' ', u.user_first_name, u.user_middle_name, u.user_last_name)) AS full_name,
      u.email,
      u.mobile,
      u.user_type_id,
      ut.user_type_english,
      u.employee_id,
      c.customer_id,
      u.is_active,
      u.date_of_registration,
      (
        SELECT COALESCE(
          json_agg(
            json_build_object('role_id', r.role_id::text, 'role_name', r.role_english)
            ORDER BY r.role_id ASC
          ),
          '[]'::json
        )
        FROM user_role ur
        JOIN roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = u.user_id
          AND ur.is_active = true
          AND r.is_active = true
          AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
          AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE)
      ) AS active_roles
    FROM users u
    LEFT JOIN user_types ut ON u.user_type_id = ut.user_type_id
    LEFT JOIN customers c ON c.user_id = u.user_id
    WHERE u.user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Updates user fields with atomic cross-table synchronization and validation.
 */
const updateAdminUser = async (userId, updateData, currentUserId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch current user
    const userQuery = `SELECT * FROM users WHERE user_id = $1 FOR UPDATE;`;
    const userRes = await client.query(userQuery, [userId]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const currentUser = userRes.rows[0];

    // 2. Validate email uniqueness if changing
    const newEmail = updateData.email !== undefined ? updateData.email.trim().toLowerCase() : currentUser.email;
    if (newEmail !== currentUser.email.toLowerCase()) {
      const emailCheck = await client.query(
        `SELECT user_id FROM users WHERE LOWER(email) = $1 AND user_id != $2;`,
        [newEmail, userId]
      );
      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        const err = new Error('Email is already in use by another account');
        err.statusCode = 409;
        throw err;
      }
    }

    // 3. Validate mobile uniqueness if changing
    const newMobile = updateData.mobile !== undefined ? updateData.mobile.trim() : currentUser.mobile;
    if (newMobile !== currentUser.mobile) {
      const mobileCheck = await client.query(
        `SELECT user_id FROM users WHERE mobile = $1 AND user_id != $2;`,
        [newMobile, userId]
      );
      if (mobileCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        const err = new Error('Mobile number is already in use by another account');
        err.statusCode = 409;
        throw err;
      }
    }

    // 4. Last Admin Protection
    const adminRoleCheck = await client.query(`
      SELECT 1 FROM user_role ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.user_id = $1
        AND r.role_english = 'Admin'
        AND ur.is_active = true
        AND r.is_active = true
        AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
        AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE);
    `, [userId]);
    const isCurrentlyAdmin = adminRoleCheck.rows.length > 0;

    const newIsActive = updateData.is_active !== undefined ? Boolean(updateData.is_active) : currentUser.is_active;

    if (isCurrentlyAdmin) {
      const adminRoleRes = await client.query(`SELECT role_id FROM roles WHERE role_english = 'Admin';`);
      const adminRoleId = adminRoleRes.rows[0]?.role_id?.toString();

      let willKeepAdminRole = true;
      if (Array.isArray(updateData.role_ids)) {
        willKeepAdminRole = updateData.role_ids.map(String).includes(adminRoleId);
      }

      if (!newIsActive || !willKeepAdminRole) {
        const otherAdminsRes = await client.query(`
          SELECT COUNT(DISTINCT u.user_id) as count
          FROM users u
          JOIN user_role ur ON ur.user_id = u.user_id
          JOIN roles r ON ur.role_id = r.role_id
          WHERE r.role_english = 'Admin'
            AND ur.is_active = true
            AND r.is_active = true
            AND u.is_active = true
            AND u.user_id != $1
            AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
            AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE);
        `, [userId]);
        const otherAdminsCount = parseInt(otherAdminsRes.rows[0].count, 10);
        if (otherAdminsCount === 0) {
          await client.query('ROLLBACK');
          const err = new Error('Cannot remove Admin role or deactivate the system sole active Administrator');
          err.statusCode = 400;
          throw err;
        }
      }
    }

    const newFirstName = updateData.user_first_name !== undefined ? updateData.user_first_name.trim() : currentUser.user_first_name;
    const newMiddleName = updateData.user_middle_name !== undefined
      ? (updateData.user_middle_name && updateData.user_middle_name.trim() !== '' ? updateData.user_middle_name.trim() : null)
      : currentUser.user_middle_name;
    const newLastName = updateData.user_last_name !== undefined ? updateData.user_last_name.trim() : currentUser.user_last_name;

    // 5. Update users table
    const updateUserQuery = `
      UPDATE users SET
        user_first_name = $1,
        user_middle_name = $2,
        user_last_name = $3,
        email = $4,
        mobile = $5,
        is_active = $6,
        update_date_time = NOW()
      WHERE user_id = $7
      RETURNING *;
    `;
    await client.query(updateUserQuery, [
      newFirstName,
      newMiddleName,
      newLastName,
      newEmail,
      newMobile,
      newIsActive,
      userId,
    ]);

    // 6. Cross-table sync: Employee
    if (currentUser.employee_id) {
      await client.query(`
        UPDATE employees SET
          first_name = $1,
          middle_name = $2,
          last_name = $3,
          is_active = $4,
          update_date_time = NOW()
        WHERE employee_id = $5;
      `, [newFirstName, newMiddleName, newLastName, newIsActive, currentUser.employee_id]);
    }

    // 7. Cross-table sync: Customer
    const custRes = await client.query(`SELECT customer_id FROM customers WHERE user_id = $1;`, [userId]);
    if (custRes.rows.length > 0) {
      await client.query(`
        UPDATE customers SET
          customer_first_name = $1,
          customer_middle_name = $2,
          customer_last_name = $3,
          email = $4,
          mobile = $5,
          is_active = $6,
          update_date_time = NOW()
        WHERE user_id = $7;
      `, [newFirstName, newMiddleName, newLastName, newEmail, newMobile, newIsActive, userId]);
    }

    // 8. Update Roles if role_ids provided
    if (Array.isArray(updateData.role_ids)) {
      const targetRoleIds = updateData.role_ids.map(id => id.toString());

      if (targetRoleIds.length === 0) {
        await client.query(`
          UPDATE user_role
          SET is_active = false, to_date = CURRENT_DATE, update_date_time = NOW()
          WHERE user_id = $1 AND is_active = true;
        `, [userId]);
      } else {
        const validRolesRes = await client.query(`
          SELECT role_id::text FROM roles WHERE role_id = ANY($1::bigint[]);
        `, [targetRoleIds]);
        const validRoleIdsSet = new Set(validRolesRes.rows.map(r => r.role_id));
        for (const rId of targetRoleIds) {
          if (!validRoleIdsSet.has(rId)) {
            const err = new Error(`Role ID ${rId} does not exist in the roles table`);
            err.statusCode = 400;
            throw err;
          }
        }

        await client.query(`
          UPDATE user_role
          SET is_active = false, to_date = CURRENT_DATE, update_date_time = NOW()
          WHERE user_id = $1 AND role_id != ALL($2::bigint[]) AND is_active = true;
        `, [userId, targetRoleIds]);

        for (const rId of targetRoleIds) {
          const existingMap = await client.query(`
            SELECT user_role_id, is_active FROM user_role WHERE user_id = $1 AND role_id = $2;
          `, [userId, rId]);

          if (existingMap.rows.length > 0) {
            await client.query(`
              UPDATE user_role
              SET is_active = true, to_date = NULL, update_date_time = NOW()
              WHERE user_id = $1 AND role_id = $2;
            `, [userId, rId]);
          } else {
            await client.query(`
              INSERT INTO user_role (user_id, role_id, is_active, from_date, creation_date_time, update_date_time)
              VALUES ($1, $2, true, CURRENT_DATE, NOW(), NOW());
            `, [userId, rId]);
          }
        }
      }
    }

    await client.query('COMMIT');

    return await getAdminUserById(userId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Returns any foreign-key dependencies preventing physical deletion of a user.
 */
const getUserDependencies = async (userId) => {
  const dependencies = [];

  // Check linked customer profile and customer records
  const custRes = await pool.query(`SELECT customer_id FROM customers WHERE user_id = $1;`, [userId]);
  if (custRes.rows.length > 0) {
    const customerId = custRes.rows[0].customer_id;
    dependencies.push({ table: 'customers', label: 'Linked Customer Profile', count: 1 });

    const reqs = await pool.query(`SELECT COUNT(*) as c FROM customer_requests WHERE customer_id = $1;`, [customerId]);
    if (parseInt(reqs.rows[0].c, 10) > 0) dependencies.push({ table: 'customer_requests', label: 'Customer Requests', count: parseInt(reqs.rows[0].c, 10) });

    const props = await pool.query(`SELECT COUNT(*) as c FROM properties WHERE customer_id = $1;`, [customerId]);
    if (parseInt(props.rows[0].c, 10) > 0) dependencies.push({ table: 'properties', label: 'Properties', count: parseInt(props.rows[0].c, 10) });

    const visits = await pool.query(`SELECT COUNT(*) as c FROM property_visits WHERE visitor_customer_id = $1;`, [customerId]);
    if (parseInt(visits.rows[0].c, 10) > 0) dependencies.push({ table: 'property_visits', label: 'Property Visits', count: parseInt(visits.rows[0].c, 10) });
  }

  // Check linked employee profile and employee records
  const userRow = await pool.query(`SELECT employee_id FROM users WHERE user_id = $1;`, [userId]);
  if (userRow.rows[0]?.employee_id) {
    const empId = userRow.rows[0].employee_id;
    dependencies.push({ table: 'employees', label: 'Linked Employee Profile', count: 1 });

    const insp = await pool.query(`SELECT COUNT(*) as c FROM property_inspected_details WHERE inspected_by_employee_id = $1;`, [empId]);
    if (parseInt(insp.rows[0].c, 10) > 0) dependencies.push({ table: 'property_inspected_details', label: 'Inspections', count: parseInt(insp.rows[0].c, 10) });

    const verif = await pool.query(`SELECT COUNT(*) as c FROM property_verifications WHERE verification_employee_id = $1;`, [empId]);
    if (parseInt(verif.rows[0].c, 10) > 0) dependencies.push({ table: 'property_verifications', label: 'Verifications', count: parseInt(verif.rows[0].c, 10) });
  }

  // Check user roles
  const roles = await pool.query(`SELECT COUNT(*) as c FROM user_role WHERE user_id = $1;`, [userId]);
  if (parseInt(roles.rows[0].c, 10) > 0) dependencies.push({ table: 'user_role', label: 'Assigned Roles', count: parseInt(roles.rows[0].c, 10) });

  // Check audit logs / created_by_user
  const reqHistory = await pool.query(`SELECT COUNT(*) as c FROM customer_request_status_history WHERE created_by_user = $1;`, [userId]);
  if (parseInt(reqHistory.rows[0].c, 10) > 0) dependencies.push({ table: 'customer_request_status_history', label: 'Status History Logs', count: parseInt(reqHistory.rows[0].c, 10) });

  const reqPropReqs = await pool.query(`SELECT COUNT(*) as c FROM customer_request_property_requirements WHERE created_by_user = $1;`, [userId]);
  if (parseInt(reqPropReqs.rows[0].c, 10) > 0) dependencies.push({ table: 'customer_request_property_requirements', label: 'Property Requirements', count: parseInt(reqPropReqs.rows[0].c, 10) });

  const propApprovals = await pool.query(`SELECT COUNT(*) as c FROM property_approvals WHERE created_by_user = $1;`, [userId]);
  if (parseInt(propApprovals.rows[0].c, 10) > 0) dependencies.push({ table: 'property_approvals', label: 'Property Approvals', count: parseInt(propApprovals.rows[0].c, 10) });

  const propDemand = await pool.query(`SELECT COUNT(*) as c FROM property_demand WHERE created_by_user = $1;`, [userId]);
  if (parseInt(propDemand.rows[0].c, 10) > 0) dependencies.push({ table: 'property_demand', label: 'Property Demands', count: parseInt(propDemand.rows[0].c, 10) });

  const propStatus = await pool.query(`SELECT COUNT(*) as c FROM property_status WHERE created_by_user = $1;`, [userId]);
  if (parseInt(propStatus.rows[0].c, 10) > 0) dependencies.push({ table: 'property_status', label: 'Property Status Updates', count: parseInt(propStatus.rows[0].c, 10) });

  return dependencies;
};

/**
 * Safely deletes a user if zero dependencies exist, protecting self-deletion and last admin.
 */
const deleteAdminUser = async (userId, currentUserId) => {
  if (currentUserId && String(currentUserId) === String(userId)) {
    const err = new Error('Cannot delete your own active administrator account');
    err.statusCode = 400;
    throw err;
  }

  const adminCheck = await pool.query(`
    SELECT 1 FROM user_role ur
    JOIN roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = $1
      AND r.role_english = 'Admin'
      AND ur.is_active = true
      AND r.is_active = true
      AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
      AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE);
  `, [userId]);

  if (adminCheck.rows.length > 0) {
    const otherAdmins = await pool.query(`
      SELECT COUNT(DISTINCT u.user_id) as count
      FROM users u
      JOIN user_role ur ON ur.user_id = u.user_id
      JOIN roles r ON ur.role_id = r.role_id
      WHERE r.role_english = 'Admin'
        AND ur.is_active = true
        AND r.is_active = true
        AND u.is_active = true
        AND u.user_id != $1
        AND (ur.from_date IS NULL OR ur.from_date <= CURRENT_DATE)
        AND (ur.to_date IS NULL OR ur.to_date >= CURRENT_DATE);
    `, [userId]);
    if (parseInt(otherAdmins.rows[0].count, 10) === 0) {
      const err = new Error('Cannot delete the system sole active Administrator');
      err.statusCode = 400;
      throw err;
    }
  }

  const dependencies = await getUserDependencies(userId);
  if (dependencies.length > 0) {
    const err = new Error('User cannot be deleted because the account is currently in use.');
    err.statusCode = 409;
    err.dependencies = dependencies;
    throw err;
  }

  const result = await pool.query(`DELETE FROM users WHERE user_id = $1 RETURNING user_id;`, [userId]);
  return result.rows[0] || null;
};

module.exports = {
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  getUserDependencies,
  deleteAdminUser,
};
