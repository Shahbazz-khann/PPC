import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, Camera, Building2,
} from 'lucide-react';

// ─── Mock session data ────────────────────────────────────────────────────────
const MOCK_OWNER = {
  full_name: 'Hassan Tariq',
  email: 'hassan.tariq@ppc.pk',
  phone: '0301-2345678',
  city: 'Islamabad',
  cnic: '37405-1234567-3',
  joined: 'January 2024',
  total_properties: 6,
  avatar: null,
};

// ─── Section Card ─────────────────────────────────────────────────────────────
const Card = ({ title, icon: Icon, children }) => (
  <div style={S.card}>
    <div style={S.cardHeader}>
      <div style={S.cardIconWrap}><Icon size={18} color="#1D6A4A" /></div>
      <h2 style={S.cardTitle}>{title}</h2>
    </div>
    <div style={S.cardBody}>{children}</div>
  </div>
);

// ─── Field Row ────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', readOnly = false, placeholder = '' }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      style={{ ...S.input, ...(readOnly ? S.inputReadOnly : {}) }}
    />
  </div>
);

// ─── Password Field ───────────────────────────────────────────────────────────
const PasswordField = ({ label, value, onChange, show, onToggle }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <div style={S.passWrap}>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange}
        style={S.input} placeholder="••••••••" />
      <button type="button" style={S.eyeBtn} onClick={onToggle}>
        {show ? <EyeOff size={15} color="#6B7280" /> : <Eye size={15} color="#6B7280" />}
      </button>
    </div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const isOk = type === 'success';
  return (
    <div style={{ ...S.toast, background: isOk ? '#DCFCE7' : '#FEF2F2', borderColor: isOk ? '#86EFAC' : '#FCA5A5' }}>
      {isOk ? <CheckCircle2 size={15} color="#166534" /> : <AlertCircle size={15} color="#991B1B" />}
      <span style={{ color: isOk ? '#166534' : '#991B1B', fontSize: '13px', fontWeight: '600' }}>{msg}</span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OwnerAccountSetting = () => {
  const [profile, setProfile] = useState({
    full_name: MOCK_OWNER.full_name,
    email: MOCK_OWNER.email,
    phone: MOCK_OWNER.phone,
    city: MOCK_OWNER.city,
  });

  const [passwords, setPasswords] = useState({ current: '', new_pass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, new_pass: false, confirm: false });
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const handleProfileSave = () => {
    if (!profile.full_name.trim() || !profile.phone.trim() || !profile.city.trim()) {
      showToast('Please fill in all required fields.', 'error'); return;
    }
    setProfileSaving(true);
    setTimeout(() => { setProfileSaving(false); showToast('Profile updated successfully.'); }, 1000);
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new_pass || !passwords.confirm) {
      showToast('Please fill in all password fields.', 'error'); return;
    }
    if (passwords.new_pass.length < 8) {
      showToast('New password must be at least 8 characters.', 'error'); return;
    }
    if (passwords.new_pass !== passwords.confirm) {
      showToast('New password and confirm password do not match.', 'error'); return;
    }
    setPassSaving(true);
    setTimeout(() => {
      setPassSaving(false);
      setPasswords({ current: '', new_pass: '', confirm: '' });
      showToast('Password changed successfully.');
    }, 1000);
  };

  const initials = MOCK_OWNER.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={S.page}>
      {/* Toast */}
      <div style={S.toastWrap}><Toast msg={toast.msg} type={toast.type} /></div>

      <div style={S.pageHeader}>
        <h1 style={S.pageTitle}>Account Settings</h1>
        <p style={S.pageSub}>Manage your PPC owner account information and security settings.</p>
      </div>

      {/* Profile Banner */}
      <div style={S.banner}>
        <div style={S.avatarWrap}>
          <div style={S.avatar}>{initials}</div>
          <button style={S.cameraBtn}><Camera size={14} color="#FFFFFF" /></button>
        </div>
        <div style={S.bannerInfo}>
          <div style={S.bannerName}>{MOCK_OWNER.full_name}</div>
          <div style={S.bannerMeta}>{MOCK_OWNER.email}</div>
          <div style={S.bannerTags}>
            <span style={S.roleBadge}>Property Owner</span>
            <span style={S.joinBadge}>Member since {MOCK_OWNER.joined}</span>
          </div>
        </div>
        <div style={S.bannerStats}>
          <div style={S.statBox}>
            <Building2 size={20} color="#1D6A4A" />
            <div style={S.statNum}>{MOCK_OWNER.total_properties}</div>
            <div style={S.statLbl}>Properties</div>
          </div>
        </div>
      </div>

      <div style={S.grid}>
        {/* Personal Information */}
        <Card title="Personal Information" icon={User}>
          <div style={S.fieldsGrid}>
            <Field label="Full Name *" value={profile.full_name}
              onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} />
            <Field label="Email Address" value={profile.email}
              onChange={() => {}} readOnly placeholder="" />
            <Field label="Phone Number *" value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <Field label="City *" value={profile.city}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
          </div>
          <div style={S.readOnlySection}>
            <div style={S.roRow}>
              <span style={S.roLabel}>CNIC</span>
              <span style={S.roVal}>{MOCK_OWNER.cnic}</span>
            </div>
          </div>
          <div style={S.emailNote}>
            <AlertCircle size={13} color="#92400E" />
            <span style={S.emailNoteText}>Email address cannot be changed. Contact PPC support if needed.</span>
          </div>
          <button style={S.saveBtn} onClick={handleProfileSave} disabled={profileSaving}>
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </Card>

        {/* Change Password */}
        <Card title="Change Password" icon={Lock}>
          <div style={S.passInfo}>
            <AlertCircle size={14} color="#4338CA" />
            <span style={S.passInfoText}>Use a strong password with at least 8 characters, including numbers and symbols.</span>
          </div>
          <div style={S.passFields}>
            <PasswordField label="Current Password" value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              show={show.current} onToggle={() => setShow((s) => ({ ...s, current: !s.current }))} />
            <PasswordField label="New Password" value={passwords.new_pass}
              onChange={(e) => setPasswords((p) => ({ ...p, new_pass: e.target.value }))}
              show={show.new_pass} onToggle={() => setShow((s) => ({ ...s, new_pass: !s.new_pass }))} />
            <PasswordField label="Confirm New Password" value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              show={show.confirm} onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))} />
          </div>
          {passwords.new_pass && passwords.confirm && passwords.new_pass !== passwords.confirm && (
            <div style={S.matchWarn}><AlertCircle size={13} color="#991B1B" /> Passwords do not match</div>
          )}
          <button style={S.saveBtn} onClick={handlePasswordChange} disabled={passSaving}>
            {passSaving ? 'Updating...' : 'Update Password'}
          </button>
        </Card>
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = {
  page: { background: '#F8FAFC', minHeight: '100vh', padding: '28px', fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: '#111827' },
  pageHeader: { marginBottom: '22px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0 },
  toastWrap: { position: 'fixed', top: '24px', right: '24px', zIndex: 2000 },
  toast: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '10px', border: '1.5px solid', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },

  banner: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '22px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#1D6A4A,#056839)', color: '#FFF', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-1px' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#1D6A4A', border: '2px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  bannerInfo: { flex: 1 },
  bannerName: { fontSize: '18px', fontWeight: '800', color: '#111827' },
  bannerMeta: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  bannerTags: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  roleBadge: { fontSize: '11px', fontWeight: '700', background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '20px' },
  joinBadge: { fontSize: '11px', fontWeight: '600', background: '#F3F4F6', color: '#6B7280', padding: '3px 10px', borderRadius: '20px' },
  bannerStats: { display: 'flex', gap: '16px' },
  statBox: { background: '#F8FAFC', borderRadius: '12px', padding: '14px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid #E2E8F0' },
  statNum: { fontSize: '22px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  statLbl: { fontSize: '11px', color: '#6B7280', fontWeight: '600' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
  card: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', borderBottom: '1px solid #F1F5F9' },
  cardIconWrap: { width: '34px', height: '34px', borderRadius: '9px', background: '#E8F4F1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 },
  cardBody: { padding: '20px' },

  fieldsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#374151' },
  input: { border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#111827', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  inputReadOnly: { background: '#F8FAFC', color: '#6B7280', cursor: 'default' },

  readOnlySection: { background: '#F8FAFC', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', border: '1px solid #E2E8F0' },
  roRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roLabel: { fontSize: '12px', fontWeight: '600', color: '#6B7280' },
  roVal: { fontSize: '13px', fontWeight: '600', color: '#374151', fontFamily: 'monospace' },

  emailNote: { display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF7ED', borderRadius: '8px', padding: '9px 12px', marginBottom: '18px' },
  emailNoteText: { fontSize: '12px', color: '#92400E' },

  passInfo: { display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#EEF2FF', borderRadius: '8px', padding: '9px 12px', marginBottom: '16px' },
  passInfoText: { fontSize: '12px', color: '#4338CA', lineHeight: 1.5 },
  passFields: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' },
  passWrap: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '2px' },
  matchWarn: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#991B1B', marginBottom: '12px' },

  saveBtn: { background: '#1D6A4A', color: '#FFFFFF', border: 'none', borderRadius: '9px', padding: '11px 22px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '4px', fontFamily: 'inherit', transition: 'background 0.2s', width: '100%' },
};

export default OwnerAccountSetting;
