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

/**
 * Retrieves a list of districts.
 */
export const getAdminDistricts = async (params = {}) => {
  return await api.get('/admin/reference/location/districts', params);
};

/**
 * Creates a new district in the admin reference location.
 */
export const createAdminDistrict = async (payload) => {
  return await api.post('/admin/reference/location/districts', payload);
};

/**
 * Updates an existing district in the admin reference location.
 */
export const updateAdminDistrict = async (districtId, payload) => {
  return await api.put(`/admin/reference/location/districts/${districtId}`, payload);
};

/**
 * Deletes a district.
 */
export const deleteAdminDistrict = async (districtId) => {
  return await api.delete(`/admin/reference/location/districts/${districtId}`);
};

/**
 * Retrieves a list of tehsils.
 */
export const getAdminTehsils = async (params = {}) => {
  return await api.get('/admin/reference/location/tehsils', params);
};

/**
 * Creates a new tehsil.
 */
export const createAdminTehsil = async (payload) => {
  return await api.post('/admin/reference/location/tehsils', payload);
};

/**
 * Updates an existing tehsil.
 */
export const updateAdminTehsil = async (tehsilId, payload) => {
  return await api.put(`/admin/reference/location/tehsils/${tehsilId}`, payload);
};

/**
 * Deletes a tehsil.
 */
export const deleteAdminTehsil = async (tehsilId) => {
  return await api.delete(`/admin/reference/location/tehsils/${tehsilId}`);
};

/**
 * Retrieves a list of cities.
 */
export const getAdminCities = async (params = {}) => {
  return await api.get('/admin/reference/location/cities', params);
};

/**
 * Creates a new city.
 */
export const createAdminCity = async (payload) => {
  return await api.post('/admin/reference/location/cities', payload);
};

/**
 * Updates an existing city.
 */
export const updateAdminCity = async (cityId, payload) => {
  return await api.put(`/admin/reference/location/cities/${cityId}`, payload);
};

/**
 * Deletes a city.
 */
export const deleteAdminCity = async (cityId) => {
  return await api.delete(`/admin/reference/location/cities/${cityId}`);
};

/**
 * Retrieves a list of societies.
 */
export const getAdminSocieties = async (params = {}) => {
  return await api.get('/admin/reference/location/societies', params);
};

/**
 * Creates a new society in the admin reference location.
 */
export const createAdminSociety = async (payload) => {
  return await api.post('/admin/reference/location/societies', payload);
};

/**
 * Updates an existing society.
 */
export const updateAdminSociety = async (societyId, payload) => {
  return await api.put(`/admin/reference/location/societies/${societyId}`, payload);
};

/**
 * Deletes a society safely.
 */
export const deleteAdminSociety = async (societyId) => {
  return await api.delete(`/admin/reference/location/societies/${societyId}`);
};

/**
 * Admin Reference Property Services
 */
export const getAdminPropertyTypes = async (params = {}) => {
  return await api.get('/admin/reference/property/property-types', params);
};

/**
 * Creates a new Property Type.
 */
export const createAdminPropertyType = async (payload) => {
  return await api.post('/admin/reference/property/property-types', payload);
};

/**
 * Updates an existing Property Type.
 */
export const updateAdminPropertyType = async (propertyTypeId, payload) => {
  return await api.put(`/admin/reference/property/property-types/${propertyTypeId}`, payload);
};

/**
 * Deletes a Property Type safely.
 */
export const deleteAdminPropertyType = async (propertyTypeId) => {
  return await api.delete(`/admin/reference/property/property-types/${propertyTypeId}`);
};

/**
 * Retrieves a list of Property Uses.
 */
export const getAdminPropertyUses = async (params = {}) => {
  return await api.get('/admin/reference/property/property-use', params);
};

/**
 * Creates a new Property Use.
 */
export const createAdminPropertyUse = async (payload) => {
  return await api.post('/admin/reference/property/property-use', payload);
};

/**
 * Updates an existing Property Use.
 */
