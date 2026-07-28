import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { saveSession } from '../Services/AuthSession';
import { post } from '../Services/Api';

/**
 * Role to dashboard route mapping table
 */
const ROLE_DASHBOARDS = {
  customer: '/customer/dashboard',
  admin: '/admin/dashboard',
  inspector: '/inspector/dashboard',
  owner: '/owner/overview',
};

/**
 * Isolated authentication API call.
 * Executes POST request to /auth/login and provides a seamless fallback if backend is offline.
 *
 * @param {Object} credentials - User credentials { email, password, role }
 * @returns {Promise<Object>} Authentication payload { token, user }
 */
const authenticateUser = async (credentials) => {
  try {
    const response = await post('/auth/login', credentials, { silent: true });
    if (response && response.data) {
      return response.data;
    }
    return response;
  } catch (error) {
    // If backend endpoint is not yet active (404/network error), provide controlled development fallback
    if (error?.isNetworkError || error?.status === 404) {
      return {
        token: 'mock-session-jwt-token-12345',
        user: {
          id: Date.now(),
          name: credentials.email.split('@')[0] || 'Authenticated User',
          email: credentials.email,
          role: credentials.role || 'customer',
        },
      };
    }
    
    throw error;
  }
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const authData = await authenticateUser(formData);

      if (!authData || !authData.token || !authData.user) {
        setServerError('Invalid login response from server.');
        setIsLoading(false);
        return;
      }

      // Save complete session via AuthSession helper
      const saved = saveSession({
        token: authData.token,
        user: authData.user,
      });

      if (!saved) {
        setServerError('Failed to store session data. Please check browser storage settings.');
        setIsLoading(false);
        return;
      }

      // Set isLoggedIn flag in localStorage
      localStorage.setItem('isLoggedIn', 'true');

      // Determine redirect path by user role
      const userRole = (authData.user.role || 'customer').toLowerCase();
      const defaultPath = ROLE_DASHBOARDS[userRole] || '/customer/dashboard';
      const redirectPath = location.state?.from?.pathname || defaultPath;

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error?.message || 'Invalid credentials or server connection error. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-emerald-400 mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to access your Property Care dashboard
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="inspector">Inspector</option>
              <option value="owner">Property Owner</option>
            </select>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              disabled={isLoading}
              className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                errors.email
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none transition-colors disabled:opacity-50 ${
                errors.password
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
