const {
    getAdminPpcServiceTypes,
    getAdminPpcServiceTypeById,
    findPpcServiceTypeByEnglishInsensitive,
    findPpcServiceTypeByEnglishInsensitiveExcludingId,
    createAdminPpcServiceType,
    updateAdminPpcServiceType,
    getPpcServiceTypeDependencies,
    deleteAdminPpcServiceType
} = require('../../../../models/Admin/Reference/services/ppcServiceTypes.model');

/**
 * Retrieves PPC service types with search, status filtering, and pagination.
 */
const getPpcServiceTypes = async (req, res) => {
    try {
        const { search, status, page, limit } = req.validatedQuery;

        const result = await getAdminPpcServiceTypes({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            message: 'PPC service types retrieved successfully',
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getPpcServiceTypes:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching PPC service types',
            data: []
        });
    }
};

/**
 * Retrieves a single PPC service type by ID.
 */
const getPpcServiceTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceType = await getAdminPpcServiceTypeById(id);

        if (!serviceType) {
            return res.status(404).json({
                success: false,
                message: 'PPC service type not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: serviceType
        });
    } catch (error) {
        console.error('Error in getPpcServiceTypeById:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while fetching PPC service type'
        });
    }
};

/**
 * Creates a new PPC service type.
 */
const createPpcServiceType = async (req, res) => {
    try {
        const { service_type_english, service_type_urdu, service_type_abb } = req.validatedBody;

        const existing = await findPpcServiceTypeByEnglishInsensitive(service_type_english);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'PPC service type with this English name already exists'
            });
        }

        const result = await createAdminPpcServiceType({
            service_type_english,
            service_type_urdu,
            service_type_abb
        });

        return res.status(201).json({
            success: true,
            message: 'PPC service type created successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in createPpcServiceType:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while creating PPC service type'
        });
    }
};

/**
 * Updates an existing PPC service type.
 */
const updatePpcServiceType = async (req, res) => {
    try {
        const { id } = req.params;
        const { service_type_english, service_type_urdu, service_type_abb, is_active } = req.validatedBody;

        const current = await getAdminPpcServiceTypeById(id);
        if (!current) {
            return res.status(404).json({
                success: false,
                message: 'PPC service type not found'
            });
        }

        const duplicate = await findPpcServiceTypeByEnglishInsensitiveExcludingId(service_type_english, id);
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'Another PPC service type with this English name already exists'
            });
        }

        const updated = await updateAdminPpcServiceType(id, {
            service_type_english,
            service_type_urdu,
            service_type_abb,
            is_active
        });

        return res.status(200).json({
            success: true,
            message: 'PPC service type updated successfully',
            data: updated
        });
    } catch (error) {
        console.error('Error in updatePpcServiceType:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while updating PPC service type'
        });
    }
};

/**
 * Deletes a PPC service type safely with dependency check.
 */
const deletePpcServiceType = async (req, res) => {
    try {
        const { id } = req.params;

        const current = await getAdminPpcServiceTypeById(id);
        if (!current) {
            return res.status(404).json({
                success: false,
                message: 'PPC service type not found'
            });
        }

        const { hasDependencies, dependencies } = await getPpcServiceTypeDependencies(id);
        if (hasDependencies) {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete this PPC service type because it is referenced by active PPC services',
                dependencies
            });
        }

        const deleted = await deleteAdminPpcServiceType(id);
        return res.status(200).json({
            success: true,
            message: 'PPC service type deleted successfully',
            data: deleted
        });
    } catch (error) {
        console.error('Error in deletePpcServiceType:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while deleting PPC service type'
        });
    }
};

module.exports = {
    getPpcServiceTypes,
    getPpcServiceTypeById,
    createPpcServiceType,
    updatePpcServiceType,
    deletePpcServiceType
};
