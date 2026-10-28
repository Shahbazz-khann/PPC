const {
  getAdminCustomers: fetchAdminCustomers,
  getAdminCustomerStats: fetchAdminCustomerStats,
  getAdminCustomerById: fetchAdminCustomerById,
} = require('../../models/Admin/customers.model');
const logger = require('../../utils/logger');

/**
 * Controller handler for Admin Customer list.
 * Consumes validated query parameters, calls model, and returns standard HTTP response.
 */
const getCustomers = async (req, res) => {
  try {
    const {
      search,
      status,
      page,
      limit,
    } = req.validatedQuery;

    const result = await fetchAdminCustomers({
      search,
      status,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getCustomers controller:', error);
    } else {
      console.error('Error in getCustomers controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching customers',
      data: [],
    });
  }
};

/**
 * Controller handler for Admin Customer global summary statistics.
 * Takes no query filters and returns global counts.
 */
const getCustomerStats = async (req, res) => {
  try {
    const stats = await fetchAdminCustomerStats();

    return res.status(200).json({
      success: true,
      message: 'Customer statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getCustomerStats controller:', error);
    } else {
      console.error('Error in getCustomerStats controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching customer statistics',
      data: {},
    });
  }
};

/**
 * Controller handler for Admin Customer Details by ID.
 * Consumes validated string req.params.id, calls model, and returns standard HTTP response.
 */
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await fetchAdminCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: customer,
    });
  } catch (error) {
    if (logger && logger.error) {
      logger.error('Error in getCustomerById controller:', error);
    } else {
      console.error('Error in getCustomerById controller:', error);
    }
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while fetching customer details',
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerStats,
  getCustomerById,
};

