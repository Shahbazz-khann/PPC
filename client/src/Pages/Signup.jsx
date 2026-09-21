import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Globe, Phone, Lock, Eye, EyeOff, ShieldCheck, Home, Headphones, Key, CheckCircle2, Circle } from 'lucide-react';
import bgImage from '../assets/faisalmosqueSignup.png';
import logoImg from '../assets/IMAGEEEEEEEEEEEEEEEEEEEE.png';
import { signupUser, verifyEmail } from '../Services/auth.services';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [isVerifyingSubmit, setIsVerifyingSubmit] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

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
      setFormMessage({ text: "", type: "" });
      const signupData = {
        name: data.fullName,
        email: data.email,
        country: data.country,
        mobile_no: data.mobile,
        password: data.password,
        account_type: 'user',
      };


      const response = await signupUser(signupData);

      if (response && response.success) {
        setFormMessage({ text: "A verification code has been sent to your email. Please check your inbox to continue.", type: "success" });
        setRegisteredEmail(data.email);
        setIsVerifying(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setFormMessage({
        text: error?.response?.data?.message || "We couldn't send the verification code right now. Please try again.",
        type: "error"
      });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError("");
    setFormMessage({ text: "", type: "" });
    if (!otp || otp.length !== 6) {
      setVerifyError("Please enter a valid 6-digit verification code");
      return;
    }

    setIsVerifyingSubmit(true);
    try {
      const response = await verifyEmail({ email: registeredEmail, otp });
      if (response && response.success) {
        setFormMessage({ text: "Account created successfully!", type: "success" });
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerifyError(error?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifyingSubmit(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col lg:flex-row font-sans antialiased overflow-x-hidden">
        {/* FULL-PAGE Background Image & Overlay */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Dark Overlay for text legibility across the entire viewport */}
        <div className="fixed inset-0 bg-black/30 lg:bg-black/10 z-0" />

        {/* LEFT SECTION - Hero Branding */}
        <div className="relative lg:w-1/2 w-full p-5 sm:p-8 lg:p-12 text-white z-10 lg:h-screen lg:sticky lg:top-0">
          <div className="w-full max-w-xl lg:ml-auto lg:mr-4 xl:mr-12 flex flex-col lg:justify-between h-full gap-6 sm:gap-8 lg:gap-0">
          {/* Top-Left PPC Branding */}
          <div className="relative z-10 flex items-center justify-center lg:justify-start pt-2 sm:pt-4 lg:pt-0 mb-2 lg:mb-0">
            <img src={logoImg} alt="PPC Logo" className="w-40 sm:w-48 lg:w-48 h-auto drop-shadow-md" />
          </div>

          {/* Lower-Left Main Text */}
          <div className="relative z-10 my-4 sm:my-8 lg:my-auto max-w-xl text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight break-words">
              Buy, Rent, or Sell,
            </h2>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#C59B27] tracking-tight mt-1 leading-tight break-words">
              Your Perfect Property
            </h2>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed mt-3 sm:mt-4 max-w-lg font-normal drop-shadow-sm mx-auto lg:mx-0">
              Pakistan Property Care is your trusted platform<br className="hidden sm:block" />
              to discover and list properties with ease.
            </p>
          </div>

          {/* Bottom-Left Feature Badges */}
          {/* <div className="relative z-10 hidden lg:grid grid-cols-3 gap-6 pt-4 border-t border-white/10"> */}
            {/* Feature 1 */}
            {/* <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">Trusted &amp; Secure</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-200">Verified by our team</p>
              </div>
            </div> */}

            {/* Feature 2 */}
            {/* <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">Wide Range</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-200">Residential &amp; Commercial</p>
              </div>
            </div> */}

            {/* Feature 3 */}
            {/* <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#C59B27]/60 bg-[#C59B27]/15 backdrop-blur-md flex items-center justify-center text-[#C59B27] shrink-0">
                <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug">24/7 Support</h4>
                <p className="text-[10px] sm:text-[11px] text-gray-200">We are here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
        </div>
      </div>

        {/* RIGHT SECTION - White Rounded Authentication Card */}
        <div className="relative lg:w-1/2 w-full flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 z-10 pb-12 sm:pb-16 lg:min-h-screen">
          <div className="w-full max-w-[520px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 text-gray-800 my-auto mx-auto lg:mx-0 lg:mr-auto lg:ml-4 xl:ml-12 border border-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
                {isVerifying ? "Verify Email" : "Create Account"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5 font-medium">
                {isVerifying ? `Enter the 6-digit code sent to ${registeredEmail}` : "Sign up to get started with PPC"}
              </p>
            </div>

            {formMessage.text && (
              <div className={`mb-4 p-3 rounded-xl text-sm sm:text-base font-medium break-words ${formMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {formMessage.text}
              </div>
            )}

            {/* Form */}
            {isVerifying ? (
              <form className="space-y-4" onSubmit={handleVerify}>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Verification Code
                  </label>
                  <div className="relative flex items-center">
                    <Key className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      maxLength="6"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all tracking-widest text-center font-bold"
                    />
                  </div>
                  {verifyError && (
                    <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{verifyError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isVerifyingSubmit}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isVerifyingSubmit ? 'Verifying...' : 'Verify Email'}
                </button>
                <div className="flex items-center justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsVerifying(false)}
                    className="p-1 text-xs sm:text-sm text-gray-600 font-medium hover:text-[#B8860B] transition-colors"
                  >
                    Change Email Address
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
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
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                    <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{errors.fullName.message}</p>
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
                      className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                    <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{errors.email.message}</p>
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
                      className={`w-full pl-10 pr-10 py-2.5 sm:py-2 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all appearance-none cursor-pointer`}
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
                    <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{errors.country.message}</p>
                  )}
                </div>

                {/* Mobile No. Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Mobile No.
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <span className="absolute left-9 text-gray-800 font-medium text-sm pointer-events-none flex items-center gap-1 whitespace-nowrap">
                      {currentDialCode} <span className="text-gray-300">|</span>
                    </span>
                    <input
                      id="mobile"
                      type="tel"
                      placeholder="3001234567"
                      className="w-full pl-[5.5rem] pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                    <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{errors.mobile.message}</p>
                  )}
                </div>

                {/* Passwords Row (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Choose Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                        className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Live Password Validation */}
                    <div className="mt-2 space-y-1">
                      {[
                        { label: 'At least 8 characters', met: (password || '').length >= 8 },
                        { label: 'One uppercase letter', met: /[A-Z]/.test(password || '') },
                        { label: 'One lowercase letter', met: /[a-z]/.test(password || '') },
                        { label: 'One number', met: /\d/.test(password || '') },
                        { label: 'One special character', met: /[^a-zA-Z\d]/.test(password || '') },
                      ].map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 transition-colors duration-200">
                          {rule.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <span className={`text-[10px] sm:text-xs font-medium ${rule.met ? 'text-green-600' : 'text-gray-500'}`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {errors.password && (
                      <p className="text-red-500 text-[11px] sm:text-xs mt-2 font-medium whitespace-pre-line">{errors.password.message}</p>
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
                        className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] transition-all"
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
                        className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
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
                      <p className="text-red-500 text-[11px] sm:text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>



                {/* Full-width Gold Sign Up Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#B8860B] via-[#C59B27] to-[#B8860B] hover:from-[#a37609] hover:to-[#a37609] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
            )}

            {/* Bottom Card Footer - Login Navigation */}
            <div className="flex items-center justify-center mt-6 pt-5 border-t border-gray-100">
              <span className="text-[11px] sm:text-sm text-gray-600 font-medium">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="inline-block p-1 text-[#B8860B] hover:text-[#966d09] font-semibold transition-colors"
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
