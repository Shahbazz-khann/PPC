const express = require('express');
const router = express.Router();
const OwnerController = require('../../controller/Owner/Owner.controller');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const { uploadPropertyMedia } = require('../../middlewares/uploadMiddleware');

router.get(
  '/dashboard/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getDashboardSummary
);

router.get(
  '/properties',
  authenticate,
  authorize('owner'),
  OwnerController.getMyProperties
);

router.post(
  '/properties',
  authenticate,
  authorize('owner'),
  OwnerController.createProperty
);

router.post(
  '/properties/:propertyId/media',
  authenticate,
  authorize('owner'),
  uploadPropertyMedia.single('media'),
  OwnerController.uploadPropertyMedia
);

router.get(
  '/verifications/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getVerificationSummary
);

router.get(
  '/inspections',
  authenticate,
  authorize('owner'),
  OwnerController.getInspectionsList
);

router.get(
  '/inspections/overview',
  authenticate,
  authorize('owner'),
  OwnerController.getInspectionOverview
);

router.get(
  '/inspections/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getInspectionsSummary
);

router.get(
  '/inspections/:inspectionId',
  authenticate,
  authorize('owner'),
  OwnerController.getInspectionDetails
);

router.get(
  '/visits',
  authenticate,
  authorize('owner'),
  OwnerController.getVisitsList
);

router.get(
  '/visits/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getVisitsSummary
);

router.get(
  '/visits/upcoming',
  authenticate,
  authorize('owner'),
  OwnerController.getUpcomingVisits
);

router.get(
  '/visits/:visitId',
  authenticate,
  authorize('owner'),
  OwnerController.getVisitDetails
);

router.get(
  '/transactions',
  authenticate,
  authorize('owner'),
  OwnerController.getTransactionList
);

router.get(
  '/transactions/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getTransactionSummary
);

router.get(
  '/transactions/overview',
  authenticate,
  authorize('owner'),
  OwnerController.getTransactionOverview
);

router.get(
  '/transactions/:transactionId',
  authenticate,
  authorize('owner'),
  OwnerController.getTransactionDetails
);

router.get(
  '/invoices',
  authenticate,
  authorize('owner'),
  OwnerController.getInvoiceList
);

router.get(
  '/invoices/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getInvoicesSummary
);

router.get(
  '/invoices/:invoiceId',
  authenticate,
  authorize('owner'),
  OwnerController.getInvoiceDetails
);

router.get(
  '/financial-summary',
  authenticate,
  authorize('owner'),
  OwnerController.getFinancialSummary
);

router.patch(
  '/settings/profile',
  authenticate,
  authorize('owner'),
  OwnerController.updateOwnerProfile
);

router.patch(
  '/settings/password',
  authenticate,
  authorize('owner'),
  OwnerController.changePassword
);

router.get(
  '/activity/recent',
  authenticate,
  authorize('owner'),
  OwnerController.getRecentActivity
);

router.get(
  '/properties/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getPropertiesSummary
);

router.get(
  '/properties/:propertyId',
  authenticate,
  authorize('owner'),
  OwnerController.getPropertyDetails
);

router.get(
  '/property-verification',
  authenticate,
  authorize('owner'),
  OwnerController.getPropertyVerificationsList
);

router.get(
  '/property-verification/summary',
  authenticate,
  authorize('owner'),
  OwnerController.getPropertyVerificationPageSummary
);

router.get(
  '/property-verification/:propertyId',
  authenticate,
  authorize('owner'),
  OwnerController.getPropertyVerificationDetails
);

module.exports = router;
