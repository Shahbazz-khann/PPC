const express = require('express');
const router = express.Router();

const customerController = require('../../controller/Customer/customer.controller');
const {
    authenticate,
    authorize
} = require('../../middlewares/authMiddleware');

router.get(
    '/visits/upcoming',
    authenticate,
    authorize('customer'),
    customerController.getUpcomingVisit
);

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

router.get(
    '/inspection-reports/summary',
    authenticate,
    authorize('customer'),
    customerController.getInspectionReportSummary
);

router.get(
    '/inspection-reports',
    authenticate,
    authorize('customer'),
    customerController.getInspectionReports
);

router.get(
    '/inspection-reports/:reportId',
    authenticate,
    authorize('customer'),
    customerController.getInspectionReportById
);

router.get(
    '/transactions/summary',
    authenticate,
    authorize('customer'),
    customerController.getTransactionSummary
);

router.get(
    '/transactions',
    authenticate,
    authorize('customer'),
    customerController.getTransactions
);

router.get(
    '/transactions/:transactionId',
    authenticate,
    authorize('customer'),
    customerController.getTransactionById
);

router.patch(
    '/settings/profile',
    authenticate,
    authorize('customer'),
    customerController.updateProfile
);

router.patch(
    '/settings/password',
    authenticate,
    authorize('customer'),
    customerController.changePassword
);

module.exports = router;