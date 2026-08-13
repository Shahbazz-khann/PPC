import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Headphones,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// Replace with API calls when backend is ready.
// Fields match the expected visit/property schema.

const MOCK_UPCOMING_VISITS = [
  {
    id: 1,
    status: 'Confirmed',
    property: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    date: '18 Aug 2026',
    time: '04:00 PM',
    inspector: 'Ahmed Raza',
    image: '/src/assets/prop_villa.png',
    fallback:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    status: 'Scheduled',
    property: 'Luxury Apartment in DHA',
    location: 'DHA Phase 2, Islamabad',
    date: '22 Aug 2026',
    time: '11:30 AM',
    inspector: 'Usman Ali',
    image: '/src/assets/prop_apartment.png',
    fallback:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    status: 'Pending',
    property: 'Fully Furnished House',
    location: 'G-13, Islamabad',
    date: '25 Aug 2026',
    time: '03:00 PM',
    inspector: 'Bilal Ahmed',
    image: '/src/assets/prop_house.png',
    fallback:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80',
  },
];

const MOCK_PAST_VISITS = [
  {
    id: 101,
    property: 'Modern Apartment',
    location: 'Bahria Town, Islamabad',
    dateTime: '10 Aug 2026',
    time: '02:00 PM',
    inspector: 'Ahmed Raza',
    inspectorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    status: 'Completed',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 102,
    property: 'House for Sale',
    location: 'DHA Phase 1, Islamabad',
    dateTime: '05 Aug 2026',
    time: '11:00 AM',
    inspector: 'Usman Ali',
    inspectorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    status: 'Completed',
    rating: 4,
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 103,
    property: 'Luxury Villa',
    location: 'G-15, Islamabad',
    dateTime: '28 Jul 2026',
    time: '04:30 PM',
    inspector: 'Bilal Ahmed',
    inspectorAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80',
    status: 'Completed',
    rating: 5,
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=120&q=80',
  },
];

const MOCK_SUMMARY = {
  upcoming: 3,
  completed: 5,
  pending: 1,
  avgRating: 4.8,
};

const MOCK_THIS_WEEK = [
  {
    id: 1,
    property: 'Modern Family Villa',
    dateTime: '18 Aug, 04:00 PM',
    image: '/src/assets/prop_villa.png',
    fallback:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 2,
    property: 'Luxury Apartment in DHA',
    dateTime: '22 Aug, 11:30 AM',
    image: '/src/assets/prop_apartment.png',
    fallback:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=80&q=80',
  },
];

// Calendar data for August 2026
// August 2026 starts on Saturday → offset = 6
const CAL_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const CAL_OFFSET = 6;
const CAL_TOTAL = 31;
const VISIT_DAYS = [18, 22, 25];
const CAL_TODAY = 11;

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = {
    Confirmed: { bg: '#D1FAE5', color: '#065F46', border: '#A7F3D0' },
    Scheduled: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
    Pending:   { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Completed: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  };
  const s = cfg[status] || cfg.Pending;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 11px',
      display: 'inline-block',
      letterSpacing: '0.01em',
    }}>
      {status}
    </span>
  );
};

const StarRow = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        fill={i <= rating ? '#F59E0B' : 'none'}
        color={i <= rating ? '#F59E0B' : '#D1D5DB'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// Upcoming visit card (horizontal)
const UpcomingCard = ({ visit }) => {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={S.upCard}>
      {/* Thumbnail */}
      <div style={S.upImgWrap}>
        <img
          src={imgErr ? visit.fallback : visit.image}
          alt={visit.property}
          style={S.upImg}
          onError={() => setImgErr(true)}
        />
        {/* Badge overlaid bottom-left */}
        <div style={S.upBadgeWrap}>
          <StatusBadge status={visit.status} />
        </div>
      </div>

      {/* Info */}
      <div style={S.upBody}>
        <h3 style={S.upTitle}>{visit.property}</h3>
        <div style={S.upLocation}>
          <MapPin size={13} color="#9CA3AF" strokeWidth={2} />
          <span>{visit.location}</span>
        </div>
        {/* Meta row */}
        <div style={S.upMeta}>
          <div style={S.metaBlock}>
            <Calendar size={14} color="#6B7280" strokeWidth={2} />
            <div>
              <div style={S.metaVal}>{visit.date}</div>
              <div style={S.metaLbl}>Date</div>
            </div>
          </div>
          <div style={S.metaDiv} />
          <div style={S.metaBlock}>
            <Clock size={14} color="#6B7280" strokeWidth={2} />
            <div>
              <div style={S.metaVal}>{visit.time}</div>
              <div style={S.metaLbl}>Time</div>
            </div>
          </div>
          <div style={S.metaDiv} />
          <div style={S.metaBlock}>
            <User size={14} color="#6B7280" strokeWidth={2} />
            <div>
              <div style={S.metaVal}>{visit.inspector}</div>
              <div style={S.metaLbl}>Inspector</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <button style={S.viewBtn}>View Details</button>
    </div>
  );
};