export const updateAdminPropertyUse = async (propertyUseId, payload) => {
  return await api.put(`/admin/reference/property/property-use/${propertyUseId}`, payload);
};

/**
 * Deletes a Property Use safely.
 */
export const deleteAdminPropertyUse = async (propertyUseId) => {
  return await api.delete(`/admin/reference/property/property-use/${propertyUseId}`);
};

/**
 * Admin Reference Services - PPC Service Types
 */
export const getAdminPpcServiceTypes = async (params = {}) => {
  return await api.get('/admin/reference/services/ppc-service-types', params);
};

export const createAdminPpcServiceType = async (payload) => {
  return await api.post('/admin/reference/services/ppc-service-types', payload);
};

export const updateAdminPpcServiceType = async (serviceTypeId, payload) => {
  return await api.put(`/admin/reference/services/ppc-service-types/${serviceTypeId}`, payload);
};

export const deleteAdminPpcServiceType = async (serviceTypeId) => {
  return await api.delete(`/admin/reference/services/ppc-service-types/${serviceTypeId}`);
};

/**
 * Admin Reference Services - PPC Services
 */
export const getAdminPpcServices = async (params = {}) => {
  return await api.get('/admin/reference/services/ppc-services', params);
};

export const createAdminPpcService = async (payload) => {
  return await api.post('/admin/reference/services/ppc-services', payload);
};

export const updateAdminPpcService = async (serviceId, payload) => {
  return await api.put(`/admin/reference/services/ppc-services/${serviceId}`, payload);
};

export const deleteAdminPpcService = async (serviceId) => {
  return await api.delete(`/admin/reference/services/ppc-services/${serviceId}`);
};

/**
 * Admin User Directory Services
 */
export const getAdminUsers = async (params = {}) => {
  return await api.get('/admin/users', params);
};

/**
 * Updates an existing user.
 */
export const updateAdminUser = async (userId, payload) => {
  return await api.put(`/admin/users/${userId}`, payload);
};

/**
 * Deletes a user safely.
 */
export const deleteAdminUser = async (userId) => {
  return await api.delete(`/admin/users/${userId}`);
};

/**
 * Retrieves all system roles for admin assignment.
 */
export const getAdminRoles = async (params = {}) => {
  return await api.get('/admin/roles', params);
};

export const getAdminRolePageAccess = async (roleId) => {
  return await api.get(`/admin/roles/${roleId}/page-access`);
};

export const updateAdminRolePageAccess = async (roleId, permissions) => {
  return await api.put(`/admin/roles/${roleId}/page-access`, { permissions });
};

/**
 * Admin Customer Operations Services
 */
export const getAdminCustomers = async (params = {}) => {
  return await api.get('/admin/customers', params);
};

export const getAdminCustomerStats = async () => {
  return await api.get('/admin/customers/stats');
};

export const getAdminCustomerById = async (customerId) => {
  return await api.get(`/admin/customers/${customerId}`);
};

/**
 * Admin Property Operations Services
 */
export const getAdminProperties = async (params = {}) => {
  return await api.get('/admin/properties', params);
};

export const getAdminPropertyStats = async () => {
  return await api.get('/admin/properties/stats');
};

export const getAdminPropertyById = async (propertyId) => {
  return await api.get(`/admin/properties/${propertyId}`);
};

export const updateAdminPropertyApproval = async (propertyId, { approval_stage, remarks }) => {
  return await api.patch(`/admin/properties/${propertyId}/approval`, { approval_stage, remarks });
};

export const createAdminProperty = async (propertyData) => {
  return await api.post('/admin/properties', propertyData);
};

export const uploadAdminPropertyPictures = async (propertyId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('pictures', file);
  });
  return await api.post(`/admin/properties/${propertyId}/pictures`, formData);
};

export const uploadAdminPropertyVideo = async (propertyId, file) => {
  const formData = new FormData();
  formData.append('video', file);
  return await api.post(`/admin/properties/${propertyId}/video`, formData);
};

