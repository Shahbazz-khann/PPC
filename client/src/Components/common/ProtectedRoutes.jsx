import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../../Services/AuthSession';

/**
 * ProtectedRoute Component
 * 
 * Route guard component that restricts access to authenticated users.
 * - If the user is authenticated (valid session token and login flag), renders child routes via <Outlet />.
 * - If the user is unauthenticated, redirects to "/login" and preserves the target location in route state.
 * - If allowedRoles is provided, it restricts access based on the user's role_name.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();

  // Verify authentication status via AuthSession helper
  const isAuth = isAuthenticated();
  const user = getUser();

  if (!isAuth) {
    // Redirect to login and store attempted location in route state for post-login navigation
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if allowedRoles are specified
  if (allowedRoles && user) {
    const userRole = user.role_name?.trim().toLowerCase();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User is authenticated but doesn't have the required role.
      // Redirect to their respective dashboard or a default route.
      const roleDashboardMap = {
        user: '/user/dashboard',
        customer: '/customer/dashboard',
        owner: '/owner/dashboard',
        inspector: '/inspector/dashboard',
        admin: '/admin/dashboard'
      };
      
      const redirectPath = userRole && roleDashboardMap[userRole] ? roleDashboardMap[userRole] : '/login';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // Render child routes if session is valid and authorized
  return <Outlet />;
};

export default ProtectedRoute;
