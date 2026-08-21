import api from "./Api";

/**
 * Fetch all active properties with optional query filters
 * @param {Object} params - { search, purpose, property_type, city, min_price, max_price, bedrooms, bathrooms, area_unit, min_area, max_area, sort, page, limit }
 */
export const getProperties = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/properties?${queryString}` : '/properties';

  return await api.get(url);
};

/**
 * Fetch single property details by property ID
 * @param {number|string} propertyId
 */
export const getPropertyById = async (propertyId) => {
  return await api.get(`/properties/${propertyId}`);
}; 
