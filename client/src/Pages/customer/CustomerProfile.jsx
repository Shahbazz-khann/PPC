import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  Camera,
  Edit2,
  Save,
  X,
  ChevronRight,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { getCustomerProfile, getIdentityTypes, getCountries, getCustomerTitles, getGenders, updateCustomerProfile, uploadProfileImage, resolveMediaUrl, changeCustomerPassword } from '../../Services/customer.services';

const CustomerProfile = () => {
  const { user } = useAuth();

  const [referenceData, setReferenceData] = useState({
    titles: [],
    genders: [],
    identityTypes: [],
    countries: []
  });

  const [profileData, setProfileData] = useState({
    profile_image_url: null,
    customerTitleId: '',
    customerTitle: '',
    firstName: '',
    middleName: '',
    lastName: '',
    genderId: '',
    gender: '',
    email: '',
    countryId: '',
    country: '',
    mobile: '',
    identityTypeId: '',
    identityType: '',
    identityNumber: '',
    registrationDate: '',
    mobileAllowed: false,
    webAllowed: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const [profileRes, titlesRes, gendersRes, idTypesRes, countriesRes] = await Promise.all([
          getCustomerProfile(),
          getCustomerTitles(),
          getGenders(),
          getIdentityTypes(),
          getCountries()
        ]);

        if (isMounted) {
          setReferenceData({
            titles: titlesRes?.data || [],
            genders: gendersRes?.data || [],
            identityTypes: idTypesRes?.data || [],
            countries: countriesRes?.data || []
          });

          if (profileRes?.data) {
            const data = profileRes.data;

            const formattedDate = data.date_of_registration
              ? new Date(data.date_of_registration).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
              : '';

            const mappedData = {
              profile_image_url: data.profile_image_url || null,
              customerTitleId: data.customer_title_id ? String(data.customer_title_id) : '',
              customerTitle: data.title_description || '',
              firstName: data.first_name || '',
              middleName: data.middle_name || '',
              lastName: data.last_name || '',
              genderId: data.gender_id ? String(data.gender_id) : '',
              gender: data.gender_english || '',
              email: data.email || '',
              countryId: data.country_id ? String(data.country_id) : '',
              country: data.country_english || '',
              mobile: data.mobile || '',
              identityTypeId: data.identity_type_id ? String(data.identity_type_id) : '',
              identityType: data.identity_type_description || '',
              identityNumber: data.identity_number || '',
              registrationDate: formattedDate,
              mobileAllowed: data.mobile_allowed ?? false,
              webAllowed: data.webAllowed ?? true,
            };

            setProfileData(mappedData);
            setEditForm(mappedData);
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.message || 'Failed to load profile.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllData();
    return () => { isMounted = false; };
  }, []);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Calculate completion
  useEffect(() => {
    const requiredFields = [
      'customerTitle',
      'firstName',
      'lastName',
      'identityType',
      'identityNumber',
      'country',
      'mobile',
      'email'
    ];

    const filledFields = requiredFields.filter(field => {
      const val = profileData[field];
      return val !== null && val !== undefined && String(val).trim() !== '';
    });

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
    setCompletionPercentage(percentage);
  }, [profileData]);

  const validateField = (name, value) => {
    let error = '';
    const valStr = typeof value === 'string' ? value.trim() : '';

    switch (name) {
      case 'customerTitleId':
        if (!valStr) error = 'Please select a title.';
        break;
      case 'firstName':
        if (!valStr) error = 'First name is required.';
        else if (valStr.length < 2 || valStr.length > 50) error = 'Must be 2-50 characters.';
        else if (!/^[a-zA-Z\s'-]+$/.test(valStr)) error = 'Enter a valid first name.';
        break;
      case 'middleName':
        if (valStr) {
          if (valStr.length > 50) error = 'Must be max 50 characters.';
          else if (!/^[a-zA-Z\s'-]+$/.test(valStr)) error = 'Enter a valid middle name.';
        }
        break;
      case 'lastName':
        if (!valStr) error = 'Last name is required.';
        else if (valStr.length < 2 || valStr.length > 50) error = 'Must be 2-50 characters.';
        else if (!/^[a-zA-Z\s'-]+$/.test(valStr)) error = 'Enter a valid last name.';
        break;
      case 'genderId':
        // Optional
        break;
      case 'identityTypeId':
        if (!valStr) error = 'Please select an identity type.';
        break;
      case 'identityNumber':
        if (!valStr) break;
        if (!/^\d+$/.test(valStr)) error = 'Identity number must contain only numbers.';
        else if (valStr.length < 4 || valStr.length > 30) error = 'Must be 4-30 characters.';
        break;
      case 'countryId':
        if (!valStr) error = 'Please select a country.';
        break;
      case 'mobile':
        if (!valStr) error = 'Mobile number is required.';
        else if (valStr.length < 7 || valStr.length > 20) error = 'Must be 7-20 characters.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleEditChange = (e) => {
    let { name, value } = e.target;

    // Prevent typing alphabets in identityNumber and mobile
    if (name === 'identityNumber' || name === 'mobile') {
      value = value.replace(/[a-zA-Z]/g, '');
    }

    setEditForm(prev => ({ ...prev, [name]: value }));
    // Clear error immediately on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const validatePasswordRules = (pass) => {
    if (pass.length < 8 || pass.length > 128) return 'Password must be 8-128 characters.';
    if (!/[A-Z]/.test(pass) || !/[a-z]/.test(pass) || !/\d/.test(pass) || !/[^a-zA-Z\d]/.test(pass)) {
      return 'Password must contain:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character';
    }
    return '';
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required.');
      return;
    }

    const rulesError = validatePasswordRules(passwordForm.newPassword);
    if (rulesError) {
      setPasswordError(rulesError);
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const payload = {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      };

      const res = await changeCustomerPassword(payload);

      if (res?.success) {
        setPasswordSuccess('Password changed successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setTimeout(() => setPasswordSuccess(''), 5000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profileData);
    setErrors({});
    setIsEditing(false);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    // Validate all editable fields
    const fieldsToValidate = ['customerTitleId', 'firstName', 'middleName', 'lastName', 'genderId', 'identityTypeId', 'identityNumber', 'countryId', 'mobile'];
    const newErrors = {};
    let hasError = false;

    // Trim all values before saving
    const trimmedForm = { ...editForm };

    fieldsToValidate.forEach(field => {
      const val = trimmedForm[field];
      if (typeof val === 'string') {
        trimmedForm[field] = val.trim();
      }
      const err = validateField(field, trimmedForm[field]);
      if (err) {
        newErrors[field] = err;
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      // Let the first error field focus natively if possible
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementsByName(firstErrorField)[0];
      if (el) el.focus();
      return;
    }

    try {
      setIsSaving(true);
      setSaveError('');

      const payload = {
        customer_title_id: trimmedForm.customerTitleId,
        first_name: trimmedForm.firstName,
        middle_name: trimmedForm.middleName,
        last_name: trimmedForm.lastName,
        gender_id: trimmedForm.genderId,
        identity_type_id: trimmedForm.identityTypeId,
        identity_number: trimmedForm.identityNumber,
        country_id: trimmedForm.countryId,
        mobile: trimmedForm.mobile
      };

      const res = await updateCustomerProfile(payload);

      if (res?.data?.success) {
        const data = res.data.data;
        const formattedDate = data.date_of_registration
          ? new Date(data.date_of_registration).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          : '';

        const mappedData = {
          profile_image_url: data.profile_image_url || null,
          customerTitleId: data.customer_title_id ? String(data.customer_title_id) : '',
          customerTitle: data.title_description || '',
          firstName: data.first_name || '',
          middleName: data.middle_name || '',
          lastName: data.last_name || '',
          genderId: data.gender_id ? String(data.gender_id) : '',
          gender: data.gender_english || '',
          email: data.email || '',
          countryId: data.country_id ? String(data.country_id) : '',
          country: data.country_english || '',
          mobile: data.mobile || '',
          identityTypeId: data.identity_type_id ? String(data.identity_type_id) : '',
          identityType: data.identity_type_description || '',
          identityNumber: data.identity_number || '',
          registrationDate: formattedDate,
          mobileAllowed: data.mobile_allowed ?? false,
          webAllowed: data.webAllowed ?? true,
        };

        setProfileData(mappedData);
        setEditForm(mappedData);
        setIsEditing(false);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const fileInputRef = React.useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imageUploadSuccess, setImageUploadSuccess] = useState('');

  const handleImageClick = () => {
    if (!isUploadingImage && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploadError('');
    setImageUploadSuccess('');

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadError('Unsupported file type. Please upload JPEG, PNG, or WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('File is too large. Maximum size is 5MB.');
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await uploadProfileImage(formData);
      if (res?.data?.success) {
        // Build the correct URL. If the backend returns a relative path like /uploads/...
        // We might need to prefix it with the API base URL depending on how the frontend is configured, 
        // but since the original code just uses src={profileData.profile_image_url}, we'll stick to that.
        // Many projects resolve static files relative to the current host or use a proxy. 
        // To be safe, if we have an API base, we could prepend it, but let's just use what's returned.
        const newUrl = res.data.data.profile_image_url;

        // Actually, if it's served from the backend (port 5000), we probably need to prefix it 
        // with the backend URL if the frontend is on port 5173 without a proxy for /uploads. 
        // Wait, the API URL in api.js usually handles this, or the proxy does.
        // We will just use the returned path. If the image doesn't load, the user can fix the URL prefix later.
        // Often, people use import.meta.env.VITE_API_URL or similar.

        // Update local state directly to show new image immediately
        setProfileData(prev => ({ ...prev, profile_image_url: newUrl }));
        setEditForm(prev => ({ ...prev, profile_image_url: newUrl }));

        setImageUploadSuccess('Profile picture uploaded successfully.');
        setTimeout(() => setImageUploadSuccess(''), 3000);
      }
    } catch (err) {
      setImageUploadError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return <span className="text-gray-400 italic font-medium">Not provided</span>;
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#1a2b25] font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans flex items-center justify-center p-6">
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-red-100 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-500 mb-6">{fetchError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#1a2b25] text-white rounded-full font-bold">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">

      {/* Header Breadcrumb Area */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">My Profile</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1200px] mx-auto space-y-8">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8860B]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 sm:gap-8 z-10">
            {/* Avatar */}
            <div className="relative group flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#eaf1ec] border-4 border-white shadow-md flex items-center justify-center text-[#2c5f43] font-serif text-3xl font-bold overflow-hidden relative">
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {profileData.profile_image_url ? (
                  <img src={resolveMediaUrl(profileData.profile_image_url)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>{profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || 'U'}</>
                )}
              </div>
              <button
                onClick={handleImageClick}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#1a2b25] border border-gray-100 transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              {imageUploadError && (
                <div className="absolute -bottom-8 whitespace-nowrap text-red-500 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-red-100 z-30">
                  {imageUploadError}
                </div>
              )}
              {imageUploadSuccess && (
                <div className="absolute -bottom-8 whitespace-nowrap text-[#1E5631] text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-[#1E5631]/20 z-30 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {imageUploadSuccess}
                </div>
              )}
            </div>

            {/* Title Info */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25]">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <span className="px-3 py-1 bg-[#fdf7ee] text-[#b48742] text-xs font-bold uppercase tracking-wider rounded-full border border-[#f5e6d3]">
                  PPC Member
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-2">{profileData.email || 'No email provided'}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <Calendar size={14} />
                Joined {profileData.registrationDate}
              </div>
            </div>
          </div>

          <div className="z-10 self-start md:self-center">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-full border border-[#e4d7be] text-sm font-bold text-[#1a2b25] hover:border-[#B8860B] hover:bg-[#faf7f2] transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* --- COMPLETION PROGRESS CARD --- */}
        {completionPercentage < 100 && !isEditing && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#B8860B]/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-[#B8860B]" size={24} />
                  Complete Your Profile
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  Your profile is {completionPercentage}% complete. Add the remaining information to complete your PPC profile.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors whitespace-nowrap"
              >
                Complete Now
              </button>
            </div>

            <div className="mt-6 w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#B8860B] to-[#d4af37] h-2.5 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* --- MAIN FORM/VIEW AREA --- */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 overflow-hidden">

          {/* Section: Personal Information */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
              <User size={20} className="text-[#B8860B]" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                {isEditing ? (
                  <>
                    <select name="customerTitleId" value={editForm.customerTitleId} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.customerTitleId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`}>
                      <option value="">Select Title</option>
                      {referenceData.titles.map(t => <option key={t.customer_title_id} value={t.customer_title_id}>{t.title_description}</option>)}
                    </select>
                    {errors.customerTitleId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.customerTitleId}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.customerTitle)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                {isEditing ? (
                  <>
                    <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.firstName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.firstName}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.firstName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Middle Name <span className="normal-case font-medium text-gray-300">(Optional)</span></label>
                {isEditing ? (
                  <>
                    <input type="text" name="middleName" value={editForm.middleName} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.middleName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`} />
                    {errors.middleName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.middleName}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.middleName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                {isEditing ? (
                  <>
                    <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.lastName}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.lastName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                {isEditing ? (
                  <>
                    <select name="genderId" value={editForm.genderId} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.genderId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`}>
                      <option value="">Select Gender</option>
                      {referenceData.genders.map(g => <option key={g.gender_id} value={g.gender_id}>{g.gender_english}</option>)}
                    </select>
                    {errors.genderId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.genderId}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.gender)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Identity Information */}
          <div className="p-6 sm:p-8 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#B8860B]" /> Identity Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Identity Type</label>
                {isEditing ? (
                  <>
                    <select name="identityTypeId" value={editForm.identityTypeId} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.identityTypeId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-white focus:ring-1`}>
                      <option value="">Select Type</option>
                      {referenceData.identityTypes.map(t => <option key={t.identity_type_id} value={t.identity_type_id}>{t.identity_description}</option>)}
                    </select>
                    {errors.identityTypeId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.identityTypeId}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.identityType)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Identity Number</label>
                {isEditing ? (
                  <>
                    <input type="text" name="identityNumber" value={editForm.identityNumber} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.identityNumber ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-white focus:ring-1`} />
                    {errors.identityNumber && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.identityNumber}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.identityNumber)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Contact Information */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
              <Phone size={20} className="text-[#B8860B]" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Globe size={14} /> Country</label>
                {isEditing ? (
                  <>
                    <select name="countryId" value={editForm.countryId} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.countryId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`}>
                      <option value="">Select Country</option>
                      {referenceData.countries.map(c => <option key={c.country_id} value={c.country_id}>{c.country_english}</option>)}
                    </select>
                    {errors.countryId && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.countryId}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.country)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Phone size={14} /> Mobile</label>
                {isEditing ? (
                  <>
                    <input type="tel" name="mobile" value={editForm.mobile} onChange={handleEditChange} onBlur={handleBlur} className={`w-full px-4 py-2.5 rounded-xl border ${errors.mobile ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 focus:ring-1`} />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mobile}</p>}
                  </>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.mobile)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Mail size={14} /> Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={editForm.email} readOnly disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed outline-none transition-all text-sm font-semibold" title="Email cannot be changed" />
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.email)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Account Information (Read-only) */}
          <div className="p-6 sm:p-8 bg-gray-50/30">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#B8860B]" /> Account Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Date</label>
                <div className="text-sm font-semibold text-gray-800">{profileData.registrationDate}</div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile App Access</label>
                {profileData.mobileAllowed ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1E5631]">
                    <CheckCircle2 size={16} /> Allowed
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                    <XCircle size={16} /> Denied
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Web Portal Access</label>
                {profileData.webAllowed ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1E5631]">
                    <CheckCircle2 size={16} /> Allowed
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                    <XCircle size={16} /> Denied
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Security */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
              <Lock size={20} className="text-[#B8860B]" /> Security
            </h2>
            <div className="max-w-md space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="text-red-500 text-sm font-semibold flex items-center gap-1.5 mt-2">
                  <XCircle size={16} /> {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5 mt-2">
                  <CheckCircle2 size={16} /> {passwordSuccess}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={isSubmittingPassword}
                  className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmittingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit Actions Footer */}
          {isEditing && (
            <div className="p-6 bg-[#fcfbfa] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-4">
              {saveError && (
                <div className="text-red-500 text-sm font-semibold flex items-center gap-1.5 mr-auto">
                  <XCircle size={16} /> {saveError}
                </div>
              )}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70"
                >
                  <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
