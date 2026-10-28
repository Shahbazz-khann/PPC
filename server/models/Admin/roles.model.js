const { pool } = require('../../config/db');

/**
 * Retrieves all roles from the database for Admin management and selection.
 */
const getAdminRoles = async (params = {}) => {
  const { isActive } = params;
  let query = `
    SELECT 
      role_id::text AS role_id,
      role_english,
      role_urdu,
      role_abb,
      is_active
    FROM roles
  `;
  const conditions = [];
  const queryParams = [];

  if (isActive !== undefined && isActive !== '') {
    queryParams.push(isActive === true || isActive === 'true');
    conditions.push(`is_active = $${queryParams.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ` ORDER BY role_id ASC`;

  const { rows } = await pool.query(query, queryParams);
  return rows;
};

module.exports = {
  getAdminRoles,
};
