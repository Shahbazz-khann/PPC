const propertyModel = require('../../models/Property/property.model');
const logger = require('../../utils/logger');

/**
 * Get all available properties controller
 */
const getAvailableProperties = async (req, res, next) => {
    try {
        const properties = await propertyModel.getAvailableProperties();

        return res.status(200).json({
            success: true,
            message: 'Available properties retrieved successfully',
            data: properties || []
        });
    } catch (error) {
        logger.error('Error fetching available properties:', error);
        next(error);
    }
};

module.exports = {
    getAvailableProperties,
};
