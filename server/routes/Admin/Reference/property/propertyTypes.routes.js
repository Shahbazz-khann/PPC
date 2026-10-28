const express = require('express');
const router = express.Router();

const { getPropertyTypes, createPropertyType, updatePropertyType, deletePropertyType } = require('../../../../controller/Admin/Reference/property/propertyTypes.controller');
const { validateGetPropertyTypes, validateCreatePropertyType, validatePropertyTypeId, validateUpdatePropertyType } = require('../../../../validators/Admin/Reference/property/propertyTypes.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_TYPES),
    validateGetPropertyTypes,
    getPropertyTypes
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_TYPES),
    validateCreatePropertyType,
    createPropertyType
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_TYPES),
    validatePropertyTypeId,
    validateUpdatePropertyType,
    updatePropertyType
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_TYPES),
    validatePropertyTypeId,
    deletePropertyType
);

module.exports = router;
