const { getAdminPropertyTypes, createAdminPropertyType, findPropertyTypeByDescriptionInsensitive, getAdminPropertyTypeById, findPropertyTypeByDescriptionInsensitiveExcludingId, updateAdminPropertyType, getPropertyTypeDependencies, deleteAdminPropertyType } = require('../../../../models/Admin/Reference/property/propertyTypes.model');

const getPropertyTypes = async (req, res) => {
    try {
        const { search, status, page, limit } = req.validatedQuery;

        const result = await getAdminPropertyTypes({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            message: "Property types retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getPropertyTypes:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching property types",
            data: []
        });
    }
};

const createPropertyType = async (req, res) => {
    try {
        const { property_type_description, property_type_urdu, property_type_abb } = req.validatedBody;

        const existingType = await findPropertyTypeByDescriptionInsensitive(property_type_description);

        if (existingType) {
            return res.status(409).json({
                success: false,
                message: "Property type with this English description already exists"
            });
        }

        const result = await createAdminPropertyType({
            property_type_description,
            property_type_urdu,
            property_type_abb
        });

        return res.status(201).json({
            success: true,
            message: "Property type created successfully",
            data: result
        });

    } catch (error) {
        if (error.code === '23505' && error.constraint === 'property_types_property_type_description_key') {
            return res.status(409).json({
                success: false,
                message: "Property type with this English description already exists"
            });
        }
        
        console.error('Error in createPropertyType:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating property type"
        });
    }
};

const updatePropertyType = async (req, res) => {
    try {
        const { id } = req;
        // In some controllers the param is validated directly to req.validatedId. Let's use req.validatedId if present, else req.params.id
        const propertyTypeId = req.validatedId;

        const { property_type_description, property_type_urdu, property_type_abb, is_active } = req.validatedBody;

        // Verify existence
        const existingPropertyType = await getAdminPropertyTypeById(propertyTypeId);
        if (!existingPropertyType) {
            return res.status(404).json({
                success: false,
                message: "Property type not found"
            });
        }

        // Check for duplicates
        const duplicateType = await findPropertyTypeByDescriptionInsensitiveExcludingId(property_type_description, propertyTypeId);
        if (duplicateType) {
            return res.status(409).json({
                success: false,
                message: "Property type with this English description already exists"
            });
        }

        const result = await updateAdminPropertyType(propertyTypeId, {
            property_type_description,
            property_type_urdu,
            property_type_abb,
            is_active
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Property type not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property type updated successfully",
            data: result
        });

    } catch (error) {
        if (error.code === '23505' && error.constraint === 'property_types_property_type_description_key') {
            return res.status(409).json({
                success: false,
                message: "Property type with this English description already exists"
            });
        }

        console.error('Error in updatePropertyType:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating property type"
        });
    }
};

const deletePropertyType = async (req, res) => {
    try {
        const propertyTypeId = req.validatedId;

        // 1. Verify existence
        const existingPropertyType = await getAdminPropertyTypeById(propertyTypeId);
        if (!existingPropertyType) {
            return res.status(404).json({
                success: false,
                message: "Property Type not found"
            });
        }

        // 2. Dependency check
        const { hasDependencies, dependencies } = await getPropertyTypeDependencies(propertyTypeId);
        if (hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "Property Type cannot be deleted because it is currently in use.",
                data: {
                    dependencies
                }
            });
        }

        // 3. Physical delete
        const result = await deleteAdminPropertyType(propertyTypeId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Property Type not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Property Type deleted successfully",
            data: result
        });
    } catch (error) {
        // 4. Catch 23503 race condition safely
        if (error.code === '23503') {
            try {
                // Refresh dependencies
                const propertyTypeId = req.validatedId;
                const { dependencies } = await getPropertyTypeDependencies(propertyTypeId);
                return res.status(409).json({
                    success: false,
                    message: "Property Type cannot be deleted because it is currently in use.",
                    data: {
                        dependencies
                    }
                });
            } catch (fallbackError) {
                // Fallback if refresh fails
                return res.status(409).json({
                    success: false,
                    message: "Property Type cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: []
                    }
                });
            }
        }

        console.error('Error in deletePropertyType:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting property type"
        });
    }
};

module.exports = {
    getPropertyTypes,
    createPropertyType,
    updatePropertyType,
    deletePropertyType
};
