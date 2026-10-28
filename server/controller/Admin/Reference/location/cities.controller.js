const { 
    getAdminCities,
    createAdminCity,
    findCityByEnglishInsensitiveInTehsil,
    getAdminCityById,
    findCityByEnglishInsensitiveInTehsilExcludingId,
    updateAdminCity,
    getCityDependencies,
    deleteAdminCity
} = require('../../../../models/Admin/Reference/location/cities.model');

const {
    getAdminTehsilById
} = require('../../../../models/Admin/Reference/location/tehsils.model');

const getCities = async (req, res, next) => {
    try {
        const { search, status, countryId, provinceId, divisionId, districtId, tehsilId, page, limit } = req.validatedQuery;

        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (countryId) filters.countryId = countryId;
        if (provinceId) filters.provinceId = provinceId;
        if (divisionId) filters.divisionId = divisionId;
        if (districtId) filters.districtId = districtId;
        if (tehsilId) filters.tehsilId = tehsilId;
        if (page) filters.page = page;
        if (limit) filters.limit = limit;

        const result = await getAdminCities(filters);

        return res.status(200).json({
            success: true,
            message: "Cities retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getCities:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching cities",
            data: []
        });
    }
};

const createCity = async (req, res, next) => {
    try {
        const { tehsil_id, city_english, city_urdu, city_abb } = req.validatedBody;

        // Verify selected Tehsil exists
        const tehsil = await getAdminTehsilById(tehsil_id);
        if (!tehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        // Check case-insensitive English duplicate within selected Tehsil
        const existingCity = await findCityByEnglishInsensitiveInTehsil(tehsil_id, city_english);
        if (existingCity) {
            return res.status(409).json({
                success: false,
                message: "City with this English name already exists in the selected tehsil"
            });
        }

        const newCity = await createAdminCity({
            tehsil_id,
            city_english,
            city_urdu,
            city_abb
        });

        return res.status(201).json({
            success: true,
            message: "City created successfully",
            data: newCity
        });
    } catch (error) {
        console.error('Error in createCity:', error);
        
        // 23503 Mapping (Foreign Key Violation - Tehsil might have been deleted)
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }
        
        // 23505 Mapping (Unique Constraint Violation - concurrency race)
        if (error.code === '23505' && error.constraint === 'uq_city_tehsil') {
            return res.status(409).json({
                success: false,
                message: "City with this English name already exists in the selected tehsil"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating city"
        });
    }
};

const updateCity = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { tehsil_id, city_english, city_urdu, city_abb, is_active } = req.validatedBody;

        // 1. Verify current City exists
        const currentCity = await getAdminCityById(id);
        if (!currentCity) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        // 2. Verify selected Tehsil exists
        const tehsil = await getAdminTehsilById(tehsil_id);
        if (!tehsil) {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        // 3. Check duplicate excluding current City ID
        const existingCity = await findCityByEnglishInsensitiveInTehsilExcludingId(
            tehsil_id,
            city_english,
            id
        );
        if (existingCity) {
            return res.status(409).json({
                success: false,
                message: "City with this English name already exists in the selected tehsil"
            });
        }

        // 4. Update
        const updatedCity = await updateAdminCity(id, {
            tehsil_id,
            city_english,
            city_urdu,
            city_abb,
            is_active
        });

        if (!updatedCity) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "City updated successfully",
            data: updatedCity
        });
    } catch (error) {
        console.error('Error in updateCity:', error);

        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Tehsil not found"
            });
        }

        if (error.code === '23505' && error.constraint === 'uq_city_tehsil') {
            return res.status(409).json({
                success: false,
                message: "City with this English name already exists in the selected tehsil"
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating city"
        });
    }
};

const deleteCity = async (req, res) => {
    try {
        const cityId = req.params.id;
        
        const city = await getAdminCityById(cityId);
        if (!city) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }
        
        const depCheck = await getCityDependencies(cityId);
        if (depCheck.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "City cannot be deleted because it is currently in use.",
                data: {
                    dependencies: depCheck.dependencies
                }
            });
        }
        
        const deletedCity = await deleteAdminCity(cityId);
        if (!deletedCity) {
            return res.status(404).json({
                success: false,
                message: "City not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "City deleted successfully",
            data: deletedCity
        });
        
    } catch (error) {
        console.error('Error in deleteCity:', error);
        
        if (error.code === '23503') {
            try {
                const currentDeps = await getCityDependencies(req.params.id);
                return res.status(409).json({
                    success: false,
                    message: "City cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: currentDeps.dependencies || []
                    }
                });
            } catch (refreshErr) {
                return res.status(409).json({
                    success: false,
                    message: "City cannot be deleted because it is currently in use.",
                    data: {
                        dependencies: []
                    }
                });
            }
        }
        
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting city"
        });
    }
};

module.exports = {
    getCities,
    createCity,
    updateCity,
    deleteCity
};
