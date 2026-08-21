import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUser } from '../../Services/AuthSession';

/**
 * GuestRoute Component
 * 
 * Route guard component for public-only pages (e.g., login, register).
 * - If the user is unauthenticated, it renders the child routes via <Outlet />.
 * - If the user is authenticated, it redirects them to their respective role dashboard.
 */
const GuestRoute = () => {
  const isAuth = isAuthenticated();
  const user = getUser();

  if (isAuth && user) {
    const userRole = user.role_name?.trim().toLowerCase();
    const roleDashboardMap = {
      customer: '/customer/dashboard',
      owner: '/owner/dashboard',
      inspector: '/inspector/dashboard',
      admin: '/admin/dashboard'
    };

    const redirectPath = userRole && roleDashboardMap[userRole] ? roleDashboardMap[userRole] : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Render child routes if unauthenticated
  return <Outlet />;
};

export default GuestRoute;
