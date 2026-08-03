const express = require('express');
const router = express.Router();

const authController = require('../../controller/Auth/auth.controller');
const { authenticate } = require('../../middlewares/authMiddleware');
const {
    validateSignup,
    validateVerifyEmail,
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require('../../validators/Auth/auth.validator');

router.post('/signup', validateSignup, authController.signup);
router.post('/verify-email', validateVerifyEmail, authController.verifyEmail);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);

router.get('/profile', authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: req.user
    });
});

module.exports = router;