import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  Building2,
  ShieldCheck,
  Calendar,
  FileText,
  Receipt,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Search,
  Bell,
  Mail,
  Phone,
  User,
  Activity,
  CreditCard,
} from 'lucide-react';
import { getOwnerDashboardSummary, getOwnerVerificationSummary } from '../../Services/owner.services';

// ─── Static / Mock Data (Owner-scoped) ──────────────────────────────────────────

const MOCK_OWNER_STATS = [
  {
    id: 'properties',
    icon: Building2,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    value: 6,
    label: 'Total Properties',
    sub: 'Registered properties',
    subColor: '#1D6A4A',
  },
  {
    id: 'verification',
    icon: ShieldCheck,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    value: 2,
    label: 'Pending Verification',
    sub: 'Under PPC review',
    subColor: '#D97706',
  },
  {
    id: 'visits',
    icon: Calendar,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    value: 3,
    label: 'Upcoming Visits',
    sub: 'Scheduled this week',
    subColor: '#4F46E5',
  },
  {
    id: 'transactions',
    icon: FileText,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    value: 1,
    label: 'Active Transactions',
    sub: 'In progress',
    subColor: '#059669',
  },
  {
    id: 'invoices',
    icon: Receipt,
    iconBg: '#FEF2F2',
    iconColor: '#DC2626',
    value: 2,
    label: 'Pending Invoices',
    sub: 'Total Rs. 180,000',
    subColor: '#DC2626',
  },
];

const MOCK_OWNER_PROPERTIES = [
  {
    id: 1,
    title: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    type: 'House',
    purpose: 'For Sale',
    price: 'Rs. 25,000,000',
    beds: 5,
    baths: 6,
    area: '1 Kanal',
    verification: 'Verified',
    image: '/src/assets/prop_villa.png',
    fallback: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    title: 'Luxury Apartment in DHA',
    location: 'DHA Phase 2, Islamabad',
    type: 'Apartment',
    purpose: 'For Sale',
    price: 'Rs. 18,500,000',
    beds: 3,
    baths: 3,
    area: '1200 sqft',
    verification: 'Verified',
    image: '/src/assets/prop_apartment.png',
    fallback: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    title: 'Fully Furnished House',
    location: 'G-13, Islamabad',
    type: 'House',
    purpose: 'For Rent',
    price: 'Rs. 120,000 / mo',
    beds: 4,
    baths: 4,
    area: '10 Marla',
    verification: 'Under Review',
    image: '/src/assets/prop_house.png',
    fallback: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80',
  },
];

const MOCK_VERIFICATION_SUMMARY = {
  verified: 4,
  underReview: 2,
  total: 6,
};

const MOCK_RECENT_INSPECTION = {
  property: 'Modern Family Villa',
  location: 'Bahria Town, Islamabad',
  date: '10 Aug 2026',
  status: 'Completed',
  result: 'Passed',
};

const MOCK_UPCOMING_VISITS = [
  {
    id: 1,
    property: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    date: '18 Aug 2026',
    time: '04:00 PM',
    visitor: 'Ahmed Raza (Customer)',
    status: 'Confirmed',
  },
  {
    id: 2,
    property: 'Luxury Apartment in DHA',
    location: 'DHA Phase 2, Islamabad',
    date: '22 Aug 2026',
    time: '11:30 AM',
    visitor: 'Usman Ali (Customer)',
    status: 'Scheduled',
  },
];

const MOCK_RECENT_TRANSACTION = {
  id: 'TXN-2026-0041',
  property: 'Modern Family Villa',
  type: 'Purchase',
  status: 'Active',
  agreedAmount: 'Rs. 25,000,000',
  date: '05 Aug 2026',
};

const MOCK_FINANCIAL_SUMMARY = {
  paidAmount: 'Rs. 1,250,000',
  pendingAmount: 'Rs. 180,000',
  paidInvoicesCount: 8,
  pendingInvoicesCount: 2,
};

