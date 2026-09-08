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
 * Find user by email with user_type information
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT
            u.user_id,
            u.user_type_id,
            ut.user_type_english,
            u.user_first_name,
            u.user_middle_name,
            u.user_last_name,
            u.country,
            u.email,
            u.mobile,
            u.password_hash,
            u.date_of_registration,
            u.is_active
        FROM users u
        LEFT JOIN user_types ut
            ON u.user_type_id = ut.user_type_id
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
            u.user_id,
            u.user_first_name,
            u.user_last_name,
            u.email,
            u.country,
            u.mobile,
            u.user_type_id,
            ut.user_type_english,
            u.date_of_registration,
            u.is_active
        FROM users u
        LEFT JOIN user_types ut ON ut.user_type_id = u.user_type_id
        ORDER BY u.user_id ASC
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
            u.user_first_name,
            u.user_middle_name,
            u.user_last_name,
            u.email,
            u.country,
            u.mobile,
            u.user_type_id,
            ut.user_type_english,
            u.date_of_registration,
            u.is_active
        FROM users u
        LEFT JOIN user_types ut ON ut.user_type_id = u.user_type_id
        WHERE u.user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

/**
 * Check if email or mobile exists in users
 */
const checkEmailOrMobileExists = async (email, mobile) => {
    const query = `
        SELECT user_id FROM users
        WHERE email = $1 OR mobile = $2
        LIMIT 1
    `;
    const result = await pool.query(query, [email, mobile]);
    return result.rows.length > 0;
};

/**
 * Transaction to create a customer user, their customer profile,
 * and atomically delete the pending_users record.
 * All 5 steps share the same client: BEGIN → INSERT users → INSERT customers → DELETE pending_users → COMMIT
 */
const createCustomerUserTransaction = async (pendingUser, countryName, userTypeId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert into users
        const insertUserQuery = `
            INSERT INTO users (
                user_type_id,
                employee_id,
                user_first_name,
                user_middle_name,
                user_last_name,
                country,
                email,
                mobile,
                password_hash,
                date_of_registration,
                is_active,
                creation_date_time,
                update_date_time
            )
            VALUES ($1, NULL, $2, NULL, $3, $4, $5, $6, $7, NOW(), true, NOW(), NOW())
            RETURNING user_id
        `;
        const userValues = [
            userTypeId,
            pendingUser.first_name,
            pendingUser.last_name,
            countryName,
            pendingUser.email,
            pendingUser.mobile,
            pendingUser.password_hash
        ];

        const userResult = await client.query(insertUserQuery, userValues);
        const newUserId = userResult.rows[0].user_id;

        // 2. Insert into customers
        const insertCustomerQuery = `
            INSERT INTO customers (
                user_id,
                customer_first_name,
                customer_last_name,
                email,
                mobile,
                country_id,
                date_of_registration,
                is_active,
                creation_date_time,
                update_date_time
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), true, NOW(), NOW())
        `;
        const customerValues = [
            newUserId,
            pendingUser.first_name,
            pendingUser.last_name,
            pendingUser.email,
            pendingUser.mobile,
            pendingUser.country_id
        ];

        await client.query(insertCustomerQuery, customerValues);

        // 3. Delete the pending_users record inside the same transaction
        await client.query('DELETE FROM pending_users WHERE email = $1', [pendingUser.email]);

        await client.query('COMMIT');
        return newUserId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    saveResetToken,
    findUserByResetToken,
    updatePassword,
    getUsers,
    getUserById,
    checkEmailOrMobileExists,
    createCustomerUserTransaction
};