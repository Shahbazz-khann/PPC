const validateUpdateProfile = (req, res, next) => {
    const {
        customer_title_id,
        first_name,
        middle_name,
        last_name,
        gender_id,
        identity_type_id,
        identity_number,
        country_id,
        mobile
    } = req.body;

    const errors = [];

    // Required fields check
    if (!customer_title_id) errors.push('Customer title is required');
    if (!first_name || !String(first_name).trim()) errors.push('First name is required');
    if (!last_name || !String(last_name).trim()) errors.push('Last name is required');
    if (!identity_type_id) errors.push('Identity type is required');
    if (!identity_number || !String(identity_number).trim()) errors.push('Identity number is required');
    if (!country_id) errors.push('Country is required');
    if (!mobile || !String(mobile).trim()) errors.push('Mobile is required');

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Trim the normal string fields
    req.body.first_name = String(first_name).trim();
    req.body.last_name = String(last_name).trim();
    req.body.identity_number = String(identity_number).trim();
    req.body.mobile = String(mobile).trim();

    if (middle_name) req.body.middle_name = String(middle_name).trim();

    // gender_id is optional but if empty string, send as null
    if (!gender_id || String(gender_id).trim() === '') {
        req.body.gender_id = null;
    }

    next();
};



const validateChangePassword = (req, res, next) => {
    const { current_password, new_password, confirm_password } = req.body;

    const errors = {};

    if (!current_password) errors.current_password = 'Current password is required.';
    if (!new_password) errors.new_password = 'New password is required.';

    if (new_password) {
        if (new_password.length < 8 || new_password.length > 128) {
            errors.new_password = 'Password must be 8-128 characters.';
        } else if (!/[A-Z]/.test(new_password) || !/[a-z]/.test(new_password) || !/\d/.test(new_password) || !/[^a-zA-Z\d]/.test(new_password)) {
            errors.new_password = 'Password must contain:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character';
        }
    }

    if (new_password !== confirm_password) {
        errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateAddProperty = (req, res, next) => {
    const { area_id } = req.body;

    if (!area_id) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: ['Area ID is required']
        });
    }

    // Additional numeric validation could be added here, but the controller/model will also naturally reject bad types.
    // Ensure amenities is an array if provided
    if (req.body.amenities && !Array.isArray(req.body.amenities)) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: ['Amenities must be an array of strings']
        });
    }

    next();
};

/**
 * Validate :propertyId route param is a positive integer.
 * Must run BEFORE ownership check and BEFORE Multer.
 */
const validatePropertyId = (req, res, next) => {
    const { propertyId } = req.params;
    const id = parseInt(propertyId, 10);

    if (!propertyId || isNaN(id) || id <= 0 || String(id) !== String(propertyId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid property ID. Must be a positive integer.'
        });
    }

    // Normalise: store parsed integer back so downstream code is consistent
    req.params.propertyId = id;
    next();
};

/**
 * Verify that the authenticated customer owns the property referenced by :propertyId.
 * MUST run BEFORE Multer so no files are written to disk for unauthorised requests.
 */
const { pool } = require('../../config/db');

const verifyPropertyOwnership = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const propertyId = req.params.propertyId;

        // 1. Resolve customer_id from user_id
        const customerResult = await pool.query(
            'SELECT customer_id FROM customers WHERE user_id = $1',
            [userId]
        );

        if (customerResult.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'Customer profile not found for authenticated user.'
            });
        }

        const customerId = customerResult.rows[0].customer_id;

        // 2. Verify property belongs to this customer
        const propertyResult = await pool.query(
            'SELECT property_id FROM properties WHERE property_id = $1 AND customer_id = $2',
            [propertyId, customerId]
        );

        if (propertyResult.rowCount === 0) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this property.'
            });
        }

        // Attach for downstream use (avoids duplicate queries in controller/model)
        req.verifiedCustomerId = customerId;
        next();

    } catch (error) {
        next(error);
    }
};

const validatePropertyDemand = (req, res, next) => {
    const { demand_type_id, demand_amount } = req.body;

    const errors = [];

    const parsedDemandTypeId = parseInt(demand_type_id, 10);
    if (!demand_type_id || isNaN(parsedDemandTypeId) || parsedDemandTypeId <= 0 || String(parsedDemandTypeId) !== String(demand_type_id)) {
        errors.push('demand_type_id must be a positive integer.');
    } else {
        req.body.demand_type_id = parsedDemandTypeId;
    }

    const parsedDemandAmount = Number(demand_amount);
    if (demand_amount === undefined || demand_amount === null || isNaN(parsedDemandAmount) || parsedDemandAmount <= 0) {
        errors.push('demand_amount must be a positive number.');
    } else {
        req.body.demand_amount = parsedDemandAmount;
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

const validateUpdateProperty = [
    (req, res, next) => {
        if (!req.body.area_id) {
            return res.status(400).json({ success: false, errors: ['area_id is required'] });
        }
        
        // Strip uneditable fields
        delete req.body.customer_id;
        delete req.body.is_active;
        delete req.body.created_by_user;
        delete req.body.property_id;
        
        next();
    }
];

module.exports = {
    validateUpdateProfile,
    validateChangePassword,
    validatePropertyId,
    verifyPropertyOwnership,
    validateAddProperty,
    validateUpdateProperty,
    validatePropertyDemand
};
