const express = require('express');
const router = express.Router();

const authController = require('../../controller/Auth/auth.controller');
const { authenticate } = require('../../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: req.user
    });
});

module.exports = router;