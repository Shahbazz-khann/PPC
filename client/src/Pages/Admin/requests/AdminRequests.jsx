import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Filter,
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  User,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Plus,
  X,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Home,
  Wrench,
  Volume2,
  Calendar,
  Building,
  ShieldCheck,
  Tag,
  Check,
  ChevronLeft,
  ExternalLink,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';
import { INITIAL_REQUESTS, REQUEST_STATUSES } from './mockAdminRequests';
import {
  getAdminRequests,
  getAdminRequestStats,
  getAdminRequestById,
  updateAdminRequestStatus
} from '../../../Services/admin.services';

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

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

// Status badge styling helper
const getStatusBadgeConfig = (status) => {
  switch (status) {
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'Completed'
      };
    case 'In Progress':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dot: 'bg-indigo-500',
        label: 'In Progress'
      };
    case 'Assigned':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500',
        label: 'Assigned'
      };
    case 'Under Review':
      return {
        bg: 'bg-sky-50 text-sky-700 border-sky-200/80',
        dot: 'bg-sky-500',
        label: 'Under Review'
      };
    case 'Pending':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
        label: 'Pending'
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
        label: 'Rejected'
      };
    case 'Withdrawn':
      return {
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Withdrawn'
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: status || 'Unknown'
      };
  }
};

