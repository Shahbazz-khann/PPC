import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../../Services/AuthSession';

/**
 * GuestRoute Component
 * 
 * Route guard component for public-only pages (e.g., login, register).
 * - If the user is unauthenticated, it renders the child routes via <Outlet />.
 * - If the user is authenticated, it redirects them to the home page.
 */
const GuestRoute = () => {
  const isAuth = isAuthenticated();

  if (isAuth) {
    return <Navigate to="/" replace />;
  }

  // Render child routes if unauthenticated
  return <Outlet />;
};

export default GuestRoute;
