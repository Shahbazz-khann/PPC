const customerModel = require('../../models/Customer/customer.model');
const bcrypt = require('bcryptjs');
const logger = require('../../utils/logger');

/**
 * Controller to get customer's nearest upcoming visit
 */
const getUpcomingVisit = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const visit = await customerModel.getUpcomingVisitByCustomerId(userId);

        return res.status(200).json({
            success: true,
            message: visit ? 'Upcoming visit retrieved successfully' : 'No upcoming visit found',
            data: visit
        });
    } catch (error) {
        logger.error('Error fetching upcoming visit:', error);
        next(error);
    }
};

/**
 * Controller to get customer's recent activities (latest 5)
 */
const getRecentActivity = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const activities = await customerModel.getRecentActivitiesByCustomerId(userId);

        return res.status(200).json({
            success: true,
            message: 'Recent activity retrieved successfully',
            data: activities || []
        });
    } catch (error) {
        logger.error('Error fetching recent activity:', error);
        next(error);
    }
};

/**
 * Controller to get customer's visits list with summary and pagination
 */
const getVisits = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const result = await customerModel.getCustomerVisits(userId, req.query);

        return res.status(200).json({
            success: true,
            message: 'Customer visits retrieved successfully',
            summary: result.summary,
            data: result.visits || [],
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error fetching customer visits:', error);
        next(error);
    }
};
/**
 * Controller to get customer's transaction summary
 */
const getTransactionSummary = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const summary = await customerModel.getTransactionSummary(userId);

        return res.status(200).json({
            success: true,
            message: 'Transaction summary retrieved successfully',
            data: {
                total_transactions: Number(summary.total_transactions) || 0,
                active_transactions: Number(summary.active_transactions) || 0,
                completed_transactions: Number(summary.completed_transactions) || 0,
                pending_transactions: Number(summary.pending_transactions) || 0
            }
        });
    } catch (error) {
        logger.error('Error fetching transaction summary:', error);
        next(error);
    }
};
/**
 * Controller to get customer's transactions list with pagination and filters
 */
const getTransactions = async (req, res, next) => {
    try {
        const userId = req
        .user.user_id;

        const result = await customerModel.getCustomerTransactions(userId, req.query);

        return res.status(200).json({
            success: true,
            message: 'Customer transactions retrieved successfully',
            data: result.transactions || [],
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error fetching customer transactions:', error);
        next(error);
    }
};

/**
 * Controller to get customer's transaction details by ID
 */
const getTransactionById = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const transactionId = req.params.transactionId;

        const transaction = await customerModel.getTransactionById(userId, transactionId);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or you do not have permission to view it'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Transaction details retrieved successfully',
            data: transaction
        });
    } catch (error) {
        logger.error('Error fetching transaction details:', error);
        next(error);
    }
};

/**
 * Controller to get customer's inspection report summary
 */
const getInspectionReportSummary = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const summary = await customerModel.getInspectionReportSummary(userId);

        return res.status(200).json({
            success: true,
            message: 'Inspection report summary retrieved successfully',
            data: {
                total_reports: Number(summary.total_reports) || 0,
                completed: Number(summary.completed) || 0,
                passed: Number(summary.passed) || 0,
                needs_attention: Number(summary.needs_attention) || 0
            }
        });
    } catch (error) {
        logger.error('Error fetching inspection report summary:', error);
        next(error);
    }
};

/**
 * Controller to get customer's inspection reports list with pagination and filters
 */
const getInspectionReports = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const result = await customerModel.getInspectionReportsList(userId, req.query);

        return res.status(200).json({
            success: true,
            message: 'Customer inspection reports retrieved successfully',
            data: result.reports || [],
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error fetching customer inspection reports:', error);
        next(error);
    }
};

/**
 * Controller to get customer's single inspection report by ID
 */
const getInspectionReportById = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const reportId = req.params.reportId;

        const report = await customerModel.getInspectionReportById(userId, reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Inspection report not found or does not belong to you'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Inspection report retrieved successfully',
            data: report
        });
    } catch (error) {
        logger.error('Error fetching customer inspection report details:', error);
        next(error);
    }
};

/**
 * Controller to update customer profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        
        // Extract only allowed fields
        const { name, email, country, mobile_no } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (country !== undefined) updateData.country = country;
        if (mobile_no !== undefined) updateData.mobile_no = mobile_no;

        const updatedUser = await customerModel.updateCustomerProfile(userId, updateData);

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        logger.error('Error updating customer profile:', error);
        next(error);
    }
};

/**
 * Controller to change customer password
 */
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!current_password || !new_password || !confirm_password) {
            const error = new Error('All password fields are required');
            error.statusCode = 400;
            throw error;
        }

        if (new_password !== confirm_password) {
            const error = new Error('New password and confirm password do not match');
            error.statusCode = 400;
            throw error;
        }

        if (new_password === current_password) {
            const error = new Error('New password cannot be the same as the current password');
            error.statusCode = 400;
            throw error;
        }

        const currentHashedPassword = await customerModel.getCustomerPasswordById(userId);
        
        if (!currentHashedPassword) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(current_password, currentHashedPassword);
        
        if (!isPasswordValid) {
            const error = new Error('Incorrect current password');
            error.statusCode = 400;
            throw error;
        }

        const newHashedPassword = await bcrypt.hash(new_password, 10);
        await customerModel.updateCustomerPassword(userId, newHashedPassword);

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Error changing customer password:', error);
        next(error);
    }
};

module.exports = {
    getUpcomingVisit,
    getRecentActivity,
    getVisits,
    getTransactionSummary,
    getTransactions,
    getTransactionById,
    getInspectionReportSummary,
    getInspectionReports,
    getInspectionReportById,
    updateProfile,
    changePassword
};
