import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  RotateCcw,
  Eye,
  CheckCircle2,
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
  Building,
  ShieldCheck,
  Check,
  ChevronLeft,
  ExternalLink,
  MapPin,
  FileText,
  UserCheck,
  CalendarCheck,
  CalendarX,
  Clock3,
  MessageSquare,
  Briefcase,
  Loader2,
  Edit3,
  Save,
} from 'lucide-react';
import {
  INITIAL_VISITS,
  VISIT_STATUSES,
  MOCK_AVAILABLE_PROPERTIES,
  MOCK_AVAILABLE_CUSTOMERS,
  MOCK_AVAILABLE_EMPLOYEES
} from './mockAdminVisits';
import PropHouse from '../../../assets/prop_house.png';
import { resolveMediaUrl } from '../../../Services/Api';
import {
  getAdminVisits,
  getAdminVisitStats,
  getAdminVisitById,
  getAdminVisitOptions,
  createAdminVisit,
  rescheduleAdminVisit,
  completeAdminVisit,
  cancelAdminVisit,
  updateAdminVisitRemarks,
} from '../../../Services/admin.services';

const formatDate = (isoOrDateStr) => {
  if (!isoOrDateStr) return '-';
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return isoOrDateStr;
  }
};

// Status styling badge helper
const getVisitStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'Completed'
      };
    case 'Scheduled':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500',
        label: 'Scheduled'
      };
    case 'Overdue':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
        label: 'Overdue / Pending'
      };
    case 'Cancelled':
      return {
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Cancelled'
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: status || 'Unknown'
      };
  }
};

