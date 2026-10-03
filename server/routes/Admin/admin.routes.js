const express = require('express');
const router = express.Router();

const countriesRoutes = require('./Reference/location/countries.routes');
const provincesRoutes = require('./Reference/location/provinces.routes');
const divisionsRoutes = require('./Reference/location/divisions.routes');

// Mount Admin subroutes
router.use('/reference/location/countries', countriesRoutes);
router.use('/reference/location/provinces', provincesRoutes);
router.use('/reference/location/divisions', divisionsRoutes);

module.exports = router;
