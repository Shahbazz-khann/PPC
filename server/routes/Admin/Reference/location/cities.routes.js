const express = require('express');
const router = express.Router();

const { getCities, createCity, updateCity, deleteCity } = require('../../../../controller/Admin/Reference/location/cities.controller');
const { validateGetCities, validateCreateCity, validateCityId, validateUpdateCity } = require('../../../../validators/Admin/Reference/location/cities.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CITIES),
    validateGetCities,
    getCities
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CITIES),
    validateCreateCity,
    createCity
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CITIES),
    validateCityId,
    validateUpdateCity,
    updateCity
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_CITIES),
    validateCityId,
    deleteCity
);

module.exports = router;
