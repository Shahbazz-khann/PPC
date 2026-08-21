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

/**
 * Fetch customer's transaction summary
 */
export const getTransactionSummary = async () => {
  return await api.get("/customer/transactions/summary");
};

/**
 * Fetch customer's transactions list with optional search, status, type, sort, and pagination
 * @param {Object} params - { search, status, transaction_type, sort, page, limit }
 */
export const getTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/customer/transactions?${queryString}` : '/customer/transactions';

  return await api.get(url);
};

/**
 * Fetch a single transaction details by ID
 * @param {string|number} transactionId 
 */
export const getTransactionById = async (transactionId) => {
  return await api.get(`/customer/transactions/${transactionId}`);
};

/**
 * Fetch customer's inspection reports summary
 */
export const getInspectionReportSummary = async () => {
  return await api.get("/customer/inspection-reports/summary");
};

/**
 * Fetch customer's inspection reports list with optional filters and pagination
 * @param {Object} params - { search, status, result, sort, page, limit }
 */
export const getInspectionReports = async (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const url = queryString ? `/customer/inspection-reports?${queryString}` : '/customer/inspection-reports';

  return await api.get(url);
};

/**
 * Fetch a single inspection report details by ID
 * @param {string|number} reportId 
 */
export const getInspectionReportById = async (reportId) => {
  return await api.get(`/customer/inspection-reports/${reportId}`);
};

/**
 * Update customer profile
 * @param {Object} data 
 */
export const updateCustomerProfile = async (data) => {
  return await api.patch("/customer/settings/profile", data);
};

/**
 * Change customer password
 * @param {Object} data - { current_password, new_password, confirm_password }
 */
export const changeCustomerPassword = async (data) => {
  return await api.patch("/customer/settings/password", data);
};
