const { 
    getAdminDistricts,
    createAdminDistrict,
    findDistrictByEnglishInsensitiveInDivision,
    getAdminDistrictById,
    findDistrictByEnglishInsensitiveInDivisionExcludingId,
    updateAdminDistrict,
    getDistrictDependencies,
    deleteAdminDistrict
} = require('../../../../models/Admin/Reference/location/districts.model');
const {
    getAdminDivisionById
} = require('../../../../models/Admin/Reference/location/divisions.model');

const getDistricts = async (req, res, next) => {
    try {
        const { search, status, countryId, provinceId, divisionId, page, limit } = req.query;

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (countryId) filters.countryId = countryId;
        if (provinceId) filters.provinceId = provinceId;
        if (divisionId) filters.divisionId = divisionId;
        if (page) filters.page = page;
        if (limit) filters.limit = limit;

        const result = await getAdminDistricts(filters);

        return res.status(200).json({
            success: true,
            message: "Districts retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getDistricts:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching districts",
            data: []
        });
    }
};

const createDistrict = async (req, res, next) => {
    try {
        const { division_id, district_english, district_urdu, district_abb } = req.body;

        // 1. Verify Division exists
        const division = await getAdminDivisionById(division_id);
        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // 2. Perform duplicate check within Division
        const existing = await findDistrictByEnglishInsensitiveInDivision(division_id, district_english);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "District with this English name already exists in the selected division"
            });
        }

        // 3. Create District
        const newDistrict = await createAdminDistrict({
            division_id,
            district_english,
            district_urdu,
            district_abb
        });

        // 4. Return success
        return res.status(201).json({
            success: true,
            message: "District created successfully",
            data: newDistrict
        });

    } catch (error) {
        // Map 23503 error to 404 in case of race condition
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        console.error('Error in createDistrict:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating the district"
        });
    }
};

const updateDistrict = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { division_id, district_english, district_urdu, district_abb, is_active } = req.body;

        // 1. Verify District exists
        const currentDistrict = await getAdminDistrictById(id);
        if (!currentDistrict) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        // 2. Verify selected Division exists
        const division = await getAdminDivisionById(division_id);
        if (!division) {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        // 3. Duplicate check within selected Division, excluding current District
        const duplicate = await findDistrictByEnglishInsensitiveInDivisionExcludingId(division_id, district_english, id);
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: "District with this English name already exists in the selected division"
            });
        }

        // 4. Update District
        const updatedDistrict = await updateAdminDistrict(id, {
            division_id,
            district_english,
            district_urdu,
            district_abb,
            is_active
        });

        // Race condition fallback
        if (!updatedDistrict) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        // 5. Return success
        return res.status(200).json({
            success: true,
            message: "District updated successfully",
            data: updatedDistrict
        });

    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Division not found"
            });
        }

        console.error('Error in updateDistrict:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating the district"
        });
    }
};

const deleteDistrict = async (req, res) => {
    try {
        const districtId = req.params.id;

        // 1. Existence check
        const existingDistrict = await getAdminDistrictById(districtId);
        if (!existingDistrict) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        // 2. Dependency check
        const depCheck = await getDistrictDependencies(districtId);
        if (depCheck.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "District cannot be deleted because it is currently in use.",
                data: {
                    dependencies: depCheck.dependencies
                }
            });
        }

        // 3. Physical Delete
        const deletedDistrict = await deleteAdminDistrict(districtId);
        
        // Safety net if delete returns null unexpectedly
        if (!deletedDistrict) {
            return res.status(404).json({
                success: false,
                message: "District not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "District deleted successfully",
            data: deletedDistrict
        });

    } catch (error) {
        // Race condition: if somehow a dependent record was added exactly between check and delete
        if (error.code === '23503') {
            try {
                const refreshedDepCheck = await getDistrictDependencies(req.params.id);
                return res.status(409).json({
                    success: false,
                    message: "District cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: refreshedDepCheck.hasDependencies ? refreshedDepCheck.dependencies : []
                    }
                });
            } catch (innerError) {
                // Fallback if the refresh fails
                return res.status(409).json({
                    success: false,
                    message: "District cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: [] 
                    }
                });
            }
        }

        console.error('Error in deleteDistrict:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting the district"
        });
    }
};

module.exports = {
    getDistricts,
    createDistrict,
    updateDistrict,
    deleteDistrict
};
