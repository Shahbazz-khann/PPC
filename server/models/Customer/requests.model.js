const { pool } = require('../../config/db');

/**
 * Retrieve all active requests for a customer
 * @param {number} userId - The authenticated user ID
 * @returns {Array} List of requests
 */
const getCustomerRequests = async (userId) => {
    const client = await pool.connect();
    try {
        // 1. Resolve ownership: user_id -> customer_id
        const customerRes = await client.query('SELECT customer_id FROM customers WHERE user_id = $1 AND is_active = true', [userId]);
        if (customerRes.rows.length === 0) {
            // Customer profile not found or inactive, returning empty list
            return [];
        }
        const customerId = customerRes.rows[0].customer_id;

        // 2. Query requests strictly scoped to the resolved customerId
        const query = `
            SELECT 
                cr.request_id AS id,
                CASE 
                    WHEN cr.request_purpose_id IS NOT NULL THEN 'PROPERTY'
                    WHEN cr.service_id IS NOT NULL THEN 'SERVICE'
                END AS category,
                pp.purpose_description AS purpose,
                ps.service_english AS service,
                cr.property_id AS "propertyId",
                pt.property_type_description AS "propertyType",
                s.society_english AS "societyName",
                cr.request_description AS description,
                cr.creation_date_time AS "createdAt",
                st.request_status_english AS status,
                st.request_status_abb AS "statusAbb"
            FROM customer_requests cr
            -- Property Request Joins
            LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
            -- PPC Service Request Join
            LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
            -- Property Label Joins (for frontend display)
            LEFT JOIN properties pr ON cr.property_id = pr.property_id
            LEFT JOIN property_types pt ON pr.property_type_id = pt.property_type_id
            LEFT JOIN areas a ON pr.area_id = a.area_id
            LEFT JOIN societies s ON a.society_id = s.society_id
            -- Current Active Status Join
            LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
            LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
            WHERE cr.customer_id = $1 
              AND cr.is_active = true
            ORDER BY cr.creation_date_time DESC, cr.request_id DESC;
        `;
        
        const res = await client.query(query, [customerId]);
        return res.rows;
    } finally {
        client.release();
    }
};
/**
 * Retrieve a specific request for a customer
 * @param {number} userId - The authenticated user ID
 * @param {string} requestId - The ID of the request to fetch
 * @returns {Object|null} The request object or null if not found/unauthorized
 */
const getCustomerRequestById = async (userId, requestId) => {
    const client = await pool.connect();
    try {
        // 1. Resolve ownership: user_id -> customer_id
        const customerRes = await client.query('SELECT customer_id FROM customers WHERE user_id = $1 AND is_active = true', [userId]);
        if (customerRes.rows.length === 0) {
            return null;
        }
        const customerId = customerRes.rows[0].customer_id;

        // 2. Query specific request securely scoped to the resolved customerId
        const query = `
            SELECT 
                cr.request_id AS id,
                CASE 
                    WHEN cr.request_purpose_id IS NOT NULL THEN 'PROPERTY'
                    WHEN cr.service_id IS NOT NULL THEN 'SERVICE'
                END AS category,
                pp.purpose_description AS purpose,
                ps.service_english AS service,
                ps.service_id AS "serviceId",
                cr.property_id AS "propertyId",
                pt.property_type_description AS "propertyType",
                s.society_english AS "societyName",
                cr.request_description AS description,
                cr.request_audio_url AS "audioUrl",
                cr.creation_date_time AS "createdAt",
                st.request_status_english AS status,
                st.request_status_abb AS "statusAbb"
            FROM customer_requests cr
            -- Property Request Joins
            LEFT JOIN property_purposes pp ON cr.request_purpose_id = pp.purpose_id
            -- PPC Service Request Join
            LEFT JOIN ppc_services ps ON cr.service_id = ps.service_id
            -- Property Label Joins (for frontend display)
            LEFT JOIN properties pr ON cr.property_id = pr.property_id
            LEFT JOIN property_types pt ON pr.property_type_id = pt.property_type_id
            LEFT JOIN areas a ON pr.area_id = a.area_id
            LEFT JOIN societies s ON a.society_id = s.society_id
            -- Current Active Status Join
            LEFT JOIN customer_request_status_history sh ON cr.request_id = sh.request_id AND sh.is_active = true
            LEFT JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
            WHERE cr.request_id = $1
              AND cr.customer_id = $2 
              AND cr.is_active = true
        `;
        
        const res = await client.query(query, [requestId, customerId]);
        return res.rows.length > 0 ? res.rows[0] : null;
    } finally {
        client.release();
    }
};

