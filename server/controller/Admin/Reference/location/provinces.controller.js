const { 
    getAdminProvinces,
    createAdminProvince,
    findProvinceByEnglishInsensitiveInCountry,
    getAdminProvinceById,
    findProvinceByEnglishInsensitiveInCountryExcludingId,
    updateAdminProvince
} = require('../../../../models/Admin/Reference/location/provinces.model');
const {
    getAdminCountryById
} = require('../../../../models/Admin/Reference/location/countries.model');

const getProvinces = async (req, res, next) => {
    try {
        const { search, status, countryId } = req.query;

        // Normalization matching the model requirements happens via undefined checks naturally,
        // or through the model's defaults.
        const filters = {};
        if (search) filters.search = search;
        if (status) filters.status = status;
        if (countryId) filters.countryId = countryId;

        const provinces = await getAdminProvinces(filters);

        return res.status(200).json({
            success: true,
            message: "Provinces retrieved successfully",
            data: provinces
        });
    } catch (error) {
        console.error('Error in getProvinces:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching provinces",
            data: []
        });
    }
};

const createProvince = async (req, res, next) => {
    try {
        const { country_id, province_english, province_urdu, province_abb } = req.body;

        // 1. Check if Country exists
        const existingCountry = await getAdminCountryById(country_id);
        if (!existingCountry) {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        // 2. Check Province English duplicate within that Country
        const englishExists = await findProvinceByEnglishInsensitiveInCountry(country_id, province_english);
        if (englishExists) {
            return res.status(409).json({
                success: false,
                message: "Province with this English name already exists in the selected country"
            });
        }

        // 3. Create Province
        const newProvince = await createAdminProvince({
            country_id,
            province_english,
            province_urdu,
            province_abb
        });

        // 4. Return 201 Created
        return res.status(201).json({
            success: true,
            message: "Province created successfully",
            data: newProvince
        });

    } catch (error) {
        // FK Race Condition: Country deleted exactly between our check and insert
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        // Postgres unique violation safety net (e.g. concurrent inserts)
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: "Province with this English name already exists in the selected country"
            });
        }

        console.error('Error in createProvince:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while creating the province"
        });
    }
};

const updateProvince = async (req, res, next) => {
    try {
        const provinceId = req.params.id;
        const { country_id, province_english, province_urdu, province_abb, is_active } = req.body;

        // 1. Get existing Province
        const existingProvince = await getAdminProvinceById(provinceId);
        if (!existingProvince) {
            return res.status(404).json({
                success: false,
                message: "Province not found"
            });
        }

        // 2. Verify target Country exists
        const existingCountry = await getAdminCountryById(country_id);
        if (!existingCountry) {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        // 3. Check scoped duplicate
        const englishExists = await findProvinceByEnglishInsensitiveInCountryExcludingId(country_id, province_english, provinceId);
        if (englishExists) {
            return res.status(409).json({
                success: false,
                message: "Province with this English name already exists in the selected country"
            });
        }

        // 4. Update Province
        const updatedProvince = await updateAdminProvince(provinceId, {
            country_id,
            province_english,
            province_urdu,
            province_abb,
            is_active
        });

        // 5. Return 200 OK
        return res.status(200).json({
            success: true,
            message: "Province updated successfully",
            data: updatedProvince
        });

    } catch (error) {
        if (error.code === '23503') {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: "Province with this English name already exists in the selected country"
            });
        }

        console.error('Error in updateProvince:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while updating the province"
        });
    }
};

module.exports = {
    getProvinces,
    createProvince,
    updateProvince
};
