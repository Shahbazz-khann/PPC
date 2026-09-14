import api, { resolveMediaUrl } from "./Api";

export { resolveMediaUrl };

/**
 * Get current Customer profile
 */
export const getCustomerProfile = async () => {
  return await api.get("/customer/profile");
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
