import api from './api';

/**
 * Admin Reference Location Services
 */
export const getAdminCountries = async (params = {}) => {
  return await api.get('/admin/reference/location/countries', params);
};

/**
 * Creates a new country in the admin reference location.
 */
export const createAdminCountry = async (payload) => {
  return await api.post('/admin/reference/location/countries', payload);
};

/**
 * Updates an existing country.
 */
export const updateAdminCountry = async (countryId, payload) => {
  return await api.put(`/admin/reference/location/countries/${countryId}`, payload);
};

/**
 * Deletes a country.
 */
export const deleteAdminCountry = async (countryId) => {
  return await api.delete(`/admin/reference/location/countries/${countryId}`);
};

/**
 * Retrieves a list of provinces.
 */
export const getAdminProvinces = async (params = {}) => {
  return await api.get('/admin/reference/location/provinces', params);
};

/**
 * Creates a new province in the admin reference location.
 */
export const createAdminProvince = async (payload) => {
  return await api.post('/admin/reference/location/provinces', payload);
};

/**
 * Updates an existing province in the admin reference location.
 */
export const updateAdminProvince = async (provinceId, payload) => {
  return await api.put(`/admin/reference/location/provinces/${provinceId}`, payload);
};

/**
 * Deletes a province.
 */
export const deleteAdminProvince = async (provinceId) => {
  return await api.delete(`/admin/reference/location/provinces/${provinceId}`);
};

/**
 * Retrieves a list of divisions.
 */
export const getAdminDivisions = async (params = {}) => {
  return await api.get('/admin/reference/location/divisions', params);
};

/**
 * Creates a new division in the admin reference location.
 */
export const createAdminDivision = async (payload) => {
  return await api.post('/admin/reference/location/divisions', payload);
};

/**
 * Updates an existing division in the admin reference location.
 */
export const updateAdminDivision = async (divisionId, payload) => {
  return await api.put(`/admin/reference/location/divisions/${divisionId}`, payload);
};

/**
 * Deletes a division.
 */
export const deleteAdminDivision = async (divisionId) => {
  return await api.delete(`/admin/reference/location/divisions/${divisionId}`);
};

