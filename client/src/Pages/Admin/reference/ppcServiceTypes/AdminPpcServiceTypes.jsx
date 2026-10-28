import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import {
  getAdminPpcServiceTypes,
  createAdminPpcServiceType,
  updateAdminPpcServiceType,
  deleteAdminPpcServiceType
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X, Plus, Wrench, AlertTriangle, Layers, Sparkles } from 'lucide-react';

const AdminPpcServiceTypes = () => {
  const { t } = useTranslation(['admin', 'common']);

  // Core List State
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');

  // --- Add Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    service_type_english: '',
    service_type_urdu: '',
    service_type_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    service_type_english: '',
    service_type_urdu: '',
    service_type_abb: '',
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

  // Fetch Service Types from Backend API
  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(status !== 'all' ? { status } : {})
      };

      const res = await getAdminPpcServiceTypes(params);
      if (res && res.success && Array.isArray(res.data)) {
        setServiceTypes(res.data);
        const metaObj = res.meta || {};
        setMeta({
          total: Number(metaObj.total) || res.data.length,
          totalPages: Number(metaObj.totalPages) || Math.max(1, Math.ceil((res.data.length || 1) / limit))
        });
      } else {
        setServiceTypes([]);
      }
    } catch (err) {
      console.error('Failed to fetch service types:', err);
      setError(err?.message || t('admin:errorLoadingData', 'Unable to load service types.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, [debouncedSearch, status, page, limit]);

  // --- Add Modal Handlers ---
  const handleOpenAddModal = () => {
    setCreateForm({
      service_type_english: '',
      service_type_urdu: '',
      service_type_abb: ''
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
    if (!createForm.service_type_english.trim()) {
      errs.service_type_english = t('admin:nameRequired', 'Service type name in English is required.');
    } else if (createForm.service_type_english.trim().length < 2) {
      errs.service_type_english = t('admin:nameTooShort', 'Name must be at least 2 characters.');
    }

    if (createForm.service_type_abb && createForm.service_type_abb.length > 10) {
      errs.service_type_abb = t('admin:abbTooLong', 'Abbreviation cannot exceed 10 characters.');
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
        service_type_english: createForm.service_type_english.trim(),
        service_type_urdu: createForm.service_type_urdu.trim() || null,
        service_type_abb: createForm.service_type_abb.trim() ? createForm.service_type_abb.trim().toUpperCase() : null
      };

      const res = await createAdminPpcServiceType(payload);
      if (res?.success) {
        setSuccessMsg(t('admin:createSuccess', 'PPC Service Type created successfully.'));
        setIsAddModalOpen(false);
        await fetchServiceTypes();
      } else {
        setCreateApiError(res?.message || 'Failed to create service type.');
      }
    } catch (err) {
      setCreateApiError(err?.message || err?.response?.data?.message || 'Failed to create service type.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (row) => {
    setEditId(row.service_type_id);
    setEditForm({
      service_type_english: row.service_type_english || '',
      service_type_urdu: row.service_type_urdu || '',
      service_type_abb: row.service_type_abb || '',
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
    if (!editForm.service_type_english.trim()) {
      errs.service_type_english = t('admin:nameRequired', 'Service type name in English is required.');
    } else if (editForm.service_type_english.trim().length < 2) {
      errs.service_type_english = t('admin:nameTooShort', 'Name must be at least 2 characters.');
    }

    if (editForm.service_type_abb && editForm.service_type_abb.length > 10) {
      errs.service_type_abb = t('admin:abbTooLong', 'Abbreviation cannot exceed 10 characters.');
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
        service_type_english: editForm.service_type_english.trim(),
        service_type_urdu: editForm.service_type_urdu.trim() || null,
        service_type_abb: editForm.service_type_abb.trim() ? editForm.service_type_abb.trim().toUpperCase() : null,
        is_active: Boolean(editForm.is_active)
      };

      const res = await updateAdminPpcServiceType(editId, payload);
      if (res?.success) {
        setSuccessMsg(t('admin:updateSuccess', 'PPC Service Type updated successfully.'));
        setIsEditModalOpen(false);
        await fetchServiceTypes();
      } else {
        setEditApiError(res?.message || 'Failed to update service type.');
      }
    } catch (err) {
      setEditApiError(err?.message || err?.response?.data?.message || 'Failed to update service type.');
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

      const res = await deleteAdminPpcServiceType(deleteTarget.service_type_id);
      if (res?.success) {
        setSuccessMsg(t('admin:deleteSuccess', 'PPC Service Type deleted successfully.'));
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        await fetchServiceTypes();
      } else {
        setDeleteError(res?.message || 'Failed to delete service type.');
      }
    } catch (err) {
      console.error('Delete service type error:', err);
      const msg = err?.message || err?.data?.message || err?.response?.data?.message || 'Failed to delete service type.';
      const deps = err?.data?.dependencies || err?.response?.data?.dependencies || [];
      setDeleteError(msg);
      setDeleteDependencies(deps);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Table Columns Definition
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colServiceTypeNameEn', 'Service Type Name (English)'),
    t('admin:colServiceTypeNameUr', 'Service Type Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  // Render Row Callback
  const renderRow = (row, index) => {
    const sr = String((page - 1) * limit + index + 1).padStart(2, '0');

    return (
      <tr key={row.service_type_id} className="hover:bg-gray-50/70 transition-colors group">
        {/* SR */}
        <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-gray-700 w-16">
          {sr}
        </td>

        {/* ID */}
        <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-gray-900">
          #{row.service_type_id}
        </td>

        {/* Service Type (English) */}
        <td className="px-4 py-3.5 text-sm font-bold text-gray-900 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C59B27]/60"></span>
            <span>{row.service_type_english}</span>
          </div>
        </td>

        {/* Service Type (Urdu) */}
        <td className="px-4 py-3.5 text-sm font-urdu font-medium text-gray-700 min-w-[160px]" dir="auto">
          {row.service_type_urdu || '-'}
        </td>

        {/* Abbreviation */}
        <td className="px-4 py-3.5 text-sm whitespace-nowrap min-w-[100px]">
          {row.service_type_abb ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
              {row.service_type_abb}
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
        title={t('admin:adminPpcServiceTypesTitle', 'PPC Service Types')}
        description={t('admin:adminPpcServiceTypesDesc', 'MANAGE PPC SERVICE TYPES REFERENCE DATA.')}
        columns={columns}
        rows={serviceTypes}
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
        onReset={() => {
          setSearch('');
          setDebouncedSearch('');
          setStatus('all');
          setPage(1);
        }}
        onRetry={fetchServiceTypes}
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
        emptyMessage={t('admin:noServiceTypesFound', 'No PPC service types found.')}
      />

      {/* ======================================================== */}
      {/* Add New Service Type Modal */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-[#002a1b] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-[#C59B27]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t('admin:addPpcServiceTypeTitle', 'Add PPC Service Type')}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    {t('admin:addPpcServiceTypeDesc', 'Create a new PPC service category in reference data.')}
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

              {/* Service Type English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:serviceTypeEnglish', 'Service Type Name (English)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.service_type_english}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, service_type_english: e.target.value });
                    if (createErrors.service_type_english) setCreateErrors({ ...createErrors, service_type_english: null });
                  }}
                  placeholder="e.g. Security & Surveillance"
                  disabled={createSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    createErrors.service_type_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                  autoFocus
                />
                {createErrors.service_type_english && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{createErrors.service_type_english}</p>
                )}
              </div>

              {/* Service Type Urdu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:serviceTypeUrdu', 'Service Type Name (Urdu)')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={createForm.service_type_urdu}
                  onChange={(e) => setCreateForm({ ...createForm, service_type_urdu: e.target.value })}
                  placeholder="مثلاً: سیکیورٹی اور نگرانی"
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
                  value={createForm.service_type_abb}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, service_type_abb: e.target.value.toUpperCase() });
                    if (createErrors.service_type_abb) setCreateErrors({ ...createErrors, service_type_abb: null });
                  }}
                  placeholder="e.g. SEC"
                  maxLength={10}
                  disabled={createSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 uppercase focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    createErrors.service_type_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                />
                {createErrors.service_type_abb && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{createErrors.service_type_abb}</p>
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
                      <span>{t('admin:create', 'Create Service Type')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Edit Service Type Modal */}
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
                    {t('admin:editPpcServiceTypeTitle', 'Edit PPC Service Type')}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    {t('admin:editPpcServiceTypeDesc', 'Update service type details and active status.')}
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

              {/* Service Type English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:serviceTypeEnglish', 'Service Type Name (English)')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.service_type_english}
                  onChange={(e) => {
                    setEditForm({ ...editForm, service_type_english: e.target.value });
                    if (editErrors.service_type_english) setEditErrors({ ...editErrors, service_type_english: null });
                  }}
                  disabled={editSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    editErrors.service_type_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                  autoFocus
                />
                {editErrors.service_type_english && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.service_type_english}</p>
                )}
              </div>

              {/* Service Type Urdu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  {t('admin:serviceTypeUrdu', 'Service Type Name (Urdu)')}
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={editForm.service_type_urdu}
                  onChange={(e) => setEditForm({ ...editForm, service_type_urdu: e.target.value })}
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
                  value={editForm.service_type_abb}
                  onChange={(e) => {
                    setEditForm({ ...editForm, service_type_abb: e.target.value.toUpperCase() });
                    if (editErrors.service_type_abb) setEditErrors({ ...editErrors, service_type_abb: null });
                  }}
                  maxLength={10}
                  disabled={editSubmitting}
                  className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 uppercase focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-all ${
                    editErrors.service_type_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                  }`}
                />
                {editErrors.service_type_abb && (
                  <p className="mt-1 text-xs text-red-500 font-semibold">{editErrors.service_type_abb}</p>
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
                {t('admin:deletePpcServiceTypeTitle', 'Delete PPC Service Type')}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {t(
                  'admin:deletePpcServiceTypeConfirm',
                  'Are you sure you want to delete this PPC service type? This action cannot be undone.'
                )}
              </p>

              {/* Target Details Badge */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 flex items-center justify-between">
                <span>{deleteTarget.service_type_english}</span>
                <span className="text-xs text-gray-500">#{deleteTarget.service_type_id}</span>
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
                            <span className="font-bold">{dep.table === 'ppc_services' ? 'PPC Services' : dep.table}:</span> {dep.count} service(s)
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11px] text-rose-600 font-normal">
                        Please reassign or delete the associated PPC services before removing this service type.
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

export default AdminPpcServiceTypes;
