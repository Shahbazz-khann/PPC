const express = require('express');
const router = express.Router();

const {
    getPpcServices,
    getPpcServiceById,
    createPpcService
} = require('../../../../controller/Admin/Reference/services/ppcServices.controller');

const {
    validateGetPpcServices,
    validatePpcServiceId,
    validateCreatePpcService
} = require('../../../../validators/Admin/Reference/services/ppcServices.validator');

const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

// GET /api/v1/admin/reference/services/ppc-services
router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICES),
    validateGetPpcServices,
    getPpcServices
);

// GET /api/v1/admin/reference/services/ppc-services/:id
router.get(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICES),
    validatePpcServiceId,
    getPpcServiceById
);

// POST /api/v1/admin/reference/services/ppc-services
router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PPC_SERVICES),
    validateCreatePpcService,
    createPpcService
);

module.exports = router;

