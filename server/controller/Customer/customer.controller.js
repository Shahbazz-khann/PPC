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
        logger.error('Get Customer Properties Error:', error);
        next(error);
    }
};

/**
 * Get single property detail — owner verified in the model via user_id join.
 */
const getPropertyDetail = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const propertyId = req.params.propertyId; // already parsed to int by validatePropertyId

        const detail = await customerModel.getPropertyDetailByIdAndUserId(propertyId, userId);

        if (!detail) {
            return res.status(404).json({
                success: false,
                message: 'Property not found or you do not have permission to view it.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Property details retrieved successfully',
            data: detail
        });
    } catch (error) {
        logger.error('Get Property Detail Error:', error);
        next(error);
    }
};


/**
 * Add a new Property
 */
const addProperty = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const propertyData = req.body;

        const propertyId = await customerModel.addProperty(userId, propertyData);

        return res.status(201).json({
            success: true,
            message: 'Property added successfully',
            data: {
                property_id: propertyId
            }
        });
    } catch (error) {
        logger.error('Add Property Error:', error);

        // Handle invalid hierarchy or pending stage errors specifically if needed
        if (error.message.includes('Invalid geographic hierarchy') ||
            error.message.includes('Customer profile not found') ||
            error.message.includes('stage not found') ||
            error.message.includes('type not found')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

/**
 * Upload pictures for a specific property.
 * Ownership already verified by verifyPropertyOwnership middleware.
 * Files already saved to disk by Multer before this controller runs.
 */
const uploadPropertyPictures = async (req, res, next) => {
    // Helper: delete every file written by this request to avoid orphans
    const cleanupFiles = () => {
        if (!req.files || req.files.length === 0) return;
        req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
                try { fs.unlinkSync(file.path); } catch (_) { /* best-effort */ }
            }
        });
    };

    try {
        const propertyId = req.params.propertyId;
        const userId = req.user.user_id;

        // 1. Ensure at least one file was uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pictures supplied. Please upload at least one image file.'
            });
        }

        // 2. Build relative public URLs for each saved file
        const pictureUrls = req.files.map(
            file => `/uploads/property-pictures/${file.filename}`
        );

        // 3. Delegate to model (transaction + display_order + active-count guard)
        let insertedPictures;
        try {
            insertedPictures = await customerModel.uploadPropertyPictures(
                propertyId,
                userId,
                pictureUrls
            );
        } catch (modelError) {
            // DB operation failed – rollback is already done inside the model.
            // Delete the physical files that Multer already wrote.
            cleanupFiles();
            logger.error('Upload Property Pictures - DB Error (files cleaned up):', modelError);

            if (modelError.statusCode === 400) {
                return res.status(400).json({
                    success: false,
                    message: modelError.message
                });
            }
            return next(modelError);
        }

        return res.status(201).json({
            success: true,
            message: 'Property pictures uploaded successfully',
            data: {
                property_id: propertyId,
                pictures: insertedPictures
            }
        });

    } catch (error) {
        // Unexpected error – attempt cleanup
        cleanupFiles();
        logger.error('Upload Property Pictures Error:', error);
        next(error);
    }
};

/**
 * Upload a single MP4 video for a specific property.
 * Ownership already verified by verifyPropertyOwnership middleware.
 * File already saved to disk by Multer .single('video') before this runs.
 */
const uploadPropertyVideo = async (req, res, next) => {
    // Helper: delete the video file saved by this request (orphan prevention)
    const cleanupFile = () => {
        if (!req.file) return;
        if (fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (_) { /* best-effort */ }
        }
    };

    try {
        const propertyId = req.params.propertyId;
        const userId = req.user.user_id;

        // 1. Ensure Multer saved a file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No video file supplied. Please upload an MP4 file.'
            });
        }

        // 2. Build relative public URL
        const videoUrl = `/uploads/property-videos/${req.file.filename}`;

        // 3. Delegate to model (transaction + FOR UPDATE lock + one-video limit)
        let insertedVideo;
        try {
            insertedVideo = await customerModel.uploadPropertyVideo(
                propertyId,
                userId,
                videoUrl
            );
        } catch (modelError) {
            // DB failed – rollback already done in model; delete the physical file
            cleanupFile();
            logger.error('Upload Property Video - DB Error (file cleaned up):', modelError);

            if (modelError.statusCode === 400) {
                return res.status(400).json({
                    success: false,
                    message: modelError.message
                });
            }
            return next(modelError);
        }

        return res.status(201).json({
            success: true,
            message: 'Property video uploaded successfully',
            data: {
                property_id: propertyId,
                video: insertedVideo
            }
        });

    } catch (error) {
        cleanupFile();
        logger.error('Upload Property Video Error:', error);
        next(error);
    }
};

/**
 * Set Property Pricing (Demand)
 */
const setPropertyDemand = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;
        const customerId = req.verifiedCustomerId; // From verifyPropertyOwnership middleware
        const userId = req.user.user_id;
        const { demand_type_id, demand_amount } = req.body;

        const demand = await customerModel.addPropertyDemand(
            propertyId,
            customerId,
            userId,
            demand_type_id,
            demand_amount
        );

        return res.status(200).json({
            success: true,
            message: 'Property demand set successfully',
            data: demand
        });
    } catch (error) {
        logger.error('Set Property Demand Error:', error);

        if (error.statusCode === 400 || error.statusCode === 404) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }

        next(error);
    }
};

const updateProperty = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const customerId = req.verifiedCustomerId;
        const propertyId = req.params.propertyId;
        const data = req.body;

        await customerModel.updateProperty(propertyId, customerId, data);

        logger.info(`Property updated successfully: Prop ${propertyId} by User ${userId}`);

        return res.status(200).json({
            success: true,
            message: 'Property updated successfully'
        });
    } catch (error) {
        logger.error('Update Property Error:', error);
        if (error.message.includes('Invalid geographic hierarchy')) {
            return res.status(400).json({ success: false, message: error.message });
        }
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
    getProperties,
    getPropertyDetail,
    addProperty,
    updateProperty,
    uploadPropertyPictures,
    uploadPropertyVideo,
    setPropertyDemand
};
