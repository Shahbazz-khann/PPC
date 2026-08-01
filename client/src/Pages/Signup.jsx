import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Globe, Phone, Lock, Eye, EyeOff, ShieldCheck, Home, Headphones } from 'lucide-react';
import bgImage from '../assets/faisalmosqueSignup.png';
import logoImg from '../assets/Logo3.png';
import { signupUser } from '../Services/auth.services';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');
  const selectedCountry = watch('country', 'Pakistan');
  
  const countryDialCodes = {
    'Pakistan': '+92',
    'United States': '+1',
    'United Kingdom': '+44',
    'Saudi Arabia': '+966',
    'United Arab Emirates': '+971',
    'Canada': '+1',
  };
  const currentDialCode = countryDialCodes[selectedCountry] || '+92';

const onSubmit = async (data) => {
  try {
    const signupData = {
      name: data.fullName,
      email: data.email,
      country: data.country,
      mobile_no: data.mobile,
      password: data.password,
    };

    console.log("Signup data being sent:", signupData);

    const response = await signupUser(signupData);

    console.log("Signup response:", response);

    if (response.success) {
      alert("Account created successfully!");

      navigate("/login");
    }
  } catch (error) {
    console.error("Signup error:", error);
  }
};

  return (
    <div className="relative min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans antialiased overflow-x-hidden lg:overflow-hidden">
      {/* FULL-PAGE Background Image & Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Dark Overlay for text legibility across the entire viewport */}
      <div className="fixed inset-0 bg-black/10 z-0" />

      {/* LEFT SECTION - Hero Branding */}
      <div className="relative lg:w-[58%] min-h-[350px] sm:min-h-[480px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white z-10">
        {/* Top-Left PPC Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img src={logoImg} alt="PPC Logo" className="w-40 sm:w-60 h-auto drop-shadow-md" />
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
            Pakistan Property Care is your trusted platform<br/>
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
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">Trusted &amp; Secure</h4>
              <p className="text-[11px] text-gray-300">Verified by our team</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">Wide Range</h4>
              <p className="text-[11px] text-gray-300">Residential &amp; Commercial</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">24/7 Support</h4>
              <p className="text-[11px] text-gray-300">We are here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - White Rounded Authentication Card */}
      <div className="relative lg:w-[42%] flex items-center justify-center p-4 sm:p-8 lg:p-12 z-10">
        <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-800 my-auto">
          {/* Header */}
          <div className="mb-5">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
              Create Account
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
              Sign up to get started with PPC
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                  autoComplete="name"
                  aria-invalid={errors.fullName ? "true" : "false"}
                  {...register('fullName', {
                    required: 'Full Name is required.',
                    setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                    minLength: { value: 3, message: 'Minimum 3 characters required.' },
                    maxLength: { value: 100, message: 'Maximum 100 characters allowed.' },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: 'Only alphabetic characters and spaces allowed.',
                    }
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Address Field */}
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
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register('email', {
                    required: 'Email is required.',
                    setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address.',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Country Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Country
              </label>
              <div className="relative flex items-center">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <select
                  id="country"
                  className={`w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all appearance-none cursor-pointer`}
                  autoComplete="country-name"
                  aria-invalid={errors.country ? "true" : "false"}
                  {...register('country', {
                    required: 'Country is required.',
                  })}
                  defaultValue="Pakistan"
                >
                  <option value="" disabled hidden>Select your country</option>
                  <option value="Pakistan" className="text-gray-800">Pakistan</option>
                  <option value="United Arab Emirates" className="text-gray-800">United Arab Emirates</option>
                  <option value="United Kingdom" className="text-gray-800">United Kingdom</option>
                  <option value="United States" className="text-gray-800">United States</option>
                  <option value="Saudi Arabia" className="text-gray-800">Saudi Arabia</option>
                  <option value="Canada" className="text-gray-800">Canada</option>
                </select>
                <div className="absolute right-3.5 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.country && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.country.message}</p>
              )}
            </div>

            {/* Mobile No. Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Mobile No.
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <span className="absolute left-9 text-gray-800 font-medium text-xs sm:text-sm pointer-events-none flex items-center gap-1 whitespace-nowrap">
                  {currentDialCode} <span className="text-gray-300">|</span>
                </span>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="3001234567"
                  className="w-full pl-[5.5rem] pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                  autoComplete="tel-national"
                  aria-invalid={errors.mobile ? "true" : "false"}
                  {...register('mobile', {
                    required: 'Mobile number is required.',
                    setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                    validate: {
                      onlyNumbers: (v) => /^\d+$/.test(v) || 'Only numbers are allowed.',
                      exactLength: (v) => {
                        if (selectedCountry === 'Pakistan' && v.length !== 10) return 'Must be exactly 10 digits for Pakistan.';
                        return true;
                      }
                    }
                  })}
                />
              </div>
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile.message}</p>
              )}
            </div>

            {/* Passwords Row (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                    autoComplete="new-password"
                    aria-invalid={errors.password ? "true" : "false"}
                    {...register('password', {
                      required: 'Password is required.',
                      setValueAs: (v) => (typeof v === 'string' ? v.trim() : v),
                      minLength: {
                        value: 8,
                        message: 'Minimum 8 characters.',
                      },
                      maxLength: {
                        value: 128,
                        message: 'Maximum 128 characters.',
                      },
                      validate: (value) => {
                        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^a-zA-Z\d]/.test(value)) {
                          return 'Password must contain:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character';
                        }
                        return true;
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium whitespace-pre-line">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
                    autoComplete="new-password"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password.',
                      validate: (value) => value === password || 'Passwords do not match.',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkout removed as requested */}

            {/* Full-width Gold Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Bottom Card Footer - Login Navigation */}
          <div className="flex items-center justify-center mt-6 pt-5">
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              Already have an account?{' '}
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

export default Signup;
