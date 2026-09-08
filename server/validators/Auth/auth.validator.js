const validateSignup = (req, res, next) => {
    const {
        first_name,
        last_name,
        email,
        country_id,
        mobile,
        password,
        confirm_password
    } = req.body;

    const errors = {};

    if (!first_name) errors.first_name = 'First name is required.';
    if (!last_name) errors.last_name = 'Last name is required.';

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = 'Please provide a valid email address.';
    }

    if (!country_id) errors.country_id = 'Country is required.';
    if (!mobile) errors.mobile = 'Mobile number is required.';
    
    if (!password) {
        errors.password = 'Password is required.';
    }
    
    if (password !== confirm_password) {
        errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Normalize email
    req.body.email = email.trim().toLowerCase();

    next();
};
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Normalize email: trim whitespace and convert to lowercase
    req.body.email = email.trim().toLowerCase();

    next();
};

const validateVerifyEmail = (req, res, next) => {
    const { email, otp } = req.body;
    const errors = {};

    if (!email) errors.email = 'Email is required.';
    if (!otp) errors.otp = 'OTP is required.';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Normalize email: trim whitespace and convert to lowercase
    req.body.email = email.trim().toLowerCase();

    next();
};

const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;
    const errors = {};

    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = 'Please provide a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    // Normalize email: trim whitespace and convert to lowercase
    req.body.email = email.trim().toLowerCase();

    next();
};

const validateResetPassword = (req, res, next) => {
    const { token, password } = req.body;
    const errors = {};

    if (!token) errors.token = 'Reset token is required.';
    if (!password) errors.password = 'New password is required.';

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
    validateSignup,
    validateLogin,
    validateVerifyEmail,
    validateForgotPassword,
    validateResetPassword
};
