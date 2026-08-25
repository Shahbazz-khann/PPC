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

/**
 * Fetch owner's property verification list
 * @param {Object} params - Query parameters (page, limit, search, status)
 * @returns {Promise<Object>}
 */
export const getOwnerPropertyVerifications = async (params = {}) => {
  return await api.get('/owner/property-verification', { params });
};

/**
 * Fetch owner's upcoming visits
 * @returns {Promise<Object>}
 */
export const getOwnerUpcomingVisits = async (page = 1, limit = 10) => {
  return await api.get(`/owner/visits/upcoming?page=${page}&limit=${limit}`);
};

/**
 * Fetch owner's inspection overview
 * @returns {Promise<Object>}
 */
export const getOwnerInspectionOverview = async () => {
  return await api.get('/owner/inspections/overview');
};

/**
 * Fetch owner's recent activity
 * @returns {Promise<Object>}
 */
export const getOwnerRecentActivity = async () => {
  return await api.get('/owner/activity/recent');
};

/**
 * Fetch owner's properties with filters/pagination
 * @returns {Promise<Object>}
 */
export const getOwnerProperties = async (params = {}) => {
  return await api.get('/owner/properties', { params });
};

/**
 * Fetch owner's properties summary stats
 * @returns {Promise<Object>}
 */
export const getOwnerPropertiesSummary = async () => {
  return await api.get('/owner/properties/summary');
};

/**
 * Fetch owner property details
 * @param {number|string} propertyId 
 * @returns {Promise<Object>}
 */
export const getOwnerPropertyDetails = async (propertyId) => {
  return await api.get(`/owner/properties/${propertyId}`);
};

/**
 * Create a new property
 * @param {Object} propertyData 
 * @returns {Promise<Object>}
 */
export const createOwnerProperty = async (propertyData) => {
  return await api.post('/owner/properties', propertyData);
};

/**
 * Upload property media
 * @param {number|string} propertyId 
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadOwnerPropertyMedia = async (propertyId, formData) => {
  return await api.post(`/owner/properties/${propertyId}/media`, formData);
};
