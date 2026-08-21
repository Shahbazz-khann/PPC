import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSession,
  saveSession,
  clearSession,
  updateUser,
  getToken,
} from '../Services/AuthSession';
import { getCurrentUser } from '../Services/auth.services';

/**
 * @file AuthContext.jsx
 * @description Reactive authentication state for the application.
 *
 * Architecture:
 *   AuthSession.js  → sessionStorage persistence (source of truth on reload)
 *   AuthContext     → React state (reactive, drives UI)
 *   auth.services   → GET /auth/me for fresh user profile
 *
 * AuthContext reads initial state from AuthSession on mount so UI loads immediately.
 * On init, if a valid session token exists, it calls GET /auth/me to refresh
 * user details with authoritative database data.
 */

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the application and provides reactive auth state.
 */
export const AuthProvider = ({ children }) => {
  // Initialize from existing session so refreshes preserve the logged-in state immediately
  const [session, setSession] = useState(() => {
    const stored = getSession();
    return stored || { token: null, user: null };
  });

  /**
   * Called by Login.jsx after a successful API response.
   * Persists the session to sessionStorage AND updates React state.
   *
   * @param {{ token: string, user: object }} sessionData
   */
  const login = (sessionData) => {
    saveSession(sessionData);
    setSession(sessionData);
  };

  /**
   * Called by logout pages/components or when auth token is invalid/expired.
   * Clears sessionStorage AND resets React state.
   */
  const logout = () => {
    clearSession();
    localStorage.removeItem('isLoggedIn');
    setSession({ token: null, user: null });
  };

  /**
   * On mount (or when session token exists), fetch fresh user data from GET /auth/me.
   */
  useEffect(() => {
    const activeToken = getToken() || session.token;
    if (!activeToken) return;

    let isMounted = true;

    const fetchLatestUser = async () => {
      try {
        const response = await getCurrentUser();

        if (!isMounted) return;

        if (response?.success && response?.data) {
          const freshUser = response.data;

          // 1. Update stored session user in sessionStorage
          updateUser(freshUser);

          // 2. Update React state with latest backend user data while keeping token
          setSession((prev) => ({
            ...prev,
            user: freshUser,
          }));
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('AuthContext: Failed to fetch /auth/me:', error);

        const errorMsg = (error?.message || '').toLowerCase();
        const status = error?.status || error?.response?.status;

        const isAuthInvalid =
          status === 401 ||
          status === 403 ||
          errorMsg.includes('unauthorized') ||
          errorMsg.includes('invalid token') ||
          errorMsg.includes('token expired') ||
          errorMsg.includes('authentication failed') ||
          errorMsg.includes('authenticated user not found') ||
          errorMsg.includes('token is required') ||
          errorMsg.includes('invalid authentication');

        if (isAuthInvalid) {
          logout();
        }
      }
    };

    fetchLatestUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    user: session.user || null,
    token: session.token || null,
    isAuthenticated: Boolean(session.token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook — consume auth state anywhere in the tree.
 *
 * @returns {{ user, token, isAuthenticated, login, logout }}
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;
