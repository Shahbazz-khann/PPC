const express = require('express');
const router = express.Router();
const propertyController = require('../../controller/Property/Property.controller');

// GET /api/v1/properties
router.get('/', propertyController.getAllProperties);

// GET /api/v1/properties/available
router.get('/available', propertyController.getAvailableProperties);

// GET /api/v1/properties/:propertyId
router.get('/:propertyId', propertyController.getPropertyById);

module.exports = router;
