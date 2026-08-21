import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { logoutUser } from '../../Services/auth.services';

const Logout = () => {
  const { logout } = useAuth();
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logoutUser();
      } catch (error) {
        console.error("Logout API call failed:", error);
      } finally {
        // Clear local state and session storage regardless of API success
        logout();
        setLoggedOut(true);
      }
    };

    performLogout();
  }, [logout]);

  if (loggedOut) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-xl font-semibold text-gray-600">Logging out...</div>
    </div>
  );
};

export default Logout;
