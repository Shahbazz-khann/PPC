import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../Services/AuthSession';
import { useAuth } from '../../Context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  BedDouble,
  Bath,
  Maximize,
  FileText,
  ArrowRight,
  Bell,
  CheckCircle2,
  Receipt,
  Home,
} from 'lucide-react';

// ─── Static / Mock Data ────────────────────────────────────────────────────────
// Replace each array/object below with real API calls when the backend is ready.

const MOCK_STATS = [
  {
    id: 'visits',
    icon: Calendar,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    value: 3,
    label: 'Upcoming Visits',
    sub: '1 this week',
    subColor: '#1D6A4A',
  },
  {
    id: 'transactions',
    icon: FileText,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    value: 1,
    label: 'Active Transactions',
    sub: 'In progress',
    subColor: '#6B7280',
  },
  {
    id: 'invoices',
    icon: Receipt,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    value: 2,
    label: 'Pending Invoices',
    sub: 'Total Rs. 85,000',
    subColor: '#6B7280',
  },
];

const MOCK_PROPERTIES = [
  {
    id: 1,
    image: '/src/assets/prop_villa.png',
    badge: 'For Sale',
    badgeColor: '#1D6A4A',
    title: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    price: 'Rs. 25,000,000',
    priceNote: null,
    beds: 5,
    baths: 6,
    area: '1 Kanal',
    areaIcon: 'kanal',
  },
  {
    id: 2,
    image: '/src/assets/prop_apartment.png',
    badge: 'For Sale',
    badgeColor: '#1D6A4A',
    title: 'Luxury Apartment',
    location: 'DHA Phase 2, Islamabad',
    price: 'Rs. 18,500,000',
    priceNote: null,
    beds: 3,
    baths: 3,
    area: '1200 sqft',
    areaIcon: 'sqft',
  },
  {
    id: 3,
    image: '/src/assets/prop_house.png',
    badge: 'For Rent',
    badgeColor: '#0EA5E9',
    title: 'Fully Furnished House',
    location: 'G-13, Islamabad',
    price: 'Rs. 120,000',
    priceNote: '/ month',
    beds: 4,
    baths: 4,
    area: '10 Marla',
    areaIcon: 'marla',
  },
];

const MOCK_UPCOMING_VISIT = {
  image: '/src/assets/prop_villa.png',
  title: 'Modern Family Villa',
  location: 'Bahria Town, Islamabad',
  status: 'Confirmed',
  date: '18 Aug 2026',
  time: '04:00 PM',
  inspector: 'Ahmed Raza',
};

const MOCK_RECENT_TRANSACTION = {
  title: 'Luxury Apartment in DHA',
  type: 'Purchase',
  status: 'In Progress',
  amount: 'Rs. 18,500,000',
};

const MOCK_ACTIVITY = [
  {
    id: 1,
    icon: CheckCircle2,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    text: 'Property visit confirmed',
    time: 'Today, 10:30 AM',
  },
  {
    id: 2,
    icon: FileText,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    text: 'Inspection report available',
    time: 'Yesterday, 04:15 PM',
  },
  {
    id: 3,
    icon: Receipt,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    text: 'Invoice generated',
    time: '3 days ago',
  },
];

// ─── Sub-Components ────────────────────────────────────────────────────────────

const StatCard = ({ stat }) => {
  const IconComp = stat.icon;
  return (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            ...styles.statIconBox,
            background: stat.iconBg,
          }}
        >
          <IconComp size={20} color={stat.iconColor} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.statValue}>{stat.value}</div>
          <div style={styles.statLabel}>{stat.label}</div>
        </div>
      </div>
      <div style={{ ...styles.statSub, color: stat.subColor }}>{stat.sub}</div>
    </div>
  );
};