const AdminRequests = () => {
  const { t } = useTranslation(['admin', 'requests', 'common']);

  // --- Main Requests State ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Global Stats State ---
  const [stats, setStats] = useState({
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
  const [statsLoading, setStatsLoading] = useState(false);

  // --- Filter & Search State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // 'ALL' | 'PROPERTY' | 'SERVICE'
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- 360 Inspection Drawer State ---
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  // --- Status Decision Modal State ---
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    request: null,
    targetStatus: 'Assigned',
    remarks: ''
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  // --- Toast Alert State ---
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, statusFilter]);

  // Fetch Global Summary Stats from Backend API
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminRequestStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Request stats API error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch Paginated Customer Requests List from Backend API
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pageSize,
        category: categoryFilter,
        status: statusFilter
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }

      const res = await getAdminRequests(params);
      if (res?.success && Array.isArray(res?.data)) {
        setRequests(res.data);
        const pMeta = res.pagination || {};
        setTotal(Number(pMeta.total) || res.data.length);
        setTotalPages(Number(pMeta.totalPages) || 1);
      } else {
        // Fallback to initial mock if API payload is empty
        setRequests(INITIAL_REQUESTS);
        setTotal(INITIAL_REQUESTS.length);
        setTotalPages(Math.ceil(INITIAL_REQUESTS.length / pageSize) || 1);
      }
    } catch (err) {
      console.warn('Customer requests fetch error, falling back to mock dataset:', err);
      setError('Failed to fetch live requests from backend');
      setRequests(INITIAL_REQUESTS);
      setTotal(INITIAL_REQUESTS.length);
      setTotalPages(Math.ceil(INITIAL_REQUESTS.length / pageSize) || 1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open 360 Inspection Drawer and fetch deep detail with status history
  const handleOpenDrawer = async (req) => {
    setSelectedRequest(req);
    setDrawerLoading(true);
    try {
      const res = await getAdminRequestById(req.id);
      if (res?.success && res?.data) {
        setSelectedRequest(res.data);
      }
    } catch (err) {
      console.warn('Failed to load full request inspection detail:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Clear / Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setStatusFilter('all');
    setPage(1);
  };

  // Handle Status Update Submission via Backend PATCH API
  const handleSaveStatus = async () => {
    if (!statusModal.request || statusUpdating) return;

    const targetReqId = statusModal.request.id;
    const newStatus = statusModal.targetStatus;
    const remarks = statusModal.remarks?.trim() || null;

    setStatusUpdating(true);
    try {
      const res = await updateAdminRequestStatus(targetReqId, {
        status: newStatus,
        remarks: remarks || `Status updated to "${newStatus}" by Administrator.`
      });

      if (res?.success && res?.data) {
        const updated = res.data;

        // Update row item in state
        setRequests((prev) =>
          prev.map((item) => (item.id === targetReqId ? { ...item, ...updated } : item))
        );

        // If drawer open for this request, sync its complete detail with updated status history
        if (selectedRequest && selectedRequest.id === targetReqId) {
          setSelectedRequest(updated);
        }

        // Refresh stats cards so numbers are synchronized
        fetchStats();

        showToast(`Request ${statusModal.request.formatted_id} status updated to "${newStatus}".`);
        setStatusModal({ isOpen: false, request: null, targetStatus: 'Assigned', remarks: '' });
      } else {
        showToast(res?.message || 'Failed to update request status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.message || 'Error occurred while updating request status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-20 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a2b25] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-amber-500/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#C59B27]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C59B27] mb-1">
                <span>Operations</span>
                <span>/</span>
                <span className="text-gray-500">Customer Inquiries & Requests</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2b25] tracking-tight">
                Customer Requests Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review, verify, assign, track, and update all property and maintenance service inquiries submitted by customers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchRequests();
                  showToast('Requests data refreshed from database.');
                }}
                disabled={loading || statsLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                title="Refresh Requests"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loading || statsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* ========================================================================= */}
        {/* 5 KPI METRIC INTELLIGENCE CARDS                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Inquiries */}
          <div
            onClick={() => handleResetFilters()}
            className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Inquiries</span>
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 border border-gray-100">
                <FileText className="w-5 h-5 text-[#1a2b25]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-[#1a2b25]">{stats.total}</span>
              <p className="text-xs text-gray-500 mt-0.5">All customer requests</p>
            </div>
          </div>

          {/* Card 2: Pending Review (Action Required) */}
          <div
            onClick={() => {
              setStatusFilter('Pending');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter.toLowerCase() === 'pending'
                ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                : 'border-amber-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 relative">
                <Clock className="w-5 h-5" />
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900">{stats.pending}</span>
                <span className="text-xs font-medium text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Action Req
                </span>
              </div>
              <p className="text-xs text-amber-700/80 mt-0.5">Awaiting initial action</p>
            </div>
          </div>

          {/* Card 3: Active Operations (Assigned / In Progress) */}
          <div
            onClick={() => {
              setStatusFilter('In Progress');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter.toLowerCase() === 'in progress' || statusFilter.toLowerCase() === 'assigned'
                ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/20'
                : 'border-blue-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">In Operations</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900">{stats.inOps}</span>
                {stats.underReview > 0 && (
                  <span className="text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                    +{stats.underReview} Reviewing
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-600 mt-0.5">Assigned & actively handled</p>
            </div>
          </div>

          {/* Card 4: Completed Inquiries */}
          <div
            onClick={() => {
              setStatusFilter('Completed');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter.toLowerCase() === 'completed'
                ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20'
                : 'border-emerald-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-emerald-900">{stats.completed}</span>
              <p className="text-xs text-emerald-600 mt-0.5">Fulfilled & resolved</p>
            </div>
          </div>

          {/* Card 5: Category Distribution */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Category Split</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-extrabold text-purple-900">{stats.propertyReqs}</span>
                  <p className="text-[11px] font-semibold text-gray-500">Property</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div>
                  <span className="text-2xl font-extrabold text-indigo-900">{stats.serviceReqs}</span>
                  <p className="text-[11px] font-semibold text-gray-500">Service</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED SEARCH & MULTI-FILTER CONTROL HUB                                 */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by ID (REQ-021), Customer, Mobile, Service..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] outline-none text-xs font-semibold text-gray-800 bg-gray-50/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Category Tabs */}
            <div className="flex items-center bg-gray-100/70 p-1 rounded-xl text-xs font-bold w-full lg:w-auto">
              {[
                { key: 'ALL', label: 'All Categories' },
                { key: 'PROPERTY', label: 'Property Inquiries', icon: Home },
                { key: 'SERVICE', label: 'Service Inquiries', icon: Wrench }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = categoryFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(tab.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all flex-1 lg:flex-none justify-center ${
                      isActive
                        ? 'bg-white text-[#1a2b25] shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Switcher & Action */}
            <div className="flex items-center gap-2 self-end lg:self-center">
              <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-[#1a2b25] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#1a2b25] shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {(search || categoryFilter !== 'ALL' || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filter Line */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px]">
              Filter By Status:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['all', 'Pending', 'Under Review', 'Assigned', 'In Progress', 'Completed', 'Rejected', 'Withdrawn'].map(
                (st) => {
                  const isActive = statusFilter.toLowerCase() === st.toLowerCase();
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setPage(1);
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1a2b25] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {st === 'all' ? 'All Statuses' : st}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Results Counter / Filter status info */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <div>
            Showing <span className="font-bold text-gray-800">{requests.length}</span> of{' '}
            <span className="font-bold text-gray-800">{total}</span> customer requests
          </div>
          {(search || categoryFilter !== 'ALL' || statusFilter !== 'all') && (
            <span className="inline-flex items-center gap-1 text-[#C59B27] font-semibold">
              <Filter className="w-3 h-3" /> Active filter applied
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* REQUESTS LIST: TABLE OR GRID VIEW                                         */}
        {/* ========================================================================= */}
        {loading ? (
          /* Loading Skeleton / Spinner State */
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-12 h-12 bg-amber-50 text-[#C59B27] rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Loading Customer Inquiries...</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Synchronizing customer requests and status tracking from the live database.
            </p>
          </div>
        ) : requests.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matching requests found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
              No customer inquiries match your selected category, status, or search query. Try clearing your filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1a2b25] text-white text-xs font-semibold rounded-xl hover:bg-[#253c34] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ==================== TABLE VIEW ==================== */
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                {/* SOLID DARK GREEN HEADER */}
                <thead className="bg-[#002a1b] text-[11px] font-bold text-white uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-3">Request ID & Date</th>
                    <th scope="col" className="px-3 py-4">Category & Purpose</th>
                    <th scope="col" className="px-3 py-4">Customer Details</th>
                    <th scope="col" className="px-3 py-4">Asset / Requirements</th>
                    <th scope="col" className="px-3 py-4">Customer Remarks</th>
                    <th scope="col" className="px-3 py-4">Current Status</th>
                    <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {requests.map((req) => {
                    const badge = getStatusBadgeConfig(req.status);
                    const isProperty = req.category === 'PROPERTY';

                    return (
                      <tr
                        key={req.id}
                        onClick={() => handleOpenDrawer(req)}
                        className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                      >
                        {/* 1. Request ID & Date */}
                        <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1a2b25] text-xs font-mono group-hover:text-[#C59B27] transition-colors flex items-center gap-1.5">
                              {req.formatted_id}
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C59B27] transition-colors" />
                            </span>
                            <span className="text-[11px] text-gray-500 mt-0.5">
                              {formatDate(req.created_at)}
                            </span>
                          </div>
                        </td>

                        {/* 2. Category & Purpose */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isProperty
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                              }`}
                            >
                              {isProperty ? <Home className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-800 block">
                                {isProperty ? req.purpose || 'Property Request' : req.service || 'Service Request'}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                {req.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Customer Profile */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-[#1a2b25] border border-gray-200 font-bold text-xs flex items-center justify-center shrink-0">
                              {req.customer_name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900">{req.customer_name}</span>
                              <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-gray-400" />
                                {req.customer_mobile || 'No phone'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Asset / Requirements */}
                        <td className="px-3 py-4 max-w-[180px]">
                          {req.formatted_property_id ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#1a2b25] inline-flex items-center gap-1">
                                <Building className="w-3 h-3 text-gray-400" />
                                {req.formatted_property_id}
                              </span>
                              <span className="text-[11px] text-gray-500 truncate">
                                {req.linked_property_type ? `${req.linked_property_type} in ` : ''}
                                {req.linked_society || req.linked_city || 'Registered Asset'}
                              </span>
                            </div>
                          ) : req.req_property_type || req.req_city ? (
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-800">
                                {req.req_property_type || 'Search Requirement'}
                              </span>
                              <span className="text-[11px] text-gray-500 truncate">
                                {req.req_society ? `${req.req_society}, ` : ''}{req.req_city || 'Flexible location'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No specific asset linked</span>
                          )}
                        </td>

                        {/* 5. Customer Remarks & Voice */}
                        <td className="px-3 py-4 max-w-[200px]">
                          <div className="flex items-start gap-1.5">
                            {req.audio_url && (
                              <span
                                className="p-1 rounded bg-amber-50 text-amber-700 shrink-0"
                                title="Customer voice note attached"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {req.description || 'No additional notes provided.'}
                            </p>
                          </div>
                        </td>

                        {/* 6. Current Status */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-4 pl-3 pr-6 whitespace-nowrap text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Update Status Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setStatusModal({
                                  isOpen: true,
                                  request: req,
                                  targetStatus: req.status === 'Pending' ? 'Assigned' : req.status,
                                  remarks: ''
                                })
                              }
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                              title="Update Request Status"
                            >
                              Update Status
                            </button>

                            {/* View 360 Drawer Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(req)}
                              className="p-1.5 text-gray-400 hover:text-[#1a2b25] hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Full Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/30">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 bg-white font-semibold text-gray-700"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <span>
                  Page <span className="font-bold text-gray-800">{page}</span> of{' '}
                  <span className="font-bold text-gray-800">{totalPages}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== GRID / CARD VIEW ==================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => {
              const badge = getStatusBadgeConfig(req.status);
              const isProperty = req.category === 'PROPERTY';

              return (
                <div
                  key={req.id}
                  onClick={() => handleOpenDrawer(req)}
                  className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="space-y-4">
                    {/* Top Row: ID & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#1a2b25] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                          {req.formatted_id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isProperty ? 'bg-amber-50 text-amber-800' : 'bg-indigo-50 text-indigo-800'
                          }`}
                        >
                          {isProperty ? <Home className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                          {req.category}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Title / Service */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#C59B27] transition-colors">
                        {isProperty ? req.purpose || 'Property Request' : req.service || 'Service Request'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {req.description || 'No description notes provided.'}
                      </p>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{req.customer_name}</span>
                        <span className="text-[10px] font-mono text-gray-400">ID #{req.customer_id}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-gray-400" />
                          {req.customer_mobile || 'No phone'}
                        </span>
                        <span>{formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    {/* Linked Asset snippet */}
                    {req.formatted_property_id && (
                      <div className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          Linked Property: <strong className="text-gray-900">{req.formatted_property_id}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      {formatTime(req.created_at)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusModal({
                          isOpen: true,
                          request: req,
                          targetStatus: req.status === 'Pending' ? 'Assigned' : req.status,
                          remarks: ''
                        });
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 360° INSPECTION DRAWER FOR CUSTOMER REQUEST                               */}
      {/* ========================================================================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedRequest.category === 'PROPERTY'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {selectedRequest.category === 'PROPERTY' ? <Home size={20} /> : <Wrench size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1a2b25] bg-gray-100 px-2 py-0.5 rounded">
                      {selectedRequest.formatted_id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        getStatusBadgeConfig(selectedRequest.status).bg
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-1">
                    {selectedRequest.category === 'PROPERTY'
                      ? selectedRequest.purpose || 'Property Request'
                      : selectedRequest.service || 'Service Request'}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer Contact Box */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Customer Profile
                  </span>
                  <Link
                    to={`/admin/customers/${selectedRequest.customer_id}`}
                    className="text-xs font-bold text-[#C59B27] hover:underline inline-flex items-center gap-1"
                  >
                    View Customer Profile <ExternalLink size={12} />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#1a2b25] text-white flex items-center justify-center font-bold text-sm">
                    {selectedRequest.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{selectedRequest.customer_name}</h3>
                    <p className="text-xs text-gray-500">Customer ID: #{selectedRequest.customer_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                  <a
                    href={`tel:${selectedRequest.customer_mobile}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Phone size={14} className="text-emerald-600" />
                    <span>{selectedRequest.customer_mobile || 'No Mobile'}</span>
                  </a>
                  <a
                    href={`mailto:${selectedRequest.customer_email}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors truncate"
                  >
                    <Mail size={14} className="text-blue-600 shrink-0" />
                    <span className="truncate">{selectedRequest.customer_email || 'No Email'}</span>
                  </a>
                </div>
              </div>

              {/* Inquiry Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  Customer Description / Requirements
                </label>
                <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 leading-relaxed font-medium">
                  {selectedRequest.description || 'No description notes provided by customer.'}
                </div>
              </div>

              {/* Voice Note Player (if customer attached an audio message) */}
              {selectedRequest.audio_url && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <Volume2 size={16} />
                    <span>Customer Voice Note Attached</span>
                  </div>
                  <audio controls className="w-full h-8 mt-1">
                    <source src={selectedRequest.audio_url} type="audio/mpeg" />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {/* Linked Property Details (if request has property_id) */}
              {selectedRequest.formatted_property_id && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Associated Property Listing
                  </label>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-[#1a2b25]" />
                        <span className="font-bold text-xs text-gray-900">
                          {selectedRequest.formatted_property_id}
                        </span>
                      </div>
                      <Link
                        to="/admin/properties"
                        className="text-xs font-bold text-[#C59B27] hover:underline"
                      >
                        Find in Properties
                      </Link>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>
                        Type:{' '}
                        <strong className="text-gray-900">
                          {selectedRequest.linked_property_type || 'Unspecified'}
                        </strong>
                      </p>
                      <p>
                        Location:{' '}
                        <strong className="text-gray-900">
                          {[selectedRequest.linked_society, selectedRequest.linked_city]
                            .filter(Boolean)
                            .join(', ') || 'Registered Location'}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Requirements (For Purchase / Rent inquiries) */}
              {(selectedRequest.req_property_type || selectedRequest.req_city || selectedRequest.minimum_budget) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Property Search Criteria
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Desired Type:</span>
                      <span className="font-bold text-gray-900">
                        {selectedRequest.req_property_type || 'Any Type'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Area:</span>
                      <span className="font-bold text-gray-900">
                        {[selectedRequest.req_society, selectedRequest.req_city].filter(Boolean).join(', ') ||
                          'Flexible'}
                      </span>
                    </div>
                    {(selectedRequest.minimum_budget || selectedRequest.maximum_budget) && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget Range:</span>
                        <span className="font-bold text-emerald-700">
                          PKR {Number(selectedRequest.minimum_budget || 0).toLocaleString()} -{' '}
                          {Number(selectedRequest.maximum_budget || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Trail & Status History Timeline */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status History & Audit Trail
                  </span>
                  {drawerLoading && (
                    <span className="text-[11px] text-[#C59B27] flex items-center gap-1 font-semibold">
                      <Loader2 size={12} className="animate-spin" /> Syncing...
                    </span>
                  )}
                </div>

                {selectedRequest.status_history && selectedRequest.status_history.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedRequest.status_history.map((sh, idx) => (
                      <div
                        key={sh.history_id || idx}
                        className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
                            {sh.status}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {formatDate(sh.created_at || sh.effective_date)} {formatTime(sh.created_at || sh.effective_date)}
                          </span>
                        </div>
                        {sh.remarks && (
                          <p className="text-gray-600 pl-3.5 italic">
                            "{sh.remarks}"
                          </p>
                        )}
                        {sh.created_by_name && (
                          <p className="text-[10px] text-gray-400 pl-3.5 font-medium">
                            Updated by: {sh.created_by_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Creation Date:</span>
                      <span className="text-gray-700 font-semibold">{formatDate(selectedRequest.created_at)} at {formatTime(selectedRequest.created_at)}</span>
                    </div>
                    {selectedRequest.admin_remarks && (
                      <div className="flex justify-between text-amber-700">
                        <span>Latest Admin Note:</span>
                        <span className="font-medium text-right max-w-[240px]">{selectedRequest.admin_remarks}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Bottom Sticky Action Bar */}
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Close Drawer
              </button>

              <button
                type="button"
                onClick={() =>
                  setStatusModal({
                    isOpen: true,
                    request: selectedRequest,
                    targetStatus: selectedRequest.status === 'Pending' ? 'Assigned' : selectedRequest.status,
                    remarks: ''
                  })
                }
                className="px-5 py-2.5 rounded-xl bg-[#1a2b25] hover:bg-[#253c34] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <ShieldCheck size={16} />
                Update Request Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATUS DECISION MODAL (7 DATABASE STATUSES)                               */}
      {/* ========================================================================= */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Update Request Status</h3>
                  <span className="text-xs text-gray-500">
                    {statusModal.request?.formatted_id} • {statusModal.request?.customer_name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModal({ isOpen: false, request: null, targetStatus: 'Assigned', remarks: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  Select Workflow Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {REQUEST_STATUSES.map((st) => {
                    const isSelected = statusModal.targetStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusModal((prev) => ({ ...prev, targetStatus: st }))}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? st === 'Completed'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : st === 'In Progress'
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : st === 'Assigned'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : st === 'Rejected'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : st === 'Under Review'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Internal Notes & Inspector Remarks
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  placeholder="Enter reason, assignment details, or notes regarding this status change..."
                  value={statusModal.remarks}
                  onChange={(e) => setStatusModal((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => setStatusModal({ isOpen: false, request: null, targetStatus: 'Assigned', remarks: '' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusUpdating}
                onClick={handleSaveStatus}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#1a2b25] hover:bg-[#253c34] rounded-xl transition-colors shadow-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {statusUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{statusUpdating ? 'Updating Status...' : 'Confirm Status Change'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