const AdminPropertyVisits = () => {
  const { t } = useTranslation(['admin', 'visits', 'common']);

  // --- Main Dataset State ---
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Global Stats State ---
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    completed: 0,
    overdue: 0,
    cancelled: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // --- Filters & Controls ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'upcoming' | 'past' | 'today'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- 360° Inspection Drawer ---
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState('');
  const [savingRemarks, setSavingRemarks] = useState(false);

  // --- Action Modals ---
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    propertyId: '',
    customerId: '',
    employeeId: '',
    scheduledDate: '',
    scheduledTime: '11:00 AM',
    notes: ''
  });

  // --- Real DB Options State for Scheduling ---
  const [options, setOptions] = useState({
    properties: [],
    customers: [],
    employees: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [completeModal, setCompleteModal] = useState({
    isOpen: false,
    visit: null,
    actualDate: new Date().toISOString().split('T')[0],
    actualTime: '11:30 AM',
    employeeRemarks: ''
  });

  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    visit: null,
    newDate: '',
    newTime: '11:00 AM',
    reason: ''
  });

  // --- Toast Notification ---
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
  }, [debouncedSearch, statusFilter]);

  // Fetch Summary Statistics from Backend API
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminVisitStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Visits stats API error:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Lookups/Options for Scheduling from Backend API
  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const res = await getAdminVisitOptions();
      if (res?.success && res?.data) {
        const { properties = [], customers = [], employees = [] } = res.data;
        setOptions({ properties, customers, employees });
        setScheduleForm((prev) => ({
          ...prev,
          propertyId: prev.propertyId || properties[0]?.id || '',
          customerId: prev.customerId || customers[0]?.id || '',
          employeeId: prev.employeeId || employees[0]?.id || '',
        }));
      }
    } catch (err) {
      console.warn('Visit options fetch error:', err);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchOptions();
  }, [fetchStats, fetchOptions]);

  // Fetch Paginated Visits List from Backend API
  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pageSize,
        status: statusFilter
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }

      const res = await getAdminVisits(params);
      if (res?.success && Array.isArray(res?.data)) {
        setVisits(res.data);
        const pMeta = res.pagination || {};
        setTotal(Number(pMeta.total) || res.data.length);
        setTotalPages(Number(pMeta.totalPages) || 1);
      } else {
        setVisits(INITIAL_VISITS);
        setTotal(INITIAL_VISITS.length);
        setTotalPages(Math.ceil(INITIAL_VISITS.length / pageSize) || 1);
      }
    } catch (err) {
      console.warn('Visits fetch error, using fallback dataset:', err);
      setError('Failed to fetch visits from backend');
      setVisits(INITIAL_VISITS);
      setTotal(INITIAL_VISITS.length);
      setTotalPages(Math.ceil(INITIAL_VISITS.length / pageSize) || 1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // Open 360 Inspection Drawer and fetch deep visit details
  const handleOpenDrawer = async (v) => {
    setSelectedVisit(v);
    setEditedRemarks(v.employee_remarks || '');
    setIsEditingRemarks(false);
    setDrawerLoading(true);
    try {
      const res = await getAdminVisitById(v.id);
      if (res?.success && res?.data) {
        setSelectedVisit(res.data);
        setEditedRemarks(res.data.employee_remarks || '');
      }
    } catch (err) {
      console.warn('Failed to load full visit details:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Super Admin: Direct Save/Update of PPC Representative Findings
  const handleSaveFindings = async () => {
    if (!selectedVisit) return;
    setSavingRemarks(true);
    try {
      const res = await updateAdminVisitRemarks(selectedVisit.id, { remarks: editedRemarks });
      if (res?.success && res?.data) {
        setSelectedVisit(res.data);
        setIsEditingRemarks(false);
        showToast('PPC Representative findings updated successfully!');
        setVisits((prev) =>
          prev.map((v) => (v.id === selectedVisit.id ? { ...v, employee_remarks: editedRemarks } : v))
        );
      } else {
        showToast(res?.message || 'Failed to update findings');
      }
    } catch (err) {
      console.error('Error updating findings:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update findings');
    } finally {
      setSavingRemarks(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTimeFilter('all');
    setPage(1);
  };

  // Handle Schedule New Visit Submit (Live Backend API)
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.scheduledDate) {
      showToast('Please select a scheduled visit date.');
      return;
    }
    if (!scheduleForm.propertyId) {
      showToast('Please select a target property.');
      return;
    }
    if (!scheduleForm.customerId) {
      showToast('Please select a visitor customer.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        propertyId: scheduleForm.propertyId,
        customerId: scheduleForm.customerId,
        employeeId: scheduleForm.employeeId || null,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime || '11:00 AM',
        notes: scheduleForm.notes,
      };

      const res = await createAdminVisit(payload);
      if (res?.success) {
        showToast(`Visit ${res.data?.formatted_id || ''} scheduled successfully!`);
        setScheduleModalOpen(false);
        setScheduleForm((prev) => ({
          ...prev,
          scheduledDate: '',
          notes: '',
        }));
        await Promise.all([fetchVisits(), fetchStats()]);
      } else {
        showToast(res?.message || 'Failed to schedule visit');
      }
    } catch (err) {
      console.error('Error creating visit:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to schedule visit');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Complete Visit Submission (Live Backend API)
  const handleSaveComplete = async () => {
    if (!completeModal.visit) return;
    setActionLoading(true);
    try {
      const targetId = completeModal.visit.id;
      const actDate = completeModal.actualDate || new Date().toISOString().split('T')[0];
      const actTime = completeModal.actualTime || '11:30 AM';
      const remarks = completeModal.employeeRemarks?.trim() || 'Visit conducted successfully. Property condition verified.';

      const res = await completeAdminVisit(targetId, {
        actualDate: actDate,
        actualTime: actTime,
        remarks,
      });

      if (res?.success) {
        showToast(`Visit ${completeModal.visit.formatted_id} marked as Completed.`);
        setCompleteModal({ isOpen: false, visit: null, actualDate: '', actualTime: '', employeeRemarks: '' });
        if (selectedVisit && selectedVisit.id === targetId) {
          setSelectedVisit(res.data);
        }
        await Promise.all([fetchVisits(), fetchStats()]);
      } else {
        showToast(res?.message || 'Failed to complete visit');
      }
    } catch (err) {
      console.error('Error completing visit:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to record completion');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reschedule Visit (Live Backend API)
  const handleSaveReschedule = async () => {
    if (!rescheduleModal.visit || !rescheduleModal.newDate) {
      showToast('Please specify a new date.');
      return;
    }
    setActionLoading(true);
    try {
      const targetId = rescheduleModal.visit.id;
      const newDate = rescheduleModal.newDate;
      const newTime = rescheduleModal.newTime || '11:00 AM';
      const reason = rescheduleModal.reason?.trim() || 'Rescheduled per customer request.';

      const res = await rescheduleAdminVisit(targetId, {
        newDate,
        newTime,
        reason,
      });

      if (res?.success) {
        showToast(`Visit ${rescheduleModal.visit.formatted_id} rescheduled to ${formatDate(newDate)}.`);
        setRescheduleModal({ isOpen: false, visit: null, newDate: '', newTime: '', reason: '' });
        if (selectedVisit && selectedVisit.id === targetId) {
          setSelectedVisit(res.data);
        }
        await Promise.all([fetchVisits(), fetchStats()]);
      } else {
        showToast(res?.message || 'Failed to reschedule visit');
      }
    } catch (err) {
      console.error('Error rescheduling visit:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to reschedule visit');
    } finally {
      setActionLoading(false);
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
                <span className="text-gray-500">Field Coordination</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2b25] tracking-tight">
                Property Visits Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Schedule, assign, track, and verify on-site property walkthroughs and customer viewing appointments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchVisits();
                  showToast('Property visits refreshed from database.');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                title="Refresh Visits"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loading || statsLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2b25] hover:bg-[#253c34] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C59B27]" />
                Schedule Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* ========================================================================= */}
        {/* 4 INTELLIGENCE KPI CARDS                                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Visits */}
          <div
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'all'
                ? 'border-[#C59B27] ring-2 ring-[#C59B27]/20 bg-amber-50/10'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Visits</span>
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-[#1a2b25] border border-gray-100">
                <Calendar className="w-5 h-5 text-[#C59B27]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#1a2b25]">{stats.total}</span>
                <span className="text-xs font-semibold text-gray-500">coordinations</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">All scheduled, completed & active</p>
            </div>
          </div>

          {/* Card 2: Upcoming / Scheduled */}
          <div
            onClick={() => {
              setStatusFilter('Scheduled');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter.toLowerCase() === 'scheduled'
                ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/20'
                : 'border-blue-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Upcoming Visits</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 relative">
                <Clock3 className="w-5 h-5" />
                {stats.scheduled > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900">{stats.scheduled}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-0.5">Assigned to field officers</p>
            </div>
          </div>

          {/* Card 3: Completed Visits */}
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
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-900">{stats.completed}</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-0.5">Findings recorded & verified</p>
            </div>
          </div>

          {/* Card 4: Overdue / Action Needed */}
          <div
            onClick={() => {
              setStatusFilter('Overdue');
              setPage(1);
            }}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter.toLowerCase() === 'overdue'
                ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20'
                : 'border-rose-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Overdue / Follow-Up</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-900">{stats.overdue}</span>
                <span className="text-xs font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Report Pending
                </span>
              </div>
              <p className="text-xs text-rose-600 mt-0.5">Awaiting completion findings</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED FILTER & SEARCH HUB                                               */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visits by ID (VST-001), property (PRP-015), customer name, mobile, officer, location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27] focus:border-transparent transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#1a2b25] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Visits
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Scheduled');
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'Scheduled'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Clock3 className="w-3.5 h-3.5" />
                Scheduled ({stats.scheduled})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Completed');
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'Completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed ({stats.completed})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('Overdue');
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'Overdue'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue ({stats.overdue})
              </button>
            </div>

            {/* View Switcher & Clear */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-gray-100 p-0.5 rounded-xl border border-gray-200 flex items-center">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table' ? 'bg-white text-[#1a2b25] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid' ? 'bg-white text-[#1a2b25] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {(search || statusFilter !== 'all' || timeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="p-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-gray-200 flex items-center gap-1"
                  title="Reset All Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter / Filter status info */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <div>
            Showing <span className="font-bold text-gray-800">{visits.length}</span> of{' '}
            <span className="font-bold text-gray-800">{total}</span> property visits
          </div>
          {(debouncedSearch || statusFilter !== 'all') && (
            <span className="inline-flex items-center gap-1 text-[#C59B27] font-semibold">
              <Filter className="w-3 h-3" /> Active filter applied
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VISITS LIST: TABLE OR GRID VIEW                                           */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#C59B27] animate-spin mb-3" />
            <h3 className="text-base font-bold text-gray-900">Loading Property Visits...</h3>
            <p className="text-xs text-gray-500 mt-1">Fetching live viewing records and customer appointments from database.</p>
          </div>
        ) : visits.length === 0 ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No property visits found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-5">
              No viewing appointments match your selected search criteria or status filter.
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
                    <th scope="col" className="py-4 pl-6 pr-3">Visit ID & Date</th>
                    <th scope="col" className="px-3 py-4">Target Property</th>
                    <th scope="col" className="px-3 py-4">Visitor Customer</th>
                    <th scope="col" className="px-3 py-4">Inquiry / Req</th>
                    <th scope="col" className="px-3 py-4">Scheduled Slot</th>
                    <th scope="col" className="px-3 py-4">Field Officer</th>
                    <th scope="col" className="px-3 py-4">Status</th>
                    <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {visits.map((v) => {
                    const badge = getVisitStatusBadge(v.status);

                    return (
                      <tr
                        key={v.id}
                        onClick={() => handleOpenDrawer(v)}
                        className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                      >
                        {/* 1. Visit ID & Created At */}
                        <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1a2b25] text-xs font-mono group-hover:text-[#C59B27] transition-colors flex items-center gap-1.5">
                              {v.formatted_id}
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C59B27] transition-colors" />
                            </span>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                              Created {formatDate(v.created_at)}
                            </span>
                          </div>
                        </td>

                        {/* 2. Target Property */}
                        <td className="px-3 py-4 max-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                              <img
                                src={resolveMediaUrl(v.property_image) || PropHouse}
                                alt={v.property_title}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PropHouse;
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex flex-col truncate">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {v.property_title}
                              </span>
                              <span className="text-[11px] text-gray-500 font-medium truncate flex items-center gap-1">
                                <span className="font-mono text-[#C59B27]">{v.formatted_property_id}</span>
                                <span>•</span>
                                <span>{v.society}, {v.city}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Visitor Customer */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-[#1a2b25] border border-gray-200 font-bold text-xs flex items-center justify-center shrink-0">
                              {v.customer_name?.charAt(0) || 'C'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900">{v.customer_name}</span>
                              <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 text-gray-400" />
                                {v.customer_mobile || 'No phone'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Inquiry / Request */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-800">
                              {v.request_purpose || 'General Viewing'}
                            </span>
                            <span className="text-[11px] font-mono text-gray-400">
                              {v.formatted_request_id}
                            </span>
                          </div>
                        </td>

                        {/* 5. Scheduled Slot */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              {formatDate(v.visit_scheduled_date)}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {v.visit_scheduled_time || '11:00 AM'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Conducted By / Assigned Officer */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-[10px]">
                              <Briefcase className="w-3 h-3" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900">{v.employee_name}</span>
                              <span className="text-[10px] text-gray-400 truncate max-w-[130px]">
                                {v.employee_designation}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 7. Status */}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* 8. Actions */}
                        <td className="py-4 pl-3 pr-6 whitespace-nowrap text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {v.status !== 'Completed' && v.status !== 'Cancelled' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setCompleteModal({
                                    isOpen: true,
                                    visit: v,
                                    actualDate: new Date().toISOString().split('T')[0],
                                    actualTime: '11:30 AM',
                                    employeeRemarks: ''
                                  })
                                }
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                                title="Record Visit Completion"
                              >
                                Complete Visit
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenDrawer(v)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                View Report
                              </button>
                            )}

                            {/* View Drawer Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(v)}
                              className="p-1.5 text-gray-400 hover:text-[#1a2b25] hover:bg-gray-100 rounded-lg transition-colors"
                              title="360° Visit Inspection"
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
            {visits.map((v) => {
              const badge = getVisitStatusBadge(v.status);

              return (
                <div
                  key={v.id}
                  onClick={() => handleOpenDrawer(v)}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Property Image Cover */}
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={resolveMediaUrl(v.property_image) || PropHouse}
                      alt={v.property_title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PropHouse;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                        {v.formatted_id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${badge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-mono text-[#C59B27] font-bold block">
                        {v.formatted_property_id} • {v.property_type}
                      </span>
                      <h3 className="text-sm font-bold truncate">{v.property_title}</h3>
                      <p className="text-[11px] text-gray-300 truncate">{v.society}, {v.city}</p>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Schedule Box */}
                      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                            Scheduled Appointment
                          </span>
                          <span className="font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            {formatDate(v.visit_scheduled_date)} at {v.visit_scheduled_time}
                          </span>
                        </div>
                        {v.visit_actual_date && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                              Conducted
                            </span>
                            <span className="font-semibold text-emerald-800 text-[11px]">
                              {formatDate(v.visit_actual_date)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Visitor Customer Profile */}
                      <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{v.customer_name}</span>
                          <span className="text-[10px] font-mono text-gray-400">ID #{v.visitor_customer_id}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-gray-400" />
                            {v.customer_mobile || 'No phone'}
                          </span>
                          <span className="font-mono text-gray-400">{v.formatted_request_id}</span>
                        </div>
                      </div>

                      {/* Field Officer Badge */}
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#C59B27]" />
                        <span>Officer: <strong className="text-gray-900">{v.employee_name}</strong></span>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(v);
                        }}
                        className="text-xs font-bold text-gray-600 hover:text-[#1a2b25] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>

                      {v.status !== 'Completed' && v.status !== 'Cancelled' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompleteModal({
                              isOpen: true,
                              visit: v,
                              actualDate: new Date().toISOString().split('T')[0],
                              actualTime: '11:30 AM',
                              employeeRemarks: ''
                            });
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Complete Visit
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Report Logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 360° INSPECTION DRAWER                                                    */}
      {/* ========================================================================= */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Calendar size={20} className="text-[#C59B27]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1a2b25] bg-gray-100 px-2 py-0.5 rounded">
                      {selectedVisit.formatted_id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        getVisitStatusBadge(selectedVisit.status).bg
                      }`}
                    >
                      {selectedVisit.status}
                    </span>
                    {drawerLoading && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-normal">
                        <Loader2 className="w-3 h-3 text-[#C59B27] animate-spin" />
                        Loading details...
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-1">
                    Viewing Inspection Appointment
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Target Property Card */}
              <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Target Property Listing
                  </span>
                  <Link
                    to="/admin/properties"
                    className="text-xs font-bold text-[#C59B27] hover:underline inline-flex items-center gap-1"
                  >
                    Open in Properties <ExternalLink size={12} />
                  </Link>
                </div>
                <div className="flex gap-3.5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shrink-0">
                    <img
                      src={resolveMediaUrl(selectedVisit.property_image) || PropHouse}
                      alt={selectedVisit.property_title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PropHouse;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#C59B27]">
                      {selectedVisit.formatted_property_id} • {selectedVisit.property_type}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">
                      {selectedVisit.property_title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {selectedVisit.society}, {selectedVisit.city}
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      PKR {selectedVisit.demand_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Visitor Customer Profile */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Visitor Customer Profile
                  </span>
                  <Link
                    to={`/admin/customers/${selectedVisit.visitor_customer_id}`}
                    className="text-xs font-bold text-[#C59B27] hover:underline inline-flex items-center gap-1"
                  >
                    View Customer Profile <ExternalLink size={12} />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a2b25] text-white flex items-center justify-center font-bold text-sm">
                    {selectedVisit.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{selectedVisit.customer_name}</h3>
                    <p className="text-xs text-gray-500">Customer ID: #{selectedVisit.visitor_customer_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <a
                    href={`tel:${selectedVisit.customer_mobile}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Phone size={14} className="text-emerald-600" />
                    <span>{selectedVisit.customer_mobile || 'No Mobile'}</span>
                  </a>
                  <a
                    href={`mailto:${selectedVisit.customer_email}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors truncate"
                  >
                    <Mail size={14} className="text-blue-600 shrink-0" />
                    <span className="truncate">{selectedVisit.customer_email || 'No Email'}</span>
                  </a>
                </div>
              </div>

              {/* Schedule vs Actual Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Scheduled Slot
                  </span>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <Calendar size={13} className="text-blue-600" />
                    {formatDate(selectedVisit.visit_scheduled_date)}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    {selectedVisit.visit_scheduled_time || '11:00 AM'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Actual Conducted
                  </span>
                  {selectedVisit.visit_actual_date ? (
                    <>
                      <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {formatDate(selectedVisit.visit_actual_date)}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        {selectedVisit.visit_actual_time || '11:30 AM'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic pt-1">Visit pending conduct</p>
                  )}
                </div>
              </div>

              {/* Assigned PPC Field Officer */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Assigned PPC Field Officer
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#C59B27] flex items-center justify-center font-bold text-xs">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{selectedVisit.employee_name}</h4>
                    <p className="text-[11px] text-gray-500">{selectedVisit.employee_designation}</p>
                  </div>
                </div>
              </div>

              {/* Remarks Exchange (Officer vs Visitor) */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Visit Findings & Remarks
                </span>

                {/* Officer Findings (Super Admin can view & edit anytime) */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a2b25]">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>PPC Representative Findings:</span>
                    </div>
                    {!isEditingRemarks ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditedRemarks(selectedVisit.employee_remarks || '');
                          setIsEditingRemarks(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C59B27] hover:text-[#a07d1c] transition-colors"
                      >
                        <Edit3 size={12} />
                        {selectedVisit.employee_remarks ? 'Edit Findings' : '+ Add Findings'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingRemarks(false)}
                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {isEditingRemarks ? (
                    <div className="space-y-2.5 pt-1">
                      <textarea
                        rows={3}
                        value={editedRemarks}
                        onChange={(e) => setEditedRemarks(e.target.value)}
                        placeholder="Write PPC Representative inspection observations, property status, client feedback, or findings..."
                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingRemarks(false)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingRemarks}
                          onClick={handleSaveFindings}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1a2b25] hover:bg-[#253c34] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          {savingRemarks && <Loader2 className="w-3 h-3 animate-spin" />}
                          <Save size={12} />
                          {savingRemarks ? 'Saving...' : 'Save Findings'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      {selectedVisit.employee_remarks || (
                        <span className="text-gray-400 italic">
                          No inspection findings recorded yet. Click &quot;+ Add Findings&quot; to write notes.
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Visitor Customer Feedback */}
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <MessageSquare size={14} className="text-[#C59B27]" />
                    <span>Customer / Visitor Remarks:</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {selectedVisit.visitor_remarks || 'Visitor has not submitted feedback yet.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Action Bar */}
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {selectedVisit.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() =>
                      setRescheduleModal({
                        isOpen: true,
                        visit: selectedVisit,
                        newDate: selectedVisit.visit_scheduled_date,
                        newTime: selectedVisit.visit_scheduled_time || '11:00 AM',
                        reason: ''
                      })
                    }
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                  >
                    Reschedule
                  </button>
                )}

                {selectedVisit.status !== 'Completed' ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCompleteModal({
                        isOpen: true,
                        visit: selectedVisit,
                        actualDate: new Date().toISOString().split('T')[0],
                        actualTime: '11:30 AM',
                        employeeRemarks: selectedVisit.employee_remarks || ''
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    Complete Visit
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 px-3">
                    <CheckCircle2 size={14} /> Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE NEW VISIT MODAL                                                  */}
      {/* ========================================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#C59B27]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Schedule Property Visit</h3>
                  <span className="text-xs text-gray-500">Coordinate on-site customer viewing</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="py-4 space-y-4">
              {/* Select Target Property */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Target Property Listing
                </label>
                <select
                  value={scheduleForm.propertyId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, propertyId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                >
                  {(options.properties.length > 0 ? options.properties : MOCK_AVAILABLE_PROPERTIES).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.formatted_id} - {p.title} ({p.location || p.city || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Customer */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Visitor Customer
                </label>
                <select
                  value={scheduleForm.customerId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, customerId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                >
                  {(options.customers.length > 0 ? options.customers : MOCK_AVAILABLE_CUSTOMERS).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile || c.email || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Field Officer */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Assigned Field Officer
                </label>
                <select
                  value={scheduleForm.employeeId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, employeeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                >
                  <option value="">-- Select Field Officer (Optional) --</option>
                  {(options.employees.length > 0 ? options.employees : MOCK_AVAILABLE_EMPLOYEES).map((em) => (
                    <option key={em.id} value={em.id}>
                      {em.name} - {em.designation}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Time Slot
                  </label>
                  <select
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Field Notes & Coordination Instructions
                </label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Keyholder contact, specific viewing requirements, society gate pass instructions..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1a2b25] hover:bg-[#253c34] disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {actionLoading ? 'Scheduling...' : 'Confirm & Schedule Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPLETE VISIT / RECORD FINDINGS MODAL                                    */}
      {/* ========================================================================= */}
      {completeModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Record Visit Completion</h3>
                  <span className="text-xs text-gray-500">
                    {completeModal.visit?.formatted_id} • {completeModal.visit?.customer_name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModal({ isOpen: false, visit: null, actualDate: '', actualTime: '', employeeRemarks: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Actual Date Conducted
                  </label>
                  <input
                    type="date"
                    value={completeModal.actualDate}
                    onChange={(e) => setCompleteModal({ ...completeModal, actualDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Actual Time
                  </label>
                  <input
                    type="text"
                    value={completeModal.actualTime}
                    onChange={(e) => setCompleteModal({ ...completeModal, actualTime: e.target.value })}
                    placeholder="e.g. 11:30 AM"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  PPC Field Officer Inspection Findings
                </label>
                <textarea
                  rows={4}
                  value={completeModal.employeeRemarks}
                  onChange={(e) => setCompleteModal({ ...completeModal, employeeRemarks: e.target.value })}
                  placeholder="Record property condition, client satisfaction level, buyer interest, defects noted, and next steps..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCompleteModal({ isOpen: false, visit: null, actualDate: '', actualTime: '', employeeRemarks: '' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveComplete}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {actionLoading ? 'Saving...' : 'Save & Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESCHEDULE VISIT MODAL                                                    */}
      {/* ========================================================================= */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <Clock3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Reschedule Property Visit</h3>
                  <span className="text-xs text-gray-500">
                    {rescheduleModal.visit?.formatted_id} • {rescheduleModal.visit?.customer_name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleModal({ isOpen: false, visit: null, newDate: '', newTime: '', reason: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    New Visit Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleModal.newDate}
                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, newDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    New Time Slot
                  </label>
                  <input
                    type="text"
                    value={rescheduleModal.newTime}
                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, newTime: e.target.value })}
                    placeholder="e.g. 03:00 PM"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Reason for Rescheduling
                </label>
                <textarea
                  rows={3}
                  value={rescheduleModal.reason}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, reason: e.target.value })}
                  placeholder="Client unavailable, weather delay, seller access requested change..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRescheduleModal({ isOpen: false, visit: null, newDate: '', newTime: '', reason: '' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveReschedule}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {actionLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyVisits;
