const express = require('express');
const router = express.Router();

const inspectorController = require('../../controller/Inspector/inspector.controller');
const {
    authenticate,
    authorize
} = require('../../middlewares/authMiddleware');

router.get(
    '/profile',
    authenticate,
    authorize('inspector'),
    inspectorController.getInspectorProfile
);

router.patch(
    '/profile',
    authenticate,
    authorize('inspector'),
    inspectorController.updateInspectorProfile
);

router.get(
    '/properties/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getPropertiesSummary
);

router.get(
    '/properties/export',
    authenticate,
    authorize('inspector'),
    inspectorController.exportProperties
);

router.get(
    '/properties/:propertyId',
    authenticate,
    authorize('inspector'),
    inspectorController.getPropertyDetails
);

router.get(
    '/properties',
    authenticate,
    authorize('inspector'),
    inspectorController.getPropertiesList
);

router.get(
    '/dashboard/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getDashboardSummary
);

router.get(
    '/inspections/overview',
    authenticate,
    authorize('inspector'),
    inspectorController.getInspectionOverview
);

router.get(
    '/schedules/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getSchedulesSummary
);

router.get(
    '/schedules/upcoming',
    authenticate,
    authorize('inspector'),
    inspectorController.getUpcomingSchedules
);

router.get(
    '/schedules',
    authenticate,
    authorize('inspector'),
    inspectorController.getSchedulesList
);

router.get(
    '/schedules/:inspectionId',
    authenticate,
    authorize('inspector'),
    inspectorController.getScheduleDetails
);

router.post(
    '/schedules/:inspectionId/start',
    authenticate,
    authorize('inspector'),
    inspectorController.startInspection
);

router.get(
    '/inspections/recent',
    authenticate,
    authorize('inspector'),
    inspectorController.getRecentInspections
);

router.get(
    '/inspections/status-trend',
    authenticate,
    authorize('inspector'),
    inspectorController.getStatusTrend
);

router.get(
    '/inspections/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getInspectionsPageSummary
);

router.get(
    '/inspections',
    authenticate,
    authorize('inspector'),
    inspectorController.getInspectionsList
);

router.get(
    '/inspections/:inspectionId',
    authenticate,
    authorize('inspector'),
    inspectorController.getInspectionDetails
);

router.patch(
    '/inspections/:inspectionId',
    authenticate,
    authorize('inspector'),
    inspectorController.updateInspection
);

router.get(
    '/reports/overview',
    authenticate,
    authorize('inspector'),
    inspectorController.getReportsOverview
);

router.get(
    '/reports/issues/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getReportIssuesSummary
);

router.get(
    '/reports/activity/recent',
    authenticate,
    authorize('inspector'),
    inspectorController.getRecentReportActivity
);

router.get(
    '/reports/export',
    authenticate,
    authorize('inspector'),
    inspectorController.exportReports
);

router.get(
    '/reports/summary',
    authenticate,
    authorize('inspector'),
    inspectorController.getReportsSummary
);

router.get(
    '/reports',
    authenticate,
    authorize('inspector'),
    inspectorController.getReportsList
);

router.post(
    '/reports',
    authenticate,
    authorize('inspector'),
    inspectorController.createReport
);

router.get(
    '/reports/:reportId',
    authenticate,
    authorize('inspector'),
    inspectorController.getReportDetails
);

router.patch(
    '/reports/:reportId',
    authenticate,
    authorize('inspector'),
    inspectorController.updateReport
);

router.post(
    '/reports/:reportId/submit',
    authenticate,
    authorize('inspector'),
    inspectorController.submitReport
);

router.get(
    '/reports/:reportId/download',
    authenticate,
    authorize('inspector'),
    inspectorController.downloadReportPdf
);

router.patch(
    '/settings/password',
    authenticate,
    authorize('inspector'),
    inspectorController.changePassword
);

module.exports = router;
