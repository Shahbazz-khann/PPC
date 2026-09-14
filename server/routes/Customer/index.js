const express = require('express');
const router = express.Router();

const customerRoutes = require('./customer.routes');

// Mount all customer-related routes
router.use('/', customerRoutes);

module.exports = router;
