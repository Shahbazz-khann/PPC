import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  ClipboardList,
  Eye,
  CheckSquare,
  ArrowRight,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Home,
  Bell
} from 'lucide-react';
import CustomerAccountMenu from '../../Components/common/CustomerAccountMenu';
import NotificationDropdown from '../../Components/common/NotificationDropdown';
import MosqFaisal from '../../assets/mosqiiiiii.webp';
import { getToken } from '../../Services/AuthSession';
import { resolveMediaUrl } from '../../Services/Api';
import PropHouse from '../../assets/prop_house.png';
import { formatPrice } from './properties/mockAdminProperties';
import {
  getAdminDashboardOverview,
  getAdminCustomerStats,
  getAdminPropertyStats,
  getAdminRequestStats,
  getAdminVisitStats,
  getAdminInspectionStats,
  getAdminProperties,
  getAdminRequests,
  getAdminVisits
} from '../../Services/admin.services';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
};

const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  try {
    const diff = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return '';
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation(['admin', 'common']);

  const token = getToken();
  let decodedUser = null;
  if (token) {
    decodedUser = parseJwt(token);
  }

  const firstName = user?.user_first_name || decodedUser?.user_first_name;
  const middleName = user?.user_middle_name || decodedUser?.user_middle_name;
  const lastName = user?.user_last_name || decodedUser?.user_last_name;
  const displayName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Super Admin';

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // --- Statistics State ---
  const [propertyStats, setPropertyStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    inactive: 0,
    forSale: 0,
    forRent: 0
  });

  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    inOps: 0,
    completed: 0,
    rejected: 0,
    withdrawn: 0,
    propertyReqs: 0,
    serviceReqs: 0
  });

  const [visitStats, setVisitStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    overdue: 0,
    cancelled: 0
  });

  const [inspectionStats, setInspectionStats] = useState({
    total: 0,
    verified: 0,
    flagged: 0,
    scheduled: 0
  });

  const [customerStats, setCustomerStats] = useState({
    total_customers: '0',
    active_customers: '0',
    inactive_customers: '0',
    new_customers: '0'
  });

  // --- Live Activity Feed State ---
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [activeFeedTab, setActiveFeedTab] = useState('properties'); // 'properties' | 'requests' | 'visits'

  // --- Loading & Notification State ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Fetch All Live Dashboard Metrics & Feeds ---
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Primary: Single unified dashboard endpoint
      const res = await getAdminDashboardOverview({ limit: 5 }).catch(() => null);

      if (res?.success && res?.data) {
        const data = res.data;
        if (data.properties) setPropertyStats(data.properties);
        if (data.requests) setRequestStats(data.requests);
        if (data.visits) setVisitStats(data.visits);
        if (data.inspections) setInspectionStats(data.inspections);
        if (data.customers) setCustomerStats(data.customers);
        if (Array.isArray(data.recentProperties)) setRecentProperties(data.recentProperties);
        if (Array.isArray(data.recentRequests)) setRecentRequests(data.recentRequests);
        if (Array.isArray(data.recentVisits)) setRecentVisits(data.recentVisits);
      } else {
        // Fallback: Individual service calls
        const [
          propStatsRes,
          reqStatsRes,
          visStatsRes,
          insStatsRes,
          custStatsRes,
          recentPropsRes,
          recentReqsRes,
          recentVisitsRes
        ] = await Promise.allSettled([
          getAdminPropertyStats(),
          getAdminRequestStats(),
          getAdminVisitStats(),
          getAdminInspectionStats(),
          getAdminCustomerStats(),
          getAdminProperties({ limit: 5 }),
          getAdminRequests({ limit: 5 }),
          getAdminVisits({ limit: 5 })
        ]);

        if (propStatsRes.status === 'fulfilled' && propStatsRes.value?.success && propStatsRes.value?.data) {
          setPropertyStats(propStatsRes.value.data);
        }
        if (reqStatsRes.status === 'fulfilled' && reqStatsRes.value?.success && reqStatsRes.value?.data) {
          setRequestStats(reqStatsRes.value.data);
        }
        if (visStatsRes.status === 'fulfilled' && visStatsRes.value?.success && visStatsRes.value?.data) {
          setVisitStats(visStatsRes.value.data);
        }
        if (insStatsRes.status === 'fulfilled' && insStatsRes.value?.success && insStatsRes.value?.data) {
          setInspectionStats(insStatsRes.value.data);
        }
        if (custStatsRes.status === 'fulfilled' && custStatsRes.value?.success && custStatsRes.value?.data) {
          setCustomerStats(custStatsRes.value.data);
        }
        if (recentPropsRes.status === 'fulfilled' && recentPropsRes.value?.success && Array.isArray(recentPropsRes.value?.data)) {
          setRecentProperties(recentPropsRes.value.data);
        }
        if (recentReqsRes.status === 'fulfilled' && recentReqsRes.value?.success && Array.isArray(recentReqsRes.value?.data)) {
          setRecentRequests(recentReqsRes.value.data);
        }
        if (recentVisitsRes.status === 'fulfilled' && recentVisitsRes.value?.success && Array.isArray(recentVisitsRes.value?.data)) {
          setRecentVisits(recentVisitsRes.value.data);
        }
      }

      if (isManualRefresh) {
        showToast('Dashboard updated.');
      }
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Derived Calculations ---
  const totalPendingTriage = useMemo(() => {
    return (
      (propertyStats.pending || 0) +
      (requestStats.pending || 0) +
      (visitStats.overdue || 0) +
      (inspectionStats.flagged || 0)
    );
  }, [propertyStats.pending, requestStats.pending, visitStats.overdue, inspectionStats.flagged]);

  const complianceRate = useMemo(() => {
    const totalDone = (inspectionStats.verified || 0) + (inspectionStats.flagged || 0);
    if (!totalDone) return 100;
    return Math.round(((inspectionStats.verified || 0) / totalDone) * 100);
  }, [inspectionStats.verified, inspectionStats.flagged]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans pb-16 text-gray-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a2b25] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#C59B27]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ── HERO BANNER with MOSQFAISAL Background ── */}
      <div className="relative w-full bg-[#FAF8F3] pt-4 pb-8 sm:pb-4 border-b border-gray-200/40">

        {/* Faisal Mosque Hero Graphic on Right - Fixed height so it NEVER changes size */}
        <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 w-full sm:w-[75%] lg:w-[68%] xl:w-[62%] h-[220px] sm:h-[240px] z-0 overflow-hidden pointer-events-none select-none">
          <img
            src={MosqFaisal}
            alt="Faisal Mosque Hero"
            className="w-full h-full object-cover object-[80%_center] scale-125 sm:scale-130 origin-[82%_45%] rtl:origin-[18%_45%] rtl:object-[20%_center] rtl:-scale-x-130 opacity-95 transition-transform duration-300"
          />
          {/* Smooth gradient masks blending image into #FAF8F3 on left and bottom */}
          <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#FAF8F3] via-[#FAF8F3]/40 via-15% to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/30 to-transparent" />
        </div>

        {/* Top Header inside Hero: Breadcrumb (Left) and Controls (Right) - High z-index so dropdowns float above cards */}
        <div className="relative z-50 px-4 sm:px-8 max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">

            {/* Breadcrumb: Home > Dashboard */}
            <div className="flex items-center text-xs sm:text-sm font-semibold text-gray-500 gap-2">
              <Home size={17} className="text-gray-600" />
              <ChevronRight size={13} className="text-gray-400 rtl:rotate-180" />
              <span className="text-gray-700">Dashboard</span>
            </div>

            {/* Right Controls: Language | Notifications | Account */}
            <div className="flex items-center gap-3 sm:gap-4">

              {/* Language Pill Dropdown */}
              <div className="relative" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a2b25] text-white text-xs font-bold shadow-xs hover:bg-[#253c34] transition-all cursor-pointer"
                >
                  <span>{i18n.language === 'ur' ? 'اردو' : 'English'}</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full mt-1.5 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[110px] animate-in fade-in slide-in-from-top-1">
                    <button
                      type="button"
                      onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('ppc-language', 'en'); setIsLangOpen(false); }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${i18n.language === 'en' ? 'text-[#063B29] bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => { i18n.changeLanguage('ur'); localStorage.setItem('ppc-language', 'ur'); setIsLangOpen(false); }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold ${i18n.language === 'ur' ? 'text-[#063B29] bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      اردو
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Dropdown */}
              <NotificationDropdown />

              {/* User Account Menu */}
              <CustomerAccountMenu hideChevron={true} />
            </div>
          </div>

          {/* Hero Welcome Text */}
          <div className="max-w-xl">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-serif font-bold text-[#063B29] tracking-tight leading-snug">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-[13px] text-gray-500 font-medium mt-0.5">
              Manage PPC operations from one place
            </p>
          </div>
        </div>

        {/* 5 Metrics Cards Grid placed down where user specified */}
        <div className="relative z-20 px-4 sm:px-8 max-w-[1600px] mx-auto mt-24 sm:mt-32 lg:mt-18">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">

            {/* Card 1: PROPERTIES */}
            <Link
              to="/admin/properties"
              className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100/80 shrink-0">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    PROPERTIES
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {loading ? '...' : (propertyStats.total || 0)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] font-medium truncate">
                  {propertyStats.forSale || 0} Sale • {propertyStats.forRent || 0} Rent
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#fef3c7] text-[#92400e] shrink-0 ms-1">
                  {propertyStats.pending || 0} Pending
                </span>
              </div>
            </Link>

            {/* Card 2: REQUESTS */}
            <Link
              to="/admin/requests"
              className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shrink-0">
                    <ClipboardList className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    REQUESTS
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {loading ? '...' : (requestStats.total || 0)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] font-medium truncate">
                  {requestStats.inOps || 0} In Progress
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ffe4e6] text-[#be123c] shrink-0 ms-1">
                  {requestStats.pending || 0} Pending
                </span>
              </div>
            </Link>

            {/* Card 3: VISITS */}
            <Link
              to="/admin/property-visits"
              className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/80 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    VISITS
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {loading ? '...' : (visitStats.total || 0)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] font-medium truncate">
                  {visitStats.scheduled || 0} Scheduled
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#dcfce7] text-[#15803d] shrink-0 ms-1">
                  On Time
                </span>
              </div>
            </Link>

            {/* Card 4: INSPECTIONS */}
            <Link
              to="/admin/inspection-reports"
              className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shrink-0">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    INSPECTIONS
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {loading ? '...' : (inspectionStats.total || 0)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] font-medium truncate">
                  {inspectionStats.verified || 0} Passed
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#dcfce7] text-[#15803d] shrink-0 ms-1">
                  {complianceRate}% Passed
                </span>
              </div>
            </Link>

            {/* Card 5: CUSTOMERS */}
            <Link
              to="/admin/customers"
              className="bg-white/95 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-xs border border-gray-100 hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/80 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    CUSTOMERS
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {loading ? '...' : (customerStats.total_customers || 0)}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 text-[10px] font-medium truncate">
                  {customerStats.active_customers || 0} Active
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#ccfbf1] text-[#0f766e] shrink-0 ms-1">
                  +{customerStats.new_customers || 0} new
                </span>
              </div>
            </Link>

          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 2. NEEDS ATTENTION                                                        */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100/70 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Needs Attention</h2>
            </div>

            <Link
              to="/admin/requests"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] transition-colors"
            >
              <span>{totalPendingTriage} Pending</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Action 1: Pending Properties */}
            <div className="bg-[#fef9ee] border border-[#fde8c3] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">PROPERTIES</span>
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{propertyStats.pending || 0}</span>
                  <span className="text-xs font-medium text-amber-900/80">Waiting for approval</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200/50 flex justify-end">
                <Link
                  to="/admin/properties"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-amber-800 transition-colors"
                >
                  <span>View Properties</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Action 2: Pending Requests */}
            <div className="bg-[#fef2f4] border border-[#fcd5dc] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">REQUESTS</span>
                  <ClipboardList className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{requestStats.pending || 0}</span>
                  <span className="text-xs font-medium text-rose-900/80">Waiting for review</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/50 flex justify-end">
                <Link
                  to="/admin/requests"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-rose-800 transition-colors"
                >
                  <span>View Requests</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Action 3: Overdue Visits */}
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">VISITS</span>
                  <Eye className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{visitStats.overdue || 0}</span>
                  <span className="text-xs font-medium text-orange-900/80">Overdue</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200/50 flex justify-end">
                <Link
                  to="/admin/property-visits"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-orange-800 transition-colors"
                >
                  <span>View Visits</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Action 4: Inspection Issues */}
            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">INSPECTIONS</span>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">{inspectionStats.flagged || 0}</span>
                  <span className="text-xs font-medium text-blue-900/80">Issues found</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/50 flex justify-end">
                <Link
                  to="/admin/inspection-reports"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-blue-800 transition-colors"
                >
                  <span>View Reports</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. PROPERTIES & REQUESTS OVERVIEW                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel 1: Properties Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <h3 className="font-bold text-gray-900 text-base">Properties Overview</h3>
                <span className="text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-xl">
                  {propertyStats.total} Total
                </span>
              </div>

              {/* Sale / Rent Split Bar */}
              <div className="space-y-2.5 mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    For Sale: {propertyStats.forSale}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    For Rent: {propertyStats.forRent}
                  </span>
                </div>
                <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{
                      width: `${propertyStats.total ? (propertyStats.forSale / propertyStats.total) * 100 : 50}%`
                    }}
                    className="bg-emerald-600 transition-all duration-500"
                    title={`For Sale: ${propertyStats.forSale}`}
                  />
                  <div
                    style={{
                      width: `${propertyStats.total ? (propertyStats.forRent / propertyStats.total) * 100 : 50}%`
                    }}
                    className="bg-blue-600 transition-all duration-500"
                    title={`For Rent: ${propertyStats.forRent}`}
                  />
                </div>
              </div>

              {/* Approval Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 text-center">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-800 block">Approved</span>
                  <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">{propertyStats.approved}</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-xs font-semibold text-amber-800 block">Pending</span>
                  <span className="text-xl font-extrabold text-amber-900 mt-0.5 block">{propertyStats.pending}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-xs font-semibold text-blue-800 block">Under Review</span>
                  <span className="text-xl font-extrabold text-blue-900 mt-0.5 block">{propertyStats.underReview}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                  <span className="text-xs font-semibold text-rose-800 block">Rejected</span>
                  <span className="text-xl font-extrabold text-rose-900 mt-0.5 block">{propertyStats.rejected}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <Link
                to="/admin/properties"
                className="font-bold text-xs text-[#1a2b25] hover:text-[#C59B27] inline-flex items-center gap-1"
              >
                View Properties <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Panel 2: Requests Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <h3 className="font-bold text-gray-900 text-base">Requests Overview</h3>
                <span className="text-xs font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-xl">
                  {requestStats.total} Total
                </span>
              </div>

              {/* Request Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs font-semibold text-amber-800 block">Pending</span>
                  <span className="text-xl font-extrabold text-amber-900 mt-0.5 block">{requestStats.pending}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-xs font-semibold text-blue-800 block">Under Review</span>
                  <span className="text-xl font-extrabold text-blue-900 mt-0.5 block">{requestStats.underReview}</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                  <span className="text-xs font-semibold text-purple-800 block">In Progress</span>
                  <span className="text-xl font-extrabold text-purple-900 mt-0.5 block">{requestStats.inOps}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs font-semibold text-emerald-800 block">Completed</span>
                  <span className="text-xl font-extrabold text-emerald-900 mt-0.5 block">{requestStats.completed}</span>
                </div>
              </div>

              {/* Simple Inspections Summary */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {inspectionStats.verified} Passed
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {inspectionStats.flagged} Issues
                  </span>
                </div>
                <Link
                  to="/admin/inspection-reports"
                  className="font-bold text-[#1a2b25] hover:text-[#C59B27] inline-flex items-center gap-1"
                >
                  View Inspections <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <Link
                to="/admin/requests"
                className="font-bold text-xs text-[#1a2b25] hover:text-[#C59B27] inline-flex items-center gap-1"
              >
                View Requests <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. RECENT ACTIVITY                                                        */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>

            {/* Segmented Tab Controls */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFeedTab('properties')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFeedTab === 'properties'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Properties ({recentProperties.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('requests')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFeedTab === 'requests'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Requests ({recentRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('visits')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFeedTab === 'visits'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Visits ({recentVisits.length})
              </button>
            </div>
          </div>

          {/* TAB 1: RECENT PROPERTIES */}
          {activeFeedTab === 'properties' && (
            <div className="space-y-3">
              {recentProperties.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No properties found.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentProperties.map((p) => {
                    const isApproved = p.approval_stage === 'Approved';
                    const isPending = p.approval_stage === 'Pending';
                    return (
                      <Link
                        key={p.property_id}
                        to="/admin/properties"
                        className="py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            <img
                              src={
                                p.cover_image
                                  ? resolveMediaUrl(p.cover_image)
                                  : (p.pictures?.[0]?.url ? resolveMediaUrl(p.pictures[0].url) : PropHouse)
                              }
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = PropHouse;
                              }}
                              alt={p.formatted_id}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#1a2b25] text-sm">
                                {p.formatted_id}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                {p.property_type}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isApproved
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : isPending
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-blue-50 text-blue-800'
                                }`}>
                                {p.approval_stage}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {p.society}, {p.city} • Owner: <strong>{p.customer_name || 'Customer'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right flex-shrink-0">
                          <div>
                            <span className="text-sm font-extrabold text-[#1a2b25] block">
                              {formatPrice(p.demand_amount, p.demand_type)}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              {formatTimeAgo(p.creation_date_time)}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              <div className="pt-2 flex justify-end">
                <Link
                  to="/admin/properties"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  View All Properties ({propertyStats.total}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: RECENT REQUESTS */}
          {activeFeedTab === 'requests' && (
            <div className="space-y-3">
              {recentRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No requests found.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentRequests.map((req) => (
                    <Link
                      key={req.request_id}
                      to="/admin/requests"
                      className="py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-blue-100">
                          REQ
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#1a2b25] text-sm">
                              {req.formatted_id || `REQ-${req.request_id}`}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                              {req.service_type_description || req.request_purpose || 'General Request'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            Customer: <strong>{req.customer_name || 'Customer'}</strong> • {req.city || 'Islamabad'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 block">
                            {req.status || 'Pending'}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            {formatTimeAgo(req.creation_date_time)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="pt-2 flex justify-end">
                <Link
                  to="/admin/requests"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  View All Requests ({requestStats.total}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: VISITS */}
          {activeFeedTab === 'visits' && (
            <div className="space-y-3">
              {recentVisits.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No visits scheduled.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentVisits.map((v) => (
                    <Link
                      key={v.visit_id}
                      to="/admin/property-visits"
                      className="py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-extrabold text-xs flex-shrink-0 border border-purple-100">
                          VIS
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#1a2b25] text-sm">
                              {v.formatted_id || `VIS-${v.visit_id}`}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                              {v.property_formatted_id || `PRP-${v.property_id}`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            Customer: <strong>{v.customer_name || 'Customer'}</strong> • Staff: {v.employee_name || 'Unassigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div>
                          <span className="text-xs font-bold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 block">
                            {formatDate(v.visit_scheduled_date)}
                          </span>
                          <span className={`text-[10px] font-bold block mt-0.5 ${v.visit_actual_date ? 'text-emerald-700' : 'text-purple-700'}`}>
                            {v.visit_actual_date ? 'Completed' : 'Scheduled'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="pt-2 flex justify-end">
                <Link
                  to="/admin/property-visits"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  View All Visits ({visitStats.total}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
