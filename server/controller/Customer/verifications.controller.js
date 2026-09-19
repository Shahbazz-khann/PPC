const logger = require('../../utils/logger');
const verificationsModel = require('../../models/Customer/verifications.model');

/**
 * Get all verification reports (properties with their verification status) for the authenticated customer
 */
const getVerificationReports = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const reports = await verificationsModel.getCustomerVerificationReports(userId);

        return res.status(200).json({
            success: true,
            message: 'Verification reports retrieved successfully',
            data: reports
        });
    } catch (error) {
        logger.error('Get Customer Verification Reports Error:', error);
        next(error);
    }
};

/**
 * Get details of a specific verification report (by propertyId) for the authenticated customer
 */
const getVerificationReportById = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { propertyId } = req.params;

        const report = await verificationsModel.getCustomerVerificationReportByPropertyId(userId, propertyId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Verification report not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Verification report retrieved successfully',
            data: report
        });
    } catch (error) {
        logger.error('Get Customer Verification Report By Id Error:', error);
        next(error);
    }
};

module.exports = {
    getVerificationReports,
    getVerificationReportById
};
