const express = require('express');
const router = express.Router();

const { getCountries, createCountry, updateCountry, deleteCountry } = require('../../../../controller/Admin/Reference/location/countries.controller');
const { validateGetCountries, validateCreateCountry, validateCountryId, validateUpdateCountry } = require('../../../../validators/Admin/Reference/location/countries.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES),
    validateGetCountries,
    getCountries
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES),
    validateCreateCountry,
    createCountry
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES),
    validateCountryId,
    validateUpdateCountry,
    updateCountry
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_COUNTRIES),
    validateCountryId,
    deleteCountry
);

module.exports = router;
