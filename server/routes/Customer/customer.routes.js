const express = require('express');
const router = express.Router();

const customerController = require('../../controller/Customer/customer.controller');
const { validateUpdateProfile, validateChangePassword } = require('../../validators/Customer/customer.validator');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadProfileImage } = require('../../middlewares/uploadMiddleware');

router.get('/profile', authenticate, authorize('customer'), customerController.getProfile);
router.put('/profile', authenticate, authorize('customer'), validateUpdateProfile, customerController.updateProfile);
router.post('/profile-image', authenticate, authorize('customer'), uploadProfileImage.single('profileImage'), customerController.uploadProfileImage);
router.put('/password', authenticate, authorize('customer'), validateChangePassword, customerController.changePassword);

module.exports = router;
