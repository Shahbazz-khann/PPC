const visitsModel = require('../../models/Customer/visits.model');
const logger = require('../../utils/logger');

/**
 * Get all property visits for the authenticated customer
 * @param {Object} req 
 * @param {Object} res 
 */
const getPropertyVisits = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const visits = await visitsModel.getCustomerPropertyVisits(userId);
        
        return res.status(200).json({
            success: true,
            message: 'Property visits retrieved successfully',
            data: visits
        });
    } catch (error) {
        logger.error(`Error in getPropertyVisits controller: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving property visits.'
        });
    }
};

/**
 * Get details of a single property visit for the authenticated customer
 * @param {Object} req 
 * @param {Object} res 
 */
const getPropertyVisitById = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { visitId } = req.params;
        
        const visit = await visitsModel.getCustomerPropertyVisitById(userId, visitId);
        
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: 'Property visit not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Property visit retrieved successfully',
            data: visit
        });
    } catch (error) {
        logger.error(`Error in getPropertyVisitById controller: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving the property visit.'
        });
    }
};

/**
 * Submit one-time customer remarks for a completed property visit.
 * @param {Object} req 
 * @param {Object} res 
 */
const submitPropertyVisitRemarks = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { visitId } = req.params;
        const { remarks } = req.body;
        
        // Validation logic - handled primarily in validator, but double check just in case
        if (!remarks || typeof remarks !== 'string' || remarks.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Remarks must be a non-empty string.'
            });
        }
        
        const trimmedRemarks = remarks.trim();
        
        const result = await visitsModel.submitCustomerVisitRemarks(userId, visitId, trimmedRemarks);
        
        if (result.status !== 200) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }
        
        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        logger.error(`Error in submitPropertyVisitRemarks controller: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while submitting visit remarks.'
        });
    }
};

module.exports = {
    getPropertyVisits,
    getPropertyVisitById,
    submitPropertyVisitRemarks
};
