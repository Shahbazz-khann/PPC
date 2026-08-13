const express = require('express');
const router = express.Router();
const propertyController = require('../../controller/Property/Property.controller');

router.get('/available', propertyController.getAvailableProperties);

module.exports = router;
