const express = require('express');
const router = express.Router();

const { getProvinces, createProvince, updateProvince } = require('../../../../controller/Admin/Reference/location/provinces.controller');
const { validateGetProvinces, validateCreateProvince, validateProvinceId, validateUpdateProvince } = require('../../../../validators/Admin/Reference/location/provinces.validator');
const { authenticate, authorize } = require('../../../../middlewares/authMiddleware');

router.get(
    '/',
    authenticate,
    authorize('admin'),
    validateGetProvinces,
    getProvinces
);

router.post(
    '/',
    authenticate,
    authorize('admin'),
    validateCreateProvince,
    createProvince
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validateProvinceId,
    validateUpdateProvince,
    updateProvince
);

module.exports = router;
