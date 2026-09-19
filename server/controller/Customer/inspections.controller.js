const logger = require('../../utils/logger');
const inspectionsModel = require('../../models/Customer/inspections.model');

/**
 * Get all completed inspection reports for properties owned by the authenticated customer
 */
const getInspectionReports = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const reports = await inspectionsModel.getCustomerInspectionReports(userId);

        return res.status(200).json({
            success: true,
            message: 'Inspection reports retrieved successfully',
            data: reports
        });
    } catch (error) {
        logger.error('Get Customer Inspection Reports Error:', error);
        next(error);
    }
};

/**
 * Get details of a single completed inspection report for the authenticated customer
 */
const getInspectionReportById = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { inspectionId } = req.params;

        const report = await inspectionsModel.getCustomerInspectionReportById(userId, inspectionId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Inspection report not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Inspection report retrieved successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get Customer Inspection Report By Id Error:', error);
        next(error);
    }
};

module.exports = {
    getInspectionReports,
    getInspectionReportById
};
