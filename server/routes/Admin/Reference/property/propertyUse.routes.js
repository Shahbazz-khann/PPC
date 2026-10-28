const express = require('express');
const router = express.Router();

const { getPropertyUses, createPropertyUse, updatePropertyUse, deletePropertyUse } = require('../../../../controller/Admin/Reference/property/propertyUse.controller');
const { 
    validateGetPropertyUses, 
    validateCreatePropertyUse, 
    validatePropertyUseId, 
    validateUpdatePropertyUse 
} = require('../../../../validators/Admin/Reference/property/propertyUse.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_USE),
    validateGetPropertyUses,
    getPropertyUses
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_USE),
    validateCreatePropertyUse,
    createPropertyUse
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_USE),
    validatePropertyUseId,
    validateUpdatePropertyUse,
    updatePropertyUse
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROPERTY_USE),
    validatePropertyUseId,
    deletePropertyUse
);

module.exports = router;
