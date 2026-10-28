const {
    getAdminPpcServices,
    getAdminPpcServiceById,
    findPpcServiceByEnglishAndType,
    createAdminPpcService
} = require('../../../../models/Admin/Reference/services/ppcServices.model');

const {
    getAdminPpcServiceTypeById
} = require('../../../../models/Admin/Reference/services/ppcServiceTypes.model');


/**
 * Retrieves PPC services with search, status filtering, service type filtering, and pagination.
 */
const getPpcServices = async (req, res) => {
    try {
        const { search, status, service_type_id, page, limit } = req.validatedQuery;

        const result = await getAdminPpcServices({
            search,
            status,
            service_type_id,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            message: 'PPC services retrieved successfully',
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getPpcServices:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching PPC services',
            data: []
        });
    }
};

/**
 * Retrieves a single PPC service by ID.
 */
const getPpcServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await getAdminPpcServiceById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'PPC service not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Error in getPpcServiceById:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching PPC service'
        });
    }
};

/**
 * Creates a new PPC service.
 */
const createPpcService = async (req, res) => {
    try {
        const { service_type_id, service_english, service_urdu, service_abb } = req.validatedBody;

        // 1. Verify parent service type exists
        const parentType = await getAdminPpcServiceTypeById(service_type_id);
        if (!parentType) {
            return res.status(400).json({
                success: false,
                message: 'The selected PPC service type does not exist'
            });
        }

        // 2. Check for duplicate English name under this service type
        const existing = await findPpcServiceByEnglishAndType(service_english, service_type_id);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'A PPC service with this English name already exists under the selected service type'
            });
        }

        // 3. Create the service
        const newService = await createAdminPpcService({
            service_type_id,
            service_english,
            service_urdu,
            service_abb
        });

        return res.status(201).json({
            success: true,
            message: 'PPC service created successfully',
            data: newService
        });
    } catch (error) {
        console.error('Error in createPpcService:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while creating PPC service'
        });
    }
};

module.exports = {
    getPpcServices,
    getPpcServiceById,
    createPpcService
};

