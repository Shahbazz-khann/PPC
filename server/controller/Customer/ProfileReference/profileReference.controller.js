const logger = require('../../../utils/logger');
const referenceModel = require('../../../models/Reference/reference.model');

const getIdentityTypes = async (req, res, next) => {
    try {
        const data = await referenceModel.getIdentityTypes();
        return res.status(200).json({
            success: true,
            message: 'Identity types retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get Identity Types Error:', error);
        next(error);
    }
};

const getCountries = async (req, res, next) => {
    try {
        const data = await referenceModel.getCountries();
        return res.status(200).json({
            success: true,
            message: 'Countries retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get Countries Error:', error);
        next(error);
    }
};

const getCustomerTitles = async (req, res, next) => {
    try {
        const data = await referenceModel.getCustomerTitles();
        return res.status(200).json({
            success: true,
            message: 'Customer titles retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get Customer Titles Error:', error);
        next(error);
    }
};

const getGenders = async (req, res, next) => {
    try {
        const data = await referenceModel.getGenders();
        return res.status(200).json({
            success: true,
            message: 'Genders retrieved successfully',
            data
        });
    } catch (error) {
        logger.error('Get Genders Error:', error);
        next(error);
    }
};

module.exports = {
    getIdentityTypes,
    getCountries,
    getCustomerTitles,
    getGenders
};
