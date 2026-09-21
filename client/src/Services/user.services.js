import api from './Api';

/**
 * ============================================================================
 * UNIFIED USER SERVICES (Phase 3A)
 * Maps frontend features to the unified /api/v1/user/* endpoints
 * ============================================================================
 */

/**
 * -----------------------------------------------------------------------------
 * SETTINGS (Unified)
 * -----------------------------------------------------------------------------
 */
export const updateProfile = async (profileData) => {
  return await api.patch('/user/settings/profile', profileData);
};

export const changePassword = async (data) => {
  return await api.patch('/user/settings/password', data);
};

/**
 * -----------------------------------------------------------------------------
 * SELLING (Owner capabilities)
 * -----------------------------------------------------------------------------
 */
export const getSellingDashboardSummary = async () => {
  return await api.get('/user/selling/dashboard/summary');
};

export const getSellingVerificationSummary = async () => {
  return await api.get('/user/selling/property-verification/summary');
};

export const getSellingPropertyVerifications = async (params = {}) => {
  return await api.get('/user/selling/property-verification', { params });
};

export const getSellingUpcomingVisits = async (page = 1, limit = 10) => {
  return await api.get(`/user/selling/visits/upcoming?page=${page}&limit=${limit}`);
};

export const getSellingInspectionOverview = async () => {
  return await api.get('/user/selling/inspections/overview');
};

export const getSellingRecentActivity = async () => {
  return await api.get('/user/selling/activity');
};

export const getSellingProperties = async (params = {}) => {
  return await api.get('/user/selling/properties', { params });
};

export const getSellingPropertiesSummary = async () => {
  return await api.get('/user/selling/properties/summary');
};

export const getSellingPropertyDetails = async (propertyId) => {
  return await api.get(`/user/selling/properties/${propertyId}`);
};

export const createSellingProperty = async (propertyData) => {
  return await api.post('/user/selling/properties', propertyData);
};

export const uploadSellingPropertyMedia = async (propertyId, formData) => {
  return await api.post(`/user/selling/properties/${propertyId}/media`, formData);
};

export const getSellingInspectionsSummary = async () => {
  return await api.get('/user/selling/inspections/summary');
};

export const getSellingInspectionsList = async (params = {}) => {
  return await api.get('/user/selling/inspections', { params });
};

export const getSellingInspectionDetails = async (inspectionId) => {
  return await api.get(`/user/selling/inspections/${inspectionId}`);
};

export const getSellingVisitsSummary = async () => {
  return await api.get('/user/selling/visits/summary');
};

export const getSellingVisitsList = async (params = {}) => {
  return await api.get('/user/selling/visits', { params });
};

export const getSellingVisitDetails = async (visitId) => {
  return await api.get(`/user/selling/visits/${visitId}`);
};

export const getSellingTransactionSummary = async () => {
  return await api.get('/user/selling/transactions/summary');
};

export const getSellingTransactionOverview = async () => {
  return await api.get('/user/selling/transactions/overview');
};

export const getSellingTransactions = async (params = {}) => {
  return await api.get('/user/selling/transactions', { params });
};

export const getSellingTransactionDetails = async (transactionId) => {
  return await api.get(`/user/selling/transactions/${transactionId}`);
};

export const getSellingInvoiceSummary = async () => {
  return await api.get('/user/selling/invoices/summary');
};

export const getSellingInvoiceDetails = async (invoiceId) => {
  return await api.get(`/user/selling/invoices/${invoiceId}`);
};

export const getSellingFinancialSummary = async () => {
  return await api.get('/user/selling/financial-summary');
};

export const getSellingPropertyVerificationDetails = async (propertyId) => {
  return await api.get(`/user/selling/property-verification/${propertyId}`);
};

/**
 * -----------------------------------------------------------------------------
 * BUYING (Customer capabilities)
 * -----------------------------------------------------------------------------
 */
export const getBuyingUpcomingVisit = async () => {
  return await api.get("/user/buying/visits/upcoming");
};

export const getBuyingRecentActivities = async () => {
  return await api.get("/user/buying/activity");
};

export const getBuyingVisits = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  const url = queryString ? `/user/buying/visits?${queryString}` : '/user/buying/visits';
  return await api.get(url);
};

export const getBuyingTransactionSummary = async () => {
  return await api.get("/user/buying/transactions/summary");
};

export const getBuyingTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  const url = queryString ? `/user/buying/transactions?${queryString}` : '/user/buying/transactions';
  return await api.get(url);
};

export const getBuyingTransactionById = async (transactionId) => {
  return await api.get(`/user/buying/transactions/${transactionId}`);
};

export const getBuyingInspectionReportSummary = async () => {
  return await api.get("/user/buying/inspection-reports/summary");
};

export const getBuyingInspectionReports = async (params = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      queryParams.append(key, value);
    }
  });
  const queryString = queryParams.toString();
  const url = queryString ? `/user/buying/inspection-reports?${queryString}` : '/user/buying/inspection-reports';
  return await api.get(url);
};

export const getBuyingInspectionReportById = async (reportId) => {
  return await api.get(`/user/buying/inspection-reports/${reportId}`);
};
