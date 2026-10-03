const express = require('express');
const router = express.Router();

const { getDivisions, createDivision, updateDivision, deleteDivision } = require('../../../../controller/Admin/Reference/location/divisions.controller');
const { validateGetDivisions, validateCreateDivision, validateDivisionIdParam, validateUpdateDivision } = require('../../../../validators/Admin/Reference/location/divisions.validator');
const { authenticate, authorize } = require('../../../../middlewares/authMiddleware');

router.get(
    '/',
    authenticate,
    authorize('admin'),
    validateGetDivisions,
    getDivisions

);

router.post(
    '/',
    authenticate,
    authorize('admin'),
    validateCreateDivision,
    createDivision
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validateDivisionIdParam,
    validateUpdateDivision,
    updateDivision
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    validateDivisionIdParam,
    deleteDivision
);

module.exports = router;
