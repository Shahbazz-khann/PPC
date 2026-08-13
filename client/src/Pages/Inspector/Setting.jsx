import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Mail,
  Smartphone,
  Sliders,
  RotateCcw,
} from 'lucide-react';

// ─── Initial Notification Settings State ─────────────────────────────────────
const INITIAL_SETTINGS = {
  // Inspection & Assignment
  assignmentAlerts: true,
  scheduleReminders: true,
  scheduleChanges: true,

  // Reports & Reviews
  reportApprovals: true,
  revisionRequests: true,

  // Channels & System
  emailNotifications: true,
  inAppNotifications: true,
  systemAnnouncements: true,
};

const InspectorSetting = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  // Settings State
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // UI Feedback States
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = user?.full_name || user?.name || 'Inspector Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';

  // Toggle Handler
  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset to Default Handler
  const handleReset = () => {
    setSettings(INITIAL_SETTINGS);
    setToastMessage('Notification preferences reset to default values.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save Preferences Handler
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToastMessage('Notification preferences saved successfully.');
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={styles.toastBanner}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={styles.toastText}>{toastMessage}</span>
          <button style={styles.closeToastBtn} onClick={() => setToastMessage(null)}>
            <X size={14} color="#065F46" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          TOP HEADER BAR
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        <div>
          <h1 style={styles.headerTitle}>Notification Settings</h1>
          <p style={styles.headerSubtitle}>
            Manage your inspection alerts, report notifications, and communication preferences.
          </p>
        </div>

        <div style={styles.headerRight}>
          <button style={styles.notificationBtn} aria-label="Notifications">
            <Bell size={18} color="#374151" />
            <span style={styles.notificationBadge}>2</span>
          </button>

          <div style={styles.profileChip} onClick={() => navigate('/inspector/profile')}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={styles.profileAvatarTop}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256';
              }}
            />
            <div style={styles.profileInfoTop}>
              <span style={styles.profileNameTop}>{displayName}</span>
              <span style={styles.profileRoleTop}>{displayRole}</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          SETTINGS FORM CONTAINER
      ═══════════════════════════════════════════════ */}
      <form onSubmit={handleSave} style={styles.formContainer}>
        {/* CARD 1: Inspection & Assignment Notifications */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <ClipboardList size={18} color="#2563EB" />
              <h2 style={styles.cardTitle}>Inspection & Assignment Notifications</h2>
            </div>
          </div>

          <div style={styles.cardBody}>
            {/* Item 1 */}
            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Inspection Assignment Alerts</h4>
                <p style={styles.toggleDesc}>
                  Receive notifications immediately when a new property inspection is assigned to your account.
                </p>
              </div>
              <button
                type="button"
                style={settings.assignmentAlerts ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('assignmentAlerts')}
                aria-label="Toggle Inspection Assignment Alerts"
              >
                <span
                  style={settings.assignmentAlerts ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>

            {/* Item 2 */}
            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Inspection Schedule Reminders</h4>
                <p style={styles.toggleDesc}>
                  Get automated reminders 24 hours and 2 hours prior to scheduled property inspection visits.
                </p>
              </div>
              <button
                type="button"
                style={settings.scheduleReminders ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('scheduleReminders')}
                aria-label="Toggle Schedule Reminders"
              >
                <span
                  style={settings.scheduleReminders ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>

            {/* Item 3 */}
            <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
              <div>
                <h4 style={styles.toggleTitle}>Schedule Changes & Cancellations</h4>
                <p style={styles.toggleDesc}>
                  Notify me if a property owner or PPC admin reschedules or cancels an inspection visit.
                </p>
              </div>
              <button
                type="button"
                style={settings.scheduleChanges ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('scheduleChanges')}
                aria-label="Toggle Schedule Changes"
              >
                <span
                  style={settings.scheduleChanges ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: Report & Review Notifications */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <FileText size={18} color="#2563EB" />
              <h2 style={styles.cardTitle}>Report & Review Notifications</h2>
            </div>
          </div>

          <div style={styles.cardBody}>
            {/* Item 1 */}
            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Report Approval Notifications</h4>
                <p style={styles.toggleDesc}>
                  Receive alerts when your submitted inspection reports are approved by the PPC quality review team.
                </p>
              </div>
              <button
                type="button"
                style={settings.reportApprovals ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('reportApprovals')}
                aria-label="Toggle Report Approvals"
              >
                <span
                  style={settings.reportApprovals ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>

            {/* Item 2 */}
            <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
              <div>
                <h4 style={styles.toggleTitle}>Revision Requests & QA Feedback</h4>
                <p style={styles.toggleDesc}>
                  Get instant alerts if a submitted inspection report requires additional notes or photo updates.
                </p>
              </div>
              <button
                type="button"
                style={settings.revisionRequests ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('revisionRequests')}
                aria-label="Toggle Revision Requests"
              >
                <span
                  style={settings.revisionRequests ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 3: Communication Channels & System Notifications */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardHeaderLeft}>
              <Bell size={18} color="#2563EB" />
              <h2 style={styles.cardTitle}>Communication Channels & System Alerts</h2>
            </div>
          </div>

          <div style={styles.cardBody}>
            {/* Item 1 */}
            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>Email Notifications</h4>
                <p style={styles.toggleDesc}>
                  Send notification summaries and schedule reminders to your registered email address.
                </p>
              </div>
              <button
                type="button"
                style={settings.emailNotifications ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('emailNotifications')}
                aria-label="Toggle Email Notifications"
              >
                <span
                  style={settings.emailNotifications ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>

            {/* Item 2 */}
            <div style={styles.toggleRow}>
              <div>
                <h4 style={styles.toggleTitle}>In-App & Real-Time Alerts</h4>
                <p style={styles.toggleDesc}>
                  Show real-time notification badges and pop-up alerts inside the PPC web dashboard.
                </p>
              </div>
              <button
                type="button"
                style={settings.inAppNotifications ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('inAppNotifications')}
                aria-label="Toggle In-App Notifications"
              >
                <span
                  style={settings.inAppNotifications ? styles.switchKnobOn : styles.switchKnobOff}
                />
              </button>
            </div>

            {/* Item 3 */}
            <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
              <div>
                <h4 style={styles.toggleTitle}>Important System & Platform Announcements</h4>
                <p style={styles.toggleDesc}>
                  Receive important platform updates, policy revisions, and scheduled maintenance notices.
                </p>
              </div>
              <button
                type="button"
                style={settings.systemAnnouncements ? styles.switchOn : styles.switchOff}
                onClick={() => handleToggle('systemAnnouncements')}
                aria-label="Toggle System Announcements"
              >
                <span
                  style={
                    settings.systemAnnouncements ? styles.switchKnobOn : styles.switchKnobOff
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={styles.actionBar}>
          <button type="button" style={styles.resetBtn} onClick={handleReset}>
            <RotateCcw size={15} color="#475569" />
            <span>Reset to Default</span>
          </button>

          <button type="submit" style={styles.saveBtn} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
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
    background: '#ECFDF5',
    border: '1.5px solid #A7F3D0',
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
    color: '#065F46',
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

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '900px',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    padding: '16px 24px',
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
    padding: '8px 24px',
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #F1F5F9',
    gap: '20px',
  },
  toggleTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F172A',
    margin: '0 0 2px 0',
  },
  toggleDesc: {
    fontSize: '12.5px',
    color: '#64748B',
    margin: 0,
    lineHeight: '1.4',
  },

  /* Toggle Switch Elements */
  switchOn: {
    position: 'relative',
    width: '46px',
    height: '24px',
    background: '#2563EB',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    flexShrink: 0,
    transition: 'background 0.2s ease',
  },
  switchOff: {
    position: 'relative',
    width: '46px',
    height: '24px',
    background: '#CBD5E1',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    flexShrink: 0,
    transition: 'background 0.2s ease',
  },
  switchKnobOn: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '20px',
    height: '20px',
    background: '#FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
  },
  switchKnobOff: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    background: '#FFFFFF',
    borderRadius: '50%',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
  },

  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#475569',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  saveBtn: {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 24px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  },
};

export default InspectorSetting;
