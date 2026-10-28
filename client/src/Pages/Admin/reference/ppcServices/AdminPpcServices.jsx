import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import Dropdown from '../../../../Components/common/Dropdown';
import {
  getAdminPpcServices,
  createAdminPpcService,
  updateAdminPpcService,
  deleteAdminPpcService,
  getAdminPpcServiceTypes
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X, Plus, Wrench, AlertTriangle, Layers, Sparkles } from 'lucide-react';

// Realistic initial dummy service types (aligned with PostgreSQL database)
const INITIAL_SERVICE_TYPES = [
  { service_type_id: 1, service_type_english: 'Property Maintenance', service_type_urdu: 'پراپرٹی مینٹیننس', service_type_abb: 'MNT', is_active: true },
  { service_type_id: 2, service_type_english: 'Cleaning & Hygiene', service_type_urdu: 'صفائی اور حفظان صحت', service_type_abb: 'CLN', is_active: true },
  { service_type_id: 3, service_type_english: 'Plumbing & Drainage', service_type_urdu: 'پلمبنگ اور ڈرینیج', service_type_abb: 'PLB', is_active: true },
  { service_type_id: 4, service_type_english: 'Electrical & AC Services', service_type_urdu: 'الیکٹریکل اور اے سی', service_type_abb: 'EAC', is_active: true },
  { service_type_id: 5, service_type_english: 'Finishing & Woodwork', service_type_urdu: 'فنشنگ اور ووڈ ورک', service_type_abb: 'FIN', is_active: true },
  { service_type_id: 6, service_type_english: 'Landscaping', service_type_urdu: 'لینڈ اسکیپنگ', service_type_abb: 'LND', is_active: true }
];

// Realistic initial dummy services (aligned with PostgreSQL database)
const INITIAL_PPC_SERVICES = [
  {
    service_id: 1,
    service_type_id: 1,
    service_english: 'Property Care (Regular Maintenance)',
    service_urdu: 'پراپرٹی کی دیکھ بھال',
    service_abb: 'PCRM',
    is_active: true
  },
  {
    service_id: 2,
    service_type_id: 1,
    service_english: 'General Repair and Maintenance',
    service_urdu: 'عام مرمت اور دیکھ بھال',
    service_abb: 'GRM',
    is_active: true
  },
  {
    service_id: 3,
    service_type_id: 2,
    service_english: 'Cleaning Services',
    service_urdu: 'صفائی کی خدمات',
    service_abb: 'CS',
    is_active: true
  },
  {
    service_id: 4,
    service_type_id: 2,
    service_english: 'Water Tank Cleaning',
    service_urdu: 'پانی کے ٹینک کی صفائی',
    service_abb: 'WTC',
    is_active: true
  },
  {
    service_id: 5,
    service_type_id: 2,
    service_english: 'Pest Control',
    service_urdu: 'کیڑے مار اسپرے',
    service_abb: 'PC',
    is_active: true
  },
  {
    service_id: 6,
    service_type_id: 3,
    service_english: 'Plumbing Services',
    service_urdu: 'پلمبنگ کی خدمات',
    service_abb: 'PS',
    is_active: true
  },
  {
    service_id: 7,
    service_type_id: 3,
    service_english: 'Drain and Gutter Cleaning',
    service_urdu: 'ڈرین اور گٹر کی صفائی',
    service_abb: 'DGC',
    is_active: true
  },
  {
    service_id: 8,
    service_type_id: 4,
    service_english: 'Electrical Services',
    service_urdu: 'الیکٹریکل خدمات',
    service_abb: 'ES',
    is_active: true
  },
  {
    service_id: 9,
    service_type_id: 4,
    service_english: 'AC Repair and Maintenance',
    service_urdu: 'اے سی کی مرمت اور دیکھ بھال',
    service_abb: 'ACR',
    is_active: true
  },
  {
    service_id: 10,
    service_type_id: 5,
    service_english: 'Painting Services',
    service_urdu: 'پینٹنگ کی خدمات',
    service_abb: 'PNT',
    is_active: true
  },
  {
    service_id: 11,
    service_type_id: 5,
    service_english: 'Carpentry Services',
    service_urdu: 'کارپینٹری کی خدمات',
    service_abb: 'CRP',
    is_active: true
  },
  {
    service_id: 12,
    service_type_id: 6,
    service_english: 'Gardening / Lawn Maintenance',
    service_urdu: 'باغبانی اور لان کی دیکھ بھال',
    service_abb: 'GLM',
    is_active: true
  }
];

