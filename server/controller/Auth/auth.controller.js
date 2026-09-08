const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const authModel = require('../../models/Auth/auth.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../../utils/email');
const pendingUserModel = require('../../models/Auth/pending_user.model');
const { pool } = require('../../config/db');
/**
 * User Signup Controller
 */
const signup = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            email,
            country_id,
            mobile,
            password
        } = req.body;

        // Check if user already exists with this email or mobile
        const userExists = await authModel.checkEmailOrMobileExists(email, mobile);
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email or mobile number'
            });
        }

        // Validate country_id
        const countryResult = await pool.query("SELECT country_id FROM countries WHERE country_id = $1 LIMIT 1", [country_id]);
        if (countryResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid country selected'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP for secure storage
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Set expiration to 15 minutes from now
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        // Store in pending_users table
        const pendingUser = await pendingUserModel.createPendingUser({
            first_name,
            last_name,
            email,
            country_id,
            mobile,
            password_hash: hashedPassword,
            verification_code: hashedOtp,
            verification_code_expires: otpExpires
        });

        // Send email with plain text OTP
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            logger.error(`Signup failed: Email could not be sent to ${email}`);
            return res.status(500).json({
                success: false,
                message: 'We were unable to send the verification code to your email. Please try again.'
            });
        }

        logger.info(`User registered and verification email sent: ${email}`);

        return res.status(200).json({
            success: true,
            message: 'A verification code has been sent to your email. Please check your inbox to continue.',
            email: email
        });

    } catch (error) {
        logger.error('Signup error:', error);
        next(error);
    }
};

/**
 * Verify Email Controller
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const pendingUser = await pendingUserModel.findPendingUserByEmail(email);

        if (!pendingUser) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification request'
            });
        }

        // Check if OTP is expired
        if (new Date() > pendingUser.verification_code_expires) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please sign up again.'
            });
        }

        // Validate OTP
        const isOtpValid = await bcrypt.compare(otp, pendingUser.verification_code);

        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // pool already imported at module level

        // Fetch user_type_id for "Customer"
        const userTypeResult = await pool.query("SELECT user_type_id FROM user_types WHERE user_type_english = 'Customer' LIMIT 1");
        if (userTypeResult.rows.length === 0) {
            return res.status(500).json({ success: false, message: 'User type Customer not found in database' });
        }
        const userTypeId = userTypeResult.rows[0].user_type_id;

        // Fetch country name
        const countryResult = await pool.query("SELECT country_english FROM countries WHERE country_id = $1 LIMIT 1", [pendingUser.country_id]);
        const countryName = countryResult.rows.length > 0 ? countryResult.rows[0].country_english : null;

        // Create user in main users and customers table via transaction
        // (also atomically deletes the pending_users record inside the same transaction)
        await authModel.createCustomerUserTransaction(pendingUser, countryName, userTypeId);

        logger.info(`User email verified successfully: ${email}`);

        return res.status(201).json({
            success: true,
            message: 'Email verified and account created successfully'
        });

    } catch (error) {
        logger.error('Verify email error:', error);
        next(error);
    }
};



/**
 * User Login Controller
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;



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
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                user_first_name: user.user_first_name,
                user_last_name: user.user_last_name,
                user_type_id: user.user_type_id,
                user_type: user.user_type_english
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
            user_first_name: user.user_first_name,
            user_last_name: user.user_last_name,
            email: user.email,
            country: user.country,
            mobile: user.mobile,
            user_type_id: user.user_type_id,
            user_type: user.user_type_english,
            date_of_registration: user.date_of_registration
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

// getusers 
const getUsers = async (req, res, next) => {
    try {
        const users = await authModel.getUsers();

        return res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
        logger.error('Get users error:', error);
        next(error);
    }
};

// getme 
const getMe = async (req, res, next) => {
    try {
        const user = await authModel.getUserById(req.user.user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Authenticated user not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Current user retrieved successfully',
            data: user
        });
    } catch (error) {
        logger.error('Get current user error:', error);
        next(error);
    }
};


/**
 * User Logout Controller
 */
const logout = async (req, res, next) => {
    try {
        // Since we are using stateless JWTs without a token blacklist,
        // logout is handled client-side by destroying the token.
        // We just return a success response to confirm the action.
        if (req.user && req.user.email) {
            logger.info(`User logged out successfully: ${req.user.email}`);
        } else {
            logger.info(`User logged out successfully`);
        }

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        next(error);
    }
};

module.exports = {
    signup,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUsers,
    getMe
};