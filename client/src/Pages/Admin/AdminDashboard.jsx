import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  ClipboardList,
  Eye,
  CheckSquare,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
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
  const { t } = useTranslation(['admin', 'common']);

  const token = getToken();
  let decodedUser = null;
  if (token) {
    decodedUser = parseJwt(token);
  }

  const firstName = user?.user_first_name || decodedUser?.user_first_name;
  const middleName = user?.user_middle_name || decodedUser?.user_middle_name;
  const lastName = user?.user_last_name || decodedUser?.user_last_name;
  const displayName = [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Administrator';

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
        showToast('Dashboard metrics refreshed from live database.');
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

  const requestResolutionRate = useMemo(() => {
    const total = requestStats.total || 0;
    if (!total) return 0;
    return Math.round(((requestStats.completed || 0) / total) * 100);
  }, [requestStats.total, requestStats.completed]);

  const propertyApprovalRate = useMemo(() => {
    const total = propertyStats.total || 0;
    if (!total) return 0;
    return Math.round(((propertyStats.approved || 0) / total) * 100);
  }, [propertyStats.total, propertyStats.approved]);

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans pb-16 text-gray-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a2b25] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#C59B27]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Control Strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C59B27] mb-1">
                <span>Operations Center</span>
                <span>/</span>
                <span className="text-gray-500">Live Executive Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b25] tracking-tight">
                {t('admin:welcomeBack', 'Welcome back')}, {displayName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('admin:managePpc', 'Real-time overview of properties, client requests, physical visits, and quality inspections.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Date Indicator Badge */}
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600">
                <Calendar className="w-4 h-4 text-[#C59B27]" />
                <span>
                  {new Date().toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                title="Refresh Live Metrics"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin text-[#C59B27]' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
              </button>

              {/* Quick Action: Register Property */}
              <Link
                to="/admin/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2b25] text-white text-sm font-semibold hover:bg-[#253c34] transition-all shadow-sm shadow-[#1a2b25]/20 hover:shadow-md"
              >
                <Plus className="w-4 h-4 text-[#C59B27]" />
                <span>Register Property</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. CORE OPERATIONS KPI CARDS (High Scannability 5-Card Layout)            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          
          {/* Card 1: Properties */}
          <Link
            to="/admin/properties"
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-[#C59B27] transition-colors">
                  Properties
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#C59B27] border border-amber-100">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">
                  {loading ? '...' : propertyStats.total}
                </span>
                <span className="text-xs text-gray-500 font-medium">Total</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {propertyStats.forSale} Sale • {propertyStats.forRent} Rent
              </span>
              {propertyStats.pending > 0 ? (
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {propertyStats.pending} New
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-[11px]">Up to date</span>
              )}
            </div>
          </Link>

          {/* Card 2: Customer Requests */}
          <Link
            to="/admin/requests"
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-600 transition-colors">
                  Customer Requests
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">
                  {loading ? '...' : requestStats.total}
                </span>
                <span className="text-xs text-gray-500 font-medium">Total</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {requestStats.inOps} In Progress
              </span>
              {requestStats.pending > 0 ? (
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {requestStats.pending} Pending
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-[11px]">All handled</span>
              )}
            </div>
          </Link>

          {/* Card 3: Site Visits */}
          <Link
            to="/admin/property-visits"
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-purple-600 transition-colors">
                  Site Visits
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">
                  {loading ? '...' : visitStats.total}
                </span>
                <span className="text-xs text-gray-500 font-medium">Total</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {visitStats.scheduled} Scheduled
              </span>
              {visitStats.overdue > 0 ? (
                <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px]">
                  {visitStats.overdue} Overdue
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-[11px]">On Schedule</span>
              )}
            </div>
          </Link>

          {/* Card 4: Quality Inspections */}
          <Link
            to="/admin/inspection-reports"
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-emerald-600 transition-colors">
                  Inspections
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">
                  {loading ? '...' : inspectionStats.total}
                </span>
                <span className="text-xs text-gray-500 font-medium">Audits</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {inspectionStats.verified} Verified
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                {complianceRate}% Pass
              </span>
            </div>
          </Link>

          {/* Card 5: Customers */}
          <Link
            to="/admin/customers"
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200/80 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-teal-600 transition-colors">
                  Customer Accounts
                </span>
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">
                  {loading ? '...' : customerStats.total_customers}
                </span>
                <span className="text-xs text-gray-500 font-medium">Registered</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">
                {customerStats.active_customers} Active
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px]">
                +{customerStats.new_customers} new
              </span>
            </div>
          </Link>

        </div>

        {/* ========================================================================= */}
        {/* 2. IMMEDIATE ACTION REQUIRED (Triage Radar)                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Immediate Action Required</h2>
                <p className="text-xs text-gray-500">Live operational items awaiting review, approval, or scheduling</p>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full ${totalPendingTriage > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}>
              {totalPendingTriage > 0 ? `${totalPendingTriage} Action Items` : 'All Clear • Zero Pending'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            
            {/* Action 1: Properties Awaiting Approval */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Properties</span>
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">{propertyStats.pending}</span>
                  <span className="text-xs font-medium text-amber-800">awaiting review</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  New property listings submitted by customers needing verification.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-200/60 flex justify-end">
                <Link
                  to="/admin/properties"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  Review Listings <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Action 2: Requests Awaiting Intake */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Customer Requests</span>
                  <ClipboardList className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">{requestStats.pending}</span>
                  <span className="text-xs font-medium text-rose-800">unassigned requests</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Customer service requests awaiting initial triage and staff assignment.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-200/60 flex justify-end">
                <Link
                  to="/admin/requests"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  Triage Requests <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Action 3: Overdue Visits */}
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-800">Site Visits</span>
                  <Eye className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">{visitStats.overdue}</span>
                  <span className="text-xs font-medium text-orange-800">overdue visits</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Scheduled property inspections requiring field outcome updates.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-orange-200/60 flex justify-end">
                <Link
                  to="/admin/property-visits"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  Manage Visits <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Action 4: Flagged Inspections */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Quality Checklist</span>
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">{inspectionStats.flagged}</span>
                  <span className="text-xs font-medium text-blue-800">flagged items</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Discrepancies reported during physical property condition audits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60 flex justify-end">
                <Link
                  to="/admin/inspection-reports"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2b25] hover:text-[#C59B27] transition-colors"
                >
                  View Reports <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. OPERATIONS BREAKDOWN & PIPELINE (2 Spacious, High-Contrast Panels)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Panel 1: Property Portfolio Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Property Portfolio Mix</h3>
                  <p className="text-xs text-gray-500">Distribution of registered listings by demand and approval</p>
                </div>
                <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-xl">
                  {propertyStats.total} Total Listings
                </span>
              </div>

              {/* Demand Split Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span>For Sale: {propertyStats.forSale} ({propertyStats.total ? Math.round((propertyStats.forSale / propertyStats.total) * 100) : 0}%)</span>
                  <span>For Rent: {propertyStats.forRent} ({propertyStats.total ? Math.round((propertyStats.forRent / propertyStats.total) * 100) : 0}%)</span>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
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
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> For Sale Listings
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> For Rent Listings
                  </span>
                </div>
              </div>

              {/* Approval Stages Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 text-center">
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

            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Clearance Rate:</span>
              <span className="font-bold text-emerald-700">{propertyApprovalRate}% of portfolio approved</span>
            </div>
          </div>

          {/* Panel 2: Request Workflow & Inspection Health */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Request Workflow & Audit Quality</h3>
                  <p className="text-xs text-gray-500">Intake-to-completion progress and verification accuracy</p>
                </div>
                <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {complianceRate}% Pass Rate
                </span>
              </div>

              {/* 4-Stage Horizontal Pipeline */}
              <div className="space-y-3 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Request Execution Pipeline ({requestStats.total} Total)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-[11px] font-bold text-amber-800 block">1. Intake Pending</span>
                    <span className="text-lg font-black text-amber-900 mt-0.5 block">{requestStats.pending}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <span className="text-[11px] font-bold text-blue-800 block">2. Under Review</span>
                    <span className="text-lg font-black text-blue-900 mt-0.5 block">{requestStats.underReview}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                    <span className="text-[11px] font-bold text-purple-800 block">3. In Operations</span>
                    <span className="text-lg font-black text-purple-900 mt-0.5 block">{requestStats.inOps}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 block">4. Resolved</span>
                    <span className="text-lg font-black text-emerald-900 mt-0.5 block">{requestStats.completed}</span>
                  </div>
                </div>
              </div>

              {/* Inspection Quality Summary */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {inspectionStats.verified} Verified Clean
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    {inspectionStats.flagged} Flagged Findings
                  </span>
                </div>
                <Link
                  to="/admin/inspection-reports"
                  className="font-bold text-[#1a2b25] hover:text-[#C59B27] inline-flex items-center gap-1"
                >
                  Inspection Log <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Request Resolution:</span>
              <span className="font-bold text-emerald-700">{requestResolutionRate}% of requests closed</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. LIVE OPERATIONS ACTIVITY (Clean, High-Readability Segmented Feed)       */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Live Operations Activity</h2>
              <p className="text-xs text-gray-500">Recent property listings, customer service requests, and site visits</p>
            </div>

            {/* Segmented Tab Controls */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFeedTab('properties')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeFeedTab === 'properties'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent Properties ({recentProperties.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('requests')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeFeedTab === 'requests'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent Requests ({recentRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab('visits')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeFeedTab === 'visits'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming Visits ({recentVisits.length})
              </button>
            </div>
          </div>

          {/* TAB 1: RECENT PROPERTIES */}
          {activeFeedTab === 'properties' && (
            <div className="space-y-3">
              {recentProperties.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No properties registered yet.
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
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isApproved
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
                  No customer requests logged yet.
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

          {/* TAB 3: UPCOMING VISITS */}
          {activeFeedTab === 'visits' && (
            <div className="space-y-3">
              {recentVisits.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No upcoming visits scheduled.
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
                            Customer: <strong>{v.customer_name || 'Customer'}</strong> • Field Staff: {v.employee_name || 'Unassigned'}
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
