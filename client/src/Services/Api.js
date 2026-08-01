// /**
//  * @file Api.js
//  * @description Enterprise HTTP API client for backend communication.
//  * Architecture adopted from enterprise React patterns (Cliff project).
//  * 
//  * Features:
//  * 1. Environment Configuration (BASE_URL & API_BASE via Vite env vars)
//  * 2. Centralized Authentication Header Attachment via AuthSession
//  * 3. Reusable Request Configuration (JSON & FormData handling)
//  * 4. Generic Request Handler (GET, POST, PUT, PATCH, DELETE, File Uploads)
//  * 5. Standardized ApiResponse and ApiError Classes
//  * 6. HTTP 401 Unauthorized session clearing & redirect hooks
//  * 7. Global API Loader Integration Placeholders
//  * 8. Silent Request Support ({ silent: true })
//  * 9. Separation of Concerns (pure utility, framework-agnostic)
//  */

// import { getToken, clearSession } from './AuthSession';

// // ----------------------------------------------------------------------
// // 1. Environment Configuration
// // ----------------------------------------------------------------------

// /** Base domain / host configuration */
// export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// /** Full API prefix path used across all service endpoints */
// export const API_BASE = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

// // ----------------------------------------------------------------------
// // 5. Standard Response & Error Objects
// // ----------------------------------------------------------------------

// /**
//  * Standardized API Response class representing successful responses.
//  */
// export class ApiResponse {
//   constructor(data, status = 200, message = 'Success') {
//     this.success = true;
//     this.data = data;
//     this.status = status;
//     this.message = message;
//   }
// }

// /**
//  * Standardized API Error class for network, HTTP 4xx/5xx, and server errors.
//  */
// export class ApiError extends Error {
//   constructor(message, status = 500, data = null, isNetworkError = false) {
//     super(message);
//     this.name = 'ApiError';
//     this.success = false;
//     this.status = status;
//     this.data = data;
//     this.isNetworkError = isNetworkError;
//   }
// }

// // ----------------------------------------------------------------------
// // 7 & 8. Global API Loader & Silent Request Support
// // ----------------------------------------------------------------------

// /**
//  * Global Loader Start Integration Placeholder.
//  * If a global loader store is integrated in the future, trigger loader start here
//  * unless options.silent is set to true.
//  *
//  * @param {boolean} silent - Whether to suppress global loader
//  */
// const startGlobalLoader = (silent = false) => {
//   if (silent) return;
//   // TODO: Integrate global loader store (e.g., useLoaderStore.getState().showLoader())
// };

// /**
//  * Global Loader Stop Integration Placeholder.
//  * Trigger loader stop here unless options.silent is set to true.
//  *
//  * @param {boolean} silent - Whether to suppress global loader
//  */
// const stopGlobalLoader = (silent = false) => {
//   if (silent) return;
//   // TODO: Integrate global loader store (e.g., useLoaderStore.getState().hideLoader())
// };

// // ----------------------------------------------------------------------
// // 2 & 3. Centralized Authentication & Reusable Request Configuration
// // ----------------------------------------------------------------------

// /**
//  * Prepares unified Headers for outgoing API requests.
//  * Automatically attaches Authorization Bearer token if session exists.
//  * Manages Content-Type header appropriately (omits for FormData).
//  *
//  * @param {Object} customHeaders - Optional custom or override headers.
//  * @param {boolean} isFormData - Flag indicating body is FormData.
//  * @returns {Headers} Configured Headers object.
//  */
// const buildHeaders = (customHeaders = {}, isFormData = false) => {
//   const headers = new Headers();

//   if (!isFormData) {
//     headers.set('Content-Type', 'application/json');
//   }

//   // Merge custom headers
//   Object.entries(customHeaders).forEach(([key, value]) => {
//     if (value !== undefined && value !== null) {
//       headers.set(key, value);
//     }
//   });

//   // Centralized Auth Token attachment via AuthSession helper
//   const token = getToken();
//   if (token && !headers.has('Authorization')) {
//     headers.set('Authorization', `Bearer ${token}`);
//   }

//   return headers;
// };

// /**
//  * Formats relative API endpoints into full URLs using API_BASE.
//  *
//  * @param {string} endpoint - Relative endpoint or absolute URL string.
//  * @returns {string} Fully qualified URL string.
//  */
// const resolveUrl = (endpoint) => {
//   if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
//     return endpoint;
//   }
//   const cleanBase = API_BASE.replace(/\/+$/, '');
//   const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
//   return `${cleanBase}${cleanEndpoint}`;
// };

// // ----------------------------------------------------------------------
// // 6. Unauthorized (401) Session Handling
// // ----------------------------------------------------------------------

// /**
//  * Handles HTTP 401 Unauthorized responses.
//  * Clears authentication session storage and local login state.
//  * Prepared for future login redirect integration.
//  */
// const handleUnauthorized = () => {
//   clearSession();
//   try {
//     localStorage.removeItem('isLoggedIn');
//   } catch {
//     // Safe fallback for restricted browser storage environments
//   }
//   // TODO: Trigger global auth event or login redirect if required (e.g. window.dispatchEvent(new Event('auth:unauthorized')))
// };

// // ----------------------------------------------------------------------
// // 4. Generic Request Handler
// // ----------------------------------------------------------------------