const PropertyCard = ({ prop }) => {
  return (
    <div style={styles.propCard}>
      {/* Image */}
      <div style={styles.propImageWrap}>
        <img
          src={prop.image}
          alt={prop.title}
          style={styles.propImage}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Badge */}
        <span
          style={{
            ...styles.propBadge,
            background: prop.badgeColor,
          }}
        >
          {prop.badge}
        </span>
      </div>

      {/* Info */}
      <div style={styles.propBody}>
        <div style={styles.propTitle}>{prop.title}</div>
        <div style={styles.propLocation}>
          <MapPin size={12} color="#9CA3AF" strokeWidth={2} />
          <span>{prop.location}</span>
        </div>
        <div style={styles.propPrice}>
          {prop.price}
          {prop.priceNote && (
            <span style={styles.propPriceNote}>{prop.priceNote}</span>
          )}
        </div>
        {/* Features */}
        <div style={styles.propFeatures}>
          <span style={styles.propFeature}>
            <BedDouble size={12} color="#6B7280" strokeWidth={2} />
            {prop.beds} Bed
          </span>
          <span style={styles.propFeature}>
            <Bath size={12} color="#6B7280" strokeWidth={2} />
            {prop.baths} Bath
          </span>
          <span style={styles.propFeature}>
            <Maximize size={12} color="#6B7280" strokeWidth={2} />
            {prop.area}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard Component ──────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Carousel state for properties
  const [propStart, setPropStart] = useState(0);
  const visibleCount = 3;

  const handlePrevProp = () => {
    setPropStart((prev) => Math.max(0, prev - 1));
  };
  const handleNextProp = () => {
    setPropStart((prev) =>
      Math.min(MOCK_PROPERTIES.length - visibleCount, prev + 1)
    );
  };

  const visibleProps = MOCK_PROPERTIES.slice(
    propStart,
    propStart + visibleCount
  );

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name?.split(' ')[0] || '…';

  // Logout handler — preserves existing session clearing logic
  const handleLogout = () => {
    clearSession();
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      {/* ═══════════════════════════════════════════════
          TOP HEADER — greeting & search
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        {/* Left: search bar only */}
        <div style={styles.headerLeft}>
          <div style={styles.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={styles.searchPlaceholder}>Search properties, locations...</span>
          </div>
        </div>

        {/* Right: bell + profile */}
        <div style={styles.headerRight}>
          {/* Notification Bell */}
          <button style={styles.bellBtn} aria-label="Notifications">
            <Bell size={20} color="#374151" strokeWidth={1.8} />
            <span style={styles.bellDot}>3</span>
          </button>

          {/* Profile */}
          <div style={styles.profileChip}>
            <img
              src="/src/assets/customer_avatar.png"
              alt={displayName}
              style={styles.profileAvatar}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80';
              }}
            />
            <div style={styles.profileText}>
              <span style={styles.profileName}>{user?.name || '—'}</span>
              <span style={styles.profileRole}>{user?.role_name || '—'}</span>
            </div>
            <ChevronRight size={14} color="#9CA3AF" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          TWO-COLUMN LAYOUT: Main + Sidebar
      ═══════════════════════════════════════════════ */}
      <div style={styles.twoCol}>
        {/* ────────────────────────────────────────────
            LEFT / MAIN CONTENT
        ──────────────────────────────────────────── */}
        <div style={styles.mainCol}>

          {/* ── Greeting ── */}
          <section style={styles.greetingSection}>
            <h1 style={styles.greetingTitle}>
              {getGreeting()}, {displayName}! <span aria-label="wave">👋</span>
            </h1>
            <p style={styles.greetingSub}>Find a property that feels right for you.</p>
          </section>

          {/* ── Stat Cards ── */}
          <section style={styles.statsGrid}>
            {MOCK_STATS.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </section>

          {/* ── Available Properties ── */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Available Properties</h2>
              <button style={styles.viewAllBtn}>
                View All Properties <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Carousel */}
            <div style={styles.propCarouselWrap}>
              <div style={styles.propCarouselGrid}>
                {visibleProps.map((prop) => (
                  <PropertyCard key={prop.id} prop={prop} />
                ))}
              </div>

              {/* Nav arrows */}
              {MOCK_PROPERTIES.length > visibleCount && (
                <button
                  style={{
                    ...styles.carouselArrow,
                    right: '-16px',
                    opacity: propStart >= MOCK_PROPERTIES.length - visibleCount ? 0.3 : 1,
                  }}
                  onClick={handleNextProp}
                  disabled={propStart >= MOCK_PROPERTIES.length - visibleCount}
                  aria-label="Next properties"
                >
                  <ChevronRight size={18} color="#1D6A4A" strokeWidth={2.5} />
                </button>
              )}
              {MOCK_PROPERTIES.length > visibleCount && (
                <button
                  style={{
                    ...styles.carouselArrow,
                    left: '-16px',
                    opacity: propStart === 0 ? 0.3 : 1,
                  }}
                  onClick={handlePrevProp}
                  disabled={propStart === 0}
                  aria-label="Previous properties"
                >
                  <ChevronLeft size={18} color="#1D6A4A" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </section>

          {/* ── Bottom Row: Upcoming Visit + Recent Transaction ── */}
          <div style={styles.bottomRow}>
            {/* Upcoming Visit */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Upcoming Visit</h2>
              <div style={styles.visitContent}>
                <img
                  src={MOCK_UPCOMING_VISIT.image}
                  alt={MOCK_UPCOMING_VISIT.title}
                  style={styles.visitImage}
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div style={styles.visitInfo}>
                  <div style={styles.visitTitleRow}>
                    <span style={styles.visitTitle}>{MOCK_UPCOMING_VISIT.title}</span>
                    <span style={styles.confirmedBadge}>{MOCK_UPCOMING_VISIT.status}</span>
                  </div>
                  <div style={styles.visitLocation}>
                    <MapPin size={12} color="#9CA3AF" />
                    <span>{MOCK_UPCOMING_VISIT.location}</span>
                  </div>
                  <div style={styles.visitMeta}>
                    <span style={styles.visitMetaItem}>
                      <Calendar size={13} color="#6B7280" />
                      {MOCK_UPCOMING_VISIT.date}
                    </span>
                    <span style={styles.visitMetaItem}>
                      <Clock size={13} color="#6B7280" />
                      {MOCK_UPCOMING_VISIT.time}
                    </span>
                  </div>
                  <div style={styles.visitInspector}>
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                      alt={MOCK_UPCOMING_VISIT.inspector}
                      style={styles.inspectorAvatar}
                    />
                    <span style={styles.inspectorName}>Inspector: {MOCK_UPCOMING_VISIT.inspector}</span>
                  </div>
                </div>
              </div>
              <div style={styles.visitBtns}>
                <button style={styles.btnPrimary}>View Property</button>
                <button style={styles.btnSecondary}>Visit Details</button>
              </div>
            </section>

            {/* Recent Transaction */}
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Recent Transaction</h2>
              <div style={styles.txCard}>
                <div style={styles.txTitle}>{MOCK_RECENT_TRANSACTION.title}</div>
                <div style={styles.txMeta}>
                  <span style={styles.txMetaItem}>
                    Type: <strong>{MOCK_RECENT_TRANSACTION.type}</strong>
                  </span>
                  <span style={styles.txStatusBadge}>
                    {MOCK_RECENT_TRANSACTION.status}
                  </span>
                </div>
                <div style={styles.txDivider} />
                <div style={styles.txRow}>
                  <span style={styles.txRowLabel}>Transaction Amount</span>
                  <span style={styles.txRowValue}>{MOCK_RECENT_TRANSACTION.amount}</span>
                </div>
                <button style={styles.txViewBtn}>View Transaction</button>
              </div>
            </section>
          </div>
        </div>

        {/* ────────────────────────────────────────────
            RIGHT SIDEBAR PANEL
        ──────────────────────────────────────────── */}
        <aside style={styles.rightAside}>
          {/* Customer Profile Card */}
          <div style={styles.profileCard}>
            <img
              src="/src/assets/customer_avatar.png"
              alt={user?.name || 'Profile'}
              style={styles.profileCardAvatar}
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80';
              }}
            />
            <div style={styles.profileCardName}>{user?.name || '—'}</div>
            <div style={styles.profileCardRole}>{user?.role_name || '—'}</div>

            <div style={styles.profileContactList}>
              <div style={styles.profileContactItem}>
                <Mail size={14} color="#1D6A4A" strokeWidth={1.8} />
                <span>{user?.email || '—'}</span>
              </div>
              <div style={styles.profileContactItem}>
                <Phone size={14} color="#1D6A4A" strokeWidth={1.8} />
                <span>{user?.mobile_no || '—'}</span>
              </div>
              <div style={styles.profileContactItem}>
                <MapPin size={14} color="#1D6A4A" strokeWidth={1.8} />
                <span>{user?.country || '—'}</span>
              </div>
            </div>

            <button style={styles.viewProfileBtn}>View Profile</button>
          </div>

          {/* Recent Activity */}
          <div style={styles.activityCard}>
            <div style={styles.activityHeader}>
              <span style={styles.sectionTitle}>Recent Activity</span>
              <button style={styles.viewAllSmall}>View All</button>
            </div>

            <div style={styles.activityList}>
              {MOCK_ACTIVITY.map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.id} style={styles.activityItem}>
                    <div
                      style={{
                        ...styles.activityIconBox,
                        background: item.iconBg,
                      }}
                    >
                      <IconComp size={14} color={item.iconColor} strokeWidth={2} />
                    </div>
                    <div style={styles.activityText}>
                      <div style={styles.activityLabel}>{item.text}</div>
                      <div style={styles.activityTime}>{item.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button style={styles.goActivityBtn}>Go to Activity</button>
          </div>
        </aside>
      </div>


    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
// Inline styles used intentionally for total isolation — zero risk of CSS bleed
// into the existing sidebar or layout. Replace with CSS modules if preferred.

const styles = {
  // ── Page wrapper ──
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
  },

  // ── Top header bar ──
  topHeader: {
    background: '#FFFFFF',
    padding: '12px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  },
  hamburgerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  hamburgerLine: {
    width: '20px',
    height: '2px',
    background: '#374151',
    borderRadius: '2px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '8px 16px',
    flex: 1,
    maxWidth: '460px',
    cursor: 'text',
  },
  searchPlaceholder: {
    fontSize: '13px',
    color: '#9CA3AF',
    userSelect: 'none',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  bellBtn: {
    position: 'relative',
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  bellDot: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '16px',
    height: '16px',
    background: '#E11D48',
    borderRadius: '50%',
    fontSize: '9px',
    color: '#fff',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fff',
  },
  profileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '12px',
    transition: 'background 0.15s',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #E5E7EB',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  },

  // ── Two column layout ──
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
    padding: '24px 28px 28px 28px',
    flex: 1,
    alignItems: 'start',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
  },

  // ── Greeting ──
  greetingSection: {
    paddingBottom: '4px',
  },
  greetingTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1.3,
  },
  greetingSub: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '500',
  },

  // ── Stat cards ──
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px 18px 14px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'default',
  },
  statIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    marginTop: '2px',
  },
  statSub: {
    fontSize: '11px',
    fontWeight: '600',
  },

  // ── Section shared ──
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1D6A4A',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
  },

  // ── Property Carousel ──
  propCarouselWrap: {
    position: 'relative',
  },
  propCarouselGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  carouselArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    zIndex: 2,
    transition: 'opacity 0.15s',
  },

  // ── Property Card ──
  propCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    transition: 'box-shadow 0.2s, transform 0.2s',
  },
  propImageWrap: {
    position: 'relative',
    height: '160px',
    overflow: 'hidden',
  },
  propImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s',
  },
  propBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '20px',
  },
  propBody: {
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  propTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
  },
  propLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  propPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1D6A4A',
    marginTop: '2px',
  },
  propPriceNote: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: '2px',
  },
  propFeatures: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  propFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  },

  // ── Bottom Row ──
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  card: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  // ── Upcoming Visit ──
  visitContent: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  visitImage: {
    width: '90px',
    height: '75px',
    borderRadius: '10px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  visitInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  visitTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  visitTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
  },
  confirmedBadge: {
    background: '#D1FAE5',
    color: '#065F46',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
    border: '1px solid #A7F3D0',
  },
  visitLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#6B7280',
  },
  visitMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  visitMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  },
  visitInspector: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  inspectorAvatar: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #E5E7EB',
  },
  inspectorName: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  },
  visitBtns: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimary: {
    flex: 1,
    background: '#1D6A4A',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnSecondary: {
    flex: 1,
    background: '#fff',
    color: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '10px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },

  // ── Transaction ──
  txCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  txTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
  },
  txMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  txMetaItem: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  txStatusBadge: {
    background: '#FEF3C7',
    color: '#B45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 10px',
    borderRadius: '20px',
    border: '1px solid #FDE68A',
  },
  txDivider: {
    height: '1px',
    background: '#F3F4F6',
    margin: '2px 0',
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txRowLabel: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
  },
  txRowValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
  },
  txViewBtn: {
    width: '100%',
    background: '#fff',
    color: '#B45309',
    border: '1.5px solid #FCD34D',
    borderRadius: '10px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'background 0.15s',
  },

  // ── Right Aside ──
  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '72px',
  },

  // ── Profile Card ──
  profileCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  profileCardAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E5E7EB',
    marginBottom: '6px',
  },
  profileCardName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
  },
  profileCardRole: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '8px',
  },
  profileContactList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px',
  },
  profileContactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#374151',
    fontWeight: '500',
  },
  viewProfileBtn: {
    width: '100%',
    background: '#fff',
    color: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '10px',
    padding: '9px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s',
    marginTop: '4px',
  },

  // ── Activity Card ──
  activityCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  activityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllSmall: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1D6A4A',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  activityIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityText: {
    flex: 1,
  },
  activityLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#111827',
    lineHeight: 1.4,
  },
  activityTime: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  goActivityBtn: {
    width: '100%',
    background: '#fff',
    color: '#1D6A4A',
    border: '1.5px solid #1D6A4A',
    borderRadius: '10px',
    padding: '9px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },

  // ── Footer ──
  footer: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '12px',
    color: '#9CA3AF',
    borderTop: '1px solid #E5E7EB',
    background: '#FFFFFF',
  },
};

export default Dashboard;