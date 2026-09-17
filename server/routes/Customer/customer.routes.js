const express = require('express');
const router = express.Router();

const customerController = require('../../controller/Customer/customer.controller');
const { validateUpdateProfile, validateChangePassword, validateAddProperty,
    validatePropertyId, verifyPropertyOwnership, validatePropertyDemand, validateUpdateProperty } = require('../../validators/Customer/customer.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadProfileImage, uploadPropertyPictures, MAX_PROPERTY_PICTURES,
    uploadPropertyVideo } = require('../../middlewares/uploadMiddleware');

router.get('/profile', authenticate, authorize('customer'), customerController.getProfile);
router.put('/profile', authenticate, authorize('customer'), validateUpdateProfile, customerController.updateProfile);
router.post('/profile-image', authenticate, authorize('customer'), uploadProfileImage.single('profileImage'), customerController.uploadProfileImage);
router.put('/password', authenticate, authorize('customer'), validateChangePassword, customerController.changePassword);

// Dashboard
router.get('/dashboard/summary', authenticate, authorize('customer'), customerController.getDashboardSummary);
router.get('/dashboard/properties', authenticate, authorize('customer'), customerController.getDashboardProperties);

// Properties
router.get('/properties', authenticate, authorize('customer'), customerController.getProperties);
router.get('/properties/:propertyId', authenticate, authorize('customer'), validatePropertyId, customerController.getPropertyDetail);
router.post('/properties', authenticate, authorize('customer'), validateAddProperty, customerController.addProperty);
router.put('/properties/:propertyId', authenticate, authorize('customer'), validatePropertyId, verifyPropertyOwnership, validateUpdateProperty, customerController.updateProperty);
router.post('/properties/:propertyId/demand', authenticate, authorize('customer'), validatePropertyId, verifyPropertyOwnership, validatePropertyDemand, customerController.setPropertyDemand);

// Property Pictures
// Middleware order: authenticate → authorize → validatePropertyId → verifyPropertyOwnership → multer → controller
// CRITICAL: verifyPropertyOwnership runs BEFORE multer so no files are written for unauthorised requests.
router.post(
    '/properties/:propertyId/pictures',
    authenticate,
    authorize('customer'),
    validatePropertyId,
    verifyPropertyOwnership,
    (req, res, next) => {
        uploadPropertyPictures.array('pictures', MAX_PROPERTY_PICTURES)(req, res, (err) => {
            if (!err) return next();
            if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ success: false, message: `Maximum ${MAX_PROPERTY_PICTURES} pictures are allowed per request.` });
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'Each image must not exceed 5 MB.' });
            }
            if (err.statusCode === 400) {
                return res.status(400).json({ success: false, message: err.message });
            }
            next(err);
        });
    },
    customerController.uploadPropertyPictures
);

// Property Video
// Middleware order: authenticate → authorize → validatePropertyId → verifyPropertyOwnership → multer.single → controller
// CRITICAL: verifyPropertyOwnership runs BEFORE multer so no file is written for unauthorised requests.
router.post(
    '/properties/:propertyId/video',
    authenticate,
    authorize('customer'),
    validatePropertyId,
    verifyPropertyOwnership,
    (req, res, next) => {
        uploadPropertyVideo.single('video')(req, res, (err) => {
            if (!err) return next();
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'Video file must not exceed 50 MB.' });
            }
            if (err.statusCode === 400) {
                // fileFilter rejection (non-MP4)
                return res.status(400).json({ success: false, message: err.message });
            }
            next(err);
        });
    },
    customerController.uploadPropertyVideo
);

module.exports = router;
