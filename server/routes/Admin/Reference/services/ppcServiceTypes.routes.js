const express = require('express');
const router = express.Router();

const {
    getPpcServiceTypes,
    getPpcServiceTypeById,
    createPpcServiceType,
    updatePpcServiceType,
    deletePpcServiceType
} = require('../../../../controller/Admin/Reference/services/ppcServiceTypes.controller');

const {
    validateGetPpcServiceTypes,
    validatePpcServiceTypeId,
    validateCreatePpcServiceType,
    validateUpdatePpcServiceType
} = require('../../../../validators/Admin/Reference/services/ppcServiceTypes.validator');

const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

// GET /api/v1/admin/reference/services/ppc-service-types
router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES),
    validateGetPpcServiceTypes,
    getPpcServiceTypes
);

// GET /api/v1/admin/reference/services/ppc-service-types/:id
router.get(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES),
    validatePpcServiceTypeId,
    getPpcServiceTypeById
);

// POST /api/v1/admin/reference/services/ppc-service-types
router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES),
    validateCreatePpcServiceType,
    createPpcServiceType
);

// PUT /api/v1/admin/reference/services/ppc-service-types/:id
router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES),
    validatePpcServiceTypeId,
    validateUpdatePpcServiceType,
    updatePpcServiceType
);

// DELETE /api/v1/admin/reference/services/ppc-service-types/:id
router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICE_TYPES),
    validatePpcServiceTypeId,
    deletePpcServiceType
);

module.exports = router;
