import api, { resolveMediaUrl } from "./Api";

export { resolveMediaUrl };

/**
 * Get current Customer profile
 */
export const getCustomerProfile = async () => {
  return await api.get("/customer/profile");
};

export const getCustomerDashboardSummary = async () => {
  return await api.get("/customer/dashboard/summary");
};

export const getCustomerDashboardProperties = async () => {
  return await api.get("/customer/dashboard/properties");
};

export const getCustomerProperties = async () => {
  return await api.get("/customer/properties");
};

export const getCustomerPropertyDetail = async (propertyId) => {
  return await api.get(`/customer/properties/${propertyId}`);
};

export const addCustomerProperty = async (payload) => {
  return await api.post("/customer/properties", payload);
};

export const updateCustomerProperty = async (propertyId, payload) => {
  return await api.put(`/customer/properties/${propertyId}`, payload);
};

export const setCustomerPropertyDemand = async (propertyId, payload) => {
  return await api.post(`/customer/properties/${propertyId}/demand`, payload);
};

/**
 * Update current Customer profile
 */
export const updateCustomerProfile = async (profileData) => {
  return await api.put("/customer/profile", profileData);
};

export const uploadProfileImage = async (formData) => {
  // Let axios set Content-Type automatically for FormData so it includes the correct boundary
  return await api.post("/customer/profile-image", formData);
};

export const getIdentityTypes = async () => {
  return await api.get("/reference/identity-types");
};

export const getCountries = async () => {
  return await api.get("/reference/countries");
};

export const getCustomerTitles = async () => {
  return await api.get("/reference/titles");
};

export const getGenders = async () => {
  return await api.get("/reference/genders");
};

export const changeCustomerPassword = async (payload) => {
  return await api.put("/customer/password", payload);
};

export const getPropertyFormReference = async () => {
  return await api.get("/reference/property-form");
};

export const getCities = async (tehsilId, search = '') => {
  return await api.get(`/reference/cities`, { params: { tehsil_id: tehsilId, search } });
};

export const getSocieties = async (cityId, search = '') => {
  return await api.get(`/reference/societies`, { params: { city_id: cityId, search } });
};

export const getAreas = async (societyId, search = '') => {
  return await api.get(`/reference/areas`, { params: { society_id: societyId, search } });
};

/**
 * Upload pictures for a created property.
 * Files must be File objects from the browser.
 * Field name accepted by backend: "pictures"
 *
 * @param {number|string} propertyId
 * @param {File[]} files - Array of File objects
 */
export const uploadCustomerPropertyPictures = async (propertyId, files) => {
  const formData = new FormData();
  // Append each File individually — backend multer field name is 'pictures'
  files.forEach((file) => {
    formData.append('pictures', file);
  });
  // Api.js detects FormData and removes Content-Type automatically,
  // so the browser sets the correct multipart boundary
  return await api.post(`/customer/properties/${propertyId}/pictures`, formData);
};

/**
 * Upload a single video for a created property.
 * File must be a File object from the browser.
 * Field name accepted by backend: "video"
 *
 * @param {number|string} propertyId
 * @param {File} file - File object
 */
export const uploadCustomerPropertyVideo = async (propertyId, file) => {
  const formData = new FormData();
  formData.append('video', file);
  return await api.post(`/customer/properties/${propertyId}/video`, formData);
};
