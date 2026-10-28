const { getAdminPropertyPurposes } = require('../../../../models/Admin/Reference/property/propertyPurposes.model');

const getPropertyPurposes = async (req, res) => {
    try {
        const { search, status, page, limit } = req.validatedQuery;

        const result = await getAdminPropertyPurposes({
            search,
            status,
            page,
            limit
        });

        return res.status(200).json({
            success: true,
            message: "Property purposes retrieved successfully",
            data: result.rows,
            meta: result.meta
        });
    } catch (error) {
        console.error('Error in getPropertyPurposes:', error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred while fetching property purposes",
            data: []
        });
    }
};

module.exports = {
    getPropertyPurposes
};
