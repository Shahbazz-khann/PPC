import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Camera,
  ChevronDown,
  Headphones,
  ShieldCheck,
} from 'lucide-react';
import { getCurrentUser } from '../../Services/auth.services';
import { updateCustomerProfile, changeCustomerPassword } from '../../Services/customer.services';

// ─── Main Component ────────────────────────────────────────────────────────────

const AccountSetting = () => {
  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [phone, setPhone] = useState('');

  // Security state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Simple password strength
  const getStrength = () => {
    if (!newPwd) return { label: '', color: '', width: '0%' };
    if (newPwd.length < 4) return { label: 'Weak', color: '#EF4444', width: '25%' };
    if (newPwd.length < 8) return { label: 'Medium', color: '#F59E0B', width: '50%' };
    if (newPwd.length < 12) return { label: 'Strong', color: '#10B981', width: '75%' };
    return { label: 'Very Strong', color: '#059669', width: '100%' };
  };

  const strength = getStrength();

  // Pakistan flag SVG inline
  const PakistanFlag = () => (
    <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: '2px', flexShrink: 0 }}>
      <rect width="5" height="14" fill="#FFFFFF" />
      <rect x="5" width="15" height="14" fill="#01411C" />
      <circle cx="13" cy="7" r="3.5" fill="#FFFFFF" />
      <circle cx="14" cy="7" r="2.8" fill="#01411C" />
      <polygon points="12.2,4.5 12.7,6 14.3,6 13,6.8 13.5,8.3 12.2,7.3 10.9,8.3 11.4,6.8 10.1,6 11.7,6" fill="#FFFFFF" />
    </svg>
  );

  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsProfileLoading(true);
      const res = await getCurrentUser();
      const user = res.data?.data || res.data;
      if (user) {
        setUserProfile(user);
        setFullName(user.name || '');
        setEmail(user.email || '');
        setCountry(user.country || 'Pakistan');
        setPhone(user.mobile_no || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileMsg({ type: '', text: '' });
    setIsSavingProfile(true);
    try {
      const res = await updateCustomerProfile({
        name: fullName,
        email: email,
        country: country,
        mobile_no: phone
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setUserProfile(res.data?.data || userProfile);
    } catch (error) {
      setProfileMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPwdMsg({ type: '', text: '' });
    
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'error', text: 'All password fields are required' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    setIsChangingPwd(true);
    try {
      await changeCustomerPassword({
        current_password: currentPwd,
        new_password: newPwd,
        confirm_password: confirmPwd
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (error) {
      setPwdMsg({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div style={s.page}>
      {/* ── Page Header ── */}
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Account Settings</h1>
        <p style={s.pageSubtitle}>
          Manage your profile, security and account preferences.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={s.twoCol}>
        {/* ══════════════ MAIN CONTENT ══════════════ */}
        <div style={s.mainCol}>
          {/* ── Profile Information Card ── */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Profile Information</h2>
            <p style={s.cardDesc}>
              Update your personal information and profile details.
            </p>

            <div style={s.profileFormRow}>
              {/* Avatar */}
              <div style={s.avatarWrap}>
                <div style={s.avatarContainer}>
                  <img
                    src="/src/assets/customer_avatar.png"
                    alt="Ahmed Khan"
                    style={s.avatar}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <button style={s.cameraBadge} aria-label="Change profile photo">
                    <Camera size={13} color="#fff" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div style={s.formFieldsGrid}>
                {/* Full Name */}
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={s.input}
                  />
                </div>

                {/* Email Address */}
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={s.input}
                  />
                </div>

                {/* Country */}
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Country</label>
                  <div style={s.selectWrap}>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      style={s.selectInput}
                    >
                      <option>Pakistan</option>
                      <option>United Arab Emirates</option>
                      <option>Saudi Arabia</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                    </select>
                    <ChevronDown size={15} color="#6B7280" style={s.selectChevronIcon} />
                  </div>
                </div>

                {/* Mobile Number */}
                <div style={s.fieldGroup}>
                  <label style={s.fieldLabel}>Mobile Number</label>
                  <div style={s.phoneInputWrap}>
                    <div style={s.phoneFlag}>
                      <PakistanFlag />
                      <ChevronDown size={12} color="#6B7280" />
                    </div>
                    <div style={s.phoneDivider} />
                    <input
                      type="tel"
                      value={phone}
                      readOnly
                      style={s.phoneInput}
                    />
                  </div>
                </div>
              </div>
            </div>

            {profileMsg.text && (
              <div style={{
                padding: '10px 14px',
                marginTop: '16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                background: profileMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: profileMsg.type === 'success' ? '#065F46' : '#991B1B',
                border: `1px solid ${profileMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`
              }}>
                {profileMsg.text}
              </div>
            )}

            {/* Action Buttons */}
            <div style={s.profileActions}>
              <button style={s.cancelBtn}>Cancel</button>
              <button 
                style={s.saveBtn} 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* ── Security Card ── */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Security</h2>
            <p style={s.cardDesc}>
              Change your password and keep your account secure.
            </p>

            <div style={s.securityFields}>
              {/* Current Password */}
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Current Password</label>
                <div style={s.passwordWrap}>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    style={s.passwordInput}
                  />
                  <button
                    style={s.eyeBtn}
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    aria-label="Toggle password visibility"
                    type="button"
                  >
                    {showCurrentPwd ? (
                      <Eye size={16} color="#9CA3AF" strokeWidth={1.8} />
                    ) : (
                      <EyeOff size={16} color="#9CA3AF" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>New Password</label>
                <div style={s.passwordWrap}>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    style={s.passwordInput}
                  />
                  <button
                    style={s.eyeBtn}
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    aria-label="Toggle password visibility"
                    type="button"
                  >
                    {showNewPwd ? (
                      <Eye size={16} color="#9CA3AF" strokeWidth={1.8} />
                    ) : (
                      <EyeOff size={16} color="#9CA3AF" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Confirm New Password</label>
                <div style={s.passwordWrap}>
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    style={s.passwordInput}
                  />
                  <button
                    style={s.eyeBtn}
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    aria-label="Toggle password visibility"
                    type="button"
                  >
                    {showConfirmPwd ? (
                      <Eye size={16} color="#9CA3AF" strokeWidth={1.8} />
                    ) : (
                      <EyeOff size={16} color="#9CA3AF" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength */}
            {newPwd && (
              <div style={s.strengthSection}>
                <div style={s.strengthLabel}>
                  Password Strength:{' '}
                  <span style={{ color: strength.color, fontWeight: '700' }}>
                    {strength.label}
                  </span>
                </div>
                <div style={s.strengthTrack}>
                  <div
                    style={{
                      ...s.strengthBar,
                      width: strength.width,
                      background: strength.color,
                    }}
                  />
                </div>
              </div>
            )}

            {pwdMsg.text && (
              <div style={{
                padding: '10px 14px',
                marginTop: '16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                background: pwdMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: pwdMsg.type === 'success' ? '#065F46' : '#991B1B',
                border: `1px solid ${pwdMsg.type === 'success' ? '#A7F3D0' : '#FECACA'}`
              }}>
                {pwdMsg.text}
              </div>
            )}

            {/* Update Password Button */}
            <div style={s.securityActions}>
              <button 
                style={s.updatePwdBtn}
                onClick={handleUpdatePassword}
                disabled={isChangingPwd}
              >
                {isChangingPwd ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT SIDEBAR ══════════════ */}
        <aside style={s.rightAside}>
          {/* Profile Summary */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Profile Summary</div>
            <div style={s.profileSummaryCenter}>
              <img
                src="/src/assets/customer_avatar.png"
                alt={userProfile?.name || "User"}
                style={s.summaryAvatar}
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div style={s.summaryName}>{userProfile?.name || fullName || "Loading..."}</div>
              <span style={s.roleBadge}>Customer</span>
              <div style={s.summaryRole}>PPC Customer</div>
            </div>
          </div>

          {/* Account Information */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Account Information</div>
            <div style={s.accountInfoList}>
              <div style={s.accountRow}>
                <span style={s.accountRowLabel}>Account Status</span>
                <span style={s.activeBadge}>{userProfile?.is_active ? 'Active' : 'Active'}</span>
              </div>
              <div style={s.accountRow}>
                <span style={s.accountRowLabel}>Account Role</span>
                <span style={s.accountRowValue}>Customer</span>
              </div>
              <div style={s.accountRow}>
                <span style={s.accountRowLabel}>Account Created</span>
                <span style={s.accountRowValue}>
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
                </span>
              </div>
              <div style={s.accountRow}>
                <span style={s.accountRowLabel}>Last Updated</span>
                <span style={s.accountRowValue}>
                  {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '...'}
                </span>
              </div>
              <div style={s.accountRow}>
                <span style={s.accountRowLabel}>User ID</span>
                <span style={s.accountRowValue}>
                  {userProfile?.user_id ? `USR-${userProfile.user_id.toString().padStart(4, '0')}` : '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div style={s.sideCard}>
            <div style={s.needHelpHeader}>
              <div style={s.needHelpIconBox}>
                <Headphones size={20} color="#1D6A4A" strokeWidth={1.8} />
              </div>
              <div style={s.sideCardTitle}>Need Help?</div>
            </div>
            <p style={s.needHelpText}>
              If you have any questions regarding your account settings.
            </p>
            <button style={s.contactSupportBtn}>Contact Support</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = {
  // ── Page ──
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    padding: '24px 28px 0 28px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '400',
  },

  // ── Layout ──
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 260px',
    gap: '20px',
    padding: '20px 28px 28px 28px',
    flex: 1,
    alignItems: 'start',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    minWidth: 0,
  },

  // ── Cards ──
  card: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '12.5px',
    color: '#6B7280',
    margin: '4px 0 20px 0',
    fontWeight: '400',
  },

  // ── Profile Form ──
  profileFormRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    flexShrink: 0,
  },
  avatarContainer: {
    position: 'relative',
    width: '100px',
    height: '100px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E5E7EB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#1D6A4A',
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  },
  formFieldsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },

  // ── Fields ──
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  fieldLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.1px',
  },
  input: {
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    background: '#FFFFFF',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',
  },

  // ── Select ──
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectInput: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    padding: '9px 32px 9px 12px',
    fontSize: '13px',
    color: '#111827',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
    width: '100%',
    boxSizing: 'border-box',
  },
  selectChevronIcon: {
    position: 'absolute',
    right: '10px',
    pointerEvents: 'none',
  },

  // ── Phone ──
  phoneInputWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#FFFFFF',
  },
  phoneFlag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '9px 8px 9px 10px',
    cursor: 'pointer',
    flexShrink: 0,
    background: '#F9FAFB',
  },
  phoneDivider: {
    width: '1.5px',
    height: '22px',
    background: '#E5E7EB',
    flexShrink: 0,
  },
  phoneInput: {
    border: 'none',
    outline: 'none',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#111827',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
    flex: 1,
    background: 'transparent',
    width: '100%',
    boxSizing: 'border-box',
  },

  // ── Profile Actions ──
  profileActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 22px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'border-color 0.15s',
  },
  saveBtn: {
    background: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '8px',
    padding: '8px 22px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'background 0.15s',
  },

  // ── Security ──
  securityFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  passwordWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid #E5E7EB',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#FFFFFF',
  },
  passwordInput: {
    border: 'none',
    outline: 'none',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#111827',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
    flex: 1,
    background: 'transparent',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0 12px',
    flexShrink: 0,
  },

  // ── Strength ──
  strengthSection: {
    marginTop: '12px',
  },
  strengthLabel: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '600',
    marginBottom: '6px',
  },
  strengthTrack: {
    width: '100%',
    height: '5px',
    borderRadius: '4px',
    background: '#E5E7EB',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease, background 0.3s ease',
  },

  // ── Security Actions ──
  securityActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  updatePwdBtn: {
    background: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '8px',
    padding: '8px 22px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'background 0.15s',
  },

  // ── Right Sidebar ──
  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sideCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E5E7EB',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  sideCardTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '14px',
  },

  // ── Profile Summary ──
  profileSummaryCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '6px',
  },
  summaryAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E5E7EB',
    marginBottom: '6px',
  },
  summaryName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: '#DCFCE7',
    color: '#166534',
  },
  summaryRole: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
    marginTop: '2px',
  },

  // ── Account Information ──
  accountInfoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  accountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #F3F4F6',
  },
  accountRowLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  accountRowValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#111827',
  },
  activeBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    background: '#DCFCE7',
    color: '#166534',
  },

  // ── Need Help ──
  needHelpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  needHelpIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: '14px',
  },
  needHelpText: {
    fontSize: '12px',
    color: '#6B7280',
    lineHeight: 1.5,
    margin: '0 0 14px 0',
  },
  contactSupportBtn: {
    display: 'block',
    width: '100%',
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 0',
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

export default AccountSetting;
