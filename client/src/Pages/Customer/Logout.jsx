import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { LogOut, X } from 'lucide-react';

/**
 * Customer Logout Page
 *
 * Displays a professional confirmation dialog.
 * On confirm: clears session (sessionStorage + localStorage auth keys)
 * via the existing AuthContext.logout(), then redirects to /login.
 * On cancel: navigates back to the previous page.
 */
const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [visible, setVisible] = useState(true);

  const handleCancel = useCallback(() => {
    setVisible(false);
    // Go back to the previous page; fallback to dashboard
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/customer/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // AuthContext.logout() handles:
    //   1. clearSession() → removes PROPERTY_CARE_SESSION from sessionStorage
    //   2. localStorage.removeItem('isLoggedIn')
    //   3. Resets React state { token: null, user: null }
    logout();

    // Redirect to login; replace so browser back button won't return here
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  // Escape key closes the dialog
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleCancel]);

  if (!visible) return null;

  return (
    <div style={s.backdrop} onClick={handleCancel}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close icon */}
        <button style={s.closeBtn} onClick={handleCancel} aria-label="Cancel">
          <X size={18} color="#6B7280" strokeWidth={2} />
        </button>

        {/* Icon */}
        <div style={s.iconWrap}>
          <LogOut size={28} color="#1D6A4A" strokeWidth={1.8} />
        </div>

        {/* Text */}
        <h2 style={s.title}>Log Out</h2>
        <p style={s.desc}>
          Are you sure you want to log out? You will need to sign in again to
          access your account.
        </p>

        {/* Buttons */}
        <div style={s.actions}>
          <button style={s.cancelBtn} onClick={handleCancel}>
            Cancel
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  modal: {
    position: 'relative',
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 28px 24px 28px',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.18)',
    textAlign: 'center',
    animation: 'fadeIn 0.18s ease-out',
  },
  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
  },
  iconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: '#E8F4F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  title: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 6px 0',
  },
  desc: {
    fontSize: '13px',
    color: '#6B7280',
    lineHeight: 1.55,
    margin: '0 0 24px 0',
    fontWeight: '400',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    flex: 1,
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '9px',
    padding: '9px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'border-color 0.15s',
  },
  logoutBtn: {
    flex: 1,
    background: '#DC2626',
    border: '1.5px solid #DC2626',
    borderRadius: '9px',
    padding: '9px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    transition: 'background 0.15s',
  },
};

export default Logout;
