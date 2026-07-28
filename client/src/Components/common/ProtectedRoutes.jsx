import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../Services/AuthSession';

/**
 * ProtectedRoute Component
 * 
 * Route guard component that restricts access to authenticated users.
 * - If the user is authenticated (valid session token and login flag), renders child routes via <Outlet />.
 * - If the user is unauthenticated, redirects to "/login" and preserves the target location in route state.
 */
const ProtectedRoute = () => {
  const location = useLocation();

  // Verify authentication status via AuthSession helper
  const isAuth = isAuthenticated();

  // Render child routes if session is valid
  if (isAuth) {
    return <Outlet />;
  }

  // Redirect to login and store attempted location in route state for post-login navigation
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
