const { 
    getAdminTehsils, 
    createAdminTehsil, 
    findTehsilByEnglishInsensitiveInDistrict,
    getAdminTehsilById,
    findTehsilByEnglishInsensitiveInDistrictExcludingId,
    updateAdminTehsil,
    getTehsilDependencies,
    deleteAdminTehsil
} = require('../../../../models/Admin/Reference/location/tehsils.model');
const { getAdminDistrictById } = require('../../../../models/Admin/Reference/location/districts.model');

const getTehsils = async (req, res, next) => {
    try {
        const { search, status, countryId, provinceId, divisionId, districtId, page, limit } = req.validatedQuery;

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (countryId) filters.countryId = countryId;
        if (provinceId) filters.provinceId = provinceId;
        if (divisionId) filters.divisionId = divisionId;
        if (districtId) filters.districtId = districtId;
        if (page) filters.page = page;
        if (limit) filters.limit = limit;

        const result = await getAdminTehsils(filters);

        return res.status(200).json({
            success: true,
            message: "Tehsils retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getTehsils:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching tehsils",
            data: []
        });
    }
};

const createTehsil = async (req, res, next) => {
    try {
        const { district_id, tehsil_english, tehsil_urdu, tehsil_abb } = req.validatedBody;

        // Verify district exists
        const district = await getAdminDistrictById(district_id);
        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        // Check for duplicates in same district
        const existing = await findTehsilByEnglishInsensitiveInDistrict(district_id, tehsil_english);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Tehsil with this English name already exists in the selected district"
            });
        }

        // Create
        const newTehsil = await createAdminTehsil({ district_id, tehsil_english, tehsil_urdu, tehsil_abb });

        return res.status(201).json({
            success: true,
            message: "Tehsil created successfully",
            data: newTehsil
        });
    } catch (error) {
        console.error('Error in createTehsil:', error);
        
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }
        
        if (error.code === '23505' && error.constraint === 'uq_tehsil_district') {
            return res.status(409).json({
                success: false,
                message: "Tehsil with this English name already exists in the selected district"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating tehsil"
        });
    }
};
const updateTehsil = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { district_id, tehsil_english, tehsil_urdu, tehsil_abb, is_active } = req.validatedBody;

        // Verify current Tehsil exists
        const tehsil = await getAdminTehsilById(id);
        if (!tehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        // Verify district exists
        const district = await getAdminDistrictById(district_id);
        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        // Check for duplicates in selected district excluding current tehsil
        const existing = await findTehsilByEnglishInsensitiveInDistrictExcludingId(district_id, tehsil_english, id);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Tehsil with this English name already exists in the selected district"
            });
        }

        // Update
        const updatedTehsil = await updateAdminTehsil(id, {
            district_id,
            tehsil_english,
            tehsil_urdu,
            tehsil_abb,
            is_active
        });

        if (!updatedTehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tehsil updated successfully",
            data: updatedTehsil
        });
    } catch (error) {
        console.error('Error in updateTehsil:', error);

        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        if (error.code === '23505' && error.constraint === 'uq_tehsil_district') {
            return res.status(409).json({
                success: false,
                message: "Tehsil with this English name already exists in the selected district"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating tehsil"
        });
    }
};

const deleteTehsil = async (req, res) => {
    try {
        const tehsilId = req.params.id;

        // 1. Existence check
        const existingTehsil = await getAdminTehsilById(tehsilId);
        if (!existingTehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        // 2. Dependency check
        const depCheck = await getTehsilDependencies(tehsilId);
        if (depCheck.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "Tehsil cannot be deleted because it is currently in use.",
                data: {
                    dependencies: depCheck.dependencies
                }
            });
        }

        // 3. Physical Delete
        const deletedTehsil = await deleteAdminTehsil(tehsilId);
        
        // Safety net if delete returns null unexpectedly
        if (!deletedTehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Tehsil deleted successfully",
            data: deletedTehsil
        });

    } catch (error) {
        // Race condition: if somehow a dependent record was added exactly between check and delete
        if (error.code === '23503') {
            try {
                const refreshedDepCheck = await getTehsilDependencies(req.params.id);
                return res.status(409).json({
                    success: false,
                    message: "Tehsil cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: refreshedDepCheck.hasDependencies ? refreshedDepCheck.dependencies : []
                    }
                });
            } catch (innerError) {
                // Fallback if the refresh fails
                return res.status(409).json({
                    success: false,
                    message: "Tehsil cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: [] 
                    }
                });
            }
        }

        console.error('Error in deleteTehsil:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting tehsil"
        });
    }
};

module.exports = {
    getTehsils,
    createTehsil,
    updateTehsil,
    deleteTehsil
};