const createCustomerRequest = async (userId, data) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Resolve Customer ID
        const customerRes = await client.query('SELECT customer_id FROM customers WHERE user_id = $1 AND is_active = true FOR UPDATE', [userId]);
        if (customerRes.rows.length === 0) {
            const err = new Error('Customer profile not found or inactive');
            err.statusCode = 400;
            throw err;
        }
        const customerId = customerRes.rows[0].customer_id;

        // 2. Validate Description
        const description = (data.description || '').trim();
        if (!description) {
            const err = new Error('Request description is required');
            err.statusCode = 400;
            throw err;
        }

        // 3. Category Validation (Property vs Service)
        const isPropertyReq = !!data.requestPurposeId;
        const isServiceReq = !!data.serviceId;

        if (isPropertyReq && isServiceReq) {
            const err = new Error('Cannot supply both purpose and service');
            err.statusCode = 400;
            throw err;
        }
        if (!isPropertyReq && !isServiceReq) {
            const err = new Error('Must supply either purpose or service');
            err.statusCode = 400;
            throw err;
        }

        // 4. Property Validation
        let isOwner = false;
        if (data.propertyId) {
            const propRes = await client.query('SELECT property_id, customer_id FROM properties WHERE property_id = $1 AND is_active = true', [data.propertyId]);
            if (propRes.rows.length === 0) {
                const err = new Error('Property not found or inactive');
                err.statusCode = 400;
                throw err;
            }
            isOwner = String(propRes.rows[0].customer_id) === String(customerId);
        }

        if (isServiceReq) {
            // Service Validation
            const srvRes = await client.query('SELECT service_id FROM ppc_services WHERE service_id = $1 AND is_active = true', [data.serviceId]);
            if (srvRes.rows.length === 0) {
                const err = new Error('Invalid or inactive PPC Service');
                err.statusCode = 400;
                throw err;
            }
            // Optional property ID already validated above if present.
        }

        if (isPropertyReq) {
            // Property Purpose Validation
            if (!data.propertyId) {
                const err = new Error('Property is required for this request');
                err.statusCode = 400;
                throw err;
            }

            const purpRes = await client.query('SELECT purpose_description FROM property_purposes WHERE purpose_id = $1 AND is_active = true', [data.requestPurposeId]);
            if (purpRes.rows.length === 0) {
                const err = new Error('Invalid or inactive Property Purpose');
                err.statusCode = 400;
                throw err;
            }

            const purposeName = purpRes.rows[0].purpose_description;

            // Only the owner can list their property for Sale or request Renovation on it
            if ((purposeName === 'Sale' || purposeName === 'Renovation') && !isOwner) {
                const err = new Error(`Only the property owner can create a ${purposeName} listing for this property.`);
                err.statusCode = 400;
                throw err;
            }

            // Demand validation for owner Sale or Rent
            if (purposeName === 'Sale' || (purposeName === 'Rent' && isOwner)) {
                // Get current active demand
                const demRes = await client.query(`
                    SELECT dt.demand_type_english 
                    FROM property_demand pd
                    JOIN property_demand_types dt ON pd.demand_type_id = dt.demand_type_id
                    WHERE pd.property_id = $1 AND pd.is_active = true
                `, [data.propertyId]);

                if (demRes.rows.length === 0) {
                    const err = new Error(`No active demand found for this property. A ${purposeName} demand is required.`);
                    err.statusCode = 400;
                    throw err;
                }

                const currentDemandType = demRes.rows[0].demand_type_english;
                if (currentDemandType !== purposeName) {
                    const err = new Error(`This property currently has a ${currentDemandType} Demand. A ${purposeName} Demand is required.`);
                    err.statusCode = 400;
                    throw err;
                }
            }
        }

        // 5. Insert Request
        const insertReqQuery = `
            INSERT INTO customer_requests (
                customer_id, property_id, request_purpose_id, service_id, 
                request_description, request_audio_url, 
                creation_date_time, update_date_time, created_by_user, is_active
            ) VALUES (
                $1, $2, $3, $4, $5, NULL, NOW(), NOW(), $6, true
            ) RETURNING request_id
        `;
        const reqRes = await client.query(insertReqQuery, [
            customerId,
            data.propertyId || null,
            data.requestPurposeId || null,
            data.serviceId || null,
            description,
            userId
        ]);
        const requestId = reqRes.rows[0].request_id;

        // 6. Resolve Pending Status
        const statusRes = await client.query(`SELECT request_status_type_id FROM customer_request_status_types WHERE request_status_english = 'Pending' AND is_active = true`);
        if (statusRes.rows.length === 0) {
            throw new Error('Pending status master not found. Data integrity error.');
        }
        const pendingStatusId = statusRes.rows[0].request_status_type_id;

        // 7. Insert Status History
        const insertHistoryQuery = `
            INSERT INTO customer_request_status_history (
                request_id, request_status_type_id, effective_date,
                creation_date_time, update_date_time, created_by_user, is_active
            ) VALUES (
                $1, $2, CURRENT_DATE, NOW(), NOW(), $3, true
            )
        `;
        await client.query(insertHistoryQuery, [requestId, pendingStatusId, userId]);

        await client.query('COMMIT');
        return requestId;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Withdraw a customer request
 * @param {number} userId - The authenticated user ID
 * @param {string|number} requestId - The request ID to withdraw
 * @returns {Promise<Object>} The updated request
 */
