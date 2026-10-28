import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { isAuthenticated, getToken } from '../../Services/AuthSession';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

/**
 * CustomerRoute Component
 *
 * Route guard that ensures only authenticated Customer accounts can access customer routes.
 * If an Employee or Admin accesses a customer route, redirects them to /admin/dashboard.
 * If unauthenticated, redirects to /login.
 */
const CustomerRoute = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isAuth = isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const token = getToken();
  let roles = user?.roles || [];
  let userType = user?.user_type || user?.user_type_english;

  if (token && (!roles || roles.length === 0)) {
    const decoded = parseJwt(token);
    if (decoded) {
      roles = decoded.roles || [];
      if (!userType) userType = decoded.user_type;
    }
  }

  const isEmployee = userType?.toLowerCase() === 'employee';
  const isAdmin = roles.some(r => r && r.toLowerCase() === 'admin');

  // If user is Admin or Employee, redirect them to admin operations dashboard
  if (isEmployee || isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