// Mini calendar widget
const MiniCalendar = () => {
  const cells = [];
  for (let i = 0; i < CAL_OFFSET; i++) cells.push(null);
  for (let d = 1; d <= CAL_TOTAL; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={S.calCard}>
      <div style={S.calHeader}>
        <button style={S.calNavBtn}><ChevronLeft size={14} color="#374151" /></button>
        <span style={S.calMonth}>August 2026</span>
        <button style={S.calNavBtn}><ChevronRight size={14} color="#374151" /></button>
      </div>
      <div style={S.calGrid}>
        {CAL_DAYS.map((d) => (
          <div key={d} style={S.calDayLbl}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          const isToday = day === CAL_TODAY;
          const isVisit = VISIT_DAYS.includes(day);
          let cellStyle = { ...S.calCell };
          if (isToday) cellStyle = { ...cellStyle, ...S.calToday };
          else if (isVisit) cellStyle = { ...cellStyle, ...S.calVisit };
          return (
            <div key={idx} style={cellStyle}>
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Myvisit = () => {
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'past'

  return (
    <div style={S.page}>

      {/* ── Page Header ── */}
      <div style={S.pageHeader}>
        <div>
          <h1 style={S.pageTitle}>My Visits</h1>
          <p style={S.pageSub}>Manage and track all your property visits in one place.</p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={S.twoCol}>

        {/* ════ LEFT MAIN COLUMN ════ */}
        <div style={S.mainCol}>

          {/* Tab bar */}
          <div style={S.tabBar}>
            <button
              onClick={() => setTab('upcoming')}
              style={tab === 'upcoming' ? S.tabActive : S.tabInactive}
            >
              Upcoming Visits
            </button>
            <button
              onClick={() => setTab('past')}
              style={tab === 'past' ? S.tabActive : S.tabInactive}
            >
              Past Visits
            </button>
          </div>

          {/* ── UPCOMING VISITS ── */}
          {tab === 'upcoming' && (
            <div style={S.cardStack}>
              {MOCK_UPCOMING_VISITS.map((v) => (
                <UpcomingCard key={v.id} visit={v} />
              ))}
            </div>
          )}

          {/* ── PAST VISITS ── */}
          {tab === 'past' && (
            <div style={S.cardStack}>
              <h2 style={S.sectionHeading}>Past Visits</h2>

              {/* Table */}
              <div style={S.tableWrap}>
                {/* Table header */}
                <div style={S.tableHead}>
                  <div style={{ ...S.th, flex: 2 }}>Property</div>
                  <div style={S.th}>Date &amp; Time</div>
                  <div style={S.th}>Inspector</div>
                  <div style={S.th}>Status</div>
                  <div style={S.th}>Feedback</div>
                  <div style={S.th}>Action</div>
                </div>

                {/* Table rows */}
                {MOCK_PAST_VISITS.map((v) => (
                  <div key={v.id} style={S.tableRow}>
                    {/* Property */}
                    <div style={{ ...S.td, flex: 2 }}>
                      <div style={S.propCell}>
                        <img src={v.image} alt={v.property} style={S.pastImg} />
                        <div>
                          <div style={S.pastName}>{v.property}</div>
                          <div style={S.pastLoc}>{v.location}</div>
                        </div>
                      </div>
                    </div>
                    {/* Date */}
                    <div style={S.td}>
                      <div style={S.pastDate}>{v.dateTime}</div>
                      <div style={S.pastTime}>{v.time}</div>
                    </div>
                    {/* Inspector */}
                    <div style={S.td}>
                      <div style={S.inspCell}>
                        <img src={v.inspectorAvatar} alt={v.inspector} style={S.inspAvatar} />
                        <span style={S.inspName}>{v.inspector}</span>
                      </div>
                    </div>
                    {/* Status */}
                    <div style={S.td}>
                      <StatusBadge status={v.status} />
                    </div>
                    {/* Rating */}
                    <div style={S.td}>
                      <StarRow rating={v.rating} />
                    </div>
                    {/* Action */}
                    <div style={S.td}>
                      <button style={S.tableBtn}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              <button style={S.loadMoreBtn}>
                Load More <ChevronDown size={15} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <aside style={S.aside}>

          {/* Visit Summary */}
          <div style={S.sideCard}>
            <h3 style={S.sideTitle}>Visit Summary</h3>
            <div style={S.sumList}>
              {/* Upcoming */}
              <div style={S.sumRow}>
                <div style={{ ...S.sumIcon, background: '#E8F4F1' }}>
                  <Calendar size={16} color="#1D6A4A" strokeWidth={2} />
                </div>
                <div>
                  <div style={S.sumVal}>{MOCK_SUMMARY.upcoming}</div>
                  <div style={S.sumLbl}>Upcoming Visits</div>
                </div>
              </div>
              {/* Completed */}
              <div style={S.sumRow}>
                <div style={{ ...S.sumIcon, background: '#DBEAFE' }}>
                  <CheckCircle2 size={16} color="#1D4ED8" strokeWidth={2} />
                </div>
                <div>
                  <div style={S.sumVal}>{MOCK_SUMMARY.completed}</div>
                  <div style={S.sumLbl}>Completed Visits</div>
                </div>
              </div>
              {/* Pending */}
              <div style={S.sumRow}>
                <div style={{ ...S.sumIcon, background: '#FEF3C7' }}>
                  <Clock3 size={16} color="#D97706" strokeWidth={2} />
                </div>
                <div>
                  <div style={S.sumVal}>{MOCK_SUMMARY.pending}</div>
                  <div style={S.sumLbl}>Pending Visits</div>
                </div>
              </div>
              {/* Rating */}
              <div style={S.sumRow}>
                <div style={{ ...S.sumIcon, background: '#FDF4FF' }}>
                  <Star size={16} color="#A855F7" strokeWidth={2} fill="#A855F7" />
                </div>
                <div>
                  <div style={S.sumVal}>{MOCK_SUMMARY.avgRating}</div>
                  <div style={S.sumLbl}>Average Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming This Week */}
          <div style={S.sideCard}>
            <h3 style={S.sideTitle}>Upcoming This Week</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_THIS_WEEK.map((item) => {
                const [err, setErr] = useState(false);
                return (
                  <div key={item.id} style={S.weekItem}>
                    <img
                      src={err ? item.fallback : item.image}
                      alt={item.property}
                      style={S.weekImg}
                      onError={() => setErr(true)}
                    />
                    <div>
                      <div style={S.weekName}>{item.property}</div>
                      <div style={S.weekDate}>
                        <Calendar size={11} color="#9CA3AF" />
                        {item.dateTime}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar */}
          <MiniCalendar />

          {/* Need Help */}
          <div style={S.helpCard}>
            <div style={S.helpTop}>
              <div style={S.helpIcon}>
                <Headphones size={22} color="#1D6A4A" strokeWidth={1.8} />
              </div>
              <div>
                <div style={S.helpTitle}>Need Help?</div>
                <div style={S.helpSub}>Our support team is here to help you.</div>
              </div>
            </div>
            <button style={S.helpBtn}>Contact Support</button>
          </div>

        </aside>
      </div>
    </div>
  );
};

// ─── Style Object ──────────────────────────────────────────────────────────────

const S = {
  // Page
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    padding: '28px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
  },
  pageHeader: { marginBottom: '20px' },
  pageTitle: {
    fontSize: '26px', fontWeight: '800', color: '#111827',
    margin: '0 0 4px 0', lineHeight: 1.2,
  },
  pageSub: { fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: '500' },

  // Layout
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 296px',
    gap: '24px',
    alignItems: 'start',
  },
  mainCol: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  aside: { display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' },

  // Tabs
  tabBar: {
    display: 'flex', borderBottom: '2px solid #E5E7EB', marginBottom: '20px',
  },
  tabActive: {
    background: 'none', border: 'none',
    borderBottom: '2.5px solid #1D6A4A', color: '#1D6A4A',
    fontWeight: '700', fontSize: '14px', padding: '10px 20px 10px 0',
    cursor: 'pointer', marginBottom: '-2px', fontFamily: 'inherit',
  },
  tabInactive: {
    background: 'none', border: 'none',
    borderBottom: '2.5px solid transparent', color: '#6B7280',
    fontWeight: '600', fontSize: '14px', padding: '10px 20px 10px 8px',
    cursor: 'pointer', marginBottom: '-2px', fontFamily: 'inherit',
  },

  cardStack: { display: 'flex', flexDirection: 'column', gap: '14px' },

  // Upcoming card
  upCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  upImgWrap: {
    position: 'relative', width: '150px', height: '100px',
    flexShrink: 0, borderRadius: '12px', overflow: 'hidden',
  },
  upImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  upBadgeWrap: { position: 'absolute', top: '8px', left: '8px' },
  upBody: { flex: 1, minWidth: 0 },
  upTitle: { fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' },
  upLocation: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#6B7280', fontWeight: '500', marginBottom: '12px',
  },
  upMeta: { display: 'flex', alignItems: 'center' },
  metaBlock: { display: 'flex', alignItems: 'center', gap: '7px', paddingRight: '16px' },
  metaDiv: { width: '1px', height: '28px', background: '#E5E7EB', marginRight: '16px', flexShrink: 0 },
  metaVal: { fontSize: '13px', fontWeight: '700', color: '#111827', lineHeight: 1.2 },
  metaLbl: { fontSize: '10px', color: '#9CA3AF', fontWeight: '500' },
  viewBtn: {
    background: '#FFFFFF', border: '1.5px solid #1D6A4A', color: '#1D6A4A',
    borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: '700',
    cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', whiteSpace: 'nowrap',
  },

  // Section heading
  sectionHeading: { fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' },

  // Table
  tableWrap: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px',
  },
  tableHead: {
    display: 'flex', background: '#F8FAFC',
    borderBottom: '1.5px solid #E2E8F0', padding: '10px 16px',
  },
  tableRow: {
    display: 'flex', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid #F1F5F9',
  },
  th: { flex: 1, fontSize: '11px', fontWeight: '700', color: '#6B7280', paddingRight: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' },
  td: { flex: 1, display: 'flex', alignItems: 'center', paddingRight: '8px' },
  propCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  pastImg: { width: '44px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  pastName: { fontSize: '13px', fontWeight: '700', color: '#111827', lineHeight: 1.3 },
  pastLoc: { fontSize: '11px', color: '#6B7280', fontWeight: '500' },
  pastDate: { fontSize: '12px', fontWeight: '600', color: '#111827', lineHeight: 1.3 },
  pastTime: { fontSize: '11px', color: '#6B7280', fontWeight: '500' },
  inspCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  inspAvatar: { width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid #E5E7EB' },
  inspName: { fontSize: '12px', color: '#374151', fontWeight: '500' },
  tableBtn: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#374151',
    borderRadius: '8px', padding: '6px 14px', fontSize: '11px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  loadMoreBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    width: '100%', background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '700',
    color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
  },

  // Side cards
  sideCard: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '16px', padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  sideTitle: { fontSize: '14px', fontWeight: '800', color: '#111827', margin: '0 0 14px 0' },

  // Summary
  sumList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sumRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  sumIcon: {
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sumVal: { fontSize: '22px', fontWeight: '800', color: '#111827', lineHeight: 1 },
  sumLbl: { fontSize: '11px', color: '#6B7280', fontWeight: '500', marginTop: '2px' },

  // This week
  weekItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  weekImg: { width: '44px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  weekName: { fontSize: '12px', fontWeight: '700', color: '#111827', marginBottom: '3px' },
  weekDate: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280', fontWeight: '500' },

  // Calendar
  calCard: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '16px', padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  calHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  calNavBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '4px', display: 'flex', alignItems: 'center', borderRadius: '6px',
  },
  calMonth: { fontSize: '13px', fontWeight: '700', color: '#111827' },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' },
  calDayLbl: { fontSize: '10px', fontWeight: '700', color: '#9CA3AF', textAlign: 'center', padding: '4px 0' },
  calCell: { fontSize: '12px', fontWeight: '500', color: '#374151', textAlign: 'center', padding: '5px 2px', borderRadius: '6px' },
  calToday: { background: '#1D6A4A', color: '#FFFFFF', fontWeight: '700' },
  calVisit: { background: '#D1FAE5', color: '#1D6A4A', fontWeight: '700' },

  // Help
  helpCard: {
    background: '#FFFFFF', border: '1.5px solid #E2E8F0',
    borderRadius: '16px', padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  helpTop: { display: 'flex', alignItems: 'center', gap: '12px' },
  helpIcon: {
    width: '42px', height: '42px', borderRadius: '50%', background: '#E8F4F1',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  helpTitle: { fontSize: '13px', fontWeight: '700', color: '#111827' },
  helpSub: { fontSize: '11px', color: '#6B7280', fontWeight: '500', marginTop: '2px' },
  helpBtn: {
    width: '100%', background: '#FFFFFF', border: '1.5px solid #1D6A4A',
    color: '#1D6A4A', borderRadius: '10px', padding: '9px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
  },
};

export default Myvisit;
