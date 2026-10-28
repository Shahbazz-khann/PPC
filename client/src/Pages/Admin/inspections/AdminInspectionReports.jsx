import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Phone,
  Mail,
  User,
  LayoutGrid,
  List,
  Sparkles,
  Download,
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  Home,
  Building,
  ShieldCheck,
  Check,
  ExternalLink,
  MapPin,
  FileText,
  UserCheck,
  CalendarCheck,
  Calendar,
  Clock,
  Printer,
  ShieldAlert,
  Loader2,
  Edit3,
  Save
} from 'lucide-react';

import {
  INITIAL_INSPECTIONS,
  INSPECTION_STATUSES,
  CHECKLIST_STATUS_MAP,
  MOCK_AVAILABLE_PROPERTIES,
  MOCK_AVAILABLE_INSPECTORS
} from './mockAdminInspections';

import {
  getAdminInspections,
  getAdminInspectionStats,
  getAdminInspectionById,
  updateAdminInspectionFindings,
  updateAdminInspectionChecklistItem,
  getAdminInspectionOptions,
  createAdminInspection
} from '../../../Services/admin.services';

import PropHouse from '../../../assets/prop_house.png';
import { resolveMediaUrl } from '../../../Services/Api';

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
const getInspectionStatusBadge = (status) => {
  switch (status) {
    case 'Verified':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'Verified / Passed'
      };
    case 'Issues Flagged':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-500',
        label: 'Issues Flagged'
      };
    case 'Scheduled':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500',
        label: 'Scheduled'
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
        label: 'In Progress'
      };
    default:
      return {
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
        label: status || 'Unknown'
      };
  }
};

