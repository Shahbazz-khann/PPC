import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building,
  Home,
  Search,
  Filter,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  User,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  Sun,
  Flame,
  Zap,
  Camera,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  Layers,
  ArrowUpRight,
  Tv,
  RefreshCw,
  ChevronLeft,
  Droplets
} from 'lucide-react';
import { INITIAL_PROPERTIES, formatPrice } from './mockAdminProperties';
import PropHouse from '../../../assets/prop_house.png';
import { resolveMediaUrl } from '../../../Services/Api';
import Dropdown from '../../../Components/common/Dropdown';
import {
  getAdminProperties,
  getAdminPropertyStats,
  getAdminPropertyById,
  updateAdminPropertyApproval
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

const AdminProperties = () => {
  const { t } = useTranslation(['admin', 'common']);

  // --- Main State ---
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Stats State ---
  const [stats, setStats] = useState({
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
  const [statsLoading, setStatsLoading] = useState(true);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demandFilter, setDemandFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Selected Property for 360 Inspection Drawer
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Quick Action Modal (Approve / Reject)
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    property: null,
    targetStage: 'Approved',
    remarks: ''
  });
  const [isSavingDecision, setIsSavingDecision] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, approvalFilter, statusFilter, demandFilter, typeFilter]);

  // Fetch Global Stats from API
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getAdminPropertyStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Stats API error, using calculated stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch Property Inventory from API
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        approval_stage: approvalFilter,
        status: statusFilter,
        demand_type: demandFilter,
        property_type: typeFilter,
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }

      const res = await getAdminProperties(params);
      if (res?.success && res?.data) {
        // Normalize properties to ensure pictures array exists
        const mapped = res.data.map(p => ({
          ...p,
          pictures: p.pictures || (p.cover_image ? [{ id: 1, url: p.cover_image, title: 'Front' }] : []),
          amenities: p.amenities || []
        }));
        setProperties(mapped);

        const pMeta = res.pagination || {};
        setTotal(Number(pMeta.total) || mapped.length);
        setTotalPages(Number(pMeta.totalPages) || 1);
      } else {
        // Fallback to local filtering of initial mock data
        setProperties(INITIAL_PROPERTIES);
      }
    } catch (err) {
      console.warn('Property fetch error, using local dataset fallback:', err);
      // Resilient fallback
      setProperties(INITIAL_PROPERTIES);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, approvalFilter, statusFilter, demandFilter, typeFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Handle opening 360 inspection drawer with full details fetch
  const handleOpen360Drawer = async (prop) => {
    setSelectedProperty(prop);
    setActiveImageIndex(0);
    setDrawerLoading(true);

    try {
      const res = await getAdminPropertyById(prop.property_id);
      if (res?.success && res?.data) {
        setSelectedProperty(prev => ({
          ...prev,
          ...res.data,
          pictures: (res.data.pictures && res.data.pictures.length > 0)
            ? res.data.pictures
            : (prev?.pictures || [])
        }));
      }
    } catch (err) {
      console.warn('Detailed property fetch warning:', err);
    } finally {
      setDrawerLoading(false);
    }
  };

  const filteredProperties = properties;

  const hasActiveFilters =
    search !== '' ||
    approvalFilter !== 'all' ||
    statusFilter !== 'all' ||
    demandFilter !== 'all' ||
    typeFilter !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setApprovalFilter('all');
    setStatusFilter('all');
    setDemandFilter('all');
    setTypeFilter('all');
  };

  // Handle Quick Decision Submission
  const handleSaveDecision = async () => {
    if (!decisionModal.property) return;

    setIsSavingDecision(true);
    try {
      const propertyId = decisionModal.property.property_id;
      const targetStage = decisionModal.targetStage;
      const remarks = decisionModal.remarks?.trim() || `Marked as ${targetStage} by Administrator.`;

      const res = await updateAdminPropertyApproval(propertyId, {
        approval_stage: targetStage,
        remarks: remarks,
      });

      if (res?.success) {
        const newStatus = targetStage === 'Approved' ? 'Active' : 'Inactive';

        // Update list in local state
        setProperties((prev) =>
          prev.map((item) => {
            if (String(item.property_id) === String(propertyId)) {
              return {
                ...item,
                approval_stage: targetStage,
                status: newStatus,
                approval_remarks: remarks,
                update_date_time: new Date().toISOString()
              };
            }
            return item;
          })
        );

        // Also update selectedProperty drawer if open
        if (selectedProperty && String(selectedProperty.property_id) === String(propertyId)) {
          setSelectedProperty((prev) => ({
            ...prev,
            approval_stage: targetStage,
            status: newStatus,
            approval_remarks: remarks,
            update_date_time: new Date().toISOString()
          }));
        }

        showToast(`Property ${decisionModal.property.formatted_id} updated to "${targetStage}".`);
        setDecisionModal({ isOpen: false, property: null, targetStage: 'Approved', remarks: '' });

        // Refresh stats cards
        fetchStats();
      } else {
        showToast(res?.message || 'Failed to update approval stage.');
      }
    } catch (err) {
      console.error('Error saving approval decision:', err);
      showToast(err?.message || 'Error occurred while saving approval decision.');
    } finally {
      setIsSavingDecision(false);
    }
  };

  // Toggle Status directly
  const handleToggleStatus = (property) => {
    const nextStatus = property.status === 'Active' ? 'Inactive' : 'Active';
    setProperties((prev) =>
      prev.map((item) =>
        item.property_id === property.property_id
          ? { ...item, status: nextStatus, update_date_time: new Date().toISOString() }
          : item
      )
    );
    showToast(`Property ${property.formatted_id} status changed to ${nextStatus}.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans text-gray-800 pb-16">
      {/* Toast Alert */}
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
                <span className="text-gray-500">Inventory & Listings</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a2b25] tracking-tight">
                Property Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review, verify, approve, and manage customer property listings and operational inventory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchStats();
                  fetchProperties();
                  showToast('Inventory reloaded from live database.');
                }}
                disabled={loading || statsLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin text-[#C59B27]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link
                to="/admin/properties/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a2b25] text-white text-sm font-medium hover:bg-[#253c34] transition-all shadow-sm shadow-[#1a2b25]/20 hover:shadow-md"
              >
                <Plus className="w-4 h-4 text-[#C59B27]" />
                Register Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* KPI Metric Strip (5 Interactive Intelligence Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Portfolio</span>
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 border border-gray-100">
                <Building className="w-5 h-5 text-[#1a2b25]" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-[#1a2b25]">{stats.total}</span>
              <p className="text-xs text-gray-500 mt-0.5">Registered listings</p>
            </div>
          </div>

          {/* Card 2: Pending Approval */}
          <div
            onClick={() => setApprovalFilter('Pending')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${approvalFilter.toLowerCase() === 'pending'
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
              <p className="text-xs text-amber-700/80 mt-0.5">Awaiting admin review</p>
            </div>
          </div>

          {/* Card 3: Active Market */}
          <div
            onClick={() => setStatusFilter('Active')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${statusFilter.toLowerCase() === 'active'
              ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/20'
              : 'border-emerald-100'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Listings</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-emerald-900">{stats.active}</span>
              <p className="text-xs text-emerald-600 mt-0.5">Live on public portal</p>
            </div>
          </div>

          {/* Card 4: Demand Breakdown */}
          <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Demand Split</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">{stats.forSale}</span>
                <span className="text-[11px] block text-gray-500 font-medium">For Sale</span>
              </div>
              <div className="h-7 w-[1px] bg-gray-200" />
              <div>
                <span className="text-xl font-bold text-gray-900">{stats.forRent}</span>
                <span className="text-[11px] block text-gray-500 font-medium">For Rent</span>
              </div>
            </div>
          </div>

          {/* Card 5: Rejected / Under Review */}
          <div
            onClick={() => setApprovalFilter('Under Review')}
            className={`bg-white rounded-[24px] p-5 shadow-sm border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md col-span-2 md:col-span-1 ${approvalFilter.toLowerCase() === 'under review'
              ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/20'
              : 'border-gray-100'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Under Review</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900">{stats.underReview}</span>
                {stats.rejected > 0 && (
                  <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    {stats.rejected} Rejected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Verification in progress</p>
            </div>
          </div>
        </div>

        {/* Unified Search & Multi-Filter Control Hub */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] text-sm transition-all"
                placeholder="Search by ID (PRP-018), Owner, Society, City..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Strip */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Approval Filter */}
              <div className="min-w-[145px] flex-1 sm:flex-none">
                <Dropdown
                  size="sm"
                  value={approvalFilter}
                  onChange={(val) => setApprovalFilter(val)}
                  options={[
                    { value: 'all', label: 'Approval: All' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Under Review', label: 'Under Review' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Rejected', label: 'Rejected' }
                  ]}
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[135px] flex-1 sm:flex-none">
                <Dropdown
                  size="sm"
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: 'all', label: 'Status: All' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                />
              </div>

              {/* Demand Filter (Sale/Rent) */}
              <div className="min-w-[135px] flex-1 sm:flex-none">
                <Dropdown
                  size="sm"
                  value={demandFilter}
                  onChange={(val) => setDemandFilter(val)}
                  options={[
                    { value: 'all', label: 'Purpose: All' },
                    { value: 'Sale', label: 'For Sale' },
                    { value: 'Rent', label: 'For Rent' }
                  ]}
                />
              </div>

              {/* Property Type Filter */}
              <div className="min-w-[135px] flex-1 sm:flex-none">
                <Dropdown
                  size="sm"
                  value={typeFilter}
                  onChange={(val) => setTypeFilter(val)}
                  options={[
                    { value: 'all', label: 'Type: All' },
                    { value: 'House', label: 'House' },
                    { value: 'Villa', label: 'Villa' },
                    { value: 'Apartment', label: 'Apartment' }
                  ]}
                />
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-[#1a2b25]' : 'text-gray-400 hover:text-gray-700'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  title="Showcase Grid View"
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#1a2b25]' : 'text-gray-400 hover:text-gray-700'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Counter pill */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <span>
              Showing <strong className="text-gray-800">{filteredProperties.length}</strong> of{' '}
              <strong className="text-gray-800">{properties.length}</strong> properties
            </span>
            {hasActiveFilters && (
              <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md">
                Filtered view active
              </span>
            )}
          </div>
        </div>

        {/* Content Area: Table View vs Grid View */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[340px]">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#C59B27] flex items-center justify-center mb-4">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No matching properties found</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1 mb-5">
              No inventory entries match your search criteria or filter combinations. Try adjusting or clearing your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#1a2b25] text-white text-xs font-semibold rounded-xl hover:bg-[#253c34] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* ==================== TABLE VIEW ==================== */
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                <thead className="bg-[#002a1b] text-[11px] font-bold text-white uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-3">Property</th>
                    <th scope="col" className="px-3 py-4">Location</th>
                    <th scope="col" className="px-3 py-4">Owner Profile</th>
                    <th scope="col" className="px-3 py-4">Specs & Size</th>
                    <th scope="col" className="px-3 py-4">Demand / Price</th>
                    <th scope="col" className="px-3 py-4">Approval Stage</th>
                    <th scope="col" className="px-3 py-4">Status</th>
                    <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredProperties.map((prop) => {
                    const isPending = prop.approval_stage === 'Pending';
                    const isApproved = prop.approval_stage === 'Approved';
                    const isUnderReview = prop.approval_stage === 'Under Review';
                    const isRejected = prop.approval_stage === 'Rejected';
                    const isActive = prop.status === 'Active';

                    return (
                      <tr
                        key={prop.property_id}
                        className="hover:bg-amber-50/20 transition-colors group cursor-pointer"
                        onClick={() => handleOpen360Drawer(prop)}
                      >
                        {/* Property Image & ID */}
                        <td className="py-4 pl-6 pr-3">
                          <div className="flex items-center gap-3.5">
                            <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                              <img
                                src={
                                  prop.cover_image
                                    ? resolveMediaUrl(prop.cover_image)
                                    : (prop.pictures?.[0]?.url ? resolveMediaUrl(prop.pictures[0].url) : PropHouse)
                                }
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PropHouse;
                                }}
                                alt={prop.formatted_id}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-medium px-1 rounded flex items-center gap-0.5">
                                <Camera className="w-2.5 h-2.5" />
                                {prop.total_photos || prop.pictures?.length || 0}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#1a2b25]">{prop.formatted_id}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                  {prop.property_type}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 block truncate max-w-[180px]">
                                {prop.property_use} • {prop.property_location}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-3 py-4">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-4 h-4 text-[#C59B27] flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-gray-800 text-xs block">
                                {prop.society}, {prop.city}
                              </span>
                              <span className="text-xs text-gray-400 block">{prop.area}</span>
                            </div>
                          </div>
                        </td>

                        {/* Owner Profile */}
                        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/admin/customers/${prop.customer_id}`}
                            className="group/owner flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#1a2b25] text-[#C59B27] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {(prop.customer_name || 'Customer').charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 text-xs block group-hover/owner:text-[#C59B27] transition-colors">
                                {prop.customer_name || 'Customer'}
                              </span>
                              <span className="text-[11px] text-gray-400 block">{prop.customer_mobile || '-'}</span>
                            </div>
                          </Link>
                        </td>

                        {/* Specs & Size */}
                        <td className="px-3 py-4">
                          <div className="text-xs">
                            <span className="font-bold text-gray-900">
                              {prop.property_size} {prop.size_uom}
                            </span>
                            <div className="flex items-center gap-2 text-gray-500 mt-0.5 text-[11px]">
                              <span>{prop.rooms} Beds</span>
                              <span>•</span>
                              <span>{prop.bathrooms} Baths</span>
                              {prop.solar_installed && (
                                <>
                                  <span>•</span>
                                  <Sun className="w-3 h-3 text-amber-500" title="Solar Installed" />
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Demand / Price */}
                        <td className="px-3 py-4">
                          <div>
                            <span className="font-extrabold text-[#1a2b25] text-xs sm:text-sm block">
                              {formatPrice(prop.demand_amount, prop.demand_type)}
                            </span>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5 ${prop.demand_type === 'Sale'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-blue-50 text-blue-700'
                                }`}
                            >
                              {prop.demand_type}
                            </span>
                          </div>
                        </td>

                        {/* Approval Stage Badge */}
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${isApproved
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isPending
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : isUnderReview
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isApproved
                                ? 'bg-emerald-500'
                                : isPending
                                  ? 'bg-amber-500 animate-ping'
                                  : isUnderReview
                                    ? 'bg-blue-500'
                                    : 'bg-rose-500'
                                }`}
                            />
                            {prop.approval_stage}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prop)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${isActive
                              ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                            {prop.status}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 pl-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Review / Decision Button */}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDecisionModal({
                                    isOpen: true,
                                    property: prop,
                                    targetStage: 'Approved',
                                    remarks: ''
                                  })
                                }
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                                title="Review & Approve"
                              >
                                Review
                              </button>
                            )}

                            {/* View 360 Inspection Drawer */}
                            <button
                              type="button"
                              onClick={() => handleOpen360Drawer(prop)}
                              className="p-1.5 text-gray-500 hover:text-[#1a2b25] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Inspect 360 Details"
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
          </div>
        ) : (
          /* ==================== SHOWCASE GRID VIEW ==================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => {
              const isPending = prop.approval_stage === 'Pending';
              const isApproved = prop.approval_stage === 'Approved';
              const isUnderReview = prop.approval_stage === 'Under Review';

              return (
                <div
                  key={prop.property_id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col group cursor-pointer"
                  onClick={() => handleOpen360Drawer(prop)}
                >
                  {/* Hero Cover Image & Badges */}
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        prop.cover_image
                          ? resolveMediaUrl(prop.cover_image)
                          : (prop.pictures?.[0]?.url ? resolveMediaUrl(prop.pictures[0].url) : PropHouse)
                      }
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = PropHouse;
                      }}
                      alt={prop.formatted_id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-[#1a2b25]/90 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-white/10">
                        {prop.formatted_id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-md ${prop.demand_type === 'Sale'
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-blue-600/90 text-white'
                          }`}
                      >
                        {prop.demand_type}
                      </span>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-xl font-black drop-shadow-md">
                          {formatPrice(prop.demand_amount, prop.demand_type)}
                        </span>
                        <span className="block text-xs text-gray-200 drop-shadow">
                          {prop.property_size} {prop.size_uom} • {prop.property_type}
                        </span>
                      </div>
                      <span className="bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {prop.pictures?.length || prop.total_photos || 0} Photos
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C59B27] flex-shrink-0" />
                        <span className="font-semibold text-gray-700 truncate">
                          {prop.society}, {prop.city}
                        </span>
                      </div>

                      {/* Title & Description preview */}
                      <h3 className="font-bold text-[#1a2b25] text-base line-clamp-1 group-hover:text-[#C59B27] transition-colors">
                        {prop.property_type} in {prop.area}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {prop.property_description}
                      </p>

                      {/* Specs Pill Strip */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-gray-400" />
                          <span>{prop.rooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-gray-400" />
                          <span>{prop.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{prop.covered_area_sqft} sqft</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Owner and Approval Stage */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1a2b25] text-[#C59B27] flex items-center justify-center font-bold text-xs">
                          {(prop.customer_name || 'Customer').charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-gray-800 truncate max-w-[110px]">
                          {prop.customer_name || 'Customer'}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isApproved
                          ? 'bg-emerald-50 text-emerald-800'
                          : isPending
                            ? 'bg-amber-50 text-amber-800'
                            : isUnderReview
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                      >
                        {prop.approval_stage}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Strip */}
        {totalPages > 1 && (
          <div className="bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500 font-medium">
              Page <strong className="text-gray-800">{page}</strong> of{' '}
              <strong className="text-gray-800">{totalPages}</strong> (Total {total} properties)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${page === num
                      ? 'bg-[#1a2b25] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 360° PROPERTY INSPECTION SLIDE-OVER DRAWER                                 */}
      {/* ========================================================================= */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#C59B27] border border-amber-200">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1a2b25]">{selectedProperty.formatted_id}</h2>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${selectedProperty.approval_stage === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedProperty.approval_stage === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}
                    >
                      {selectedProperty.approval_stage}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedProperty.property_type} • {selectedProperty.demand_type} Listing
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Photo Showcase Carousel */}
              <div className="space-y-3">
                <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                  <img
                    src={
                      selectedProperty.pictures?.[activeImageIndex]?.url
                        ? resolveMediaUrl(selectedProperty.pictures[activeImageIndex].url)
                        : (selectedProperty.cover_image ? resolveMediaUrl(selectedProperty.cover_image) : PropHouse)
                    }
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = PropHouse;
                    }}
                    alt="Property detail"
                    className="w-full h-full object-cover transition-all"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg">
                    {selectedProperty.pictures?.[activeImageIndex]?.title || 'Main View'}
                  </div>
                </div>

                {/* Thumbnails Strip */}
                {selectedProperty.pictures && selectedProperty.pictures.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedProperty.pictures.map((pic, idx) => (
                      <button
                        key={pic.id || idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-[#C59B27] ring-2 ring-amber-400/30' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={pic.url ? resolveMediaUrl(pic.url) : PropHouse}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PropHouse;
                          }}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Demand & Valuation Banner */}
              <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                    Asking Demand ({selectedProperty.demand_type})
                  </span>
                  <div className="text-2xl font-black text-[#1a2b25] mt-0.5">
                    {formatPrice(selectedProperty.demand_amount, selectedProperty.demand_type)}
                  </div>
                  {selectedProperty.discount_amount && Number(selectedProperty.discount_amount) > 0 ? (
                    <span className="text-xs text-emerald-700 font-medium">
                      Discount: PKR {Number(selectedProperty.discount_amount).toLocaleString('en-PK')} (Final:{' '}
                      PKR {Number(selectedProperty.final_amount || selectedProperty.demand_amount).toLocaleString('en-PK')})
                    </span>
                  ) : null}
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase font-bold text-gray-400 tracking-wider block">Size Unit</span>
                  <span className="text-lg font-bold text-gray-800">
                    {selectedProperty.property_size} {selectedProperty.size_uom}
                  </span>
                  <span className="text-xs text-gray-500 block">({selectedProperty.marla_size})</span>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Architectural & Dimension Specs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Bedrooms</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.rooms}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Bathrooms</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.bathrooms}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Floors</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.floors}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Covered Area</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.covered_area_sqft} sqft</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Front Road</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.road_front_ft} ft</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Plot Dimensions</span>
                    <span className="text-base font-bold text-gray-800">
                      {selectedProperty.property_size_front}x{selectedProperty.property_size_left}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Electric Meters</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.electric_meters}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 font-medium block">Gas Meters</span>
                    <span className="text-base font-bold text-gray-800">{selectedProperty.gas_meters}</span>
                  </div>
                </div>
              </div>

              {/* Special Features & Utilities */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Utility Features & Infrastructure
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.swimming_pool && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                      <Droplets className="w-3.5 h-3.5" />
                      Swimming Pool
                    </span>
                  )}
                  {selectedProperty.media_room && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                      <Tv className="w-3.5 h-3.5" />
                      Media / Cinema Room
                    </span>
                  )}
                  {selectedProperty.solar_installed && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                      <Sun className="w-3.5 h-3.5" />
                      Solar Power ({selectedProperty.solar_capacity} kW)
                    </span>
                  )}
                  {(selectedProperty.amenities || []).map((am, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {typeof am === 'string' ? am : (am?.name || am?.amenity_description || 'Amenity')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                  {selectedProperty.property_description || 'No description provided.'}
                </p>
              </div>

              {/* Owner / Customer Profile Card */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Customer & Ownership Dossier
                </h4>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#1a2b25] text-[#C59B27] flex items-center justify-center font-bold text-sm">
                      {(selectedProperty.customer_name || 'Customer').charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-sm block">
                        {selectedProperty.customer_name || 'Customer'}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#C59B27]" />
                          {selectedProperty.customer_mobile || '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#C59B27]" />
                          {selectedProperty.customer_email || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={selectedProperty.customer_id ? `/admin/customers/${selectedProperty.customer_id}` : '#'}
                    className="p-2 text-gray-400 hover:text-[#C59B27] hover:bg-gray-50 rounded-xl transition-colors"
                    title="View Customer Profile"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Approval Audit Remarks */}
              {selectedProperty.approval_remarks && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Inspection & Audit Log
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {selectedProperty.approval_remarks}
                  </p>
                  <span className="text-[10px] text-amber-700/70 block mt-2">
                    Last Updated: {formatDate(selectedProperty.update_date_time)}
                  </span>
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions Sticky Bar */}
            <div className="p-5 border-t border-gray-100 bg-white sticky bottom-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setDecisionModal({
                    isOpen: true,
                    property: selectedProperty,
                    targetStage: 'Rejected',
                    remarks: ''
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
              >
                Reject Listing
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDecisionModal({
                      isOpen: true,
                      property: selectedProperty,
                      targetStage: 'Under Review',
                      remarks: ''
                    })
                  }
                  className="px-4 py-2.5 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-colors"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDecisionModal({
                      isOpen: true,
                      property: selectedProperty,
                      targetStage: 'Approved',
                      remarks: ''
                    })
                  }
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK DECISION MODAL (APPROVE / REJECT / UNDER REVIEW)                     */}
      {/* ========================================================================= */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${decisionModal.targetStage === 'Approved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : decisionModal.targetStage === 'Rejected'
                      ? 'bg-rose-50 text-rose-600'
                      : decisionModal.targetStage === 'Under Review'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Approval Decision</h3>
                  <span className="text-xs text-gray-500">{decisionModal.property?.formatted_id}</span>
                </div>
              </div>
              <button
                type="button"
                disabled={isSavingDecision}
                onClick={() => setDecisionModal({ isOpen: false, property: null, targetStage: 'Approved', remarks: '' })}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Select Decision Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Pending', 'Under Review', 'Approved', 'Rejected'].map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      disabled={isSavingDecision}
                      onClick={() => setDecisionModal((prev) => ({ ...prev, targetStage: stage }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${decisionModal.targetStage === stage
                        ? stage === 'Approved'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : stage === 'Rejected'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : stage === 'Under Review'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Inspector & Verification Remarks
                </label>
                <textarea
                  rows={3}
                  disabled={isSavingDecision}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#C59B27] focus:outline-none disabled:bg-gray-50"
                  placeholder="Enter reason, findings, or notes for the customer..."
                  value={decisionModal.remarks}
                  onChange={(e) => setDecisionModal((prev) => ({ ...prev, remarks: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSavingDecision}
                onClick={() => setDecisionModal({ isOpen: false, property: null, targetStage: 'Approved', remarks: '' })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingDecision}
                onClick={handleSaveDecision}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1a2b25] hover:bg-[#253c34] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                {isSavingDecision && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isSavingDecision ? 'Saving...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
