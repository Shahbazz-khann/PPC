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

/**
 * Update owner's profile settings
 * @param {Object} profileData - name, mobile_no, country
 * @returns {Promise<Object>}
 */
export const updateOwnerProfile = async (profileData) => {
  return await api.patch('/owner/settings/profile', profileData);
};

/**
 * Fetch owner's inspections summary stats
 * @returns {Promise<Object>}
 */
export const getOwnerInspectionsSummary = async () => {
  return await api.get('/owner/inspections/summary');
};

/**
 * Fetch owner's inspections list
 * @param {Object} params - Query parameters (page, limit, search, status, sort)
 * @returns {Promise<Object>}
 */
export const getOwnerInspectionsList = async (params = {}) => {
  return await api.get('/owner/inspections', { params });
};

/**
 * Fetch owner's inspection details
 * @param {number|string} inspectionId
 * @returns {Promise<Object>}
 */
export const getOwnerInspectionDetails = async (inspectionId) => {
  return await api.get(`/owner/inspections/${inspectionId}`);
};

/**
 * Fetch owner's visits summary stats
 * @returns {Promise<Object>}
 */
export const getOwnerVisitsSummary = async () => {
  return await api.get('/owner/visits/summary');
};

/**
 * Fetch owner's visits list
 * @param {Object} params - Query parameters (page, limit, search, status, sort)
 * @returns {Promise<Object>}
 */
export const getOwnerVisitsList = async (params = {}) => {
  return await api.get('/owner/visits', { params });
};

/**
 * Fetch owner's visit details
 * @param {number|string} visitId
 * @returns {Promise<Object>}
 */
export const getOwnerVisitDetails = async (visitId) => {
  return await api.get(`/owner/visits/${visitId}`);
};




