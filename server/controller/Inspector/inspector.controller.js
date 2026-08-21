const inspectorModel = require('../../models/Inspector/Inspector.model');
const bcrypt = require('bcryptjs');

const getDashboardSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const summary = await inspectorModel.getDashboardSummary(inspectorId);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

const getInspectionOverview = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const overview = await inspectorModel.getInspectionOverview(inspectorId);
        
        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error) {
        next(error);
    }
};

const getSchedulesSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const summary = await inspectorModel.getSchedulesSummary(inspectorId);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

const getSchedulesList = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            search: req.query.search,
            area: req.query.area,
            status: req.query.status,
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            sort: req.query.sort
        };
        const listData = await inspectorModel.getSchedulesList(inspectorId, params);
        
        res.status(200).json({
            success: true,
            ...listData
        });
    } catch (error) {
        next(error);
    }
};

const getScheduleDetails = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const inspectionId = req.params.inspectionId;
        
        const details = await inspectorModel.getScheduleDetails(inspectorId, inspectionId);
        
        if (!details) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found or unauthorized"
            });
        }
        
        res.status(200).json({
            success: true,
            data: details
        });
    } catch (error) {
        next(error);
    }
};

const startInspection = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const inspectionId = req.params.inspectionId;
        const { notes } = req.body;
        
        const result = await inspectorModel.startInspection(inspectorId, inspectionId, notes);
        
        if (result.notFound) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found or unauthorized"
            });
        }
        
        if (result.invalidState) {
            return res.status(400).json({
                success: false,
                message: `Cannot start inspection. Current status is ${result.currentStatus}`
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Inspection started successfully",
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

const getUpcomingSchedules = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        
        const schedules = await inspectorModel.getUpcomingSchedules(inspectorId, page, limit);
        
        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules
        });
    } catch (error) {
        next(error);
    }
};

const getRecentInspections = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const recentInspections = await inspectorModel.getRecentInspections(inspectorId);
        
        res.status(200).json({
            success: true,
            data: recentInspections
        });
    } catch (error) {
        next(error);
    }
};

const getStatusTrend = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const period = req.query.period || 'month';
        
        const trendData = await inspectorModel.getStatusTrend(inspectorId, period);
        
        res.status(200).json({
            success: true,
            data: trendData
        });
    } catch (error) {
        next(error);
    }
};

const getInspectionsPageSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const summary = await inspectorModel.getInspectionsPageSummary(inspectorId);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

const getInspectionsList = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            status: req.query.status,
            search: req.query.search,
            area: req.query.area,
            date: req.query.date,
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            sort: req.query.sort
        };
        
        const listData = await inspectorModel.getInspectionsList(inspectorId, params);
        
        res.status(200).json({
            success: true,
            ...listData
        });
    } catch (error) {
        next(error);
    }
};

const getInspectionDetails = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const inspectionId = req.params.inspectionId;
        
        const inspectionDetails = await inspectorModel.getInspectionDetails(inspectorId, inspectionId);
        
        if (!inspectionDetails) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            data: inspectionDetails
        });
    } catch (error) {
        next(error);
    }
};

const updateInspection = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const inspectionId = req.params.inspectionId;
        const updateData = req.body;
        
        const updatedInspection = await inspectorModel.updateInspection(inspectorId, inspectionId, updateData);
        
        if (!updatedInspection) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedInspection
        });
    } catch (error) {
        if (error.message === 'Invalid inspection_status_id') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

const getReportsOverview = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const overview = await inspectorModel.getReportsOverview(inspectorId);
        
        res.status(200).json({
            success: true,
            data: overview
        });
    } catch (error) {
        next(error);
    }
};

const getReportIssuesSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const summary = await inspectorModel.getReportIssuesSummary(inspectorId);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

const getRecentReportActivity = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const activity = await inspectorModel.getRecentReportActivity(inspectorId);
        
        res.status(200).json({
            success: true,
            data: activity
        });
    } catch (error) {
        next(error);
    }
};

const getPropertiesSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const summary = await inspectorModel.getPropertiesSummary(inspectorId);
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        next(error);
    }
};

const getPropertiesList = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            search: req.query.search,
            area: req.query.area,
            type: req.query.type,
            status: req.query.status,
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            sort: req.query.sort
        };
        const listData = await inspectorModel.getPropertiesList(inspectorId, params);
        res.status(200).json({ success: true, ...listData });
    } catch (error) {
        next(error);
    }
};

const getPropertyDetails = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const propertyId = req.params.propertyId;
        const details = await inspectorModel.getPropertyDetails(inspectorId, propertyId);
        
        if (!details) {
            return res.status(404).json({ success: false, message: "Property not found or unauthorized" });
        }
        
        res.status(200).json({ success: true, data: details });
    } catch (error) {
        next(error);
    }
};