const MOCK_RECENT_ACTIVITY = [
  {
    id: 1,
    icon: ShieldCheck,
    iconBg: '#E8F4F1',
    iconColor: '#1D6A4A',
    title: 'Verification Status Updated',
    desc: 'Modern Family Villa was verified by PPC Inspector.',
    time: 'Today, 11:30 AM',
  },
  {
    id: 2,
    icon: Calendar,
    iconBg: '#EEF2FF',
    iconColor: '#4F46E5',
    title: 'Property Visit Confirmed',
    desc: 'Visit scheduled for Luxury Apartment on 22 Aug.',
    time: 'Yesterday, 03:45 PM',
  },
  {
    id: 3,
    icon: FileText,
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    title: 'Inspection Report Available',
    desc: 'Inspection report generated for G-13 House.',
    time: '3 days ago',
  },
  {
    id: 4,
    icon: Receipt,
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    title: 'New Invoice Issued',
    desc: 'Invoice #INV-2026-0010 issued for pending service.',
    time: '5 days ago',
  },
];

// ─── Sub-Components ────────────────────────────────────────────────────────────

const StatCard = ({ stat, loading, error }) => {
  const IconComp = stat.icon;
  return (
    <div style={styles.statCard}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ ...styles.statIconBox, background: stat.iconBg }}>
          <IconComp size={20} color={stat.iconColor} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.statValue}>
            {loading ? (
              <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
            ) : error ? (
              <span className="text-red-500 text-lg">-</span>
            ) : (
              stat.value
            )}
          </div>
          <div style={styles.statLabel}>{stat.label}</div>
        </div>
      </div>
      <div style={{ ...styles.statSub, color: stat.subColor }}>{stat.sub}</div>
    </div>
  );
};

