const logger = require('../../../../utils/logger');
const { 
    getAdminCountries, 
    createAdminCountry, 
    findCountryByEnglishInsensitive, 
    findCountryByAbbreviationInsensitive,
    getAdminCountryById,
    findCountryByEnglishInsensitiveExcludingId,
    findCountryByAbbreviationInsensitiveExcludingId,
    updateAdminCountry,
    getCountryDependencies,
    deleteAdminCountry
} = require('../../../../models/Admin/Reference/location/countries.model');

const getCountries = async (req, res, next) => {
    try {
        const { search, status } = req.query;

        // Model normalizes status=all to no-filter internally (or we could pass it down directly)
        // Since validator already normalizes absent status to 'all', we just pass it to model
        const countries = await getAdminCountries({ search, status });

        return res.status(200).json({
            success: true,
            message: 'Countries retrieved successfully',
            data: countries
        });

    } catch (error) {
        logger.error('Get Admin Countries Error:', error);
        next(error);
    }
};

const createCountry = async (req, res, next) => {
    try {
        const { country_english, country_urdu, country_abb } = req.body;

        // 1. Check English duplicate
        const englishExists = await findCountryByEnglishInsensitive(country_english);
        if (englishExists) {
            return res.status(409).json({
                success: false,
                message: 'Country with this English name already exists'
            });
        }

        // 2. Check Abbreviation duplicate if provided
        if (country_abb) {
            const abbExists = await findCountryByAbbreviationInsensitive(country_abb);
            if (abbExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Country with this abbreviation already exists'
                });
            }
        }

        // 3. Create the country
        const newCountry = await createAdminCountry({
            country_english,
            country_urdu,
            country_abb
        });

        return res.status(201).json({
            success: true,
            message: 'Country created successfully',
            data: newCountry
        });

    } catch (error) {
        // Postgres unique violation safety net
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Country with this English name already exists'
            });
        }
        
        logger.error('Create Admin Country Error:', error);
        next(error);
    }
};

const updateCountry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { country_english, country_urdu, country_abb, is_active } = req.body;

        // 1. Check if exists
        const existing = await getAdminCountryById(id);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Country not found'
            });
        }

        // 2. Check English duplicate excluding current
        const englishExists = await findCountryByEnglishInsensitiveExcludingId(country_english, id);
        if (englishExists) {
            return res.status(409).json({
                success: false,
                message: 'Country with this English name already exists'
            });
        }

        // 3. Check Abbreviation duplicate excluding current
        if (country_abb) {
            const abbExists = await findCountryByAbbreviationInsensitiveExcludingId(country_abb, id);
            if (abbExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Country with this abbreviation already exists'
                });
            }
        }

        // 4. Update the country
        const updatedCountry = await updateAdminCountry(id, {
            country_english,
            country_urdu,
            country_abb,
            is_active
        });

        return res.status(200).json({
            success: true,
            message: 'Country updated successfully',
            data: updatedCountry
        });

    } catch (error) {
        // Postgres unique violation safety net
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Country with this English name already exists'
            });
        }
        
        logger.error('Update Admin Country Error:', error);
        next(error);
    }
};

/**
 * Delete a country.
 * 
 * @param {Object} req 
 * @param {Object} res 
 */
const deleteCountry = async (req, res) => {
    try {
        const countryId = req.params.id;

        // 1. Existence check
        const existingCountry = await getAdminCountryById(countryId);
        if (!existingCountry) {
            return res.status(404).json({
                success: false,
                message: "Country not found"
            });
        }

        // 2. Dependency check
        const depCheck = await getCountryDependencies(countryId);
        if (depCheck.hasDependencies) {
            return res.status(409).json({
                success: false,
                message: "Country cannot be deleted because it is currently in use.",
                data: {
                    dependencies: depCheck.dependencies
                }
            });
        }

        // 3. Physical Delete
        const deletedCountry = await deleteAdminCountry(countryId);

        return res.status(200).json({
            success: true,
            message: "Country deleted successfully",
            data: deletedCountry
        });
    } catch (error) {
        // Race condition: if somehow a dependent record was added exactly between check and delete
        if (error.code === '23503') {
            return res.status(409).json({
                success: false,
                message: "Country cannot be deleted because it is currently in use."
            });
        }

        console.error('Error in deleteCountry:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while deleting the country"
        });
    }
};

module.exports = {
    getCountries,
    createCountry,
    updateCountry,
    deleteCountry
};
