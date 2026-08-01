const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const authModel = require('../../models/Auth/auth.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../utils/email');

/**
 * User Signup Controller
 */
const signup = async (req, res, next) => {
    try {
        const {
            name,
            email,
            country,
            mobile_no,
            password
        } = req.body;

        // Validate required fields
        if (!name || !email || !country || !mobile_no || !password) {
            return res.status(400).json({
                success: false,
                message: 'All signup fields are required'
            });
        }

        // Hash password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user through the model
        const user = await authModel.createUser({
            name,
            email,
            country,
            mobile_no,
            password: hashedPassword
        });

        logger.info(`User registered successfully: ${email}`);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });

    } catch (error) {
        logger.error('Signup error:', error);

        // Pass error to centralized error middleware
        next(error);
    }
};



/**
 * User Login Controller
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await authModel.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('JWT SECRET EXISTS:', !!process.env.JWT_SECRET);
        // Generate JWT token
const token = jwt.sign(
    {
        user_id: user.user_id,
        email: user.email,
        name: user.name
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '24h'
    }
);




        logger.info(`User logged in successfully: ${email}`);

        // Never send the password back to the client
        const userData = {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            country: user.country,
            mobile_no: user.mobile_no,
            created_at: user.created_at
        };

   return res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    data: userData
});

    } catch (error) {
        logger.error('Login error:', error);
        next(error);
    }
};


/**
 * Forgot Password Controller
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Find user by email
        const user = await authModel.findUserByEmail(email);

        /*
         * For security, we don't reveal whether
         * an email exists in our database.
         */
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link will be sent.'
            });
        }

        /*
         * Generate a secure random reset token.
         *
         * This is the raw token that will eventually
         * be sent to the user's email.
         */
        const resetToken = crypto.randomBytes(32).toString('hex');

        /*
         * Hash the token before storing it in the database.
         *
         * We never store the raw reset token.
         */
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        /*
         * Token expires after 15 minutes.
         */
        const resetTokenExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        // Save hashed token + expiration in database
        await authModel.saveResetToken(
            user.user_id,
            hashedResetToken,
            resetTokenExpires
        );

        logger.info(`Password reset requested for: ${email}`);

        // Generate the reset URL and send the email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        
        // Send email without blocking the response unnecessarily or exposing failure to the client in generic response
        sendPasswordResetEmail(user.email, resetUrl).catch(err => {
            logger.error(`Failed to send password reset email to ${user.email}`, err);
        });

        return res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link will be sent.'
        });

    } catch (error) {
        logger.error('Forgot password error:', error);
        next(error);
    }
};


/**
 * Reset user password
 */
const resetPassword = async (req, res, next) => {
    try {
        const {
            token,
            password
        } = req.body;

        // Validate required fields
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        // Hash the incoming raw token to match the database stored token
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user using reset token
        const user = await authModel.findUserByResetToken(hashedResetToken);

        // Token doesn't exist or has expired
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        const updatedUser = await authModel.updatePassword(
            user.user_id,
            hashedPassword
        );

        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: 'Password could not be updated'
            });
        }

        logger.info(
            `Password reset successfully: ${updatedUser.email}`
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        logger.error('Reset password error:', error);
        next(error);
    }
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword
};