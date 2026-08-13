import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../Services/auth.services';
import {
  Mail,
  ShieldCheck,
  Home,
  Headphones,
} from 'lucide-react';

import bgImage from '../assets/FaisalMosque.png';
import logoImg from '../assets/Logo3.png';

const ForgotPassword = () => {
 const {
  register,
  handleSubmit,
  setError,
  formState: { errors, isSubmitting },
} = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await forgotPassword(data.email);

      console.log('Forgot password response:', response);

    } catch (error) {
      console.error('Forgot password error:', error);

      setError('email', {
        type: 'server',
        message: error.message || 'Unable to process your request.',
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
      <div className="fixed inset-0  z-0" />

      {/* LEFT SECTION - Hero Branding */}
      <div className="relative lg:w-[58%] min-h-[350px] sm:min-h-[480px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white z-10">

        {/* Top-Left PPC Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src={logoImg}
            alt="PPC Logo"
            className="w-40 sm:w-50 h-auto drop-shadow-md"
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
              Forgot Password?
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
              Enter your registered email address and we'll help you reset your password.
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
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>

          </form>

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

export default ForgotPassword;
