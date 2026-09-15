const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const customerModel = require('../../models/Customer/customer.model');

// (Keep getProfile and updateProfile as they are... then append at bottom)


/**
 * Get Authenticated Customer Profile
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const profile = await customerModel.getCustomerProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer profile retrieved successfully',
            data: profile
        });

    } catch (error) {
        logger.error('Get Customer Profile Error:', error);
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const profileData = req.body;

        const updatedProfile = await customerModel.updateCustomerProfileByUserId(userId, profileData);

        return res.status(200).json({
            success: true,
            message: 'Customer profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        logger.error('Update Customer Profile Error:', error);
        
        // Handle custom validation/conflict errors from model
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        
        // Return 400 for specific known errors from the model (like missing references)
        if (error.message.includes('Invalid or inactive')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (error.message === 'Customer profile not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file supplied or unsupported file type'
            });
        }

        const userId = req.user.user_id;
        const newImageUrl = `/uploads/profile-images/${req.file.filename}`;

        const oldImageUrl = await customerModel.updateProfileImage(userId, newImageUrl);

        // Safely remove old image if it belongs to managed directory
        if (oldImageUrl && oldImageUrl.includes('/uploads/profile-images/')) {
            const oldFilename = path.basename(oldImageUrl);
            const oldFilePath = path.join(__dirname, '../../uploads/profile-images', oldFilename);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Profile image updated successfully',
            data: {
                profile_image_url: newImageUrl
            }
        });
    } catch (error) {
        // Remove uploaded orphan file if DB update fails
        if (req.file) {
            const filePath = path.join(__dirname, '../../uploads/profile-images', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        logger.error('Update Profile Image Error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                success: false,
                message: 'Authenticated user not found'
            });
        }

        next(error);
    }
};

const bcrypt = require('bcryptjs');

const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { current_password, new_password } = req.body;

        // 1. Confirm customer profile exists for this user
        const profile = await customerModel.getCustomerProfileByUserId(userId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Customer profile not found'
            });
        }

        // 2. Fetch current password hash
        const storedHash = await customerModel.getPasswordHashByUserId(userId);
        if (!storedHash) {
            return res.status(404).json({
                success: false,
                message: 'User authentication record not found'
            });
        }

        // 3. Verify current password
        const isCurrentValid = await bcrypt.compare(current_password, storedHash);
        if (!isCurrentValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // 4. Ensure new password differs
        const isSamePassword = await bcrypt.compare(new_password, storedHash);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // 5. Hash new password
        const newPasswordHash = await bcrypt.hash(new_password, 10);

        // 6. Update user password
        await customerModel.updateUserPassword(userId, newPasswordHash);

        logger.info(`Customer password changed successfully: User ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Change Customer Password Error:', error);
        next(error);
    }
};

const getDashboardSummary = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const summary = await customerModel.getDashboardSummaryByUserId(userId);

        return res.status(200).json({
            success: true,
            message: 'Dashboard summary retrieved successfully',
            data: summary
        });
    } catch (error) {
        logger.error('Get Dashboard Summary Error:', error);
        next(error);
    }
};

const getDashboardProperties = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const properties = await customerModel.getDashboardPropertiesByUserId(userId);

        return res.status(200).json({
            success: true,
            message: 'Dashboard properties retrieved successfully',
            data: properties
        });
    } catch (error) {
        logger.error('Get Dashboard Properties Error:', error);
        next(error);
    }
};

const getProperties = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const properties = await customerModel.getCustomerPropertiesByUserId(userId);

        return res.status(200).json({
            success: true,
            message: 'Properties retrieved successfully',
            data: properties
        });
    } catch (error) {
        logger.error('Get Properties Error:', error);
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfileImage,
    changePassword,
    getDashboardSummary,
    getDashboardProperties,
    getProperties
};
