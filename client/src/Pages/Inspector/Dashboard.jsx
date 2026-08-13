import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Clock,
  RotateCw,
  CheckCircle2,
  FileText,
  Calendar,
  MapPin,
  ArrowRight,
} from 'lucide-react';

// ─── Mock Data for Inspector Dashboard ────────────────────────────────────────
const MOCK_STATS = [
  {
    id: 'assigned',
    title: 'Assigned Inspections',
    subtitle: 'Total assigned to you',
    value: 18,
    icon: ClipboardList,
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
  {
    id: 'pending',
    title: 'Pending Inspections',
    subtitle: 'Awaiting inspection',
    value: 7,
    icon: Clock,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    subtitle: 'Currently ongoing',
    value: 4,
    icon: RotateCw,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'This month',
    value: 24,
    icon: CheckCircle2,
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
  },
  {
    id: 'reports',
    title: 'Reports Submitted',
    subtitle: 'This month',
    value: 21,
    icon: FileText,
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
  },
];

const MOCK_OVERVIEW = {
  pending: 7,
  pendingPercent: 20,
  inProgress: 4,
  inProgressPercent: 11,
  completed: 24,
  completedPercent: 69,
  total: 35,
};

const MOCK_UPCOMING_SCHEDULES = [
  {
    id: 1,
    day: '11',
    month: 'AUG',
    time: '10:00 AM',
    title: 'House # 123, Street 5',
    location: 'Bahria Town, Phase 8, Rawalpindi',
    status: 'Upcoming',
  },
  {
    id: 2,
    day: '11',
    month: 'AUG',
    time: '02:00 PM',
    title: 'Plot # 45, Block C',
    location: 'DHA Phase 2, Islamabad',
    status: 'Upcoming',
  },
  {
    id: 3,
    day: '12',
    month: 'AUG',
    time: '11:30 AM',
    title: 'House # 67, Street 12',
    location: 'G-13/4, Islamabad',
    status: 'Upcoming',
  },
  {
    id: 4,
    day: '12',
    month: 'AUG',
    time: '03:00 PM',
    title: 'Plot # 09, Block A',
    location: 'Citi Housing, Jhelum',
    status: 'Upcoming',
  },
];

const MOCK_RECENT_INSPECTIONS = [
  {
    id: 1,
    title: 'House # 23, Street 7',
    location: 'DHA Phase 5, Islamabad',
    completedDate: 'Completed on 10 Aug 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 2,
    title: 'Plot # 12, Block B',
    location: 'Bahria Town, Phase 8, Rawalpindi',
    completedDate: 'Completed on 09 Aug 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 3,
    title: 'House # 44, Street 3',
    location: 'G-11/2, Islamabad',
    completedDate: 'Completed on 08 Aug 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 4,
    title: 'Plot # 88, Block D',
    location: 'DHA Phase 2, Islamabad',
    completedDate: 'Completed on 07 Aug 2025',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=120&q=80',
  },
];

// Trend chart points data
const TREND_DATA = [
  { label: '1 Aug', assigned: 7, completed: 2, pending: 0 },
  { label: '3 Aug', assigned: 10, completed: 4, pending: 1 },
  { label: '5 Aug', assigned: 14, completed: 6, pending: 2 },
  { label: '7 Aug', assigned: 17, completed: 9, pending: 3 },
  { label: '9 Aug', assigned: 20, completed: 14, pending: 5 },
  { label: '11 Aug', assigned: 23, completed: 17, pending: 7 },
];

const InspectorDashboard = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;

  const [timeRange, setTimeRange] = useState('This Month');

  const displayName = user?.full_name || user?.name || 'Sara';
  const displayRole = 'Inspector';
  const avatarUrl =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

  return (
    <div style={styles.container}>
      {/* ═══════════════════════════════════════════════
          TOP HEADER
      ═══════════════════════════════════════════════ */}
      <header style={styles.topHeader}>
        {/* Welcome Greeting */}
        <div>
          <h1 style={styles.greetingTitle}>
            Good morning, Inspector {displayName} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p style={styles.greetingSub}>
            Here's what's happening with your inspections today.
          </p>
        </div>

        {/* Header Right Actions & Profile */}
        <div style={styles.headerRight}>
          {/* Current Date Badge */}
          <div style={styles.dateBadge}>
            <Calendar size={15} color="#6B7280" />
            <span style={styles.dateText}>11 August 2025, Monday</span>
          </div>

          {/* Notification Button */}
          <button style={styles.notificationBtn} aria-label="Notifications">
            <Bell size={18} color="#374151" />
            <span style={styles.notificationBadge}>3</span>
          </button>

          {/* Logged-in Inspector Profile Chip */}
          <div style={styles.profileChip} onClick={() => navigate('/inspector/profile')}>
            <img
              src={avatarUrl}
              alt={displayName}
              style={styles.profileAvatar}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';
              }}
            />
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{displayName}</span>
              <span style={styles.profileRole}>{displayRole}</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          TOP METRIC STAT CARDS (5 Cards Grid)
      ═══════════════════════════════════════════════ */}
      <section style={styles.statsGrid}>
        {MOCK_STATS.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} style={styles.statCard}>
              <div style={styles.statCardHeader}>
                <span style={styles.statTitle}>{stat.title}</span>
                <div style={{ ...styles.statIconBox, background: stat.iconBg, color: stat.iconColor }}>
                  <IconComponent size={20} />
                </div>
              </div>
              <div style={styles.statValueRow}>
                <span style={styles.statValue}>{stat.value}</span>
              </div>
              <span style={styles.statSubtitle}>{stat.subtitle}</span>
            </div>
          );
        })}
      </section>

      {/* ═══════════════════════════════════════════════
          MIDDLE ROW: Inspection Overview & Upcoming Schedules
      ═══════════════════════════════════════════════ */}
      <section style={styles.middleGrid}>
        {/* Left: Inspection Overview Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Inspection Overview</h3>
            <div style={styles.dropdownWrap}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={styles.dropdownSelect}
              >
                <option value="This Month">This Month</option>
                <option value="This Week">This Week</option>
                <option value="All Time">All Time</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={styles.dropdownIcon} />
            </div>
          </div>

          <div style={styles.donutSection}>
            {/* SVG Donut Chart */}
            <div style={styles.donutWrapper}>
              <svg viewBox="0 0 100 100" style={styles.donutSvg}>
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="11" fill="none" />

                {/* Completed Arc (69%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#22C55E"
                  strokeWidth="11"
                  fill="none"
                  strokeDasharray="172.5 251.3"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* Pending Arc (20%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3B82F6"
                  strokeWidth="11"
                  fill="none"
                  strokeDasharray="50.2 251.3"
                  strokeDashoffset="-172.5"
                  strokeLinecap="round"
                />
                {/* In Progress Arc (11%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#F59E0B"
                  strokeWidth="11"
                  fill="none"
                  strokeDasharray="28.6 251.3"
                  strokeDashoffset="-222.7"
                  strokeLinecap="round"
                />
              </svg>
              <div style={styles.donutCenter}>
                <span style={styles.donutCenterLabel}>Total</span>
                <span style={styles.donutCenterValue}>{MOCK_OVERVIEW.total}</span>
              </div>
            </div>

            {/* Donut Legend List */}
            <div style={styles.donutLegendList}>
              <div style={styles.legendRow}>
                <div style={styles.legendDotGroup}>
                  <span style={{ ...styles.legendDot, background: '#3B82F6' }} />
                  <span style={styles.legendLabel}>Pending</span>
                </div>
                <span style={styles.legendValue}>
                  {MOCK_OVERVIEW.pending} ({MOCK_OVERVIEW.pendingPercent}%)
                </span>
              </div>

              <div style={styles.legendRow}>
                <div style={styles.legendDotGroup}>
                  <span style={{ ...styles.legendDot, background: '#F59E0B' }} />
                  <span style={styles.legendLabel}>In Progress</span>
                </div>
                <span style={styles.legendValue}>
                  {MOCK_OVERVIEW.inProgress} ({MOCK_OVERVIEW.inProgressPercent}%)
                </span>
              </div>

              <div style={styles.legendRow}>
                <div style={styles.legendDotGroup}>
                  <span style={{ ...styles.legendDot, background: '#22C55E' }} />
                  <span style={styles.legendLabel}>Completed</span>
                </div>
                <span style={styles.legendValue}>
                  {MOCK_OVERVIEW.completed} ({MOCK_OVERVIEW.completedPercent}%)
                </span>
              </div>

              <div style={styles.legendTotalRow}>
                <span style={styles.legendTotalLabel}>Total</span>
                <span style={styles.legendTotalValue}>{MOCK_OVERVIEW.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Schedules Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Upcoming Schedules</h3>
            <button
              style={styles.viewAllBtn}
              onClick={() => navigate('/inspector/schedules')}
            >
              View all
            </button>
          </div>

          <div style={styles.schedulesList}>
            {MOCK_UPCOMING_SCHEDULES.map((item) => (
              <div key={item.id} style={styles.scheduleItem}>
                <div style={styles.scheduleLeft}>
                  {/* Date Circle/Box */}
                  <div style={styles.dateBox}>
                    <span style={styles.dateDay}>{item.day}</span>
                    <span style={styles.dateMonth}>{item.month}</span>
                  </div>
                  {/* Time & Property Details */}
                  <div>
                    <div style={styles.scheduleTimeRow}>
                      <Clock size={13} color="#6B7280" />
                      <span style={styles.scheduleTime}>{item.time}</span>
                    </div>
                    <h4 style={styles.schedulePropertyTitle}>{item.title}</h4>
                    <p style={styles.scheduleLocation}>{item.location}</p>
                  </div>
                </div>

                <span style={styles.upcomingBadge}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BOTTOM ROW: Recent Inspections & Status Trend Graph
      ═══════════════════════════════════════════════ */}
      <section style={styles.bottomGrid}>
        {/* Left: Recent Inspections Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Recent Inspections</h3>
            <button
              style={styles.viewAllBtn}
              onClick={() => navigate('/inspector/inspections')}
            >
              View all
            </button>
          </div>

          <div style={styles.recentList}>
            {MOCK_RECENT_INSPECTIONS.map((item) => (
              <div key={item.id} style={styles.recentItem}>
                <div style={styles.recentLeft}>
                  <img src={item.image} alt={item.title} style={styles.recentThumb} />
                  <div>
                    <h4 style={styles.recentTitle}>{item.title}</h4>
                    <p style={styles.recentSub}>{item.location}</p>
                    <span style={styles.recentDate}>{item.completedDate}</span>
                  </div>
                </div>
                <span style={styles.completedBadge}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Inspection Status Trend Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Inspection Status Trend</h3>
            <div style={styles.dropdownWrap}>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={styles.dropdownSelect}
              >
                <option value="This Month">This Month</option>
                <option value="This Week">This Week</option>
                <option value="All Time">All Time</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={styles.dropdownIcon} />
            </div>
          </div>

          {/* Trend Chart Legends */}
          <div style={styles.trendLegendsRow}>
            <div style={styles.trendLegendItem}>
              <span style={{ ...styles.trendLegendLine, background: '#2563EB' }} />
              <span style={styles.trendLegendText}>Assigned</span>
            </div>
            <div style={styles.trendLegendItem}>
              <span style={{ ...styles.trendLegendLine, background: '#EAB308' }} />
              <span style={styles.trendLegendText}>Completed</span>
            </div>
            <div style={styles.trendLegendItem}>
              <span style={{ ...styles.trendLegendLine, background: '#22C55E' }} />
              <span style={styles.trendLegendText}>Pending</span>
            </div>
          </div>

          {/* SVG Status Trend Line Chart */}
          <div style={styles.chartWrapper}>
            <svg viewBox="0 0 500 200" style={styles.trendSvg}>
              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {[25, 20, 15, 10, 5, 0].map((val, idx) => {
                const y = 20 + idx * 30;
                return (
                  <g key={val}>
                    <line x1="35" y1={y} x2="480" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    <text x="25" y={y + 4} fontSize="11" fill="#9CA3AF" textAnchor="end">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Labels */}
              {TREND_DATA.map((item, idx) => {
                const x = 50 + idx * 80;
                return (
                  <text key={item.label} x={x} y="192" fontSize="11" fill="#9CA3AF" textAnchor="middle">
                    {item.label}
                  </text>
                );
              })}

              {/* Line 1: Assigned (Blue #2563EB) */}
              <path
                d="M 50 128 L 130 110 L 210 86 L 290 68 L 370 50 L 450 32"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {[
                { x: 50, y: 128 },
                { x: 130, y: 110 },
                { x: 210, y: 86 },
                { x: 290, y: 68 },
                { x: 370, y: 50 },
                { x: 450, y: 32 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              ))}

              {/* Line 2: Completed (Yellow #EAB308) */}
              <path
                d="M 50 158 L 130 146 L 210 134 L 290 116 L 370 86 L 450 68"
                fill="none"
                stroke="#EAB308"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {[
                { x: 50, y: 158 },
                { x: 130, y: 146 },
                { x: 210, y: 134 },
                { x: 290, y: 116 },
                { x: 370, y: 86 },
                { x: 450, y: 68 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" />
              ))}

              {/* Line 3: Pending (Green #22C55E) */}
              <path
                d="M 50 170 L 130 164 L 210 158 L 290 152 L 370 140 L 450 128"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {[
                { x: 50, y: 170 },
                { x: 130, y: 164 },
                { x: 210, y: 158 },
                { x: 290, y: 152 },
                { x: 370, y: 140 },
                { x: 450, y: 128 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#22C55E" stroke="#FFFFFF" strokeWidth="2" />
              ))}
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

// ─── Styles Object (Matching Modern Clean PPC Design) ────────────────────────
const styles = {
  container: {
    background: '#F8FAFC',
    minHeight: '100vh',
    padding: '24px 32px 40px 32px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#0F172A',
  },

  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  greetingTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
    lineHeight: 1.2,
  },
  greetingSub: {
    fontSize: '13px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '8px 14px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  dateText: {
    fontSize: '12.5px',
    fontWeight: '600',
    color: '#334155',
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
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid #E2E8F0',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
  },
  profileRole: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#64748B',
  },

  /* ── 5 Stat Cards Grid ── */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  statCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  statTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  statIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },
  statSubtitle: {
    fontSize: '11.5px',
    color: '#64748B',
    fontWeight: '500',
  },

  /* ── Middle Grid Layout ── */
  middleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '28px',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0F172A',
    margin: 0,
  },

  dropdownWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  dropdownSelect: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    padding: '5px 26px 5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    background: '#F8FAFC',
    cursor: 'pointer',
    outline: 'none',
  },
  dropdownIcon: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
  },
  viewAllBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#2563EB',
    cursor: 'pointer',
  },

  /* ── Donut Chart Styling ── */
  donutSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    marginTop: '8px',
  },
  donutWrapper: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0,
  },
  donutSvg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '500',
  },
  donutCenterValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },

  donutLegendList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  legendDotGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendLabel: {
    color: '#334155',
    fontWeight: '600',
  },
  legendValue: {
    color: '#64748B',
    fontWeight: '600',
  },
  legendTotalRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px solid #F1F5F9',
    fontSize: '13px',
  },
  legendTotalLabel: {
    fontWeight: '800',
    color: '#0F172A',
  },
  legendTotalValue: {
    fontWeight: '800',
    color: '#0F172A',
  },

  /* ── Upcoming Schedules ── */
  schedulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: '#F8FAFC',
    border: '1px solid #F1F5F9',
    borderRadius: '12px',
  },
  scheduleLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  dateBox: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '6px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '52px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  dateDay: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 1,
  },
  dateMonth: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#64748B',
    marginTop: '2px',
  },
  scheduleTimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
    marginBottom: '2px',
  },
  scheduleTime: {
    fontSize: '11.5px',
  },
  schedulePropertyTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  scheduleLocation: {
    fontSize: '11.5px',
    color: '#64748B',
    margin: '1px 0 0 0',
  },
  upcomingBadge: {
    background: '#EEF2FF',
    color: '#3557E8',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '8px',
  },

  /* ── Bottom Grid ── */
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },

  /* ── Recent Inspections ── */
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    background: '#FFFFFF',
    border: '1px solid #F1F5F9',
    borderRadius: '12px',
  },
  recentLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  recentThumb: {
    width: '46px',
    height: '46px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
  },
  recentTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    margin: 0,
  },
  recentSub: {
    fontSize: '11.5px',
    color: '#64748B',
    margin: '1px 0 0 0',
  },
  recentDate: {
    fontSize: '11px',
    color: '#94A3B8',
    display: 'block',
    marginTop: '2px',
  },
  completedBadge: {
    background: '#DCFCE7',
    color: '#15803D',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '8px',
  },

  /* ── Trend Graph Styling ── */
  trendLegendsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '16px',
  },
  trendLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  trendLegendLine: {
    width: '16px',
    height: '3px',
    borderRadius: '2px',
  },
  trendLegendText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
  },
  chartWrapper: {
    width: '100%',
    height: '180px',
  },
  trendSvg: {
    width: '100%',
    height: '100%',
  },
};

export default InspectorDashboard;
