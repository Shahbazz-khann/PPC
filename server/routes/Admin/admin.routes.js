const express = require('express');
const router = express.Router();

const countriesRoutes = require('./Reference/location/countries.routes');
const provincesRoutes = require('./Reference/location/provinces.routes');

// Mount Admin subroutes
router.use('/reference/location/countries', countriesRoutes);
router.use('/reference/location/provinces', provincesRoutes);

module.exports = router;
