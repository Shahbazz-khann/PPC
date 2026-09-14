const express = require('express');
const router = express.Router();

const referenceRoutes = require('./reference.routes');

// Mount all reference-related routes
router.use('/', referenceRoutes);

module.exports = router;
