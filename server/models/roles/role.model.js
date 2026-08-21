const { pool } = require('../../config/db');

/**
 * Find role by role name
 */
const findRoleByName = async (roleName) => {
    const query = `
        SELECT
            role_id,
            role_name
        FROM roles
        WHERE LOWER(role_name) = LOWER($1)
        LIMIT 1
    `;

    const result = await pool.query(query, [roleName]);

    return result.rows[0] || null;
};

module.exports = {
    findRoleByName
};