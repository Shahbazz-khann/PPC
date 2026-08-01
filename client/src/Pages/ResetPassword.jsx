import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../Services/auth.services';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Home,
  Headphones,
} from 'lucide-react';

import bgImage from '../assets/FaisalMosque.png';
import logoImg from '../assets/Logo.png';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const response = await resetPassword({
        token: tokenParam,
        password: data.password,
      });

      console.log('Reset password response:', response);
      navigate('/login');

    } catch (error) {
      console.error('Reset password error:', error);

      setError('password', {
        type: 'server',
        message: error.message || 'Unable to reset password.',
      });
    }
  };

  return (
    <div className="relative min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans antialiased overflow-x-hidden lg:overflow-hidden">
      
      {/* FULL-PAGE Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/30 z-0" />

      {/* LEFT SECTION - Hero Branding */}
      <div className="relative lg:w-[58%] min-h-[350px] sm:min-h-[480px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white z-10">

        {/* Top-Left PPC Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src={logoImg}
            alt="PPC Logo"
            className="w-40 sm:w-48 h-auto drop-shadow-md"
          />
        </div>

        {/* Lower-Left Main Text */}
        <div className="relative z-10 my-8 sm:my-12 lg:my-auto max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Find. Buy. Rent.
          </h2>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#C59B27] tracking-tight mt-1 leading-tight">
            Your Perfect Property
          </h2>

          <p className="text-gray-200 text-sm sm:text-base leading-relaxed mt-4 max-w-lg font-normal drop-shadow-sm">
            Pakistan Property Care is your trusted platform
            <br />
            to discover verified properties with ease.
          </p>
        </div>

        {/* Bottom-Left Feature Badges */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-4 border-t border-white/10">

          {/* Feature 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                Trusted &amp; Secure
              </h4>

              <p className="text-[11px] text-gray-300">
                Verified by our team
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
              <Home className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                Wide Range
              </h4>

              <p className="text-[11px] text-gray-300">
                Residential &amp; Commercial
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">
                24/7 Support
              </h4>

              <p className="text-[11px] text-gray-300">
                We are here to help
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SECTION - Authentication Card */}
      <div className="relative lg:w-[42%] flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">

        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-800 my-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
              Reset Password
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
              Create a new strong password for your account.
            </p>
          </div>

          {!tokenParam ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <ShieldCheck className="w-8 h-8 text-red-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2 tracking-tight">Invalid Reset Link</h4>
              <p className="text-sm text-gray-500 mb-6 px-2">
                This password reset link is invalid or missing the security token. Please request a new link.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex py-2.5 px-6 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200"
              >
                Go to Forgot Password
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                New Password
              </label>

              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a new password"
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  {...register('password', {
                    required: 'Password is required.',

                    setValueAs: (value) =>
                      typeof value === 'string'
                        ? value.trim()
                        : value,

                    minLength: {
                      value: 8,
                      message: 'Minimum 8 characters.',
                    },

                    maxLength: {
                      value: 128,
                      message: 'Maximum 128 characters.',
                    },

                    validate: (value) => {
                      if (
                        !/[A-Z]/.test(value) ||
                        !/[a-z]/.test(value) ||
                        !/\d/.test(value) ||
                        !/[^a-zA-Z\d]/.test(value)
                      ) {
                        return 'Password must contain:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character';
                      }
                      return true;
                    },
                  })}
                />

                {/* Show / Hide Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
                <p className="text-red-500 text-xs mt-1 font-medium whitespace-pre-line">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Confirm Password
              </label>

              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password.',
                    validate: (value) =>
                      value === password || 'Passwords do not match.',
                  })}
                />

                {/* Show / Hide Confirm Password */}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

          </form>
          )}

          {/* Login Navigation */}
          <div className="flex items-center justify-center mt-6 pt-5 border-t border-gray-100">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              Remember your password?{' '}

              <Link
                to="/login"
                className="text-[#B8860B] hover:text-[#966d09] font-semibold transition-colors ml-1"
              >
                Login
              </Link>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
