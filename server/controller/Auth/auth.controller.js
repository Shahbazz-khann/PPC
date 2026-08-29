const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');
const authModel = require('../../models/Auth/auth.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../../utils/email');
const pendingUserModel = require('../../models/Auth/pending_user.model');
const roleModel = require('../../models/roles/role.model');
/**
 * User Signup Controller
 */
const signup = async (req, res, next) => {
    
    try {
       console.log('Signup account type:', req.body.account_type);
         const {
          name,
          email,
          country,
          mobile_no,
          password,
          account_type
       } = req.body;

console.log('Signup account type:', account_type);

        // Check if user already exists in main users table
        const existingUser = await authModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }
        //   FIND ROLE
    const roleName = 'User';
    const role = await roleModel.findRoleByName(roleName);
   if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account type'
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
            name,
            email,
            country,
            mobile_no,
            password: hashedPassword,
            verification_code: hashedOtp,
            verification_code_expires: otpExpires,
            role_id: role.role_id
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

        // Create user in main users table
        const user = await authModel.createUser({
            name: pendingUser.name,
            email: pendingUser.email,
            country: pendingUser.country,
            mobile_no: pendingUser.mobile_no,
            password: pendingUser.password, // already hashed
            role_id: pendingUser.role_id
        });

        // Delete from pending_users table
        await pendingUserModel.deletePendingUser(email);

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
                name: user.name,
                role_id: user.role_id,
                role_name: user.role_name
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
    role_id: user.role_id,
    role_name: user.role_name,
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