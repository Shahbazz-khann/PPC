const { pool } = require('../../config/db');

/**
 * Create a new pending user
 */
const createPendingUser = async (userData) => {
    const {
        first_name,
        last_name,
        email,
        country_id,
        mobile,
        password_hash,
        verification_code,
        verification_code_expires
    } = userData;

    // We'll do an upsert on email so that if a user tries to sign up again 
    // before verifying, we just update their pending record with a new OTP.
    const query = `
        INSERT INTO pending_users (
            first_name,
            last_name,
            email,
            country_id,
            mobile,
            password_hash,
            verification_code,
            verification_code_expires,
            creation_date_time
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            country_id = EXCLUDED.country_id,
            mobile = EXCLUDED.mobile,
            password_hash = EXCLUDED.password_hash,
            verification_code = EXCLUDED.verification_code,
            verification_code_expires = EXCLUDED.verification_code_expires,
            creation_date_time = EXCLUDED.creation_date_time
        RETURNING *;
    `;

    const values = [
        first_name,
        last_name,
        email,
        country_id,
        mobile,
        password_hash,
        verification_code,
        verification_code_expires
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
