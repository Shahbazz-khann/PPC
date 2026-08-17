const express = require('express');
const router = express.Router();

const customerController = require('../../controller/Customer/customer.controller');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

// Specific sub-route first
router.get(
    '/visits/upcoming',
    authenticate,
    authorize('customer'),
    customerController.getUpcomingVisit
);

// General visits route (support tab, status, pagination)
router.get(
    '/visits',
    authenticate,
    authorize('customer'),
    customerController.getVisits
);

router.get(
    '/activity/recent',
    authenticate,
    authorize('customer'),
    customerController.getRecentActivity
);

module.exports = router;
