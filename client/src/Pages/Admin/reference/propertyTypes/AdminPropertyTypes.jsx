import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import { getAdminPropertyTypes, createAdminPropertyType, updateAdminPropertyType, deleteAdminPropertyType } from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminPropertyTypes = () => {
  const { t } = useTranslation(['admin']);

  // Core List State
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // --- Create Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    property_type_description: '',
    property_type_urdu: '',
    property_type_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPropertyTypeId, setEditPropertyTypeId] = useState(null);
  const [editForm, setEditForm] = useState({
    property_type_description: '',
    property_type_urdu: '',
    property_type_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page to 1 when search logically changes
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const fetchPropertyTypes = async (currentSearch, currentStatus, currentPage, currentLimit) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: currentLimit
      };

      if (currentSearch && currentSearch.trim() !== '') {
        params.search = currentSearch;
      }
      if (currentStatus && currentStatus !== 'all') {
        params.status = currentStatus;
      }

      const res = await getAdminPropertyTypes(params);

      if (res?.success) {
        setPropertyTypes(res.data || []);

        // Numeric Pagination Normalization
        const metaObj = res.meta || {};
        const metaPageNum = Number(metaObj.page) || 1;
        const metaTotalPagesNum = Number(metaObj.totalPages) || 1;
        const metaLimitNum = Number(metaObj.limit) || 10;

        setMeta({ total: Number(metaObj.total) || 0, totalPages: metaTotalPagesNum });

        const validPage = Math.min(currentPage, Math.max(1, metaTotalPagesNum));

        if (validPage !== currentPage) {
          setPage(validPage);
        } else if (metaPageNum !== currentPage) {
          setPage(metaPageNum);
        }

        if (metaLimitNum !== currentLimit) {
          setLimit(metaLimitNum);
        }
      } else {
        setError(res?.message || t('admin:errorFetchingPropertyTypes', 'Unable to load property types.'));
      }
    } catch (err) {
      setError(err?.message || t('admin:errorFetchingPropertyTypes', 'Unable to load property types.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyTypes(debouncedSearch, status, page, limit);
  }, [debouncedSearch, status, page, limit]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
    // Limit is kept based on standard PPC reset behavior
  };

  // --- Modal Helpers ---
  const openAddModal = () => {
    setCreateForm({ property_type_description: '', property_type_urdu: '', property_type_abb: '' });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateSuccess(false);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    if (createSubmitting) return;
    setIsAddModalOpen(false);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: null }));
    }
    setCreateApiError(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateApiError(null);

    // Frontend Validation
    const errors = {};
    const engTrim = createForm.property_type_description.trim();
    if (!engTrim) {
      errors.property_type_description = t('admin:requiredField', 'Required');
    } else if (engTrim.length > 150) {
      errors.property_type_description = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const urduTrim = createForm.property_type_urdu.trim();
    if (urduTrim.length > 150) {
      errors.property_type_urdu = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const abbTrim = createForm.property_type_abb.trim();
    if (abbTrim.length > 30) {
      errors.property_type_abb = t('admin:maxLength30', 'Maximum 30 characters allowed');
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      property_type_description: engTrim,
      property_type_urdu: urduTrim ? urduTrim : null,
      property_type_abb: abbTrim ? abbTrim : null
    };

    try {
      setCreateSubmitting(true);
      const res = await createAdminPropertyType(payload);

      if (res?.success) {
        closeAddModal();
        setCreateForm({ property_type_description: '', property_type_urdu: '', property_type_abb: '' });
        setCreateErrors({});
        setCreateApiError(null);
        setCreateSuccess(true);
        setTimeout(() => setCreateSuccess(false), 3000);
        await fetchPropertyTypes(debouncedSearch, status, page, limit);
      } else {
        setCreateApiError(res?.message || t('admin:createPropertyTypeUnknownError', 'Unable to create property type. Please try again.'));
      }
    } catch (err) {
      const msg = err.message || t('admin:createPropertyTypeUnknownError', 'Unable to create property type. Please try again.');

      if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('already exists')) {
        setCreateErrors({ property_type_description: msg });
      } else if (msg.toLowerCase().includes('abbreviation')) {
        setCreateErrors({ property_type_abb: msg });
      } else {
        setCreateApiError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Helpers ---
  const openEditModal = (row) => {
    setEditPropertyTypeId(String(row.property_type_id));
    setEditForm({
      property_type_description: row.property_type_description ?? '',
      property_type_urdu: row.property_type_urdu ?? '',
      property_type_abb: row.property_type_abb ?? '',
      is_active: row.is_active === true
    });
    setEditErrors({});
    setEditApiError(null);
    setEditSuccess(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) return;
    setIsEditModalOpen(false);
    setEditPropertyTypeId(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'radio') {
      finalValue = value === 'true';
    }
    setEditForm(prev => ({ ...prev, [name]: finalValue }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
    setEditApiError(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditApiError(null);

    // Frontend Validation
    const errors = {};
    const engTrim = editForm.property_type_description.trim();
    if (!engTrim) {
      errors.property_type_description = t('admin:requiredField', 'Required');
    } else if (engTrim.length > 150) {
      errors.property_type_description = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const urduTrim = editForm.property_type_urdu.trim();
    if (urduTrim.length > 150) {
      errors.property_type_urdu = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const abbTrim = editForm.property_type_abb.trim();
    if (abbTrim.length > 30) {
      errors.property_type_abb = t('admin:maxLength30', 'Maximum 30 characters allowed');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      property_type_description: engTrim,
      property_type_urdu: urduTrim ? urduTrim : null,
      property_type_abb: abbTrim ? abbTrim : null,
      is_active: editForm.is_active
    };

    try {
      setEditSubmitting(true);
      const res = await updateAdminPropertyType(editPropertyTypeId, payload);

      if (res?.success) {
        closeEditModal();
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
        // Refresh preserving list state
        await fetchPropertyTypes(debouncedSearch, status, page, limit);
      } else {
        setEditApiError(res?.message || t('admin:updatePropertyTypeUnknownError', 'Unable to update property type. Please try again.'));
      }
    } catch (err) {
      const msg = err.message || t('admin:updatePropertyTypeUnknownError', 'Unable to update property type. Please try again.');
      
      if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('already exists')) {
        setEditErrors({ property_type_description: msg });
      } else if (err.status === 404) {
        closeEditModal();
        setEditSuccess(false);
        setEditApiError(null);
        setError(t('admin:propertyTypeNotFound', 'Property type not found. The list has been refreshed.'));
        await fetchPropertyTypes(debouncedSearch, status, page, limit);
      } else if (msg.toLowerCase().includes('abbreviation')) {
        setEditErrors({ property_type_abb: msg });
      } else {
        setEditApiError(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Helpers ---
  const openDeleteModal = (row) => {
    setDeleteTarget({
      property_type_id: String(row.property_type_id),
      property_type_description: row.property_type_description
    });
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteSubmitting) return;
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
    setDeleteDependencies([]);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget?.property_type_id) return;
    
    setDeleteError(null);
    setDeleteDependencies([]);
    setDeleteSubmitting(true);

    try {
      const res = await deleteAdminPropertyType(deleteTarget.property_type_id);

      if (res?.success) {
        closeDeleteModal();
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
        await fetchPropertyTypes(debouncedSearch, status, page, limit);
      } else {
        setDeleteError(res?.message || t('admin:deletePropertyTypeUnknownError', 'Unable to delete property type. Please try again.'));
      }
    } catch (err) {
      const status = err?.status;
      const data = err?.data;
      const msg = err?.message || t('admin:deletePropertyTypeUnknownError', 'Unable to delete property type. Please try again.');

      if (status === 409) {
        setDeleteError(msg);
        if (data?.dependencies && Array.isArray(data.dependencies)) {
          setDeleteDependencies(data.dependencies);
        }
      } else if (status === 404) {
        closeDeleteModal();
        setError(t('admin:propertyTypeNotFound', 'Property type not found. The list has been refreshed.'));
        await fetchPropertyTypes(debouncedSearch, status, page, limit);
      } else {
        setDeleteError(msg);
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colPropertyTypeNameEn', 'Property Type (English)'),
    t('admin:colPropertyTypeNameUr', 'Property Type (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  const renderRow = (row, index) => {
    const sr = ((page - 1) * limit) + index + 1;
    return (
      <tr key={row.property_type_id} className="hover:bg-gray-50/50 transition-colors group">
        <td className="px-4 py-3 whitespace-nowrap text-sm w-16 text-gray-900 font-semibold">
          {sr}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          #{row.property_type_id}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 min-w-[120px] font-semibold">
          {row.property_type_description}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900 font-urdu min-w-[120px] font-semibold" dir="auto">
          {row.property_type_urdu || '-'}
        </td>
        <td className="px-4 py-3 text-sm min-w-[100px] text-gray-900 font-semibold">
          {row.property_type_abb || '-'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${row.is_active === true
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${row.is_active === true ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
            {row.is_active === true ? t('admin:active', 'Active') : t('admin:inactive', 'Inactive')}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-end text-sm font-semibold w-24 text-gray-900">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEditModal(row)}
              title={t('admin:edit', 'Edit')}
              className="p-1.5 text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              title={t('admin:delete', 'Delete')}
              className="p-1.5 text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {createSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {t('admin:createPropertyTypeSuccess', 'Property type created successfully.')}
        </div>
      )}
      {editSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {t('admin:updatePropertyTypeSuccess', 'Property type updated successfully.')}
        </div>
      )}
      {deleteSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {t('admin:deletePropertyTypeSuccess', 'Property Type deleted successfully')}
        </div>
      )}
      <ReferenceTablePage
        title={t('admin:AdminPropertyTypesTitle', 'Property Types')}
        description={t('admin:AdminPropertyTypesDesc', 'Manage Property Types reference data.')}
        columns={columns}
        rows={propertyTypes}
        loading={loading}
        error={error}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={handleStatusChange}
        onReset={handleReset}
        onRetry={() => fetchPropertyTypes(debouncedSearch, status, page, limit)}
        onAdd={openAddModal}
        emptyMessage={
          search || status !== 'all'
            ? t('admin:noPropertyTypesSearch', 'No property types match your search.')
            : t('admin:noPropertyTypesFound', 'No property types found.')
        }
        renderRow={renderRow}
        showStatusFilter={true}

        // Pagination props mapped to match ReferenceTablePage convention
        pagination={{
          page: page,
          limit: limit,
          total: meta.total,
          totalPages: meta.totalPages,
          onPageChange: (newPage) => setPage(newPage),
          onLimitChange: handleLimitChange
        }}
      />

      {/* Add Property Type Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addPropertyTypeTitle', 'Add Property Type')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:addPropertyTypeDesc', 'Add a new property type to the reference data.')}</p>
              </div>
              <button
                onClick={closeAddModal}
                disabled={createSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4 flex-1">
                {/* Global API Error */}
                {createApiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {createApiError}
                  </div>
                )}

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:propTypeDescEn', 'Property Type Description (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="property_type_description"
                    value={createForm.property_type_description}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.property_type_description
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. Residential House"
                  />
                  {createErrors.property_type_description && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.property_type_description}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:propTypeDescUr', 'Property Type Description (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="property_type_urdu"
                    value={createForm.property_type_urdu}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${createErrors.property_type_urdu
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="رہائشی گھر"
                  />
                  {createErrors.property_type_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.property_type_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="property_type_abb"
                    value={createForm.property_type_abb}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.property_type_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. RH"
                  />
                  {createErrors.property_type_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.property_type_abb}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={createSubmitting}
                  className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:adding', 'Adding...')}
                    </>
                  ) : (
                    t('admin:addPropertyTypeBtn', 'Add Property Type')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Property Type Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editPropertyTypeTitle', 'Edit Property Type')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:editPropertyTypeDesc', 'Update property type details and status.')}</p>
              </div>
              <button
                onClick={closeEditModal}
                disabled={editSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-4 flex-1">
                {/* Global API Error */}
                {editApiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    {editApiError}
                  </div>
                )}

                {/* English Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t('admin:propTypeDescEn', 'Property Type (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="property_type_description"
                    value={editForm.property_type_description}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.property_type_description
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. Residential House"
                  />
                  {editErrors.property_type_description && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.property_type_description}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t('admin:propTypeDescUr', 'Property Type (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="property_type_urdu"
                    value={editForm.property_type_urdu}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${editErrors.property_type_urdu
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="رہائشی گھر"
                  />
                  {editErrors.property_type_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.property_type_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="property_type_abb"
                    value={editForm.property_type_abb}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.property_type_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. RH"
                  />
                  {editErrors.property_type_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.property_type_abb}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('admin:status', 'Status')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="true"
                        checked={editForm.is_active === true}
                        onChange={handleEditChange}
                        disabled={editSubmitting}
                        className="w-4 h-4 text-[#C59B27] border-gray-300 focus:ring-[#C59B27]"
                      />
                      <span className="text-sm text-gray-900 font-medium">{t('admin:active', 'Active')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="false"
                        checked={editForm.is_active === false}
                        onChange={handleEditChange}
                        disabled={editSubmitting}
                        className="w-4 h-4 text-[#C59B27] border-gray-300 focus:ring-[#C59B27]"
                      />
                      <span className="text-sm text-gray-900 font-medium">{t('admin:inactive', 'Inactive')}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:updating', 'Updating...')}
                    </>
                  ) : (
                    t('admin:updatePropertyTypeBtn', 'Update Property Type')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Property Type Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deletePropertyTypeTitle', 'Delete Property Type')}</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-800 font-medium">
                {t('admin:deletePropertyTypePrompt', 'Are you sure you want to delete this property type?')}
              </p>
              
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">{t('admin:propTypeDescEn', 'Property Type')}</p>
                <p className="text-base text-gray-900 font-bold">{deleteTarget?.property_type_description}</p>
              </div>

              {deleteError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {deleteError}
                  {deleteDependencies && deleteDependencies.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-2">{t('admin:dependencies', 'Dependencies')}:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {deleteDependencies.map((dep, idx) => {
                          let label = dep.table;
                          if (dep.table === 'properties') label = t('admin:propertiesCol', 'Properties');
                          if (dep.table === 'customer_request_property_requirements') label = t('admin:depCustomerRequestPropertyRequirements', 'Customer Request Property Requirements');
                          
                          return (
                            <li key={idx} className="text-red-700">
                              <span className="font-semibold">{label}:</span> {dep.count}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!deleteError && (
                <p className="text-sm text-red-600 font-medium">
                  {t('admin:deletePropertyTypeWarning', 'This action permanently deletes the property type if it is not currently in use.')}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteSubmitting || (deleteError && deleteDependencies.length > 0)}
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleteSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                    {t('admin:deleting', 'Deleting...')}
                  </>
                ) : (
                  t('admin:deletePropertyTypeBtn', 'Delete Property Type')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPropertyTypes;