// ─── Main Owner Dashboard Component ───────────────────────────────────────────

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const res = await getOwnerDashboardSummary();
        if (isMounted) {
          const payload = res?.data || res || {};
          setSummaryData(payload);
          setSummaryError(null);
        }
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
        if (isMounted) setSummaryError("Unable to load summary.");
      } finally {
        if (isMounted) setLoadingSummary(false);
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, []);

  const [verifData, setVerifData] = useState(null);
  const [loadingVerif, setLoadingVerif] = useState(true);
  const [verifError, setVerifError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchVerifSummary = async () => {
      try {
        setLoadingVerif(true);
        const res = await getOwnerVerificationSummary();
        if (isMounted) {
          const payload = res?.data || res || {};
          setVerifData(payload);
          setVerifError(null);
        }
      } catch (err) {
        console.error("Failed to load verification summary:", err);
        if (isMounted) setVerifError("Unable to load summary.");
      } finally {
        if (isMounted) setLoadingVerif(false);
      }
    };

    fetchVerifSummary();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      id: 'properties',
      icon: Building2,
      iconBg: '#E8F4F1',
      iconColor: '#1D6A4A',
      value: summaryData?.total_properties ?? 0,
      label: 'Total Properties',
      sub: 'Registered properties',
      subColor: '#1D6A4A',
    },
    {
      id: 'verification',
      icon: ShieldCheck,
      iconBg: '#FFF7ED',
      iconColor: '#D97706',
      value: summaryData?.pending_verification ?? 0,
      label: 'Pending Verification',
      sub: 'Under PPC review',
      subColor: '#D97706',
    },
    {
      id: 'visits',
      icon: Calendar,
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      value: summaryData?.upcoming_visits ?? 0,
      label: 'Upcoming Visits',
      sub: 'Scheduled future visits',
      subColor: '#4F46E5',
    },
    {
      id: 'transactions',
      icon: FileText,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      value: summaryData?.active_transactions ?? 0,
      label: 'Active Transactions',
      sub: 'In progress',
      subColor: '#059669',
    },
    {
      id: 'invoices',
      icon: Receipt,
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      value: summaryData?.pending_invoices ?? 0,
      label: 'Pending Invoices',
      sub: 'Pending actions',
      subColor: '#DC2626',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.full_name || 'Tariq Mahmood';
  const displayEmail = user?.email || 'tariq.mahmood@example.com';

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen flex flex-col bg-[#F8FAFC] overflow-x-hidden">
      {/* ═══════════════════════════════════════════════
          TOP HEADER — search & profile greeting
      ═══════════════════════════════════════════════ */}
      <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between bg-white px-4 sm:px-8 py-4 border-b border-gray-200 sticky top-0 z-30 gap-4 w-full">
        <div style={styles.headerLeft} className="w-full sm:w-auto">
          <div style={styles.searchBar} className="w-full sm:w-80">
            <Search size={16} color="#9CA3AF" />
            <span style={styles.searchPlaceholder}>Search my properties, visits, transactions...</span>
          </div>
        </div>

        <div style={styles.headerRight} className="w-full sm:w-auto justify-end mt-2 sm:mt-0">
          <button style={styles.bellBtn} aria-label="Notifications">
            <Bell size={20} color="#374151" strokeWidth={1.8} />
            <span style={styles.bellDot}>2</span>
          </button>

          <div style={styles.profileChip} onClick={() => navigate('/owner/account-settings')}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              alt={displayName}
              style={styles.profileAvatar}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80';
              }}
            />
            <div style={styles.profileText}>
              <span style={styles.profileName}>{displayName}</span>
              <span style={styles.profileRole}>Property Owner</span>
            </div>
            <ChevronRight size={14} color="#9CA3AF" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          TWO-COLUMN LAYOUT: Main + Right Sidebar
      ═══════════════════════════════════════════════ */}
      <div className="flex flex-col xl:grid xl:grid-cols-[1fr_350px] gap-6 px-4 sm:px-6 lg:px-8 py-6 w-full items-start">

        {/* ────────────────────────────────────────────
            LEFT / MAIN CONTENT COLUMN
        ──────────────────────────────────────────── */}
        <div style={styles.mainCol}>

          {/* ── Greeting Banner ── */}
          <section style={styles.greetingSection}>
            <h1 style={styles.greetingTitle}>
              {getGreeting()}, {displayName.split(' ')[0]}! <span aria-label="wave">👋</span>
            </h1>
            <p style={styles.greetingSub}>
              Here is an overview of your registered properties and activity on PPC.
            </p>
          </section>

          {/* ── Summary Cards ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} loading={loadingSummary} error={summaryError} />
            ))}
          </section>

          {/* ── My Properties Overview ── */}
          <section style={styles.cardSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>New Arrivals</h2>
                <p style={styles.sectionSub}>Your latest added properties</p>
              </div>
              <button
                style={styles.viewAllBtn}
                onClick={() => navigate('/owner/properties')}
              >
                View All Properties <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_OWNER_PROPERTIES.slice(0, 3).map((prop) => (
                <div key={prop.id} style={styles.propCard}>
                  <div style={styles.propImageWrap}>
                    <img
                      src={prop.image}
                      alt={prop.title}
                      style={styles.propImage}
                      onError={(e) => {
                        e.target.src = prop.fallback;
                      }}
                    />
                    <span style={styles.propPurposeBadge}>{prop.purpose}</span>
                    <span
                      style={{
                        ...styles.propVerifBadge,
                        background: prop.verification === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                        color: prop.verification === 'Verified' ? '#166534' : '#92400E',
                      }}
                    >
                      {prop.verification === 'Verified' ? '✓ PPC Verified' : '⏳ Reviewing'}
                    </span>
                  </div>

                  <div style={styles.propBody}>
                    <div style={styles.propTitle}>{prop.title}</div>
                    <div style={styles.propLocation}>
                      <MapPin size={12} color="#9CA3AF" />
                      <span>{prop.location}</span>
                    </div>
                    <div style={styles.propPrice}>{prop.price}</div>

                    <div style={styles.propFeatures}>
                      <span style={styles.propFeature}>
                        <BedDouble size={12} color="#6B7280" /> {prop.beds} Bed
                      </span>
                      <span style={styles.propFeature}>
                        <Bath size={12} color="#6B7280" /> {prop.baths} Bath
                      </span>
                      <span style={styles.propFeature}>
                        <Maximize size={12} color="#6B7280" /> {prop.area}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Two Column Grid for Status / Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

            {/* ── Property Verification Summary ── */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.cardTitle}>Property Verification</h3>
                <button
                  style={styles.linkBtn}
                  onClick={() => navigate('/owner/property-verification')}
                >
                  View Details <ChevronRight size={14} />
                </button>
              </div>

              <div style={styles.verifSummaryRow}>
                <div style={styles.verifBox}>
                  <div style={{ ...sDot('#10B981') }} />
                  <div>
                    <div style={styles.verifNum}>
                      {loadingVerif ? (
                        <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : verifError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        verifData?.verified_properties ?? 0
                      )}
                    </div>
                    <div style={styles.verifLabel}>PPC Verified</div>
                  </div>
                </div>

                <div style={styles.verifBox}>
                  <div style={{ ...sDot('#F59E0B') }} />
                  <div>
                    <div style={styles.verifNum}>
                      {loadingVerif ? (
                        <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                      ) : verifError ? (
                        <span className="text-red-500">-</span>
                      ) : (
                        verifData?.pending_verification ?? 0
                      )}
                    </div>
                    <div style={styles.verifLabel}>Under Review</div>
                  </div>
                </div>
              </div>

              <div style={styles.verifProgressBar}>
                <div
                  style={{
                    ...styles.verifProgressFill,
                    width: !loadingVerif && !verifError && verifData?.total_properties > 0
                      ? `${(verifData.verified_properties / verifData.total_properties) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* ── Inspection Overview ── */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.cardTitle}>Inspection Overview</h3>
                <button
                  style={styles.linkBtn}
                  onClick={() => navigate('/owner/inspections')}
                >
                  View Inspections <ChevronRight size={14} />
                </button>
              </div>

              <div style={styles.inspectionCard}>
                <div style={styles.inspTitle}>{MOCK_RECENT_INSPECTION.property}</div>
                <div style={styles.inspLocation}>
                  <MapPin size={12} color="#9CA3AF" />
                  <span>{MOCK_RECENT_INSPECTION.location}</span>
                </div>
                <div style={styles.inspMeta}>
                  <span>Date: <strong>{MOCK_RECENT_INSPECTION.date}</strong></span>
                  <span style={styles.badgeSuccess}>✓ {MOCK_RECENT_INSPECTION.result}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom Grid: Upcoming Visits & Recent Transactions ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

            {/* ── Upcoming Property Visits ── */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.cardTitle}>Upcoming Visits</h3>
                <button
                  style={styles.linkBtn}
                  onClick={() => navigate('/owner/property-visits')}
                >
                  View All Visits <ChevronRight size={14} />
                </button>
              </div>

              <div style={styles.visitList}>
                {MOCK_UPCOMING_VISITS.map((v) => (
                  <div key={v.id} style={styles.visitItem}>
                    <div>
                      <div style={styles.visitProp}>{v.property}</div>
                      <div style={styles.visitSub}>
                        <Calendar size={12} color="#6B7280" /> {v.date} at {v.time}
                      </div>
                      <div style={styles.visitorText}>{v.visitor}</div>
                    </div>
                    <span
                      style={{
                        ...styles.badgeBase,
                        background: v.status === 'Confirmed' ? '#DCFCE7' : '#EEF2FF',
                        color: v.status === 'Confirmed' ? '#166534' : '#4F46E5',
                      }}
                    >
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Transaction Overview ── */}
            <div style={styles.card}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.cardTitle}>Transaction Overview</h3>
                <button
                  style={styles.linkBtn}
                  onClick={() => navigate('/owner/transactions')}
                >
                  View Transactions <ChevronRight size={14} />
                </button>
              </div>

              <div style={styles.txBox}>
                <div style={styles.txHeader}>
                  <span style={styles.txId}>{MOCK_RECENT_TRANSACTION.id}</span>
                  <span style={styles.badgeSuccess}>{MOCK_RECENT_TRANSACTION.status}</span>
                </div>
                <div style={styles.txProp}>{MOCK_RECENT_TRANSACTION.property}</div>
                <div style={styles.txRow}>
                  <span style={styles.txLabel}>Type:</span>
                  <span style={styles.txVal}>{MOCK_RECENT_TRANSACTION.type}</span>
                </div>
                <div style={styles.txRow}>
                  <span style={styles.txLabel}>Agreed Amount:</span>
                  <span style={styles.txValBold}>{MOCK_RECENT_TRANSACTION.agreedAmount}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ────────────────────────────────────────────
            RIGHT SIDEBAR PANEL
        ──────────────────────────────────────────── */}
        <aside style={styles.rightAside} className="xl:sticky xl:top-24">



          {/* ── Payments & Invoices Summary ── */}
          <div style={styles.sideCard}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sideCardTitle}>Financial Summary</h3>
              <button
                style={styles.linkBtn}
                onClick={() => navigate('/owner/payments-invoices')}
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div style={styles.financialList}>
              <div style={styles.financialItem}>
                <div style={styles.finLabel}>Paid Amount</div>
                <div style={styles.finValueGreen}>{MOCK_FINANCIAL_SUMMARY.paidAmount}</div>
                <div style={styles.finSub}>{MOCK_FINANCIAL_SUMMARY.paidInvoicesCount} invoices paid</div>
              </div>

              <div style={styles.financialItem}>
                <div style={styles.finLabel}>Pending Amount</div>
                <div style={styles.finValueAmber}>{MOCK_FINANCIAL_SUMMARY.pendingAmount}</div>
                <div style={styles.finSub}>{MOCK_FINANCIAL_SUMMARY.pendingInvoicesCount} invoices due</div>
              </div>
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Quick Actions</h3>

            <div style={styles.quickActionsList}>
              <button style={styles.qaBtn} onClick={() => navigate('/owner/properties')}>
                <div style={{ ...styles.qaIconBox, background: '#E8F4F1', color: '#1D6A4A' }}>
                  <Building2 size={16} />
                </div>
                <span style={styles.qaText}>My Properties</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>

              <button style={styles.qaBtn} onClick={() => navigate('/owner/property-verification')}>
                <div style={{ ...styles.qaIconBox, background: '#FFF7ED', color: '#D97706' }}>
                  <ShieldCheck size={16} />
                </div>
                <span style={styles.qaText}>Property Verification</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>

              <button style={styles.qaBtn} onClick={() => navigate('/owner/inspections')}>
                <div style={{ ...styles.qaIconBox, background: '#ECFDF5', color: '#059669' }}>
                  <FileText size={16} />
                </div>
                <span style={styles.qaText}>Inspections</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>

              <button style={styles.qaBtn} onClick={() => navigate('/owner/property-visits')}>
                <div style={{ ...styles.qaIconBox, background: '#EEF2FF', color: '#4F46E5' }}>
                  <Calendar size={16} />
                </div>
                <span style={styles.qaText}>Property Visits</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>

              <button style={styles.qaBtn} onClick={() => navigate('/owner/transactions')}>
                <div style={{ ...styles.qaIconBox, background: '#F5F3FF', color: '#7C3AED' }}>
                  <CreditCard size={16} />
                </div>
                <span style={styles.qaText}>Transactions</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>

              <button style={styles.qaBtn} onClick={() => navigate('/owner/payments-invoices')}>
                <div style={{ ...styles.qaIconBox, background: '#FEF2F2', color: '#DC2626' }}>
                  <Receipt size={16} />
                </div>
                <span style={styles.qaText}>Payments &amp; Invoices</span>
                <ChevronRight size={14} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* ── Recent Activity Log ── */}
          <div style={styles.sideCard}>
            <h3 style={styles.sideCardTitle}>Recent Activity</h3>

            <div style={styles.activityList}>
              {MOCK_RECENT_ACTIVITY.map((act) => {
                const IconComp = act.icon;
                return (
                  <div key={act.id} style={styles.activityItem}>
                    <div style={{ ...styles.actIconBox, background: act.iconBg }}>
                      <IconComp size={14} color={act.iconColor} />
                    </div>
                    <div>
                      <div style={styles.actTitle}>{act.title}</div>
                      <div style={styles.actDesc}>{act.desc}</div>
                      <div style={styles.actTime}>{act.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sDot = (color) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: color,
  flexShrink: 0,
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
  },

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
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F3F4F6',
    borderRadius: '12px',
    padding: '10px 14px',
    width: '100%',
  },
  searchPlaceholder: {
    fontSize: '13px',
    color: '#9CA3AF',
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
    background: '#D97706',
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

  twoCol: {
    /* Migrated to Tailwind classes */
  },
  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: 0,
    width: '100%',
  },

  greetingSection: {
    paddingBottom: '4px',
  },
  greetingTitle: {
    fontSize: 'clamp(20px, 5vw, 26px)',
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

  statsGrid: {
    /* Migrated to Tailwind Grid classes */
  },
  statCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px 14px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '11.5px',
    fontWeight: '600',
    color: '#6B7280',
    marginTop: '2px',
  },
  statSub: {
    fontSize: '11px',
    fontWeight: '600',
  },

  cardSection: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  sectionSub: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '2px 0 0 0',
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#1D6A4A',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  propertiesGrid: {
    /* Migrated to Tailwind Grid classes */
  },
  propCard: {
    border: '1.5px solid #E2E8F0',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  propImageWrap: {
    position: 'relative',
    height: '140px',
    background: '#F1F5F9',
  },
  propImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  propPurposeBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: '#1D6A4A',
    color: '#fff',
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  propVerifBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  propBody: {
    padding: '12px',
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
    fontSize: '11.5px',
    color: '#6B7280',
  },
  propPrice: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1D6A4A',
  },
  propFeatures: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  propFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '11px',
    color: '#6B7280',
  },

  subGrid: {
    /* Migrated to Tailwind Grid classes */
  },
  card: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  linkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'none',
    border: 'none',
    color: '#1D6A4A',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  verifSummaryRow: {
    display: 'flex',
    gap: '16px',
  },
  verifBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  verifNum: {
    fontSize: 'clamp(16px, 4vw, 18px)',
    fontWeight: '800',
    color: '#111827',
  },
  verifLabel: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '600',
  },
  verifProgressBar: {
    height: '6px',
    background: '#FEF3C7',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  verifProgressFill: {
    height: '100%',
    background: '#10B981',
    borderRadius: '4px',
  },

  inspectionCard: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inspTitle: {
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#111827',
  },
  inspLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#6B7280',
  },
  inspMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '11.5px',
    color: '#374151',
    marginTop: '4px',
  },
  badgeSuccess: {
    background: '#DCFCE7',
    color: '#166534',
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
  },

  visitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  visitItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    background: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  visitProp: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#111827',
  },
  visitSub: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '2px',
  },
  visitorText: {
    fontSize: '10.5px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  badgeBase: {
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
  },

  txBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  txHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txId: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#111827',
  },
  txProp: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#111827',
  },
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11.5px',
  },
  txLabel: {
    color: '#6B7280',
  },
  txVal: {
    fontWeight: '600',
    color: '#111827',
  },
  txValBold: {
    fontWeight: '800',
    color: '#1D6A4A',
  },

  rightAside: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  profileCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: '10px',
  },
  profileCardAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E5E7EB',
  },
  activeStatusDot: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#10B981',
    border: '2px solid #FFFFFF',
  },
  profileCardName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
  },
  profileCardRoleBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#1D6A4A',
    background: '#E8F4F1',
    padding: '3px 10px',
    borderRadius: '20px',
    marginTop: '4px',
  },
  contactList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '14px',
    paddingTop: '14px',
    borderTop: '1px solid #F1F5F9',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '11.5px',
    color: '#4B5563',
  },
  settingsBtn: {
    marginTop: '16px',
    width: '100%',
    background: '#FFFFFF',
    border: '1.5px solid #D1D5DB',
    borderRadius: '8px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    cursor: 'pointer',
  },

  sideCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sideCardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },

  financialList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  financialItem: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  finLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
  },
  finValueGreen: {
    fontSize: 'clamp(16px, 4vw, 18px)',
    fontWeight: '800',
    color: '#10B981',
    lineHeight: 1.2,
  },
  finValueAmber: {
    fontSize: 'clamp(16px, 4vw, 18px)',
    fontWeight: '800',
    color: '#D97706',
    lineHeight: 1.2,
  },
  finSub: {
    fontSize: '10.5px',
    color: '#9CA3AF',
    marginTop: '2px',
  },

  quickActionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  qaBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  qaIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qaText: {
    flex: 1,
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
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
  actIconBox: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  actTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#111827',
  },
  actDesc: {
    fontSize: '11px',
    color: '#6B7280',
    marginTop: '1px',
  },
  actTime: {
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
};

export default OwnerDashboard;
