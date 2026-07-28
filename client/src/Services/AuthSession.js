/**
 * @file AuthSession.js
 * @description Single source of truth for reading and writing 
 * authenticated user session data in sessionStorage.
 */

export const LOGIN_SESSION_KEY = "PROPERTY_CARE_SESSION";

/**
 * Private helper function to safely read and parse session data from sessionStorage.
 *
 * @returns {Object|null} Parsed session object, or null if missing or invalid.
 */
const readSession = () => {
  try {
    const data = sessionStorage.getItem(LOGIN_SESSION_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Reads the complete authenticated session object.
 *
 * @returns {Object|null} Complete session object, or null if invalid or missing.
 */
export const getSession = () => {
  return readSession();
};

/**
 * Saves the complete authenticated session object into sessionStorage.
 * Validates that the input is a valid non-null, non-array object before saving.
 *
 * @param {Object} session - The session payload object to store.
 * @returns {boolean} True if saved successfully, false otherwise.
 */
export const saveSession = (session) => {
  try {
    if (!session || typeof session !== 'object' || Array.isArray(session)) {
      return false;
    }
    sessionStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};

/**
 * Removes and clears the stored session.
 *
 * @returns {boolean} True if cleared successfully, false otherwise.
 */
export const clearSession = () => {
  try {
    sessionStorage.removeItem(LOGIN_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
};

/**
 * Retrieves the current authenticated user object.
 *
 * @returns {Object|null} User object, or null if not found.
 */
export const getUser = () => {
  const session = readSession();
  return session && session.user && typeof session.user === 'object'
    ? session.user
    : null;
};

/**
 * Retrieves the authentication token from the active session.
 *
 * @returns {string|null} Token string, or null if not found.
 */
export const getToken = () => {
  const session = readSession();
  if (!session || typeof session.token !== 'string') {
    return null;
  }
  return session.token.trim() !== '' ? session.token : null;
};

/**
 * Checks whether a valid authenticated session exists by verifying that
 * a non-empty token exists in session storage and the login status flag 
 * in localStorage is set to "true".
 *
 * @returns {boolean} True if a valid session token and login flag exist, false otherwise.
 */
export const isAuthenticated = () => {
  try {
    const token = getToken();
    const hasLoginFlag = localStorage.getItem("isLoggedIn") === "true";
    return Boolean(token) && hasLoginFlag;
  } catch {
    return false;
  }
};

/**
 * Updates stored user information while preserving all other session properties.
 *
 * @param {Object} newUserData - User properties to merge into the stored user object.
 * @returns {boolean} True if update succeeded, false otherwise.
 */
export const updateUser = (newUserData) => {
  try {
    const session = readSession();
    if (!session || !newUserData || typeof newUserData !== 'object') {
      return false;
    }

    const currentUser = session.user && typeof session.user === 'object' ? session.user : {};

    const updatedSession = {
      ...session,
      user: {
        ...currentUser,
        ...newUserData
      }
    };

    return saveSession(updatedSession);
  } catch {
    return false;
  }
};
