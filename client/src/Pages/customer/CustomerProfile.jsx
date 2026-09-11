import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Isolated Mock Data Layer for fields not currently in AuthContext
const MOCK_PROFILE_DATA = {
  customerTitle: 'Mr.',
  firstName: 'Ahmed',
  middleName: '',
  lastName: 'Raza',
  gender: 'Male',
  email: 'ahmed.raza@example.com',
  country: 'Pakistan',
  mobile: '+92 300 1234567',
  identityType: 'National ID',
  identityNumber: '35202-1234567-1',
  registrationDate: '15 Oct 2025',
  mobileAllowed: true,
  webAllowed: true,
};

// Reference Data for Dropdowns
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
const GENDERS = ['Male', 'Female', 'Other'];
const IDENTITY_TYPES = ['National ID', 'Passport', 'Driving License'];
const COUNTRIES = ['Pakistan', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Qatar'];

const CustomerProfile = () => {
  const { user } = useAuth();

  // Use purely mock data for Sir/demo review
  const [profileData, setProfileData] = useState({
    ...MOCK_PROFILE_DATA
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Security Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordForm.currentPassword) {
      setPasswordError('Current Password is required.');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New Password is required.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New Passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingPassword(false);
      setPasswordSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setEditForm(profileData);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Frontend mock save
    setProfileData(editForm);
    setIsEditing(false);
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return <span className="text-gray-400 italic font-medium">Not provided</span>;
    }
    return value;
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">

      {/* Header Breadcrumb Area */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">My Profile</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1200px] mx-auto space-y-8">

        {/* --- PROFILE HEADER CARD --- */}
        <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8860B]/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 sm:gap-8 z-10">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#eaf1ec] border-4 border-white shadow-md flex items-center justify-center text-[#2c5f43] font-serif text-3xl font-bold overflow-hidden">
                {profileData.firstName?.charAt(0) || ''}{profileData.lastName?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#1a2b25] border border-gray-100 transition-transform hover:scale-110">
                <Camera size={16} />
              </button>
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
                  <select name="customerTitle" value={editForm.customerTitle} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50">
                    <option value="">Select Title</option>
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.customerTitle)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">First Name</label>
                {isEditing ? (
                  <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" />
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.firstName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Middle Name <span className="normal-case font-medium text-gray-300">(Optional)</span></label>
                {isEditing ? (
                  <input type="text" name="middleName" value={editForm.middleName} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" />
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.middleName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Last Name</label>
                {isEditing ? (
                  <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" />
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.lastName)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                {isEditing ? (
                  <select name="gender" value={editForm.gender} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50">
                    <option value="">Select Gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
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
                  <select name="identityType" value={editForm.identityType} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-white">
                    <option value="">Select Type</option>
                    {IDENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.identityType)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Identity Number</label>
                {isEditing ? (
                  <input type="text" name="identityNumber" value={editForm.identityNumber} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-white" />
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
                  <select name="country" value={editForm.country} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50">
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <div className="text-sm font-semibold text-gray-800">{displayValue(profileData.country)}</div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Phone size={14} /> Mobile</label>
                {isEditing ? (
                  <input type="tel" name="mobile" value={editForm.mobile} onChange={handleEditChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" />
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
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1E5631]">
                  <CheckCircle2 size={16} /> Allowed
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Web Portal Access</label>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1E5631]">
                  <CheckCircle2 size={16} /> Allowed
                </div>
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
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={passwordForm.currentPassword} 
                  onChange={handlePasswordChange} 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" 
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordForm.newPassword} 
                  onChange={handlePasswordChange} 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" 
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwordForm.confirmPassword} 
                  onChange={handlePasswordChange} 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50" 
                  placeholder="Confirm new password"
                />
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
            <div className="p-6 bg-[#fcfbfa] border-t border-gray-100 flex items-center justify-end gap-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#2c4232] transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
