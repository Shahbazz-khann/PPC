const express = require('express');
const router = express.Router();

const { getProvinces, createProvince, updateProvince, deleteProvince } = require('../../../../controller/Admin/Reference/location/provinces.controller');
const { validateGetProvinces, validateCreateProvince, validateProvinceId, validateUpdateProvince } = require('../../../../validators/Admin/Reference/location/provinces.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES),
    validateGetProvinces,
    getProvinces
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES),
    validateCreateProvince,
    createProvince
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES),
    validateProvinceId,
    validateUpdateProvince,
    updateProvince
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_PROVINCES),
    validateProvinceId,
    deleteProvince
);

module.exports = router;
