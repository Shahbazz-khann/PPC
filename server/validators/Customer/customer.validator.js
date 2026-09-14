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

module.exports = {
    validateUpdateProfile,
    validateChangePassword
};
