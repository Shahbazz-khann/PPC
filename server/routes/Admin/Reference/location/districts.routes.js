const express = require('express');
const router = express.Router();

const { getDistricts, createDistrict, updateDistrict, deleteDistrict } = require('../../../../controller/Admin/Reference/location/districts.controller');
const { validateGetDistricts, validateCreateDistrict, validateDistrictId, validateUpdateDistrict } = require('../../../../validators/Admin/Reference/location/districts.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS),
    validateGetDistricts,
    getDistricts
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS),
    validateCreateDistrict,
    createDistrict
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS),
    validateDistrictId,
    validateUpdateDistrict,
    updateDistrict
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_DISTRICTS),
    validateDistrictId,
    deleteDistrict
);

module.exports = router;