const withdrawCustomerRequest = async (userId, requestId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Resolve Customer ID
        const customerRes = await client.query(
            'SELECT customer_id FROM customers WHERE user_id = $1 AND is_active = true FOR UPDATE',
            [userId]
        );
        if (customerRes.rows.length === 0) {
            const err = new Error('Customer profile not found or inactive');
            err.statusCode = 404;
            throw err;
        }
        const customerId = customerRes.rows[0].customer_id;

        // 2. Fetch request and lock it for update, verifying ownership
        const reqRes = await client.query(
            'SELECT request_id FROM customer_requests WHERE request_id = $1 AND customer_id = $2 AND is_active = true FOR UPDATE',
            [requestId, customerId]
        );
        if (reqRes.rows.length === 0) {
            const err = new Error('Request not found or does not belong to you');
            err.statusCode = 404;
            throw err;
        }

        // 3. Check current active status
        const statusCheckQuery = `
            SELECT st.request_status_english, st.request_status_type_id
            FROM customer_request_status_history sh
            JOIN customer_request_status_types st ON sh.request_status_type_id = st.request_status_type_id
            WHERE sh.request_id = $1 AND sh.is_active = true
            ORDER BY sh.request_status_history_id DESC
            LIMIT 1
        `;
        const currentStatusRes = await client.query(statusCheckQuery, [requestId]);
        const currentStatusName = currentStatusRes.rows[0]?.request_status_english || '';

        // Only requests in 'Pending' or 'Under Review' can be withdrawn by customer
        if (
            currentStatusName.toLowerCase() !== 'pending' &&
            currentStatusName.toLowerCase() !== 'under review'
        ) {
            const err = new Error(
                `Cannot withdraw request in '${currentStatusName}' status. Only Pending or Under Review requests can be withdrawn.`
            );
            err.statusCode = 400;
            throw err;
        }

        // 4. Resolve 'Withdrawn' status type ID
        const withdrawnStatusRes = await client.query(
            `SELECT request_status_type_id, request_status_english FROM customer_request_status_types WHERE LOWER(request_status_english) = 'withdrawn' AND is_active = true`
        );
        if (withdrawnStatusRes.rows.length === 0) {
            throw new Error('Withdrawn status master not found. Data integrity error.');
        }
        const withdrawnStatusId = withdrawnStatusRes.rows[0].request_status_type_id;

        // 5. Deactivate previous active status history records
        await client.query(
            `UPDATE customer_request_status_history
             SET is_active = false, update_date_time = CURRENT_TIMESTAMP
             WHERE request_id = $1 AND is_active = true`,
            [requestId]
        );

        // 6. Insert new active status history record
        const insertHistoryQuery = `
            INSERT INTO customer_request_status_history (
                request_id,
                request_status_type_id,
                effective_date,
                status_remarks,
                creation_date_time,
                update_date_time,
                created_by_user,
                is_active
            ) VALUES (
                $1, $2, CURRENT_DATE, 'Withdrawn by customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, true
            )
        `;
        await client.query(insertHistoryQuery, [requestId, withdrawnStatusId, userId]);

        // 7. Update update_date_time on customer_requests
        await client.query(
            `UPDATE customer_requests
             SET update_date_time = CURRENT_TIMESTAMP
             WHERE request_id = $1`,
            [requestId]
        );

        await client.query('COMMIT');

        // 8. Return updated customer request details
        return await getCustomerRequestById(userId, requestId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    getCustomerRequests,
    getCustomerRequestById,
    createCustomerRequest,
    withdrawCustomerRequest
};
