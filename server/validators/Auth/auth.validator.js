const validateSignup = (req, res, next) => {
    const { name, email, country, mobile_no, password } = req.body;
    const errors = {};

    if (!name) errors.name = 'Name is required.';
    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        errors.email = 'Please provide a valid email address.';
    }
    if (!country) errors.country = 'Country is required.';
    if (!mobile_no) errors.mobile_no = 'Mobile number is required.';
    if (!password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }
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
