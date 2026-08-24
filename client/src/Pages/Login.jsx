import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Home,
  Headphones,
} from 'lucide-react';

import bgImage from '../assets/FaisalMosque.png';
import logoImg from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';

// import { loginUser } from '../services/auth.services';
// import { saveSession } from '../services/AuthSession';
import { loginUser } from '../Services/auth.services';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  /**
   * Login handler
   */
  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);

      console.log('FULL LOGIN RESPONSE:', response);
      console.log('TOKEN:', response?.token);
      console.log('USER:', response?.data);

      if (response?.success) {
        // login() persists to sessionStorage AND updates React state (Sidebar reacts)
        login({
          token: response.token,
          user: response.data,
        });

        localStorage.setItem('isLoggedIn', 'true');

        console.log('Login session saved successfully');

        // Role-based redirect using role_name from backend response
        const role = response.data?.role_name?.trim().toLowerCase();

        if (role === 'customer') {
          navigate('/customer/dashboard');
        } else if (role === 'owner') {
          navigate('/owner/dashboard');
        } else if (role === 'inspector') {
          navigate('/inspector/dashboard');
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          console.error('Login: unknown or missing role_name:', response.data?.role_name);
          setError('email', {
            type: 'server',
            message: 'Login succeeded but your account role could not be determined. Please contact support.',
          });
        }
      }

    } catch (error) {
      console.error('Login error:', error);

      setError('email', {
        type: 'server',
        message: error?.message || 'Invalid email or password',
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row font-sans antialiased overflow-x-hidden">

      {/* FULL-PAGE Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/30 lg:bg-transparent z-0" />

      {/* LEFT SECTION - Hero Branding */}
      <div className="relative lg:w-1/2 w-full p-5 sm:p-8 lg:p-12 text-white z-10 lg:h-screen lg:sticky lg:top-0">
        <div className="w-full max-w-xl lg:ml-auto lg:mr-4 xl:mr-12 flex flex-col lg:justify-between h-full gap-6 sm:gap-8 lg:gap-0">

          {/* Top-Left PPC Branding */}
          <div className="relative z-10 flex items-center gap-3.5 pt-2 sm:pt-0">
            <img
              src={logoImg}
              alt="PPC Logo"
              className="w-32 sm:w-40 lg:w-48 h-auto drop-shadow-md"
            />
          </div>

          {/* Lower-Left Main Text */}
          <div className="relative z-10 my-4 sm:my-8 lg:my-auto max-w-xl">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Find, Buy, Rent,
            </h2>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#C59B27] tracking-tight mt-1 leading-tight">
              Your Perfect Property
            </h2>

            <p className="text-gray-200 text-xs sm:text-base leading-relaxed mt-3 sm:mt-4 max-w-lg font-normal drop-shadow-sm">
              Pakistan Property Care is your trusted platform
              <br className="hidden sm:block" />
              to discover verified properties with ease.
            </p>
          </div>

          {/* Bottom-Left Feature Badges */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-4 border-t border-white/10 pb-4 sm:pb-0">

            {/* Feature 1 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  Trusted &amp; Secure
                </h4>

                <p className="text-[10px] sm:text-[11px] text-gray-300">
                  Verified by our team
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  Wide Range
                </h4>

                <p className="text-[10px] sm:text-[11px] text-gray-300">
                  Residential &amp; Commercial
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  24/7 Support
                </h4>

                <p className="text-[10px] sm:text-[11px] text-gray-300">
                  We are here to help
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* RIGHT SECTION - Authentication Card */}
        <div className="relative lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 z-10 pb-12 sm:pb-16 min-h-screen">

          <div className="w-full max-w-[520px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 text-gray-800 my-auto mx-auto lg:mx-0 lg:mr-auto lg:ml-4 xl:ml-12 border border-gray-100">

            {/* Header */}
            <div className="text-center mb-5 sm:mb-6">
              <h3 className="text-xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
                Welcome Back
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5 font-medium">
                Login to your PPC account
              </p>
            </div>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address
                </label>

                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-2.5 border border-gray-200 rounded-xl text-base sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                    autoComplete="email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    {...register('email', {
                      required: 'Email is required.',

                      setValueAs: (value) =>
                        typeof value === 'string'
                          ? value.trim()
                          : value,

                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address.',
                      },
                    })}
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password
                </label>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-2.5 sm:py-2.5 border border-gray-200 rounded-xl text-base sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                    autoComplete="current-password"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    {...register('password', {
                      required: 'Password is required.',

                      setValueAs: (value) =>
                        typeof value === 'string'
                          ? value.trim()
                          : value,

                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters.',
                      },

                      maxLength: {
                        value: 128,
                        message: 'Password cannot exceed 128 characters.',
                      },
                    })}
                  />

                  {/* Show / Hide Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right pt-0.5">
                <Link
                  to="/forgot-password"
                  className="inline-block py-1 text-[11px] sm:text-xs font-semibold text-[#B8860B] hover:text-[#966d09] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

            </form>

            {/* Sign Up */}
            <div className="flex items-center justify-center mt-6 pt-5 border-t border-gray-100">
              <span className="text-[11px] sm:text-sm text-gray-600 font-medium">
                Don't have an account?{' '}

                <Link
                  to="/signup"
                  className="inline-block p-1 text-[#B8860B] hover:text-[#966d09] font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </span>
            </div>

          </div>
        </div>
      </div>
      );
};

      export default Login;