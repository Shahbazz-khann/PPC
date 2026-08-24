import api from './Api';

/**
 * Fetch owner's dashboard summary statistics
 * @returns {Promise<Object>} The summary payload from the backend
 */
export const getOwnerDashboardSummary = async () => {
  return await api.get('/owner/dashboard/summary');
};

/**
 * Fetch owner's property verification summary
 * @returns {Promise<Object>}
 */
export const getOwnerVerificationSummary = async () => {
  return await api.get('/owner/property-verification/summary');
};
