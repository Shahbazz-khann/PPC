const express = require('express');
const router = express.Router();

const { getTehsils, createTehsil, updateTehsil, deleteTehsil } = require('../../../../controller/Admin/Reference/location/tehsils.controller');
const { validateGetTehsils, validateCreateTehsil, validateTehsilId, validateUpdateTehsil } = require('../../../../validators/Admin/Reference/location/tehsils.validator');
const { authenticate, authorizePageAccess } = require('../../../../middlewares/authMiddleware');
const { ADMIN_PAGE_KEYS } = require('../../../../config/adminPageRegistry');

router.get(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS),
    validateGetTehsils,
    getTehsils
);

router.post(
    '/',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS),
    validateCreateTehsil,
    createTehsil
);

router.put(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS),
    validateTehsilId,
    validateUpdateTehsil,
    updateTehsil
);

router.delete(
    '/:id',
    authenticate,
    authorizePageAccess(ADMIN_PAGE_KEYS.PAGE_REF_TEHSILS),
    validateTehsilId,
    deleteTehsil
);

module.exports = router;
