import React, { useState, useEffect } from 'react';
import api from '../../Services/Api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldCheck,
  Award,
  Bell,
  ChevronDown,
  Calendar,
  X,
} from 'lucide-react';

// ─── Initial Mock Inspector Data ──────────────────────────────────────────────
const INITIAL_INSPECTOR_DATA = {
  full_name: 'Sara Khan',
  email: 'sara.inspector@ppc.pk',
  phone: '0300-9876543',
  role: 'Property Inspector',
  inspector_id: '#INS-2025-048',
  region: 'Islamabad & Rawalpindi',
  joined_date: 'August 2024',
  account_status: 'Active',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  bio: 'Certified PPC Senior Property Inspector with expertise in structural integrity analysis, solar installation auditing, plumbing, and electrical verification.',
  total_assigned: 36,
  completed_inspections: 14,
  rating: '4.9 / 5.0',
};

const Profile = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // Personal Info Form State
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || user?.name || INITIAL_INSPECTOR_DATA.full_name,
    email: user?.email || INITIAL_INSPECTOR_DATA.email,
    phone: user?.phone || INITIAL_INSPECTOR_DATA.phone,
    region: INITIAL_INSPECTOR_DATA.region,
    bio: INITIAL_INSPECTOR_DATA.bio,
    avatar: INITIAL_INSPECTOR_DATA.avatar,
  });

  // Security / Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  // UI / Feedback States
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  const displayName = profileData.full_name;

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result }));
        triggerToast('Profile photo updated successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/inspector/profile');
        if (response.success && response.data) {
          setProfileData(prev => ({
            ...prev,
            full_name: response.data.full_name || prev.full_name,
            phone: response.data.phone_number || prev.phone,
            email: response.data.email || prev.email,
          }));
        }
      } catch (error) {
        console.error('Failed to load profile data', error);
      }
    };
    fetchProfile();
  }, []);

  // Handle Save Personal Info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileData.full_name.trim()) {
      triggerToast('Please enter your full name.', 'error');
      return;
    }
    if (!profileData.phone.trim()) {
      triggerToast('Please enter a valid phone number.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload = {
        full_name: profileData.full_name,
        phone_number: profileData.phone
      };
      await api.patch('/inspector/profile', payload);
      triggerToast('Personal profile information updated successfully.');
    } catch (error) {
      triggerToast('Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Update Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();

    if (!passwords.currentPassword) {
      triggerToast('Please enter your current password.', 'error');
      return;
    }
    if (!passwords.newPassword) {
      triggerToast('Please enter your new password.', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      triggerToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      triggerToast('New password and confirm password do not match.', 'error');
      return;
    }

    setIsSavingPass(true);
    setTimeout(() => {
      setIsSavingPass(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      triggerToast('Password updated successfully.');
    }, 800);
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            ...styles.toastBanner,
            background: toastType === 'success' ? '#ECFDF5' : '#FEF2F2',
            borderColor: toastType === 'success' ? '#A7F3D0' : '#FCA5A5',
          }}
        >
          {toastType === 'success' ? (
            <CheckCircle2 size={18} color="#059669" />
          ) : (
            <AlertCircle size={18} color="#DC2626" />
          )}
          <span
            style={{
              ...styles.toastText,
              color: toastType === 'success' ? '#065F46' : '#991B1B',
            }}
          >
            {toastMessage}
          </span>
          <button style={styles.closeToastBtn} onClick={() => setToastMessage(null)}>
            <X size={14} color={toastType === 'success' ? '#065F46' : '#991B1B'} />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TOP HEADER BAR
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        <div>
          <h1 style={styles.headerTitle}>Profile & Account Settings</h1>
          <p style={styles.headerSubtitle}>
            Manage your personal details, inspector credentials, and security preferences.
          </p>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.notificationBtn} aria-label="Notifications">
            <Bell size={18} color="#374151" />
            <span style={styles.notificationBadge}>2</span>
          </button>

          <div style={styles.profileChip} onClick={() => navigate('/inspector/profile')}>
            <img
              src={profileData.avatar}
              alt={displayName}
              style={styles.profileAvatarTop}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <div style={styles.profileInfoTop}>
              <span style={styles.profileNameTop}>{displayName}</span>
              <span style={styles.profileRoleTop}>Inspector</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          PROFILE HERO CARD
      ═══════════════════════════════════════════════ */}
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <div style={styles.avatarWrapper}>
            <img src={profileData.avatar} alt={displayName} style={styles.heroAvatar} />
            <label style={styles.cameraBadge} title="Change Profile Photo">
              <Camera size={14} color="#FFFFFF" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={styles.heroDetails}>
            <div style={styles.heroTitleRow}>
              <h2 style={styles.heroName}>{displayName}</h2>
              <span style={styles.roleBadge}>Property Inspector</span>
              <span style={styles.statusBadge}>● Active Account</span>
            </div>
            <p style={styles.heroSub}>
              Inspector ID: <strong>{INITIAL_INSPECTOR_DATA.inspector_id}</strong> &bull; Member since{' '}
              {INITIAL_INSPECTOR_DATA.joined_date}
            </p>
            <p style={styles.heroRegion}>
              <MapPin size={13} color="#64748B" /> Assigned Region:{' '}
              <strong>{profileData.region}</strong>
            </p>
          </div>
        </div>

        {/* Quick Inspector Badges */}
        <div style={styles.heroBadgesGroup}>
          <div style={styles.badgeItem}>
            <Award size={18} color="#2563EB" />
            <div>
              <span style={styles.badgeLabel}>Inspector Rating</span>
              <strong style={styles.badgeVal}>{INITIAL_INSPECTOR_DATA.rating} ★</strong>
            </div>
          </div>
          <div style={styles.badgeItem}>
            <ShieldCheck size={18} color="#16A34A" />
            <div>
              <span style={styles.badgeLabel}>Verified Audits</span>
              <strong style={styles.badgeVal}>
                {INITIAL_INSPECTOR_DATA.completed_inspections} Completed
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          2 COLUMN LAYOUT: Personal Info + Security Card
      ═══════════════════════════════════════════════ */}
      <div style={styles.grid2Col}>
        {/* LEFT COLUMN: Personal Details */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <User size={18} color="#2563EB" />
              <h3 style={styles.cardTitle}>Personal & Professional Information</h3>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={styles.cardBody}>
            <div style={styles.formGrid2}>
              {/* Full Name */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Full Name <span style={styles.req}>*</span>
                </label>
                <div style={styles.inputIconWrap}>
                  <User size={15} color="#9CA3AF" style={styles.fieldIcon} />
                  <input
                    type="text"
                    value={profileData.full_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    style={styles.textInputWithIcon}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Phone Number <span style={styles.req}>*</span>
                </label>
                <div style={styles.inputIconWrap}>
                  <Phone size={15} color="#9CA3AF" style={styles.fieldIcon} />
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    style={styles.textInputWithIcon}
                    required
                  />
                </div>
              </div>

              {/* Email (Read Only) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Email Address <span style={styles.readOnlyNote}>(Read Only)</span>
                </label>
                <div style={styles.inputIconWrap}>
                  <Mail size={15} color="#9CA3AF" style={styles.fieldIcon} />
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    style={{ ...styles.textInputWithIcon, ...styles.readOnlyInput }}
                  />
                </div>
              </div>

              {/* Role (Read Only) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Role & Role Rights <span style={styles.readOnlyNote}>(Read Only)</span>
                </label>
                <div style={styles.inputIconWrap}>
                  <ShieldCheck size={15} color="#9CA3AF" style={styles.fieldIcon} />
                  <input
                    type="text"
                    value={INITIAL_INSPECTOR_DATA.role}
                    readOnly
                    style={{ ...styles.textInputWithIcon, ...styles.readOnlyInput }}
                  />
                </div>
              </div>

              {/* Assigned Region (Read Only) */}
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  Assigned Territory / Region <span style={styles.readOnlyNote}>(Not Persisted)</span>
                </label>
                <div style={styles.inputIconWrap}>
                  <MapPin size={15} color="#9CA3AF" style={styles.fieldIcon} />
                  <input
                    type="text"
                    value={profileData.region}
                    readOnly
                    style={{ ...styles.textInputWithIcon, ...styles.readOnlyInput }}
                  />
                </div>
              </div>

              {/* Bio / Summary (Read Only) */}
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  Inspector Bio & Specialization <span style={styles.readOnlyNote}>(Not Persisted)</span>
                </label>
                <textarea
                  rows={4}
                  value={profileData.bio}
                  readOnly
                  style={{ ...styles.textareaInput, ...styles.readOnlyInput }}
                />
              </div>
            </div>

            <div style={styles.formFooter}>
              <button type="submit" style={styles.primaryBtn} disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Personal Info'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Change Password & Security */}
        <div style={styles.rightSideCol}>
          {/* Inspector Credential Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <Award size={18} color="#2563EB" />
                <h3 style={styles.cardTitle}>Account Credentials</h3>
              </div>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.credentialList}>
                <div style={styles.credRow}>
                  <span style={styles.credKey}>Inspector ID:</span>
                  <strong style={styles.credVal}>{INITIAL_INSPECTOR_DATA.inspector_id}</strong>
                </div>
                <div style={styles.credRow}>
                  <span style={styles.credKey}>Total Assigned:</span>
                  <strong style={styles.credVal}>{INITIAL_INSPECTOR_DATA.total_assigned} Properties</strong>
                </div>
                <div style={styles.credRow}>
                  <span style={styles.credKey}>Inspections Completed:</span>
                  <strong style={styles.credValGreen}>
                    {INITIAL_INSPECTOR_DATA.completed_inspections} Completed
                  </strong>
                </div>
                <div style={styles.credRow}>
                  <span style={styles.credKey}>System Status:</span>
                  <strong style={styles.credValGreen}>Active & Verified</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                <Lock size={18} color="#2563EB" />
                <h3 style={styles.cardTitle}>Change Password</h3>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} style={styles.cardBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Current Password */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Current Password <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.passInputWrap}>
                    <input
                      type={showPass.current ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      style={styles.textInputPass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() =>
                        setShowPass((prev) => ({ ...prev, current: !prev.current }))
                      }
                    >
                      {showPass.current ? (
                        <EyeOff size={16} color="#6B7280" />
                      ) : (
                        <Eye size={16} color="#6B7280" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    New Password <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.passInputWrap}>
                    <input
                      type={showPass.newPass ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                      }
                      style={styles.textInputPass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() =>
                        setShowPass((prev) => ({ ...prev, newPass: !prev.newPass }))
                      }
                    >
                      {showPass.newPass ? (
                        <EyeOff size={16} color="#6B7280" />
                      ) : (
                        <Eye size={16} color="#6B7280" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Confirm New Password <span style={styles.req}>*</span>
                  </label>
                  <div style={styles.passInputWrap}>
                    <input
                      type={showPass.confirm ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
                      }
                      style={styles.textInputPass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() =>
                        setShowPass((prev) => ({ ...prev, confirm: !prev.confirm }))
                      }
                    >
                      {showPass.confirm ? (
                        <EyeOff size={16} color="#6B7280" />
                      ) : (
                        <Eye size={16} color="#6B7280" />
                      )}
                    </button>
                  </div>
                </div>

                <p style={styles.passHintText}>
                  Password must be at least 6 characters long.
                </p>

                <button
                  type="submit"
                  style={{ ...styles.primaryBtn, width: '100%', marginTop: '4px' }}
                  disabled={isSavingPass}
                >
                  {isSavingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Styles Object ────────────────────────────────────────────────────────────
const styles = {
  container: {
    background: '#F8FAFC',
    minHeight: '100vh',
    padding: '24px 32px 40px 32px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#0F172A',
  },

  toastBanner: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 1100,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  toastText: {
    fontSize: '13px',
    fontWeight: '700',
  },
  closeToastBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
  },

  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  notificationBtn: {
    position: 'relative',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '9px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#EF4444',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },

  profileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '6px 12px 6px 8px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  profileAvatarTop: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #E2E8F0',
  },
  profileInfoTop: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  profileNameTop: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRoleTop: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#64748B',
  },

  /* Hero Card */
  heroCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '18px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '84px',
    height: '84px',
  },
  heroAvatar: {
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2.5px solid #2563EB',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: '2px',
    right: '2px',
    background: '#2563EB',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    border: '2px solid #FFFFFF',
  },
  heroDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  heroTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  heroName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  roleBadge: {
    background: '#DBEAFE',
    color: '#1E40AF',
    fontSize: '11.5px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  statusBadge: {
    background: '#DCFCE7',
    color: '#166534',
    fontSize: '11.5px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '6px',
  },
  heroSub: {
    fontSize: '12.5px',
    color: '#64748B',
    margin: 0,
  },
  heroRegion: {
    fontSize: '12.5px',
    color: '#475569',
    margin: '2px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  heroBadgesGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  badgeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '10px 16px',
  },
  badgeLabel: {
    fontSize: '11px',
    color: '#64748B',
    display: 'block',
    fontWeight: '500',
  },
  badgeVal: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#0F172A',
  },

  /* 2 Column Grid */
  grid2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '24px',
    alignItems: 'start',
  },

  rightSideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  /* Card */
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
    background: '#FFFFFF',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },
  cardBody: {
    padding: '20px',
  },

  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
  },
  req: {
    color: '#EF4444',
  },
  readOnlyNote: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: '500',
  },

  inputIconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  fieldIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  textInputWithIcon: {
    width: '100%',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '9.5px 12px 9.5px 36px',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: '#FFFFFF',
  },
  readOnlyInput: {
    background: '#F8FAFC',
    color: '#64748B',
    borderColor: '#E2E8F0',
    cursor: 'not-allowed',
  },
  textareaInput: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    resize: 'vertical',
  },

  formFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #F1F5F9',
  },

  primaryBtn: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 22px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  },

  /* Credential Card */
  credentialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  credRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12.5px',
    paddingBottom: '10px',
    borderBottom: '1px solid #F1F5F9',
  },
  credKey: {
    color: '#64748B',
    fontWeight: '500',
  },
  credVal: {
    color: '#0F172A',
    fontWeight: '700',
  },
  credValGreen: {
    color: '#16A34A',
    fontWeight: '700',
  },

  /* Password Form */
  passInputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  textInputPass: {
    width: '100%',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '9.5px 36px 9.5px 12px',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  eyeBtn: {
    position: 'absolute',
    right: '10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
  },
  passHintText: {
    fontSize: '11.5px',
    color: '#64748B',
    margin: 0,
  },
};

export default Profile;