// /**
//  * Core generic request handler for executing HTTP requests.
//  *
//  * @param {string} endpoint - Relative API endpoint path.
//  * @param {Object} [options={}] - Request options (method, headers, body, silent, etc.).
//  * @returns {Promise<ApiResponse>} Standardized ApiResponse instance.
//  * @throws {ApiError} Standardized ApiError instance.
//  */
// export const request = async (endpoint, options = {}) => {
//   const {
//     method = 'GET',
//     headers: customHeaders = {},
//     body = null,
//     silent = false,
//     ...restOptions
//   } = options;

//   const url = resolveUrl(endpoint);
//   const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
//   const headers = buildHeaders(customHeaders, isFormData);

//   let requestBody = body;
//   if (body && !isFormData && typeof body === 'object') {
//     requestBody = JSON.stringify(body);
//   }

//   const config = {
//     method,
//     headers,
//     body: requestBody,
//     ...restOptions,
//   };

//   startGlobalLoader(silent);

//   try {
//     const response = await fetch(url, config);

//     // Safely parse JSON or text response payload
//     let responseData = null;
//     const contentType = response.headers.get('content-type');
//     if (contentType && contentType.includes('application/json')) {
//       responseData = await response.json().catch(() => null);
//     } else {
//       responseData = await response.text().catch(() => null);
//     }

//     // Handle HTTP 401 Unauthorized
//     if (response.status === 401) {
//       handleUnauthorized();
//     }

//     // Handle HTTP Status Errors (4xx / 5xx)
//     if (!response.ok) {
//       const errorMessage =
//         (responseData && typeof responseData === 'object' && (responseData.message || responseData.error)) ||
//         `HTTP Error ${response.status}: ${response.statusText}`;

//       throw new ApiError(errorMessage, response.status, responseData, false);
//     }

//     const message = (responseData && typeof responseData === 'object' && responseData.message) || 'Success';
//     return new ApiResponse(responseData, response.status, message);
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw error;
//     }

//     // Network failures, CORS issues, or server unreachable
//     throw new ApiError(
//       error?.message || 'Network error or backend server unavailable.',
//       0,
//       null,
//       true
//     );
//   } finally {
//     stopGlobalLoader(silent);
//   }
// };

// // ----------------------------------------------------------------------
// // Reusable HTTP Methods
// // ----------------------------------------------------------------------

// export const get = (endpoint, options = {}) => {
//   return request(endpoint, { ...options, method: 'GET' });
// };

// export const post = (endpoint, body = null, options = {}) => {
//   return request(endpoint, { ...options, method: 'POST', body });
// };

// export const put = (endpoint, body = null, options = {}) => {
//   return request(endpoint, { ...options, method: 'PUT', body });
// };

// export const patch = (endpoint, body = null, options = {}) => {
//   return request(endpoint, { ...options, method: 'PATCH', body });
// };

// export const del = (endpoint, options = {}) => {
//   return request(endpoint, { ...options, method: 'DELETE' });
// };

// /**
//  * File upload helper accepting FormData payloads.
//  */
// export const upload = (endpoint, formData, options = {}) => {
//   return request(endpoint, {
//     ...options,
//     method: 'POST',
//     body: formData,
//   });
// };

// // Backward-compatibility aliases
// export const remove = del;
// export const deleteRequest = del;

// const api = {
//   BASE_URL,
//   API_BASE,
//   ApiResponse,
//   ApiError,
//   request,
//   get,
//   post,
//   put,
//   patch,
//   del,
//   remove,
//   deleteRequest,
//   upload,
// };

// export default api;
import { getToken } from "./AuthSession";

const BASE_URL = import.meta.env.VITE_API_BASE;

/**
 * Creates the configuration for API requests.
 * Automatically attaches the authenticated user's JWT token.
 */
const createRequestConfig = ({ headers = {} }) => {
  const token = getToken();

  return {
    headers: {
      "Content-Type": "application/json",
      ...headers,

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  };
};

/**
 * Central API request function.
 */
export const sendApiRequest = async ({
  url,
  method = "GET",
  data = {},
  headers = {},
}) => {
  try {
    const config = createRequestConfig({ headers });

    // GET and HEAD requests don't need a request body
    if (method !== "GET" && method !== "HEAD") {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, {
      method,
      ...config,
    });

    const responseData = await response.json();

    // Handle API errors
    if (!response.ok) {
      throw new Error(
        responseData.message || "Something went wrong"
      );
    }

    return responseData;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Reusable API methods.
 */
const api = {
  get: (url, params = {}) =>
    sendApiRequest({
      url,
      method: "GET",
      ...params,
    }),

  post: (url, data = {}, params = {}) =>
    sendApiRequest({
      url,
      method: "POST",
      data,
      ...params,
    }),

  put: (url, data = {}, params = {}) =>
    sendApiRequest({
      url,
      method: "PUT",
      data,
      ...params,
    }),

  patch: (url, data = {}, params = {}) =>
    sendApiRequest({
      url,
      method: "PATCH",
      data,
      ...params,
    }),

  delete: (url, params = {}) =>
    sendApiRequest({
      url,
      method: "DELETE",
      ...params,
    }),
};

export default api;