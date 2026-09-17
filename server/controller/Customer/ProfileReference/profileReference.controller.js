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

const getPropertyFormData = async (req, res, next) => {
    try {
        const [
            countries,
            provinces,
            divisions,
            districts,
            tehsils,
            propertyTypes,
            propertyUses,
            propertyLocations,
            uom,
            marlaSizes,
            amenities,
            demandTypes
        ] = await Promise.all([
            referenceModel.getCountries(),
            referenceModel.getProvinces(),
            referenceModel.getDivisions(),
            referenceModel.getDistricts(),
            referenceModel.getTehsils(),
            referenceModel.getPropertyTypes(),
            referenceModel.getPropertyUses(),
            referenceModel.getPropertyLocations(),
            referenceModel.getUOM(),
            referenceModel.getMarlaSizes(),
            referenceModel.getAmenities(),
            referenceModel.getDemandTypes()
        ]);

        return res.status(200).json({
            success: true,
            message: 'Property form reference data retrieved successfully',
            data: {
                countries,
                provinces,
                divisions,
                districts,
                tehsils,
                propertyTypes,
                propertyUses,
                propertyLocations,
                uom,
                marlaSizes,
                amenities,
                demandTypes
            }
        });
    } catch (error) {
        logger.error('Get Property Form Data Error:', error);
        next(error);
    }
};

const getCities = async (req, res, next) => {
    try {
        const { tehsil_id, search } = req.query;
        if (!tehsil_id || isNaN(parseInt(tehsil_id)) || parseInt(tehsil_id) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid tehsil_id is required' });
        }
        const data = await referenceModel.getCities(parseInt(tehsil_id), search);
        return res.status(200).json({ success: true, message: 'Cities retrieved successfully', data });
    } catch (error) {
        logger.error('Get Cities Error:', error);
        next(error);
    }
};

const getSocieties = async (req, res, next) => {
    try {
        const { city_id, search } = req.query;
        if (!city_id || isNaN(parseInt(city_id)) || parseInt(city_id) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid city_id is required' });
        }
        const data = await referenceModel.getSocieties(parseInt(city_id), search);
        return res.status(200).json({ success: true, message: 'Societies retrieved successfully', data });
    } catch (error) {
        logger.error('Get Societies Error:', error);
        next(error);
    }
};

const getAreas = async (req, res, next) => {
    try {
        const { society_id, search } = req.query;
        if (!society_id || isNaN(parseInt(society_id)) || parseInt(society_id) <= 0) {
            return res.status(400).json({ success: false, message: 'Valid society_id is required' });
        }
        const data = await referenceModel.getAreas(parseInt(society_id), search);
        return res.status(200).json({ success: true, message: 'Areas retrieved successfully', data });
    } catch (error) {
        logger.error('Get Areas Error:', error);
        next(error);
    }
};

module.exports = {
    getIdentityTypes,
    getCountries,
    getCustomerTitles,
    getGenders,
    getPropertyFormData,
    getCities,
    getSocieties,
    getAreas
};
