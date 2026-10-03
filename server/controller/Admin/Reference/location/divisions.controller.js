const { 
    getAdminDivisions,
    createAdminDivision,
    findDivisionByEnglishInsensitiveInProvince,
    getAdminDivisionById,
    findDivisionByEnglishInsensitiveInProvinceExcludingId,
    updateAdminDivision,
    getDivisionDependencies,
    deleteAdminDivision
} = require('../../../../models/Admin/Reference/location/divisions.model');
const { getAdminProvinceById } = require('../../../../models/Admin/Reference/location/provinces.model');

const getDivisions = async (req, res, next) => {
    try {
        const { search, status, countryId, provinceId, page, limit } = req.query;

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (countryId) filters.countryId = countryId;
        if (provinceId) filters.provinceId = provinceId;
        if (page) filters.page = page;
        if (limit) filters.limit = limit;

        const result = await getAdminDivisions(filters);

        return res.status(200).json({
            success: true,
            message: "Divisions retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getDivisions:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching divisions",
            data: []
        });
    }
};


const createDivision = async (req, res, next) => {
    try {
        const { province_id, division_english, division_urdu, division_abb } = req.body;

        // Verify Province exists
        const province = await getAdminProvinceById(province_id);
        if (!province) {
            return res.status(404).json({
                success: false,
                message: "Province not found"
            });
        }

        // Check for case-insensitive duplicate English name within the same province
        const existingDivision = await findDivisionByEnglishInsensitiveInProvince(province_id, division_english);
        if (existingDivision) {
            return res.status(409).json({
                success: false,
                message: "Division with this English name already exists in the selected province"
            });
        }

        // Insert new division
        const newDivision = await createAdminDivision({
            province_id,
            division_english,
            division_urdu,
            division_abb
        });

        return res.status(201).json({
            success: true,
            message: "Division created successfully",
            data: newDivision
        });

    } catch (error) {
        // Handle FK race condition or other known DB constraints safely
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Province not found"
            });
        }

        console.error('Error in createDivision:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating division"
        });
    }
};

const updateDivision = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { province_id, division_english, division_urdu, division_abb, is_active } = req.body;

        // Verify current Division exists
        const currentDivision = await getAdminDivisionById(id);
        if (!currentDivision) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // Verify selected Province exists
        const province = await getAdminProvinceById(province_id);
        if (!province) {
            return res.status(404).json({
                success: false,
                message: "Province not found"
            });
        }

        // Check for case-insensitive duplicate English name within the selected province excluding current division
        const existingDivision = await findDivisionByEnglishInsensitiveInProvinceExcludingId(province_id, division_english, id);
        if (existingDivision) {
            return res.status(409).json({
                success: false,
                message: "Division with this English name already exists in the selected province"
            });
        }

        // Update division
        const updatedDivision = await updateAdminDivision(id, {
            province_id,
            division_english,
            division_urdu,
            division_abb,
            is_active
        });

        if (!updatedDivision) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Division updated successfully",
            data: updatedDivision
        });

    } catch (error) {
        // Handle FK race condition
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Province not found"
            });
        }

        console.error('Error in updateDivision:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating division"
        });
    }
};

/**
 * Delete a division physically.
 * Blocked by existing district dependencies (Safe Delete).
 */
const deleteDivision = async (req, res, next) => {
    try {
        const divisionId = req.params.id;

        // 1. Existence check
        const existingDivision = await getAdminDivisionById(divisionId);
        if (!existingDivision) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // 2. Dependency check
        const depCheck = await getDivisionDependencies(divisionId);
        if (depCheck.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "Division cannot be deleted because it is currently in use.",
                data: {
                    dependencies: depCheck.dependencies
                }
            });
        }

        // 3. Physical Delete
        const deletedDivision = await deleteAdminDivision(divisionId);
        
        // Safety net if delete returns null unexpectedly due to race condition
        if (!deletedDivision) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Division deleted successfully",
            data: deletedDivision
        });
    } catch (error) {
        // Race condition: if a district was added exactly between check and delete
        if (error.code === '23503') {
            try {
                // Refresh dependency array to show accurate current state
                const freshDepCheck = await getDivisionDependencies(req.params.id);
                return res.status(409).json({
                    success: false,
                    message: "Division cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: freshDepCheck.dependencies
                    }
                });
            } catch (fallbackError) {
                // In case the refresh fails, still return 409 safe response
                return res.status(409).json({
                    success: false,
                    message: "Division cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: [] // Best effort without exposing internal error
                    }
                });
            }
        }

        console.error('Error in deleteDivision:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting division"
        });
    }
};

module.exports = {
    getDivisions,
    createDivision,
    updateDivision,
    deleteDivision
};
