const customerModel = require('../../models/Customer/customer.model');
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

module.exports = {
    getUpcomingVisit,
    getRecentActivity,
    getVisits,
};