const AdminPpcServices = () => {
  const { t } = useTranslation(['admin', 'common']);

  // Master local store for dummy/fallback data
  const [localServices, setLocalServices] = useState(INITIAL_PPC_SERVICES);

  // Core Display State
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reference Service Types (for filter dropdown and modal selects)
  const [serviceTypes, setServiceTypes] = useState(INITIAL_SERVICE_TYPES);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [serviceTypeId, setServiceTypeId] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 12, totalPages: 2 });

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');

  // --- Add Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    service_type_id: '',
    service_english: '',
    service_urdu: '',
    service_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    service_type_id: '',
    service_english: '',
    service_urdu: '',
    service_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Service Types for Dropdowns (tries backend, falls back gracefully to INITIAL_SERVICE_TYPES)
  const fetchServiceTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await getAdminPpcServiceTypes({ limit: 100, status: 'all' });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setServiceTypes(res.data);
      } else {
        setServiceTypes(INITIAL_SERVICE_TYPES);
      }
    } catch (err) {
      console.warn('Using initial service types fallback:', err?.message || err);
      setServiceTypes(INITIAL_SERVICE_TYPES);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // Helper map for fast lookup of service type name by id
  const serviceTypeMap = useMemo(() => {
    const map = {};
    serviceTypes.forEach((st) => {
      map[st.service_type_id] = st;
    });
    return map;
  }, [serviceTypes]);

  // Load Services (Tries API first, falls back smoothly to interactive local dummy data)
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(status !== 'all' ? { status } : {}),
        ...(serviceTypeId !== 'all' ? { service_type_id: serviceTypeId } : {})
      };

      try {
        const res = await getAdminPpcServices(params);
        if (res && res.success && Array.isArray(res.data)) {
          setServices(res.data);
          const metaObj = res.meta || {};
          setMeta({
            total: Number(metaObj.total) || res.data.length,
            totalPages: Number(metaObj.totalPages) || Math.max(1, Math.ceil((res.data.length || 1) / limit))
          });
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        // Backend API is not implemented yet; fall back seamlessly to dummy data
        console.info('Backend API not yet connected, rendering dummy dataset smoothly:', apiErr?.message);
      }

      // Filter local dummy dataset in memory
      let filtered = [...localServices];

      // 1. Service Type filter
      if (serviceTypeId !== 'all') {
        filtered = filtered.filter((s) => String(s.service_type_id) === String(serviceTypeId));
      }

      // 2. Status filter
      if (status === 'active') {
        filtered = filtered.filter((s) => s.is_active === true);
      } else if (status === 'inactive') {
        filtered = filtered.filter((s) => s.is_active === false);
      }

      // 3. Search query filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim().toLowerCase();
        filtered = filtered.filter((s) => {
          const typeName = serviceTypeMap[s.service_type_id]?.service_type_english?.toLowerCase() || '';
          return (
            (s.service_english && s.service_english.toLowerCase().includes(q)) ||
            (s.service_urdu && s.service_urdu.includes(q)) ||
            (s.service_abb && s.service_abb.toLowerCase().includes(q)) ||
            typeName.includes(q)
          );
        });
      }

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const validPage = Math.min(page, totalPages);
      const startIndex = (validPage - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      setServices(paginated);
      setMeta({ total, totalPages });
      if (page > totalPages && totalPages > 0) {
        setPage(totalPages);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      setError(null); // Keep error clean to show dummy data gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [debouncedSearch, status, serviceTypeId, page, limit, localServices, serviceTypes]);

  // Options for Service Type filter dropdown
  const serviceTypeFilterOptions = useMemo(() => {
    const list = [
      { value: 'all', label: t('admin:allServiceTypes', 'All Service Types') }
    ];
    serviceTypes.forEach((st) => {
      list.push({
        value: String(st.service_type_id),
        label: st.service_type_english
      });
    });
    return list;
  }, [serviceTypes, t]);

  // Options for Add/Edit Modal Service Type selector
  const serviceTypeModalOptions = useMemo(() => {
    return serviceTypes.map((st) => ({
      value: String(st.service_type_id),
      label: st.service_type_english + (st.service_type_urdu ? ` (${st.service_type_urdu})` : '')
    }));
  }, [serviceTypes]);

  // --- Add Modal Handlers ---
  const handleOpenAddModal = () => {
    setCreateForm({
      service_type_id: serviceTypeId !== 'all' ? String(serviceTypeId) : (serviceTypes[0] ? String(serviceTypes[0].service_type_id) : '1'),
      service_english: '',
      service_urdu: '',
      service_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    if (!createSubmitting) {
      setIsAddModalOpen(false);
      setCreateErrors({});
      setCreateApiError(null);
    }
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!createForm.service_type_id) {
      errs.service_type_id = t('admin:serviceTypeRequired', 'Service type is required.');
    }
    if (!createForm.service_english.trim()) {
      errs.service_english = t('admin:serviceNameRequired', 'Service name in English is required.');
    } else if (createForm.service_english.trim().length < 2) {
      errs.service_english = t('admin:nameTooShort', 'Name must be at least 2 characters.');
    }

    if (createForm.service_abb && createForm.service_abb.length > 10) {
      errs.service_abb = t('admin:abbTooLong', 'Abbreviation cannot exceed 10 characters.');
    }

    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    try {
      setCreateSubmitting(true);
      setCreateApiError(null);

      const payload = {
        service_type_id: Number(createForm.service_type_id),
        service_english: createForm.service_english.trim(),
        service_urdu: createForm.service_urdu.trim() || null,
        service_abb: createForm.service_abb.trim() ? createForm.service_abb.trim().toUpperCase() : null
      };

      try {
        const res = await createAdminPpcService(payload);
        if (res?.success) {
          setSuccessMsg(t('admin:createSuccess', 'PPC Service created successfully.'));
          setIsAddModalOpen(false);
          await fetchServices();
          return;
        }
      } catch (apiErr) {
        console.info('API not connected yet, adding locally to dummy data:', apiErr?.message);
      }

      // Add to local dummy store
      const newId = localServices.length > 0 ? Math.max(...localServices.map((s) => Number(s.service_id))) + 1 : 1;
      const newService = {
        service_id: newId,
        ...payload,
        is_active: true
      };
      setLocalServices([newService, ...localServices]);
      setSuccessMsg(t('admin:createSuccess', 'PPC Service created successfully.'));
      setIsAddModalOpen(false);
    } catch (err) {
      setCreateApiError(err?.message || 'Failed to create service.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (row) => {
    setEditId(row.service_id);
    setEditForm({
      service_type_id: String(row.service_type_id || '1'),
      service_english: row.service_english || '',
      service_urdu: row.service_urdu || '',
      service_abb: row.service_abb || '',
      is_active: row.is_active ?? true
    });
    setEditErrors({});
    setEditApiError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (!editSubmitting) {
      setIsEditModalOpen(false);
      setEditErrors({});
      setEditApiError(null);
    }
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.service_type_id) {
      errs.service_type_id = t('admin:serviceTypeRequired', 'Service type is required.');
    }
    if (!editForm.service_english.trim()) {
      errs.service_english = t('admin:serviceNameRequired', 'Service name in English is required.');
    } else if (editForm.service_english.trim().length < 2) {
      errs.service_english = t('admin:nameTooShort', 'Name must be at least 2 characters.');
    }

    if (editForm.service_abb && editForm.service_abb.length > 10) {
      errs.service_abb = t('admin:abbTooLong', 'Abbreviation cannot exceed 10 characters.');
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    try {
      setEditSubmitting(true);
      setEditApiError(null);

      const payload = {
        service_type_id: Number(editForm.service_type_id),
        service_english: editForm.service_english.trim(),
        service_urdu: editForm.service_urdu.trim() || null,
        service_abb: editForm.service_abb.trim() ? editForm.service_abb.trim().toUpperCase() : null,
        is_active: Boolean(editForm.is_active)
      };

      try {
        const res = await updateAdminPpcService(editId, payload);
        if (res?.success) {
          setSuccessMsg(t('admin:updateSuccess', 'PPC Service updated successfully.'));
          setIsEditModalOpen(false);
          await fetchServices();
          return;
        }
      } catch (apiErr) {
        console.info('API not connected yet, updating locally in dummy data:', apiErr?.message);
      }

      // Update in local dummy store
      setLocalServices(
        localServices.map((s) => (s.service_id === editId ? { ...s, ...payload } : s))
      );
      setSuccessMsg(t('admin:updateSuccess', 'PPC Service updated successfully.'));
      setIsEditModalOpen(false);
    } catch (err) {
      setEditApiError(err?.message || 'Failed to update service.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Handlers ---
  const handleOpenDeleteModal = (row) => {
    setDeleteTarget(row);
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (!deleteSubmitting) {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteError(null);
      setDeleteDependencies([]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      setDeleteDependencies([]);

      try {
        const res = await deleteAdminPpcService(deleteTarget.service_id);
        if (res?.success) {
          setSuccessMsg(t('admin:deleteSuccess', 'PPC Service deleted successfully.'));
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
          await fetchServices();
          return;
        }
      } catch (apiErr) {
        if (apiErr?.response?.status === 409 || apiErr?.status === 409) {
          const msg = apiErr?.message || apiErr?.data?.message || 'Failed to delete service.';
          const deps = apiErr?.data?.dependencies || apiErr?.response?.data?.dependencies || [];
          setDeleteError(msg);
          setDeleteDependencies(deps);
          return;
        }
        console.info('API not connected yet, deleting from local dummy data:', apiErr?.message);
      }

      // Delete locally from dummy store
      setLocalServices(localServices.filter((s) => s.service_id !== deleteTarget.service_id));
      setSuccessMsg(t('admin:deleteSuccess', 'PPC Service deleted successfully.'));
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete service error:', err);
      setDeleteError(err?.message || 'Failed to delete service.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Table Columns Definition
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colServiceType', 'Service Type'),
    t('admin:colServiceNameEn', 'Service Name (English)'),
    t('admin:colServiceNameUr', 'Service Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  // Render Row Callback
  const renderRow = (row, index) => {
    const sr = String((page - 1) * limit + index + 1).padStart(2, '0');
    const matchedType = serviceTypeMap[row.service_type_id];
    const serviceTypeName = row.service_type_english || matchedType?.service_type_english || `Type #${row.service_type_id}`;

    return (
      <tr key={row.service_id} className="hover:bg-gray-50/70 transition-colors group">
        {/* SR */}
        <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-gray-700 w-16">
          {sr}
        </td>

        {/* ID */}
        <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-gray-900">
          #{row.service_id}
        </td>

        {/* Service Type */}
        <td className="px-4 py-3.5 text-sm whitespace-nowrap min-w-[170px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#002a1b]/5 text-[#002a1b] border border-[#002a1b]/15">
            <Layers className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{serviceTypeName}</span>
          </span>
        </td>

        {/* Service Name (English) */}
        <td className="px-4 py-3.5 text-sm font-bold text-gray-900 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C59B27]"></span>
            <span>{row.service_english}</span>
          </div>
        </td>

        {/* Service Name (Urdu) */}
        <td className="px-4 py-3.5 text-sm font-urdu font-medium text-gray-700 min-w-[160px]" dir="auto">
          {row.service_urdu || '-'}
        </td>

        {/* Abbreviation */}
        <td className="px-4 py-3.5 text-sm whitespace-nowrap min-w-[100px]">
          {row.service_abb ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
              {row.service_abb}
            </span>
          ) : (
            <span className="text-gray-400 font-normal">-</span>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3.5 whitespace-nowrap text-sm">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              row.is_active
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${row.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            {row.is_active ? t('admin:active', 'Active') : t('admin:inactive', 'Inactive')}
          </span>
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 whitespace-nowrap text-end text-sm w-24">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors"
              title={t('admin:edit', 'Edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenDeleteModal(row)}
              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm transition-colors"
              title={t('admin:delete', 'Delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Toast Notification */}
      {successMsg && (
        <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Reference Table Page */}
      <ReferenceTablePage
        title={t('admin:adminPpcServicesTitle', 'PPC Services')}
        description={t('admin:adminPpcServicesDesc', 'MANAGE PPC SERVICES REFERENCE DATA.')}
        columns={columns}
        rows={services}
        renderRow={renderRow}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        status={status}
        showStatusFilter={true}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        extraFilters={
          <div className="w-full sm:w-56 shrink-0">
            <Dropdown
              value={serviceTypeId}
              onChange={(val) => {
                setServiceTypeId(val);
                setPage(1);
              }}
              options={serviceTypeFilterOptions}
              placeholder={t('admin:allServiceTypes', 'All Service Types')}
              searchable={true}
              disabled={loadingTypes}
            />
          </div>
        }
        onReset={() => {
          setSearch('');
          setDebouncedSearch('');
          setStatus('all');
          setServiceTypeId('all');
          setPage(1);
        }}
        onRetry={() => {
          fetchServiceTypes();
          fetchServices();
        }}
        onAdd={handleOpenAddModal}
        pagination={{
          page,
          limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: (newPage) => setPage(newPage),
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }
        }}
        emptyMessage={t('admin:noServicesFound', 'No PPC services found.')}
      />

      {/* ======================================================== */}
      {/* Add New Service Modal */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#002a1b] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-[#C59B27]">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t('admin:addPpcServiceTitle', 'Add PPC Service')}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    {t('admin:addPpcServiceDesc', 'Create a new PPC service item linked to a service category.')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseAddModal}
                disabled={createSubmitting}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createApiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createApiError}</span>
                </div>
              )}

              {/* Service Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceType', 'Service Type')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={createForm.service_type_id}
                  onChange={(val) => {
                    setCreateForm({ ...createForm, service_type_id: val });
                    if (createErrors.service_type_id) setCreateErrors({ ...createErrors, service_type_id: null });
                  }}
                  options={serviceTypeModalOptions}
                  placeholder={t('admin:selectServiceType', 'Select Service Type')}
                  searchable={true}
                  disabled={createSubmitting}
                  error={createErrors.service_type_id}
                />
                {createErrors.service_type_id && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{createErrors.service_type_id}</p>
                )}
              </div>

              {/* Service Name English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceNameEn', 'Service Name (English)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.service_english}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, service_english: e.target.value });
                    if (createErrors.service_english) setCreateErrors({ ...createErrors, service_english: null });
                  }}
                  placeholder="e.g. Lawn Mowing & Edging"
                  disabled={createSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    createErrors.service_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                  autoFocus
                />
                {createErrors.service_english && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{createErrors.service_english}</p>
                )}
              </div>

              {/* Service Name Urdu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceNameUr', 'Service Name (Urdu)')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={createForm.service_urdu}
                  onChange={(e) => setCreateForm({ ...createForm, service_urdu: e.target.value })}
                  placeholder="مثلاً: گھاس کی کٹائی"
                  disabled={createSubmitting}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 font-urdu focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-all"
                />
              </div>

              {/* Abbreviation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colAbb', 'Abbreviation')}
                </label>
                <input
                  type="text"
                  value={createForm.service_abb}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, service_abb: e.target.value.toUpperCase() });
                    if (createErrors.service_abb) setCreateErrors({ ...createErrors, service_abb: null });
                  }}
                  placeholder="e.g. LME"
                  maxLength={10}
                  disabled={createSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 uppercase focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    createErrors.service_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                />
                {createErrors.service_abb && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{createErrors.service_abb}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  disabled={createSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('admin:saving', 'Saving...')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{t('admin:create', 'Create Service')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Edit Service Modal */}
      {/* ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#002a1b] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-[#C59B27]">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t('admin:editPpcServiceTitle', 'Edit PPC Service')}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    {t('admin:editPpcServiceDesc', 'Update PPC service details, category, and active status.')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editApiError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editApiError}</span>
                </div>
              )}

              {/* Service Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceType', 'Service Type')} <span className="text-red-500">*</span>
                </label>
                <Dropdown
                  value={editForm.service_type_id}
                  onChange={(val) => {
                    setEditForm({ ...editForm, service_type_id: val });
                    if (editErrors.service_type_id) setEditErrors({ ...editErrors, service_type_id: null });
                  }}
                  options={serviceTypeModalOptions}
                  placeholder={t('admin:selectServiceType', 'Select Service Type')}
                  searchable={true}
                  disabled={editSubmitting}
                  error={editErrors.service_type_id}
                />
                {editErrors.service_type_id && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.service_type_id}</p>
                )}
              </div>

              {/* Service Name English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceNameEn', 'Service Name (English)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.service_english}
                  onChange={(e) => {
                    setEditForm({ ...editForm, service_english: e.target.value });
                    if (editErrors.service_english) setEditErrors({ ...editErrors, service_english: null });
                  }}
                  disabled={editSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    editErrors.service_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                  autoFocus
                />
                {editErrors.service_english && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.service_english}</p>
                )}
              </div>

              {/* Service Name Urdu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colServiceNameUr', 'Service Name (Urdu)')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={editForm.service_urdu}
                  onChange={(e) => setEditForm({ ...editForm, service_urdu: e.target.value })}
                  disabled={editSubmitting}
                  className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 font-urdu focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-all"
                />
              </div>

              {/* Abbreviation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colAbb', 'Abbreviation')}
                </label>
                <input
                  type="text"
                  value={editForm.service_abb}
                  onChange={(e) => {
                    setEditForm({ ...editForm, service_abb: e.target.value.toUpperCase() });
                    if (editErrors.service_abb) setEditErrors({ ...editErrors, service_abb: null });
                  }}
                  maxLength={10}
                  disabled={editSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 uppercase focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    editErrors.service_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                />
                {editErrors.service_abb && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.service_abb}</p>
                )}
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:colStatus', 'Status')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_active: true })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      editForm.is_active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{t('admin:active', 'Active')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_active: false })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      !editForm.is_active
                        ? 'bg-gray-200 text-gray-800 border-gray-400 ring-2 ring-gray-300 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                    <span>{t('admin:inactive', 'Inactive')}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={editSubmitting}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#002a1b] hover:bg-[#003824] rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('admin:updating', 'Updating...')}</span>
                    </>
                  ) : (
                    <span>{t('admin:saveChanges', 'Save Changes')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Delete Confirmation Modal */}
      {/* ======================================================== */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {t('admin:deletePpcServiceTitle', 'Delete PPC Service')}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {t(
                  'admin:deletePpcServiceConfirm',
                  'Are you sure you want to delete this PPC service? This action cannot be undone.'
                )}
              </p>

              {/* Target Details Badge */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 flex items-center justify-between">
                <span>{deleteTarget.service_english}</span>
                <span className="text-xs text-gray-500">#{deleteTarget.service_id}</span>
              </div>

              {deleteError && (
                <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 text-start space-y-2">
                  <div className="flex items-center gap-2 text-rose-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                  {deleteDependencies && deleteDependencies.length > 0 && (
                    <div className="pl-6 text-rose-700">
                      <p className="font-bold uppercase tracking-wider mb-1 text-[11px]">Linked Records in Database:</p>
                      <ul className="list-disc space-y-0.5">
                        {deleteDependencies.map((dep, idx) => (
                          <li key={idx}>
                            <span className="font-bold">{dep.table === 'customer_requests' ? 'Customer Requests' : dep.table}:</span> {dep.count} record(s)
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11px] text-rose-600 font-normal">
                        This service cannot be deleted because it is referenced in active customer requests. You may deactivate it instead.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting || (deleteDependencies && deleteDependencies.length > 0)}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('admin:deleting', 'Deleting...')}</span>
                  </>
                ) : (
                  <span>{t('admin:delete', 'Delete')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPpcServices;
