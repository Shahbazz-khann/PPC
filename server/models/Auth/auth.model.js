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
        password
    } = userData;

    const query = `
        INSERT INTO users (
            name,
            email,
            country,
            mobile_no,
            password
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            user_id,
            name,
            email,
            country,
            mobile_no,
            created_at
    `;

    const values = [
        name,
        email,
        country,
        mobile_no,
        password
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            user_id,
            name,
            email,
            country,
            mobile_no,
            password,
            created_at
        FROM users
        WHERE email = $1
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

module.exports = {
    createUser,
    findUserByEmail,
    saveResetToken,
    findUserByResetToken,
    updatePassword
};