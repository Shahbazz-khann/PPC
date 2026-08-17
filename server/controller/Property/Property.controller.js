const propertyModel = require('../../models/Property/property.model');
const logger = require('../../utils/logger');

/**
 * Get all active properties with filters, search, sorting & pagination
 */
const getAllProperties = async (req, res, next) => {
    try {
        const result = await propertyModel.getAllProperties(req.query);

        return res.status(200).json({
            success: true,
            message: 'Properties retrieved successfully',
            data: result.properties || [],
            pagination: result.pagination
        });
    } catch (error) {
        logger.error('Error fetching properties:', error);
        next(error);
    }
};

/**
 * Get single active property details by property ID
 */
const getPropertyById = async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        const property = await propertyModel.getPropertyById(propertyId);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Property details retrieved successfully',
            data: property
        });
    } catch (error) {
        logger.error(`Error fetching property details for ID ${req.params.propertyId}:`, error);
        next(error);
    }
};

/**
 * Get all available properties controller (legacy)
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
    getAllProperties,
    getPropertyById,
    getAvailableProperties,
};
