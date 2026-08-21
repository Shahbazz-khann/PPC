const { pool } = require('../../config/db');

/**
 * Create a new pending user
 */
const createPendingUser = async (userData) => {
    const {
        name,
        email,
        country,
        mobile_no,
        password,
        verification_code,
        verification_code_expires,
        role_id
    } = userData;

    // We'll do an upsert on email so that if a user tries to sign up again 
    // before verifying, we just update their pending record with a new OTP.
    const query = `
        INSERT INTO pending_users (
            name,
            email,
            country,
            mobile_no,
            password,
            verification_code,
            verification_code_expires,
            role_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7 , $8)
        ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            country = EXCLUDED.country,
            mobile_no = EXCLUDED.mobile_no,
            password = EXCLUDED.password,
            verification_code = EXCLUDED.verification_code,
            verification_code_expires = EXCLUDED.verification_code_expires,
            role_id = EXCLUDED.role_id
        RETURNING *;
    `;

    const values = [
        name,
        email,
        country,
        mobile_no,
        password,
        verification_code,
        verification_code_expires,
        role_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Find pending user by email
 */
const findPendingUserByEmail = async (email) => {
    const query = `
        SELECT *
        FROM pending_users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Delete pending user by email
 */
const deletePendingUser = async (email) => {
    const query = `
        DELETE FROM pending_users
        WHERE email = $1
    `;
    await pool.query(query, [email]);
};

module.exports = {
    createPendingUser,
    findPendingUserByEmail,
    deletePendingUser
};
