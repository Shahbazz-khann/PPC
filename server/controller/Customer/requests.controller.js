const logger = require('../../utils/logger');
const requestsModel = require('../../models/Customer/requests.model');

/**
 * Get all active requests for the authenticated customer
 */
const getRequests = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const requests = await requestsModel.getCustomerRequests(userId);

        return res.status(200).json({
            success: true,
            message: 'Customer requests retrieved successfully',
            data: requests
        });
    } catch (error) {
        logger.error('Get Customer Requests Error:', error);
        next(error);
    }
};

/**
 * Get details of a specific request for the authenticated customer
 */
const getRequestById = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { requestId } = req.params;

        const request = await requestsModel.getCustomerRequestById(userId, requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Customer request retrieved successfully',
            data: request
        });
    } catch (error) {
        logger.error('Get Customer Request By Id Error:', error);
        next(error);
    }
};

const createRequest = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const requestData = req.body;

        const requestId = await requestsModel.createCustomerRequest(userId, requestData);

        return res.status(201).json({
            success: true,
            message: 'Request created successfully',
            data: {
                requestId,
                ...requestData,
                status: 'Pending'
            }
        });
    } catch (error) {
        logger.error('Create Customer Request Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

module.exports = {
    getRequests,
    getRequestById,
    createRequest
};