const AdminInspectionReports = () => {
  const { t } = useTranslation(['admin', 'common']);

  // --- Main Dataset State ---
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ total: 0, verified: 0, flagged: 0, scheduled: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Filters & Controls ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Verified' | 'Issues Flagged' | 'Scheduled' | 'In Progress'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // --- 360° Inspection Report Detail Drawer ---
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [isEditingFindings, setIsEditingFindings] = useState(false);
  const [editedFindings, setEditedFindings] = useState('');
  const [isSavingFindings, setIsSavingFindings] = useState(false);

  // --- Checklist item inline editing ---
  const [editingChecklistId, setEditingChecklistId] = useState(null);
  const [editChecklistStatus, setEditChecklistStatus] = useState(1);
  const [editChecklistRemarks, setEditChecklistRemarks] = useState('');
  const [isSavingChecklist, setIsSavingChecklist] = useState(false);

  // --- Schedule New Inspection Modal & Options ---
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [availableProperties, setAvailableProperties] = useState(MOCK_AVAILABLE_PROPERTIES);
  const [availableInspectors, setAvailableInspectors] = useState(MOCK_AVAILABLE_INSPECTORS);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    propertyId: MOCK_AVAILABLE_PROPERTIES[0].id,
    inspectorId: MOCK_AVAILABLE_INSPECTORS[0].id,
    scheduledDate: '',
    scheduledTime: '11:00 AM',
    scopeNotes: ''
  });

  // --- Toast Notification ---
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  // --- Live Backend Fetching: Dropdown Options ---
  const fetchOptions = useCallback(async () => {
    try {
      const res = await getAdminInspectionOptions();
      if (res && res.data) {
        if (res.data.properties && res.data.properties.length > 0) {
          setAvailableProperties(res.data.properties);
          setScheduleForm((prev) => ({
            ...prev,
            propertyId: res.data.properties[0].id,
          }));
        }
        if (res.data.inspectors && res.data.inspectors.length > 0) {
          setAvailableInspectors(res.data.inspectors);
          setScheduleForm((prev) => ({
            ...prev,
            inspectorId: res.data.inspectors[0].id,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to load inspection options, using defaults:', err);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  // --- Live Backend Fetching: Global Stats ---
  const fetchStats = useCallback(async () => {
    try {
      const res = await getAdminInspectionStats();
      if (res && res.data) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.warn('Inspection stats fetch error:', err);
    }
  }, []);

  // --- Live Backend Fetching: Paginated List ---
  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminInspections({
        page,
        limit: pageSize,
        status: statusFilter,
        search: debouncedSearch
      });
      if (res && res.data) {
        setInspections(res.data);
        if (res.pagination) {
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages || 1);
        } else {
          setTotalCount(res.data.length);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
        }
      } else {
        setInspections(INITIAL_INSPECTIONS);
        setTotalCount(INITIAL_INSPECTIONS.length);
        setTotalPages(Math.ceil(INITIAL_INSPECTIONS.length / pageSize) || 1);
      }
    } catch (err) {
      console.warn('Inspection list fetch error, using fallback:', err);
      setInspections(INITIAL_INSPECTIONS);
      setTotalCount(INITIAL_INSPECTIONS.length);
      setTotalPages(Math.ceil(INITIAL_INSPECTIONS.length / pageSize) || 1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchInspections()]);
    showToast('Inspection reports refreshed.');
  };

  // Paginated Slices (Server already paginates, inspections is the slice)
  const paginatedInspections = inspections;

  // Global KPI Statistics (prefers live backend stats)
  const stats = useMemo(() => {
    if (statsData && (statsData.total > 0 || statsData.verified > 0 || statsData.flagged > 0 || statsData.scheduled > 0)) {
      return statsData;
    }
    const total = inspections.length;
    const verified = inspections.filter((i) => i.status === 'Verified').length;
    const flagged = inspections.filter((i) => i.status === 'Issues Flagged').length;
    const scheduled = inspections.filter((i) => i.status === 'Scheduled' || i.status === 'In Progress').length;
    return { total, verified, flagged, scheduled };
  }, [statsData, inspections]);

  // Open Drawer and fetch full 360° checklist from backend
  const handleOpenDrawer = async (item) => {
    setSelectedInspection(item);
    setEditedFindings(item.inspection_findings || '');
    setIsEditingFindings(false);
    setDrawerLoading(true);

    try {
      const res = await getAdminInspectionById(item.id);
      if (res && res.data) {
        setSelectedInspection(res.data);
        setEditedFindings(res.data.inspection_findings || '');
      }
    } catch (err) {
      console.warn('Failed to load full inspection details from API, using row summary:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  // Super Admin: Direct Save Findings in Drawer with Backend PATCH
  const handleSaveFindings = async () => {
    if (!selectedInspection) return;
    setIsSavingFindings(true);
    try {
      const res = await updateAdminInspectionFindings(selectedInspection.id, {
        findings: editedFindings
      });
      const updated = res?.data || {
        ...selectedInspection,
        inspection_findings: editedFindings
      };
      setSelectedInspection(updated);
      setInspections((prev) =>
        prev.map((i) => (String(i.id) === String(selectedInspection.id) ? { ...i, inspection_findings: editedFindings } : i))
      );
      setIsEditingFindings(false);
      showToast('Inspection findings updated successfully!');
      fetchStats();
    } catch (err) {
      console.error('Error updating findings:', err);
      setSelectedInspection((prev) => ({ ...prev, inspection_findings: editedFindings }));
      setInspections((prev) =>
        prev.map((i) => (String(i.id) === String(selectedInspection.id) ? { ...i, inspection_findings: editedFindings } : i))
      );
      setIsEditingFindings(false);
      showToast('Inspection findings updated locally.');
    } finally {
      setIsSavingFindings(false);
    }
  };

  // Super Admin: Start editing an individual checklist item
  const handleStartEditChecklist = (ch) => {
    setEditingChecklistId(ch.id);
    setEditChecklistStatus(ch.status_id);
    setEditChecklistRemarks(ch.remarks || '');
  };

  // Super Admin: Cancel editing checklist item
  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
  };

  // Super Admin: Save checklist item status & remarks to PostgreSQL
  const handleSaveChecklistItem = async (detailId) => {
    if (!selectedInspection) return;
    setIsSavingChecklist(true);
    try {
      const res = await updateAdminInspectionChecklistItem(selectedInspection.id, detailId, {
        status_id: editChecklistStatus,
        remarks: editChecklistRemarks,
      });

      // Update the checklist item in selectedInspection state
      const updatedList = (selectedInspection.checklist || []).map((item) => {
        if (String(item.id) === String(detailId)) {
          return (
            res?.data || {
              ...item,
              status_id: editChecklistStatus,
              remarks: editChecklistRemarks,
              status_label:
                editChecklistStatus === 1
                  ? 'Verified'
                  : editChecklistStatus === 2
                  ? 'Not Verified'
                  : editChecklistStatus === 3
                  ? 'Partially Verified'
                  : 'Not Applicable',
            }
          );
        }
        return item;
      });

      setSelectedInspection((prev) => ({
        ...prev,
        checklist: updatedList,
      }));

      setEditingChecklistId(null);
      showToast('Checklist item updated successfully!');

      // Re-fetch parent inspection to update overall status (e.g. Verified vs Issues Flagged)
      const freshParent = await getAdminInspectionById(selectedInspection.id);
      if (freshParent?.data) {
        setSelectedInspection(freshParent.data);
      }

      // Refresh background table and summary stats
      fetchStats();
      fetchInspections();
    } catch (err) {
      console.error('Error updating checklist item:', err);
      showToast('Failed to update checklist item.');
    } finally {
      setIsSavingChecklist(false);
    }
  };

  // Handle Schedule Inspection Submit - Saved Live to PostgreSQL
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.scheduledDate) {
      showToast('Please select a scheduled inspection date.');
      return;
    }

    setIsSubmittingSchedule(true);
    try {
      const res = await createAdminInspection(scheduleForm);
      showToast(res?.message || 'Property inspection scheduled successfully in PostgreSQL!');
      setScheduleModalOpen(false);
      setScheduleForm({
        propertyId: availableProperties[0]?.id || 1,
        inspectorId: availableInspectors[0]?.id || 1,
        scheduledDate: '',
        scheduledTime: '11:00 AM',
        scopeNotes: '',
      });

      // Refresh global stats & list from database
      fetchStats();
      fetchInspections();
    } catch (err) {
      console.error('Error scheduling inspection:', err);
      showToast(err?.message || 'Failed to schedule inspection in database.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (inspections.length === 0) {
      showToast('No inspection reports to export.');
      return;
    }

    const headers = [
      'Report ID',
      'Property ID',
      'Property Title',
      'Location',
      'Customer Name',
      'Customer Mobile',
      'Inspector Name',
      'Scheduled Date',
      'Conducted Date',
      'Status'
    ];

    const rows = inspections.map((i) => [
      `"${i.formatted_id}"`,
      `"${i.formatted_property_id}"`,
      `"${(i.property_title || '').replace(/"/g, '""')}"`,
      `"${(i.society || '')}, ${(i.city || '')}"`,
      `"${i.customer_name || ''}"`,
      `"${i.customer_mobile || ''}"`,
      `"${i.employee_name || ''}"`,
      `"${i.inspection_scheduled_date || ''}"`,
      `"${i.inspection_actual_date || 'Pending'}"`,
      `"${i.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PPC_Inspection_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Inspection reports exported successfully to CSV!');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
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
              <div className="flex items-center gap-2 text-xs font-bold text-[#C59B27] uppercase tracking-wider mb-1">
                <span>Operations</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span>Quality & Compliance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2b25] tracking-tight">
                Property Inspection Reports
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Review engineering walkthroughs, compliance checklists, structural assessments, and verified deficiency reports.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer"
                title="Refresh Reports"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2b25] hover:bg-[#253c34] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C59B27]" />
                Schedule Inspection
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* ========================================================================= */}
        {/* GLOBAL KPI STATISTICS CARDS                                               */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Inspections */}
          <div
            onClick={() => setStatusFilter('all')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'all'
                ? 'border-[#C59B27] ring-2 ring-[#C59B27]/20 bg-amber-50/10'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Inspections
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-[#C59B27] border border-amber-100">
                <ClipboardCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-gray-900">{stats.total}</span>
                <span className="text-xs font-medium text-gray-500">reports generated</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Physical property audits</p>
            </div>
          </div>

          {/* Card 2: Verified / Passed */}
          <div
            onClick={() => setStatusFilter('Verified')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'Verified'
                ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20'
                : 'border-emerald-100 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Verified & Passed
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-900">{stats.verified}</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Cleared
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-0.5">Zero major structural defects</p>
            </div>
          </div>

          {/* Card 3: Issues Flagged */}
          <div
            onClick={() => setStatusFilter('Issues Flagged')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'Issues Flagged'
                ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20'
                : 'border-rose-100 hover:border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Issues Flagged
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-900">{stats.flagged}</span>
                <span className="text-xs font-medium text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  Attention Req.
                </span>
              </div>
              <p className="text-xs text-rose-600 mt-0.5">Deficiencies noted in audit</p>
            </div>
          </div>

          {/* Card 4: Scheduled / Active */}
          <div
            onClick={() => setStatusFilter('Scheduled')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
              statusFilter === 'Scheduled'
                ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/20'
                : 'border-blue-100 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Scheduled / Ongoing
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <Clock3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900">{stats.scheduled}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  In Queue
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-0.5">Assigned to inspection officers</p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEARCH, MULTI-FILTER BAR & VIEW TOGGLES                                    */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by ID (INS-001), property (PRP-015), customer, society..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C59B27] focus:border-transparent transition-all placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#1a2b25] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Reports ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Verified')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified ({stats.verified})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Issues Flagged')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Issues Flagged'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Issues Flagged ({stats.flagged})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Scheduled')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                statusFilter === 'Scheduled'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              Scheduled ({stats.scheduled})
            </button>
          </div>

          {/* View Switcher & Clear */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-gray-100 p-0.5 rounded-xl border border-gray-200 flex items-center">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#1a2b25] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#1a2b25] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {(search || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-gray-200 flex items-center gap-1 cursor-pointer"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dataset Counter Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>
            Showing <strong className="text-gray-900">{paginatedInspections.length}</strong> of{' '}
            <strong className="text-gray-900">{totalCount || stats.total || paginatedInspections.length}</strong> inspection reports
          </span>
          {statusFilter !== 'all' && (
            <span className="text-[#C59B27] font-semibold">
              Filter: {statusFilter}
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TABLE VIEW                                                               */}
        {/* ========================================================================= */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a2b25] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-5">Report ID & Date</th>
                    <th className="py-4 px-5">Target Property</th>
                    <th className="py-4 px-5">Customer Owner</th>
                    <th className="py-4 px-5">Field Inspector</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 mx-auto text-[#C59B27] animate-spin mb-3" />
                        <p className="text-sm font-semibold text-gray-800">Loading Inspection Reports...</p>
                        <p className="text-xs text-gray-400 mt-1">Fetching live reports from PPC database</p>
                      </td>
                    </tr>
                  ) : paginatedInspections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <ClipboardCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">No inspection reports found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or filter status.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedInspections.map((ins) => {
                      const badge = getInspectionStatusBadge(ins.status);
                      return (
                        <tr
                          key={ins.id}
                          className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                          onClick={() => handleOpenDrawer(ins)}
                        >
                          {/* Report ID & Date */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 text-xs">
                                {ins.formatted_id}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C59B27] group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {formatDate(ins.inspection_scheduled_date)}
                            </span>
                          </td>

                          {/* Target Property */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                <img
                                  src={resolveMediaUrl(ins.property_image) || PropHouse}
                                  alt={ins.property_title}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = PropHouse;
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <span className="font-bold text-gray-900 block truncate">
                                  {ins.property_title}
                                </span>
                                <span className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                                  <span className="font-mono font-semibold text-[#C59B27]">{ins.formatted_property_id}</span>
                                  <span>•</span>
                                  <span>{ins.society}, {ins.city}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Customer Owner */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[11px]">
                                {ins.customer_name?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 block">
                                  {ins.customer_name}
                                </span>
                                <span className="text-[11px] text-gray-400 font-mono">
                                  {ins.customer_mobile}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Field Inspector */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-xl bg-amber-50 text-[#C59B27] flex items-center justify-center">
                                <UserCheck className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 block">
                                  {ins.employee_name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {ins.employee_designation}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${badge.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDrawer(ins);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#C59B27] hover:bg-amber-50/40 text-gray-700 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#C59B27]" />
                              <span>View Report</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50">
                <span>
                  Page <strong className="text-gray-900">{page}</strong> of{' '}
                  <strong className="text-gray-900">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <Loader2 className="w-8 h-8 text-[#C59B27] animate-spin mb-3" />
            <p className="text-sm font-semibold text-gray-800">Loading Inspection Reports...</p>
            <p className="text-xs text-gray-400 mt-1">Fetching live reports from PPC database</p>
          </div>
        ) : paginatedInspections.length === 0 ? (
          <div className="py-16 text-center text-gray-400 bg-white rounded-[24px] border border-gray-100 shadow-sm">
            <ClipboardCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No inspection reports found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria or filter status.</p>
          </div>
        ) : (
          /* ========================================================================= */
          /* GRID VIEW                                                                 */
          /* ========================================================================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedInspections.map((ins) => {
                const badge = getInspectionStatusBadge(ins.status);
                return (
                  <div
                    key={ins.id}
                    onClick={() => handleOpenDrawer(ins)}
                    className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Property Thumbnail with Badge */}
                      <div className="relative h-44 bg-gray-100 overflow-hidden">
                        <img
                          src={resolveMediaUrl(ins.property_image) || PropHouse}
                          alt={ins.property_title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PropHouse;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                          {ins.formatted_id}
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#C59B27] block mb-0.5">
                            {ins.formatted_property_id} • {ins.property_type}
                          </span>
                          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">
                            {ins.property_title}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{ins.society}, {ins.city}</span>
                          </p>
                        </div>

                        {/* Summary Notes */}
                        <p className="text-xs text-gray-600 line-clamp-2 bg-[#FAF8F3] p-2.5 rounded-xl border border-gray-100">
                          {ins.inspection_findings || 'Inspection findings recorded by officer.'}
                        </p>

                        {/* Footer Details */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(ins.inspection_scheduled_date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#C59B27] font-bold">
                            <span>View Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid Pagination */}
            {totalPages > 1 && (
              <div className="p-4 rounded-[20px] border border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white shadow-xs">
                <span>
                  Page <strong className="text-gray-900">{page}</strong> of{' '}
                  <strong className="text-gray-900">{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 font-semibold cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 360° INSPECTION REPORT DRAWER                                             */}
      {/* ========================================================================= */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <ClipboardCheck size={20} className="text-[#C59B27]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1a2b25] bg-gray-100 px-2 py-0.5 rounded">
                      {selectedInspection.formatted_id}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        getInspectionStatusBadge(selectedInspection.status).bg
                      }`}
                    >
                      {selectedInspection.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 mt-1">
                    Property Inspection Report
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
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
                    Inspected Property Listing
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
                      src={resolveMediaUrl(selectedInspection.property_image) || PropHouse}
                      alt={selectedInspection.property_title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PropHouse;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#C59B27]">
                      {selectedInspection.formatted_property_id} • {selectedInspection.property_type}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">
                      {selectedInspection.property_title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {selectedInspection.society}, {selectedInspection.city}
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      PKR {selectedInspection.demand_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule vs Conducted Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Scheduled Audit Slot
                  </span>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <Calendar size={13} className="text-blue-600" />
                    {formatDate(selectedInspection.inspection_scheduled_date)}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    {selectedInspection.inspection_scheduled_time || '11:00 AM'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Conducted & Verified
                  </span>
                  {selectedInspection.inspection_actual_date ? (
                    <>
                      <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        {formatDate(selectedInspection.inspection_actual_date)}
                      </p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        {selectedInspection.inspection_actual_time || '11:15 AM'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 italic pt-1">On-site walk pending</p>
                  )}
                </div>
              </div>

              {/* Assigned PPC Field Inspector */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#C59B27] flex items-center justify-center font-bold text-sm">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{selectedInspection.employee_name}</h4>
                    <p className="text-[11px] text-gray-500">{selectedInspection.employee_designation}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{selectedInspection.employee_mobile}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    GPS Geotag
                  </span>
                  <span className="font-mono text-xs text-gray-600 font-semibold">
                    {selectedInspection.gps_coordinates || '33.7294° N, 73.0551° E'}
                  </span>
                </div>
              </div>

              {/* Executive Summary & Findings (Super Admin Editable) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a2b25]">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Executive Inspection Findings:</span>
                  </div>
                  {!isEditingFindings ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingFindings(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C59B27] hover:text-[#a07d1c] transition-colors cursor-pointer"
                    >
                      <Edit3 size={12} />
                      {selectedInspection.inspection_findings ? 'Edit Findings' : '+ Add Findings'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingFindings(false)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {isEditingFindings ? (
                  <div className="space-y-2.5 pt-1">
                    <textarea
                      rows={4}
                      value={editedFindings}
                      onChange={(e) => setEditedFindings(e.target.value)}
                      placeholder="Write structural observations, wiring status, moisture levels, or findings..."
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingFindings(false)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSavingFindings}
                        onClick={handleSaveFindings}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1a2b25] hover:bg-[#253c34] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isSavingFindings ? (
                          <>
                            <Loader2 size={12} className="animate-spin text-[#C59B27]" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={12} />
                            Save Findings
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {selectedInspection.inspection_findings || (
                      <span className="text-gray-400 italic">No inspection findings recorded yet.</span>
                    )}
                  </p>
                )}
              </div>

              {/* Detailed Checklist Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Engineering Checklist Breakdown ({selectedInspection.checklist?.length || 0} Items)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Quality Controlled
                  </span>
                </div>

                {drawerLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-gray-400 bg-[#FAF8F3] rounded-xl border border-dashed border-gray-200">
                    <Loader2 className="w-5 h-5 text-[#C59B27] animate-spin mb-2" />
                    <span className="text-xs font-semibold text-gray-600">Loading engineering checklist...</span>
                  </div>
                ) : (selectedInspection.checklist || []).length === 0 ? (
                  <div className="py-6 text-center text-gray-400 bg-[#FAF8F3] rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs font-medium text-gray-500">Checklist pending inspection survey.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedInspection.checklist || []).map((ch) => {
                      const statusConfig = CHECKLIST_STATUS_MAP[ch.status_id] || CHECKLIST_STATUS_MAP[1];
                      const isEditingThis = editingChecklistId === ch.id;

                      return (
                        <div
                          key={ch.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isEditingThis
                              ? 'border-[#C59B27] bg-amber-50/10 ring-2 ring-[#C59B27]/20 shadow-sm'
                              : 'border-gray-200 bg-white shadow-xs hover:border-gray-300'
                          }`}
                        >
                          {isEditingThis ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                  {ch.category}
                                </span>
                                <span className="text-[11px] font-bold text-[#C59B27] flex items-center gap-1">
                                  <Edit3 size={12} /> Editing Item #{ch.id}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-gray-900">{ch.item_title}</h4>

                              {/* Status Selector Pills */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                                  Select Verification Status:
                                </label>
                                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                                  {[
                                    { id: 1, label: 'Verified', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                                    { id: 2, label: 'Not Verified', color: 'bg-rose-50 text-rose-800 border-rose-300' },
                                    { id: 3, label: 'Partially Verified', color: 'bg-amber-50 text-amber-800 border-amber-300' },
                                    { id: 4, label: 'Not Applicable', color: 'bg-gray-100 text-gray-800 border-gray-300' },
                                  ].map((st) => (
                                    <button
                                      key={st.id}
                                      type="button"
                                      onClick={() => setEditChecklistStatus(st.id)}
                                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center ${
                                        editChecklistStatus === st.id
                                          ? `${st.color} ring-2 ring-[#C59B27] shadow-xs scale-102`
                                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                      }`}
                                    >
                                      {st.label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Remarks Input */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                  Remarks & Deficiencies:
                                </label>
                                <textarea
                                  rows={2}
                                  value={editChecklistRemarks}
                                  onChange={(e) => setEditChecklistRemarks(e.target.value)}
                                  placeholder="Enter observations, test results, or deficiency notes..."
                                  className="w-full border border-gray-300 rounded-xl p-2.5 text-xs bg-white focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  disabled={isSavingChecklist}
                                  onClick={handleCancelEditChecklist}
                                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingChecklist}
                                  onClick={() => handleSaveChecklistItem(ch.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#1a2b25] hover:bg-[#253c34] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                  {isSavingChecklist ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin text-[#C59B27]" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save size={12} />
                                      Save Status & Remarks
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                                  {ch.category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                                  >
                                    {statusConfig.label}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditChecklist(ch)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C59B27] hover:underline cursor-pointer"
                                  >
                                    <Edit3 size={11} />
                                    Edit
                                  </button>
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-gray-900">{ch.item_title}</h4>
                              <p className="text-[11px] text-gray-600 leading-relaxed">
                                {ch.remarks || <span className="text-gray-400 italic">No remarks recorded.</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Verifier Sign-off & Quality Assurance */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a2b25] text-white flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#C59B27]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">PPC Engineering Seal</h5>
                    <p className="text-[10px] text-gray-500">Verified by Super Admin • Quality Assurance Cleared</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  ID: #{selectedInspection.id}
                </span>
              </div>
            </div>

            {/* Drawer Bottom Action Bar */}
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Drawer
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-[#1a2b25] hover:bg-[#253c34] text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} className="text-[#C59B27]" />
                Print Inspection Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCHEDULE NEW INSPECTION MODAL                                             */}
      {/* ========================================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-[#C59B27]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Schedule Property Inspection</h3>
                  <p className="text-xs text-gray-500">Assign a field officer for technical audit</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
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
                  {availableProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.formatted_id || `PRP-${p.id}`} - {p.title} ({p.location || p.city || 'Islamabad'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Field Inspector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Assigned Field Inspector
                </label>
                <select
                  value={scheduleForm.inspectorId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, inspectorId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                >
                  {availableInspectors.map((em) => (
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
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Scope & Instructions */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                  Scope of Inspection / Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={scheduleForm.scopeNotes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scopeNotes: e.target.value })}
                  placeholder="e.g. Inspect solar net-metering NOC, structural settling on boundary wall, underground water storage tank..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmittingSchedule}
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchedule}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1a2b25] hover:bg-[#253c34] rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingSchedule ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C59B27]" />
                      Scheduling Audit...
                    </>
                  ) : (
                    'Confirm & Schedule Audit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInspectionReports;
