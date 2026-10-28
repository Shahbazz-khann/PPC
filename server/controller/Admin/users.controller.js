const {
  getAdminUsers: fetchAdminUsers,
  updateAdminUser: executeUpdateAdminUser,
  deleteAdminUser: executeDeleteAdminUser,
} = require('../../models/Admin/users.model');

/**
 * Controller handler for Admin User Directory list.
 * Consumes validated query parameters, calls model, and returns standard HTTP response.
 */
const getAdminUsers = async (req, res, next) => {
  try {
    const {
      search,
      userTypeId,
      roleId,
      status,
      page,
      limit,
    } = req.validatedQuery;

    const result = await fetchAdminUsers({
      search,
      userTypeId,
      roleId,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.rows,
      meta: result.meta,
    });
  } catch (error) {
    console.error('Error in getAdminUsers controller:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching users',
      data: [],
    });
  }
};

/**
 * Controller handler for updating a user.
 */
const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.user_id;

    const updatedUser = await executeUpdateAdminUser(userId, req.validatedBody, currentUserId);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error in updateAdminUser controller:', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'A unique constraint was violated (email or mobile already exists)',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while updating the user',
    });
  }
};

/**
 * Controller handler for deleting a user safely.
 */
const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.user_id;

    const result = await executeDeleteAdminUser(userId, currentUserId);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in deleteAdminUser controller:', error);
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message || 'User cannot be deleted because the account is currently in use.',
        data: {
          dependencies: error.dependencies || [],
        },
        dependencies: error.dependencies || [],
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'User cannot be deleted because the account is currently in use.',
        data: {
          dependencies: [],
        },
        dependencies: [],
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while deleting the user',
    });
  }
};

module.exports = {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
};
