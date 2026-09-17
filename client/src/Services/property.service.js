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

/**
 * Fetch public properties for landing page/search
 * @param {Object} params - { intent, city, propertyType, minPrice, maxPrice, limit }
 */
export const getPublicProperties = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/public/properties/search?${queryString}` : '/public/properties/search';

  return await api.get(url);
};

/**
 * Fetch dynamic filters for public properties
 * @param {Object} params - optional params e.g. { city, society }
 */
export const getPublicPropertyFilters = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/public/properties/filters?${queryString}` : '/public/properties/filters';

  return await api.get(url);
};
