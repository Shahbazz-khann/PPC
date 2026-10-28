const societiesModel = require('../../../../models/Admin/Reference/location/societies.model');

/**
 * Retrieves a paginated list of Societies based on filter criteria.
 */
exports.getSocieties = async (req, res) => {
  try {
    const {
      search,
      status,
      districtId,
      tehsilId,
      cityId,
      page,
      limit
    } = req.query;

    const result = await societiesModel.getAdminSocieties({
      search,
      status,
      districtId,
      tehsilId,
      cityId,
      page,
      limit
    });

    return res.status(200).json({
      success: true,
      data: result.rows,
      meta: result.meta
    });
  } catch (error) {
    console.error('Error in getSocieties controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve societies.'
    });
  }
};

/**
 * Creates a new Society.
 */
exports.createSociety = async (req, res) => {
  try {
    const { city_id, society_english, society_urdu, society_abb } = req.validatedBody;

    // Verify City exists (we accept inactive parent per business rule H)
    const { getAdminCityById } = require('../../../../models/Admin/Reference/location/cities.model');
    const city = await getAdminCityById(city_id);
    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // Check for duplicates in the same City
    const existing = await societiesModel.findSocietyByEnglishInsensitiveInCity(city_id, society_english);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Society with this English name already exists in the selected city"
      });
    }

    // Create Society
    const newSociety = await societiesModel.createAdminSociety({
      city_id,
      society_english,
      society_urdu,
      society_abb
    });

    return res.status(201).json({
      success: true,
      message: "Society created successfully",
      data: newSociety
    });

  } catch (error) {
    console.error('Error in createSociety controller:', error);

    // Parent FK missing race condition
    if (error.code === '23503') {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // Exact DB duplicate constraint race fallback
    if (error.code === '23505' && error.constraint === 'uq_society_city') {
      return res.status(409).json({
        success: false,
        message: "Society with this English name already exists in the selected city"
      });
    }

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating society"
    });
  }
};

/**
 * Updates an existing Society.
 */
exports.updateSociety = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_id, society_english, society_urdu, society_abb, is_active } = req.validatedBody;

    // Check if society exists
    const currentSociety = await societiesModel.getAdminSocietyById(id);
    if (!currentSociety) {
      return res.status(404).json({
        success: false,
        message: "Society not found"
      });
    }

    // Verify City exists (accept inactive parent per existing business rule)
    const { getAdminCityById } = require('../../../../models/Admin/Reference/location/cities.model');
    const city = await getAdminCityById(city_id);
    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // Check for duplicates in the same City, excluding current Society
    const existing = await societiesModel.findSocietyByEnglishInsensitiveInCityExcludingId(city_id, society_english, id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Society with this English name already exists in the selected city"
      });
    }

    // Update Society
    const updatedSociety = await societiesModel.updateAdminSociety(id, {
      city_id,
      society_english,
      society_urdu,
      society_abb,
      is_active
    });

    if (!updatedSociety) {
      return res.status(404).json({
        success: false,
        message: "Society not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Society updated successfully",
      data: updatedSociety
    });

  } catch (error) {
    console.error('Error in updateSociety controller:', error);

    // Parent FK missing race condition
    if (error.code === '23503') {
      return res.status(404).json({
        success: false,
        message: "City not found"
      });
    }

    // Exact DB duplicate constraint race fallback
    if (error.code === '23505' && error.constraint === 'uq_society_city') {
      return res.status(409).json({
        success: false,
        message: "Society with this English name already exists in the selected city"
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update society.'
    });
  }
};

/**
 * Deletes a Society safely if it has no dependencies.
 */
exports.deleteSociety = async (req, res) => {
  try {
    const { id: societyId } = req.params;

    // 1. Verify Society exists
    const societyExists = await societiesModel.getAdminSocietyById(societyId);
    if (!societyExists) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // 2. Check dependencies
    const dependencyCheck = await societiesModel.getSocietyDependencies(societyId);
    if (dependencyCheck.hasDependencies) {
      return res.status(409).json({
        success: false,
        message: 'Society cannot be deleted because it is currently in use.',
        data: {
          dependencies: dependencyCheck.dependencies
        }
      });
    }

    // 3. Perform physical deletion
    const deletedSociety = await societiesModel.deleteAdminSociety(societyId);

    // 4. Handle deletion race condition
    if (!deletedSociety) {
      return res.status(404).json({
        success: false,
        message: 'Society not found'
      });
    }

    // 5. Success
    return res.status(200).json({
      success: true,
      message: 'Society deleted successfully',
      data: deletedSociety
    });

  } catch (error) {
    // 23503 Race protection
    if (error.code === '23503') {
      try {
        const freshDeps = await societiesModel.getSocietyDependencies(req.params.id);
        return res.status(409).json({
          success: false,
          message: 'Society cannot be deleted because it is currently in use.',
          data: {
            dependencies: freshDeps.dependencies
          }
        });
      } catch (fallbackError) {
        return res.status(409).json({
          success: false,
          message: 'Society cannot be deleted because it is currently in use.',
          data: {
            dependencies: []
          }
        });
      }
    }

    console.error('Error in deleteSociety controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete society.'
    });
  }
};
