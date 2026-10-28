const express = require('express');
const router = express.Router();

const countriesRoutes = require('./Reference/location/countries.routes');
const provincesRoutes = require('./Reference/location/provinces.routes');
const divisionsRoutes = require('./Reference/location/divisions.routes');
const districtsRoutes = require('./Reference/location/districts.routes');
const tehsilsRoutes = require('./Reference/location/tehsils.routes');
const citiesRoutes = require('./Reference/location/cities.routes');
const societiesRoutes = require('./Reference/location/societies.routes');
const propertyTypesRoutes = require('./Reference/property/propertyTypes.routes');
const propertyUseRoutes = require('./Reference/property/propertyUse.routes');
const propertyPurposesRoutes = require('./Reference/property/propertyPurposes.routes');
const ppcServiceTypesRoutes = require('./Reference/services/ppcServiceTypes.routes');
const ppcServicesRoutes = require('./Reference/services/ppcServices.routes');
const currenciesRoutes = require('./Reference/finance/currencies.routes');
const usersRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');
const customersRoutes = require('./customers.routes');
const propertiesRoutes = require('./properties.routes');
const requestsRoutes = require('./requests.routes');
const visitsRoutes = require('./visits.routes');
const inspectionsRoutes = require('./inspections.routes');
const dashboardRoutes = require('./dashboard.routes');

// Dashboard Overview & KPIs
router.use('/dashboard', dashboardRoutes);

// Administration
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);

// Operations
router.use('/customers', customersRoutes);
router.use('/properties', propertiesRoutes);
router.use('/requests', requestsRoutes);
router.use('/visits', visitsRoutes);
router.use('/inspections', inspectionsRoutes);

// Mount Admin subroutes
router.use('/reference/location/countries', countriesRoutes);
router.use('/reference/location/provinces', provincesRoutes);
router.use('/reference/location/divisions', divisionsRoutes);
router.use('/reference/location/districts', districtsRoutes);
router.use('/reference/location/tehsils', tehsilsRoutes);
router.use('/reference/location/cities', citiesRoutes);
router.use('/reference/location/societies', societiesRoutes);

// Property Reference
router.use('/reference/property/property-types', propertyTypesRoutes);
router.use('/reference/property/property-use', propertyUseRoutes);
router.use('/reference/property/property-purposes', propertyPurposesRoutes);

// Services Reference
router.use('/reference/services/ppc-service-types', ppcServiceTypesRoutes);
router.use('/reference/services/ppc-services', ppcServicesRoutes);

// Finance Reference
router.use('/reference/finance/currencies', currenciesRoutes);

module.exports = router;


