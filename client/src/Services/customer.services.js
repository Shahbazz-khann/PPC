import api from "./Api";

/**
 * Fetch customer's nearest upcoming visit
 */
export const getUpcomingVisit = async () => {
  return await api.get("/customer/visits/upcoming");
};

/**
 * Fetch customer's recent activities
 */
export const getRecentActivities = async () => {
  return await api.get("/customer/activity/recent");
};

/**
 * Fetch customer's visits list with optional tab, status, and pagination
 * @param {Object} params - { tab, status, page, limit }
 */
export const getCustomerVisits = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/customer/visits?${queryString}` : '/customer/visits';

  return await api.get(url);
};