const exportProperties = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            search: req.query.search,
            area: req.query.area,
            type: req.query.type,
            status: req.query.status,
            page: 1,
            limit: 10000,
            sort: req.query.sort
        };
        const listData = await inspectorModel.getPropertiesList(inspectorId, params);
        
        const fields = ['Property ID', 'Reference', 'Title', 'Owner Name', 'Owner Mobile', 'Location', 'Property Type', 'Verification Status', 'Inspection Status', 'Last Inspection', 'Next Inspection'];
        const csvRows = [fields.join(',')];
        
        for (const row of listData.data) {
            csvRows.push([
                row.property_id,
                row.property_reference,
                `"${(row.title || '').replace(/"/g, '""')}"`,
                `"${(row.owner_name || '').replace(/"/g, '""')}"`,
                row.owner_mobile_no || '',
                `"${(row.address || '').replace(/"/g, '""')}, ${(row.city || '').replace(/"/g, '""')}"`,
                row.property_type || '',
                row.verification_status || '',
                row.inspection_status || '',
                row.last_inspection || '',
                row.next_inspection || ''
            ].join(','));
        }
        
        const csvString = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        const filename = `inspector-properties-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvString);
    } catch (error) {
        next(error);
    }
};

const exportReports = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            search: req.query.search,
            status: req.query.status,
            area: req.query.area,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            page: 1,
            limit: 10000,
            sort: req.query.sort
        };
        
        const listData = await inspectorModel.getReportsList(inspectorId, params);
        
        const fields = ['Report ID', 'Inspection ID', 'Property', 'Location', 'Inspection Date', 'Submitted Date', 'Status'];
        const csvRows = [fields.join(',')];
        
        for (const row of listData.data) {
            const reportId = row.inspection_report_id;
            const inspectionId = row.inspection_id;
            const property = `"${(row.property_title || '').replace(/"/g, '""')}"`;
            const location = `"${(row.property_address || '').replace(/"/g, '""')}, ${(row.property_city || '').replace(/"/g, '""')}"`;
            const inspectionDate = row.inspection_date || '';
            const submittedDate = row.date_submitted || '';
            const status = row.report_status || (row.date_submitted ? 'Submitted' : 'Draft');
            
            csvRows.push([reportId, inspectionId, property, location, inspectionDate, submittedDate, status].join(','));
        }
        
        const csvString = csvRows.join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        const filename = `inspector-reports-${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        res.status(200).send(csvString);
    } catch (error) {
        next(error);
    }
};

const getReportsSummary = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const summary = await inspectorModel.getReportsSummary(inspectorId);
        
        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};

const getReportsList = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const params = {
            search: req.query.search,
            status: req.query.status,
            area: req.query.area,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            sort: req.query.sort
        };
        
        const listData = await inspectorModel.getReportsList(inspectorId, params);
        
        res.status(200).json({
            success: true,
            ...listData
        });
    } catch (error) {
        next(error);
    }
};

const getReportDetails = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const reportId = req.params.reportId;
        
        const reportDetails = await inspectorModel.getReportDetails(inspectorId, reportId);
        
        if (!reportDetails) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            data: reportDetails
        });
    } catch (error) {
        next(error);
    }
};

const downloadReportPdf = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const reportId = req.params.reportId;
        
        const reportDetails = await inspectorModel.getReportDetails(inspectorId, reportId);
        
        if (!reportDetails) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or unauthorized'
            });
        }
        
        const { generateReportPdf } = require('../../utils/pdfGenerator');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="inspection-report-${reportId}.pdf"`);
        
        await generateReportPdf(reportDetails, res);
        
    } catch (error) {
        next(error);
    }
};

const createReport = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const {
            inspection_id,
            report_summary,
            findings,
            recommendations,
            overall_condition
        } = req.body;
        
        if (!inspection_id) {
            return res.status(400).json({ success: false, message: "inspection_id is required" });
        }
        
        const report = await inspectorModel.createReport(inspectorId, req.body);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Inspection not found or unauthorized'
            });
        }
        
        if (report.duplicate) {
             return res.status(409).json({
                  success: false,
                  message: "A report already exists for this inspection"
             });
        }
        
        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

const updateReport = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const reportId = req.params.reportId;
        const updateData = req.body;
        
        const updatedReport = await inspectorModel.updateReport(inspectorId, reportId, updateData);
        
        if (!updatedReport) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or unauthorized'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedReport
        });
    } catch (error) {
        next(error);
    }
};

const submitReport = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const reportId = req.params.reportId;
        
        const submittedReport = await inspectorModel.submitReport(inspectorId, reportId);
        
        if (!submittedReport) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or unauthorized'
            });
        }
        
        if (submittedReport.validationError) {
             return res.status(400).json({
                  success: false,
                  message: submittedReport.message
             });
        }
        
        if (submittedReport.alreadySubmitted) {
             return res.status(409).json({
                  success: false,
                  message: 'Report is already submitted or not in an editable state'
             });
        }
        
        res.status(200).json({
            success: true,
            data: submittedReport
        });
    } catch (error) {
        next(error);
    }
};

const getInspectorProfile = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        
        const profile = await inspectorModel.getInspectorProfile(inspectorId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

const updateInspectorProfile = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const { full_name, phone_number } = req.body;
        
        if (!full_name || !phone_number) {
            return res.status(400).json({
                success: false,
                message: 'full_name and phone_number are required'
            });
        }
        
        const updatedProfile = await inspectorModel.updateInspectorProfile(inspectorId, { full_name, phone_number });
        
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const inspectorId = req.user.user_id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        if (current_password === new_password) {
            return res.status(400).json({
                success: false,
                message: 'New password cannot be the same as current password'
            });
        }

        const user = await inspectorModel.getInspectorPassword(inspectorId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Inspector not found'
            });
        }

        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await inspectorModel.updateInspectorPassword(inspectorId, hashedPassword);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardSummary,
    getInspectionOverview,
    getSchedulesSummary,
    getSchedulesList,
    getScheduleDetails,
    startInspection,
    getUpcomingSchedules,
    getRecentInspections,
    getStatusTrend,
    getInspectionsPageSummary,
    getInspectionsList,
    getInspectionDetails,
    updateInspection,
    getReportsOverview,
    getReportIssuesSummary,
    getRecentReportActivity,
    exportReports,
    getReportsSummary,
    getReportsList,
    getReportDetails,
    downloadReportPdf,
    createReport,
    updateReport,
    submitReport,
    getPropertiesSummary,
    getPropertiesList,
    getPropertyDetails,
    exportProperties,
    getInspectorProfile,
    updateInspectorProfile,
    changePassword
};
