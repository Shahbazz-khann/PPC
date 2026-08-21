const { pool } = require('../../config/db');

/**
 * Create a new user
 */
const createUser = async (userData) => {
    const {
        name,
        email,
        country,
        mobile_no,
        password,
        role_id
    } = userData;

    const query = `
        INSERT INTO users (
            name,
            email,
            country,
            mobile_no,
            password,
            role_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            user_id,
            name,
            email,
            country,
            mobile_no,
            role_id,
            created_at
    `;

    const values = [
        name,
        email,
        country,
        mobile_no,
        password,
        role_id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


/**
 * Find user by email with role information
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.country,
            u.mobile_no,
            u.password,
            u.role_id,
            r.role_name,
            u.created_at
        FROM users u
        LEFT JOIN roles r
            ON u.role_id = r.role_id
        WHERE u.email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
};


/**
 * Save password reset token for a user
 */
const saveResetToken = async (
    userId,
    resetPasswordToken,
    resetPasswordExpires
) => {

    const query = `
        UPDATE users
        SET
            reset_password_token = $1,
            reset_password_expires = $2
        WHERE user_id = $3
        RETURNING
            user_id,
            email
    `;

    const values = [
        resetPasswordToken,
        resetPasswordExpires,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};


/**
 * Find user by password reset token
 */
const findUserByResetToken = async (resetPasswordToken) => {

    const query = `
        SELECT
            user_id,
            name,
            email,
            password,
            reset_password_token,
            reset_password_expires
        FROM users
        WHERE reset_password_token = $1
        AND reset_password_expires > NOW()
    `;

    const result = await pool.query(query, [resetPasswordToken]);

    return result.rows[0] || null;
};


/**
 * Update user password and clear reset token
 */
const updatePassword = async (
    userId,
    hashedPassword
) => {

    const query = `
        UPDATE users
        SET
            password = $1,
            reset_password_token = NULL,
            reset_password_expires = NULL
        WHERE user_id = $2
        RETURNING
            user_id,
            email
    `;

    const values = [
        hashedPassword,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};
//  get users 
const getUsers = async () => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            country,
            mobile_no,
            role_id,
            created_at
        FROM users
        ORDER BY user_id ASC
    `;

    const result = await pool.query(query);

    return result.rows;
};

// Get me 
const getUserById = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.country,
            u.mobile_no,
            u.role_id,
            r.role_name,
            u.created_at
        FROM users u
        JOIN roles r ON r.role_id = u.role_id
        WHERE u.user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    createUser,
    findUserByEmail,
    saveResetToken,
    findUserByResetToken,
    updatePassword,
    getUsers,
    getUserById
    
};