/**
 * Admin Customer Requests Operations Services
 */
export const getAdminRequests = async (params = {}) => {
  return await api.get('/admin/requests', params);
};

export const getAdminRequestStats = async () => {
  return await api.get('/admin/requests/stats');
};

export const getAdminRequestById = async (requestId) => {
  return await api.get(`/admin/requests/${requestId}`);
};

export const updateAdminRequestStatus = async (requestId, { status, remarks }) => {
  return await api.patch(`/admin/requests/${requestId}/status`, { status, remarks });
};

/**
 * Admin Property Visits Operations Services
 */
export const getAdminVisits = async (params = {}) => {
  return await api.get('/admin/visits', params);
};

export const getAdminVisitStats = async () => {
  return await api.get('/admin/visits/stats');
};

export const getAdminVisitById = async (visitId) => {
  return await api.get(`/admin/visits/${visitId}`);
};

export const getAdminVisitOptions = async () => {
  return await api.get('/admin/visits/options');
};

export const createAdminVisit = async (payload) => {
  return await api.post('/admin/visits', payload);
};

export const rescheduleAdminVisit = async (visitId, payload) => {
  return await api.patch(`/admin/visits/${visitId}/reschedule`, payload);
};

export const completeAdminVisit = async (visitId, payload) => {
  return await api.patch(`/admin/visits/${visitId}/complete`, payload);
};

export const cancelAdminVisit = async (visitId, payload) => {
  return await api.patch(`/admin/visits/${visitId}/cancel`, payload);
};

export const updateAdminVisitRemarks = async (visitId, { remarks }) => {
  return await api.patch(`/admin/visits/${visitId}/remarks`, { remarks });
};

/**
 * Admin Property Inspections & Reports Services
 */
export const getAdminInspections = async (params = {}) => {
  return await api.get('/admin/inspections', params);
};

export const getAdminInspectionStats = async () => {
  return await api.get('/admin/inspections/stats');
};

export const getAdminInspectionById = async (inspectionId) => {
  return await api.get(`/admin/inspections/${inspectionId}`);
};

export const updateAdminInspectionFindings = async (inspectionId, payload) => {
  return await api.patch(`/admin/inspections/${inspectionId}/findings`, payload);
};

export const updateAdminInspectionChecklistItem = async (inspectionId, detailId, payload) => {
  return await api.patch(`/admin/inspections/${inspectionId}/checklist/${detailId}`, payload);
};

export const getAdminInspectionOptions = async () => {
  return await api.get('/admin/inspections/options');
};

export const createAdminInspection = async (payload) => {
  return await api.post('/admin/inspections', payload);
};

/**
 * Admin System Configuration Services
 */
export const getAdminSystemConfigurations = async (params = {}) => {
  return await api.get('/admin/system-configuration', params);
};

export const getAdminSystemConfigStats = async () => {
  return await api.get('/admin/system-configuration/stats');
};

export const updateAdminSystemConfigurations = async (settings) => {
  return await api.put('/admin/system-configuration', { settings });
};

/**
 * Admin Reference - Currencies Services
 */
export const getAdminCurrencies = async (params = {}) => {
  return await api.get('/admin/reference/finance/currencies', params);
};

export const createAdminCurrency = async (payload) => {
  return await api.post('/admin/reference/finance/currencies', payload);
};

export const updateAdminCurrency = async (currencyId, payload) => {
  return await api.put(`/admin/reference/finance/currencies/${currencyId}`, payload);
};

export const deleteAdminCurrency = async (currencyId) => {
  return await api.delete(`/admin/reference/finance/currencies/${currencyId}`);
};

/**
 * Admin Dashboard Executive Services
 */
export const getAdminDashboardOverview = async (params = {}) => {
  return await api.get('/admin/dashboard', params);
};

export const getAdminDashboardSummary = async () => {
  return await api.get('/admin/dashboard/summary');
};

export const getAdminDashboardActivity = async (params = {}) => {
  return await api.get('/admin/dashboard/activity', params);
};










