const express = require('express');
const router = express.Router();

const { getDivisions, createDivision, updateDivision, deleteDivision } = require('../../../../controller/Admin/Reference/location/divisions.controller');
const { validateGetDivisions, validateCreateDivision, validateDivisionIdParam, validateUpdateDivision } = require('../../../../validators/Admin/Reference/location/divisions.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS),
    validateGetDivisions,
    getDivisions
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS),
    validateCreateDivision,
    createDivision
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS),
    validateDivisionIdParam,
    validateUpdateDivision,
    updateDivision
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DIVISIONS),
    validateDivisionIdParam,
    deleteDivision
);

module.exports = router;
