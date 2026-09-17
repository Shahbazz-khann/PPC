const { getPublicProperties, getPublicPropertyFilters } = require('../../models/Public/public.model');
const logger = require('../../utils/logger');

const getProperties = async (req, res, next) => {
    try {
        const { 
            intent, city, propertyType, minPrice, maxPrice,
            society, area, propertyUse, minSize, maxSize, sizeUom, rooms, bathrooms
        } = req.query;

        // Validation for prices
        const parsedMin = minPrice ? parseFloat(minPrice) : null;
        const parsedMax = maxPrice ? parseFloat(maxPrice) : null;

        if (minPrice && (isNaN(parsedMin) || parsedMin < 0)) {
            const err = new Error('Invalid minPrice');
            err.statusCode = 400;
            throw err;
        }
        if (maxPrice && (isNaN(parsedMax) || parsedMax < 0)) {
            const err = new Error('Invalid maxPrice');
            err.statusCode = 400;
            throw err;
        }
        if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
            const err = new Error('minPrice cannot be greater than maxPrice');
            err.statusCode = 400;
            throw err;
        }

        // Validation for Size rules
        const parsedMinSize = minSize ? parseFloat(minSize) : null;
        const parsedMaxSize = maxSize ? parseFloat(maxSize) : null;
        
        if (minSize && (isNaN(parsedMinSize) || parsedMinSize < 0)) {
            const err = new Error('Invalid minSize');
            err.statusCode = 400;
            throw err;
        }
        if (maxSize && (isNaN(parsedMaxSize) || parsedMaxSize < 0)) {
            const err = new Error('Invalid maxSize');
            err.statusCode = 400;
            throw err;
        }
        if (parsedMinSize !== null && parsedMaxSize !== null && parsedMinSize > parsedMaxSize) {
            const err = new Error('minSize cannot be greater than maxSize');
            err.statusCode = 400;
            throw err;
        }
        if ((parsedMinSize !== null || parsedMaxSize !== null) && !sizeUom) {
            const err = new Error('sizeUom MUST be supplied when filtering by minSize or maxSize');
            err.statusCode = 400;
            throw err;
        }

        // Validation for Rooms / Bathrooms
        const parsedRooms = rooms ? parseInt(rooms, 10) : null;
        const parsedBathrooms = bathrooms ? parseInt(bathrooms, 10) : null;

        if (rooms && (isNaN(parsedRooms) || parsedRooms < 0)) {
            const err = new Error('Invalid rooms');
            err.statusCode = 400;
            throw err;
        }
        if (bathrooms && (isNaN(parsedBathrooms) || parsedBathrooms < 0)) {
            const err = new Error('Invalid bathrooms');
            err.statusCode = 400;
            throw err;
        }

        const filters = {
            intent: intent === 'Buy' ? 'Sale' : (intent === 'Rent' ? 'Rent' : intent),
            city,
            propertyType,
            minPrice: parsedMin,
            maxPrice: parsedMax,
            society,
            area,
            propertyUse,
            minSize: parsedMinSize,
            maxSize: parsedMaxSize,
            sizeUom,
            rooms: parsedRooms,
            bathrooms: parsedBathrooms
        };

        const parsedLimit = req.query.limit ? parseInt(req.query.limit, 10) : 50; // default 50
        if (req.query.limit && (isNaN(parsedLimit) || parsedLimit <= 0)) {
            const err = new Error('Invalid limit');
            err.statusCode = 400;
            throw err;
        }

        const properties = await getPublicProperties(filters, parsedLimit);

        res.status(200).json({
            success: true,
            message: 'Properties retrieved successfully',
            data: properties
        });
    } catch (error) {
        logger.error(`Error in getPublicProperties: ${error.message}`);
        next(error);
    }
};

const getFilters = async (req, res, next) => {
    try {
        const { city, society } = req.query;
        const filters = await getPublicPropertyFilters(city, society);
        res.status(200).json({
            success: true,
            message: 'Filters retrieved successfully',
            data: filters
        });
    } catch (error) {
        logger.error(`Error in getFilters: ${error.message}`);
        next(error);
    }
};

module.exports = {
    getProperties,
    getFilters
};
