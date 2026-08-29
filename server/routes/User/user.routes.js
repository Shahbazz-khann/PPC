const express = require('express');
const router = express.Router();
const userController = require('../../controller/User/user.controller');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadPropertyMedia } = require('../../middlewares/uploadMiddleware');

const unifiedAuth = authorize('user', 'owner', 'customer');

// ----------------------------------------------------------------------
// SETTINGS
// ----------------------------------------------------------------------
router.patch('/settings/profile', authenticate, unifiedAuth, userController.updateProfile);
router.patch('/settings/password', authenticate, unifiedAuth, userController.changePassword);

// ----------------------------------------------------------------------
// SELLING (Owner logic)
// ----------------------------------------------------------------------
// Dashboard & General
router.get('/selling/dashboard/summary', authenticate, unifiedAuth, userController.getSellingDashboardSummary);
router.get('/selling/activity', authenticate, unifiedAuth, userController.getSellingActivity);
router.get('/selling/financial-summary', authenticate, unifiedAuth, userController.getSellingFinancialSummary);

// Properties
router.get('/selling/properties/summary', authenticate, unifiedAuth, userController.getPropertiesSummary);
router.get('/selling/properties', authenticate, unifiedAuth, userController.getMyProperties);
router.post('/selling/properties', authenticate, unifiedAuth, userController.createProperty);
router.get('/selling/properties/:propertyId', authenticate, unifiedAuth, userController.getPropertyDetails);
router.post('/selling/properties/:propertyId/media', authenticate, unifiedAuth, uploadPropertyMedia.single('media'), userController.uploadPropertyMedia);

// Verifications
router.get('/selling/verifications/summary', authenticate, unifiedAuth, userController.getSellingVerificationSummary);
router.get('/selling/property-verification/summary', authenticate, unifiedAuth, userController.getSellingPropertyVerificationPageSummary);
router.get('/selling/property-verification', authenticate, unifiedAuth, userController.getSellingPropertyVerificationsList);
router.get('/selling/property-verification/:propertyId', authenticate, unifiedAuth, userController.getSellingPropertyVerificationDetails);

// Inspections
router.get('/selling/inspections/overview', authenticate, unifiedAuth, userController.getSellingInspectionsOverview);
router.get('/selling/inspections/summary', authenticate, unifiedAuth, userController.getSellingInspectionsSummary);
router.get('/selling/inspections', authenticate, unifiedAuth, userController.getSellingInspections);
router.get('/selling/inspections/:inspectionId', authenticate, unifiedAuth, userController.getSellingInspectionDetails);

// Visits
router.get('/selling/visits/summary', authenticate, unifiedAuth, userController.getSellingVisitsSummary);
router.get('/selling/visits/upcoming', authenticate, unifiedAuth, userController.getSellingUpcomingVisits);
router.get('/selling/visits', authenticate, unifiedAuth, userController.getSellingVisits);
router.get('/selling/visits/:visitId', authenticate, unifiedAuth, userController.getSellingVisitDetails);

// Transactions
router.get('/selling/transactions/summary', authenticate, unifiedAuth, userController.getSellingTransactionsSummary);
router.get('/selling/transactions/overview', authenticate, unifiedAuth, userController.getSellingTransactionsOverview);
router.get('/selling/transactions', authenticate, unifiedAuth, userController.getSellingTransactions);
router.get('/selling/transactions/:transactionId', authenticate, unifiedAuth, userController.getSellingTransactionDetails);

// Invoices
router.get('/selling/invoices/summary', authenticate, unifiedAuth, userController.getSellingInvoicesSummary);
router.get('/selling/invoices', authenticate, unifiedAuth, userController.getSellingInvoices);
router.get('/selling/invoices/:invoiceId', authenticate, unifiedAuth, userController.getSellingInvoiceDetails);

// ----------------------------------------------------------------------
// BUYING (Customer logic)
// ----------------------------------------------------------------------
// General
router.get('/buying/activity', authenticate, unifiedAuth, userController.getBuyingActivity);

// Visits
router.get('/buying/visits/upcoming', authenticate, unifiedAuth, userController.getBuyingUpcomingVisits);
router.get('/buying/visits', authenticate, unifiedAuth, userController.getBuyingVisits);

// Inspection Reports
router.get('/buying/inspection-reports/summary', authenticate, unifiedAuth, userController.getBuyingInspectionReportsSummary);
router.get('/buying/inspection-reports', authenticate, unifiedAuth, userController.getBuyingInspectionReports);
router.get('/buying/inspection-reports/:reportId', authenticate, unifiedAuth, userController.getBuyingInspectionReportDetails);

// Transactions
router.get('/buying/transactions/summary', authenticate, unifiedAuth, userController.getBuyingTransactionsSummary);
router.get('/buying/transactions', authenticate, unifiedAuth, userController.getBuyingTransactions);
router.get('/buying/transactions/:transactionId', authenticate, unifiedAuth, userController.getBuyingTransactionDetails);

module.exports = router;
