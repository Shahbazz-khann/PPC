const express = require('express');
const router = express.Router();

const { getPropertyPurposes } = require('../../../../controller/Admin/Reference/property/propertyPurposes.controller');
const { validateGetPropertyPurposes } = require('../../../../validators/Admin/Reference/property/propertyPurposes.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_PURPOSES),
    validateGetPropertyPurposes,
    getPropertyPurposes
);

module.exports = router;
