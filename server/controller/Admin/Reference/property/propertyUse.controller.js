const { 
    getAdminPropertyUses,
    createAdminPropertyUse,
    findPropertyUseByDescriptionInsensitive,
    getAdminPropertyUseById,
    findPropertyUseByDescriptionInsensitiveExcludingId,
    updateAdminPropertyUse,
    getPropertyUseDependencies,
    deleteAdminPropertyUse
} = require('../../../../models/Admin/Reference/property/propertyUse.model');

const getPropertyUses = async (req, res) => {
    try {
        const { search, status, page, limit } = req.validatedQuery;

        const result = await getAdminPropertyUses({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            message: "Property uses retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getPropertyUses:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching property uses",
            data: []
        });
    }
};

const createPropertyUse = async (req, res) => {
    try {
        const { property_use_description, property_use_urdu, property_use_abb } = req.validatedBody;

        // Global duplicate check (case-insensitive)
        const duplicate = await findPropertyUseByDescriptionInsensitive(property_use_description);
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Property Use with this description already exists"
            });
        }

        // Call model
        const newPropertyUse = await createAdminPropertyUse({
            property_use_description,
            property_use_urdu,
            property_use_abb
        });

        return res.status(201).json({
            success: true,
            message: "Property Use created successfully",
            data: newPropertyUse
        });

    } catch (error) {
        console.error('Error in createPropertyUse:', error);

        // 23505 race condition mapping
        if (error.code === '23505' && error.constraint === 'property_use_property_use_description_key') {
            return res.status(409).json({
                success: false,
                message: "Property Use with this description already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating property use"
        });
    }
};

const updatePropertyUse = async (req, res) => {
    try {
        const { id } = req.params;
        const { property_use_description, property_use_urdu, property_use_abb, is_active } = req.validatedBody;

        // 1. Check existence
        const existing = await getAdminPropertyUseById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Property Use not found"
            });
        }

        // 2. Global duplicate check excluding current ID
        const duplicate = await findPropertyUseByDescriptionInsensitiveExcludingId(property_use_description, id);
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "Property Use with this description already exists"
            });
        }

        // 3. Update
        const updatedRow = await updateAdminPropertyUse(id, {
            property_use_description,
            property_use_urdu,
            property_use_abb,
            is_active
        });

        if (!updatedRow) {
            // Race condition: another request deleted the row before we updated it
            return res.status(404).json({
                success: false,
                message: "Property Use not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property Use updated successfully",
            data: updatedRow
        });

    } catch (error) {
        console.error('Error in updatePropertyUse:', error);

        // 23505 mapping for race conditions on exact DB duplicate
        if (error.code === '23505' && error.constraint === 'property_use_property_use_description_key') {
            return res.status(409).json({
                success: false,
                message: "Property Use with this description already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating property use"
        });
    }
};

const deletePropertyUse = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check existence
        const existing = await getAdminPropertyUseById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Property Use not found"
            });
        }

        // 2. Check dependencies
        const dependencyResult = await getPropertyUseDependencies(id);
        if (dependencyResult.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "Property Use cannot be deleted because it is currently in use.",
                data: {
                    dependencies: dependencyResult.dependencies
                }
            });
        }

        // 3. Physical delete
        const deletedRow = await deleteAdminPropertyUse(id);
        if (!deletedRow) {
            return res.status(404).json({
                success: false,
                message: "Property Use not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property Use deleted successfully",
            data: deletedRow
        });

    } catch (error) {
        console.error('Error in deletePropertyUse:', error);

        if (error.code === '23503') {
            try {
                const refreshedDependencies = await getPropertyUseDependencies(req.params.id);
                return res.status(409).json({
                    success: false,
                    message: "Property Use cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: refreshedDependencies.dependencies
                    }
                });
            } catch (refreshError) {
                console.error('Error refreshing dependencies:', refreshError);
                return res.status(409).json({
                    success: false,
                    message: "Property Use cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: []
                    }
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting property use"
        });
    }
};

module.exports = {
    getPropertyUses,
    createPropertyUse,
    updatePropertyUse,
    deletePropertyUse
};
