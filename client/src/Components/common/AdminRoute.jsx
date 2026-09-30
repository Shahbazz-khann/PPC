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

const AdminRoute = () => {
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
  const isAdmin = roles.some(r => r.toLowerCase() === 'admin');

  if (!isEmployee || !isAdmin) {
    // Return unauthorized access to home or customer dashboard if customer
    if (userType?.toLowerCase() === 'customer') {
       return <Navigate to="/customer/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
