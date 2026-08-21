import api from "./Api";

/**
 * Login user
 */
export const loginUser = async (loginData) => {
  return await api.post("/auth/login", loginData);
};

/**
 * Register new user
 */
export const signupUser = async (signupData) => {
  return await api.post("/auth/signup", signupData);
};

/**
 * Verify user email
 */
export const verifyEmail = async (verifyData) => {
  return await api.post("/auth/verify-email", verifyData);
};

/**
 * Request password reset
 */
export const forgotPassword = async (email) => {
  return await api.post("/auth/forgot-password", {
    email,
  });
};

/**
 * Reset user password
 */
export const resetPassword = async (resetData) => {
  return await api.post("/auth/reset-password", resetData);
};

/**
 * Get current logged in user profile
 */
export const getCurrentUser = async () => {
  return await api.get("/auth/me");
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  return await api.post("/auth/logout");
};