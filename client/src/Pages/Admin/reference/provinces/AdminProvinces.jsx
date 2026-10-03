
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import { getAdminProvinces, getAdminCountries, createAdminProvince, updateAdminProvince, deleteAdminProvince } from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminProvinces = () => {
  const { t } = useTranslation(['admin']);

  // --- Provinces State ---
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Create Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_english: '',
    province_urdu: '',
    province_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [pageSuccess, setPageSuccess] = useState('');

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_english: '',
    province_urdu: '',
    province_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProvinceForDelete, setSelectedProvinceForDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [countryId, setCountryId] = useState('');

  // --- Countries Dropdown State ---
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  // Fetch parent countries for the filter dropdown
  const fetchCountriesForFilter = async () => {
    try {
      setCountriesLoading(true);
      setCountriesError(null);
      // Admin should see all countries in the filter
      const res = await getAdminCountries({ status: 'all' });
      if (res?.success) {
        setCountries(res.data || []);
      } else {
        setCountriesError(t('admin:errorLoadingCountries', 'Unable to load countries'));
      }
    } catch (err) {
      setCountriesError(t('admin:errorLoadingCountries', 'Unable to load countries'));
    } finally {
      setCountriesLoading(false);
    }
  };

  // Fetch provinces based on current filters
  const fetchProvinces = async (searchQuery = search, statusQuery = status, countryQuery = countryId) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusQuery) params.status = statusQuery;
      if (countryQuery) params.countryId = countryQuery;

      const res = await getAdminProvinces(params);
      
      if (res?.success) {
        setProvinces(res.data || []);
      } else {
        setError(res?.message || t('admin:errorFetching', 'Failed to fetch data'));
      }
    } catch (err) {
      setError(err?.message || t('admin:errorFetching', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  // Initial load for countries dropdown
  useEffect(() => {
    fetchCountriesForFilter();
  }, []);

  // Debounced load for provinces
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProvinces(search, status, countryId);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, countryId]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCountryId('');
  };

  // --- Modal Helpers ---
  const openAddModal = () => {
    setCreateForm({ country_id: '', province_english: '', province_urdu: '', province_abb: '' });
    setCreateErrors({});
    setCreateApiError(null);
    setPageSuccess('');
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
    setPageSuccess('');
    
    // Frontend Validation
    const errors = {};
    if (!createForm.country_id) {
      errors.country_id = t('admin:valCountryReq', 'Country is required.');
    }
    
    const engTrim = createForm.province_english.trim();
    if (!engTrim) {
      errors.province_english = t('admin:valEngReq', 'Province Name (English) is required.');
    } else if (engTrim.length > 100) {
      errors.province_english = t('admin:valEngMax', 'Province Name (English) must not exceed 100 characters.');
    }

    const urduTrim = createForm.province_urdu.trim();
    if (urduTrim.length > 100) {
      errors.province_urdu = t('admin:valUrduMax', 'Province Name (Urdu) must not exceed 100 characters.');
    }

    const abbTrim = createForm.province_abb.trim();
    if (abbTrim.length > 20) {
      errors.province_abb = t('admin:valAbbMax', 'Abbreviation must not exceed 20 characters.');
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      country_id: createForm.country_id,
      province_english: engTrim,
      province_urdu: urduTrim ? urduTrim : null,
      province_abb: abbTrim ? abbTrim : null
    };

    try {
      setCreateSubmitting(true);
      const res = await createAdminProvince(payload);
      
      if (res?.success) {
        setPageSuccess(t('admin:createProvinceSuccess', 'Province created successfully.'));
        closeAddModal();
        setCreateForm({ country_id: '', province_english: '', province_urdu: '', province_abb: '' });
        setCreateErrors({});
        setCreateApiError(null);
        await fetchProvinces(); // Use current state (search, status, countryId) seamlessly
        
        setTimeout(() => setPageSuccess(''), 5000);
      }
    } catch (err) {
      const msg = err.message || t('admin:createUnknownError', 'Unable to create province. Please try again.');
      
      if (err.status === 404) {
        setCreateErrors({ country_id: t('admin:countryNotFound', 'Country not found. Please select another country.') });
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setCreateErrors({ province_english: msg || t('admin:provinceExists', 'Province with this English name already exists in the selected country') });
      } else {
        setCreateApiError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openEditModal = (row) => {
    setSelectedProvince(row);
    setEditForm({
      country_id: String(row.country_id),
      province_english: row.province_english,
      province_urdu: row.province_urdu ?? '',
      province_abb: row.province_abb ?? '',
      is_active: row.is_active
    });
    setEditErrors({});
    setEditApiError(null);
    setPageSuccess('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) return;
    setIsEditModalOpen(false);
    setSelectedProvince(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'radio' && (value === 'true' || value === 'false')) {
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
    setPageSuccess('');
    
    // Frontend Validation
    const errors = {};
    if (!editForm.country_id) {
      errors.country_id = t('admin:valCountryReq', 'Country is required.');
    }
    
    const engTrim = editForm.province_english.trim();
    if (!engTrim) {
      errors.province_english = t('admin:valEngReq', 'Province Name (English) is required.');
    } else if (engTrim.length > 100) {
      errors.province_english = t('admin:valEngMax', 'Province Name (English) must not exceed 100 characters.');
    }

    const urduTrim = editForm.province_urdu.trim();
    if (urduTrim.length > 100) {
      errors.province_urdu = t('admin:valUrduMax', 'Province Name (Urdu) must not exceed 100 characters.');
    }

    const abbTrim = editForm.province_abb.trim();
    if (abbTrim.length > 20) {
      errors.province_abb = t('admin:valAbbMax', 'Abbreviation must not exceed 20 characters.');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      country_id: editForm.country_id,
      province_english: engTrim,
      province_urdu: urduTrim ? urduTrim : null,
      province_abb: abbTrim ? abbTrim : null,
      is_active: editForm.is_active
    };

    try {
      setEditSubmitting(true);
      const res = await updateAdminProvince(selectedProvince.province_id, payload);
      
      if (res?.success) {
        setPageSuccess(t('admin:updateProvinceSuccess', 'Province updated successfully.'));
        closeEditModal();
        await fetchProvinces(); // Use current state (search, status, countryId) seamlessly
        
        setTimeout(() => setPageSuccess(''), 5000);
      }
    } catch (err) {
      const msg = err.message || t('admin:updateUnknownError', 'Unable to update province. Please try again.');
      
      if (err.status === 404) {
        if (msg.toLowerCase().includes('country')) {
          setEditErrors({ country_id: t('admin:countryNotFound', 'Country not found. Please select another country.') });
          fetchCountriesForFilter(); // refresh country list
        } else {
          setEditApiError(t('admin:provinceNotFound', 'Province not found. It may have already been removed.'));
          fetchProvinces(); // refresh province list
        }
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setEditErrors({ province_english: msg || t('admin:provinceExists', 'Province with this English name already exists in the selected country') });
      } else {
        setEditApiError(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Helpers ---
  const openDeleteModal = (row) => {
    setSelectedProvinceForDelete(row);
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteSubmitting) return;
    setIsDeleteModalOpen(false);
    setSelectedProvinceForDelete(null);
  };

  const friendlyDependencyMap = {
    divisions: t('admin:depDivisions', 'Divisions')
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProvinceForDelete?.province_id) return;
    
    setDeleteError(null);
    setDeleteDependencies([]);
    setDeleteSubmitting(true);
    
    try {
      const res = await deleteAdminProvince(selectedProvinceForDelete.province_id);
      
      if (res?.success) {
        closeDeleteModal();
        setPageSuccess(t('admin:deleteProvinceSuccess', 'Province deleted successfully.'));
        await fetchProvinces(); // Uses current search, status, and countryId from state natively
        
        setTimeout(() => setPageSuccess(''), 5000);
      }
    } catch (err) {
      if (err.status === 404) {
        closeDeleteModal();
        setPageSuccess(t('admin:provinceNotFoundDelete', 'Province not found. The list has been refreshed.'));
        await fetchProvinces();
        setTimeout(() => setPageSuccess(''), 5000);
      } else if (err.status === 409) {
        setDeleteError(err.message || t('admin:provinceInUse', 'Province cannot be deleted because it is currently in use.'));
        if (err.data?.dependencies) {
          setDeleteDependencies(err.data.dependencies);
        }
      } else if (err.status === 400) {
        setDeleteError(t('admin:invalidId', 'Invalid ID.'));
      } else {
        setDeleteError(err.message || t('admin:deleteProvinceUnknownError', 'Unable to delete province. Please try again.'));
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // The final required columns for the table
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colCountry', 'Country'),
    t('admin:colProvinceNameEn', 'Province Name (English)'),
    t('admin:colProvinceNameUr', 'Province Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  const renderRow = (row, index) => (
    <tr key={row.province_id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 w-16">
        {(index + 1).toString().padStart(2, '0')}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        #{row.province_id}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[100px]">
        {row.country_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[120px]">
        {row.province_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 font-urdu min-w-[120px]">
        {row.province_urdu || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[100px]">
        {row.province_abb || '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          row.is_active 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${row.is_active ? 'bg-green-600' : 'bg-red-600'}`}></span>
          {row.is_active ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-end text-sm font-medium w-24">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => openEditModal(row)}
            title={t('admin:editProvince', 'Edit province')}
            className="p-1.5 text-blue-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openDeleteModal(row)}
            title={t('admin:deleteProvince', 'Delete province')}
            className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const countryFilterSelect = (
    <select
      value={countryId}
      onChange={(e) => setCountryId(e.target.value)}
      disabled={countriesLoading}
      className="block w-full sm:w-48 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
    >
      <option value="">
        {countriesError 
          ? t('admin:errorLoadingCountries', 'Unable to load countries') 
          : (countriesLoading 
              ? t('admin:loadingCountries', 'Loading countries...') 
              : t('admin:allCountries', 'All Countries')
            )
        }
      </option>
      {countries.map(c => (
        <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
      ))}
    </select>
  );

  return (
    <>
      {pageSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {pageSuccess}
        </div>
      )}
      <ReferenceTablePage
        title={t('admin:AdminProvincesTitle', 'Provinces')}
        description={t('admin:AdminProvincesDesc', 'Manage Provinces reference data.')}
        columns={columns}
        rows={provinces}
        
        search={search}
        onSearchChange={setSearch}
        
        status={status}
        showStatusFilter={true}
        onStatusChange={setStatus}
        
        extraFilters={countryFilterSelect}

        loading={loading}
        error={error}
        onReset={handleReset}
        onRetry={() => fetchProvinces(search, status, countryId)}
        
        onAdd={openAddModal}
        
        emptyMessage={
          (search || status !== 'all' || countryId) 
            ? t('admin:noProvincesMatch', 'No provinces match the selected filters.')
            : t('admin:noProvincesFound', 'No provinces found.')
        }
        renderRow={renderRow}
      />

      {/* Add Province Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addProvinceTitle', 'Add Province')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:addProvinceDesc', 'Add a new province to the location reference data.')}</p>
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
                
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country_id"
                    value={createForm.country_id}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || countriesLoading || !!countriesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.country_id 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                  >
                    <option value="">
                      {countriesError 
                        ? t('admin:errorLoadingCountries', 'Unable to load countries') 
                        : (countriesLoading 
                            ? t('admin:loadingCountries', 'Loading countries...') 
                            : t('admin:selectCountry', 'Select Country')
                          )
                      }
                    </option>
                    {countries.map(c => (
                      <option key={c.country_id} value={c.country_id}>
                        {c.country_english} {c.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {createErrors.country_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.country_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvinceNameEn', 'Province Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="province_english"
                    value={createForm.province_english}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.province_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. Punjab"
                  />
                  {createErrors.province_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.province_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvinceNameUr', 'Province Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="province_urdu"
                    value={createForm.province_urdu}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      createErrors.province_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="پنجاب"
                  />
                  {createErrors.province_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.province_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="province_abb"
                    value={createForm.province_abb}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.province_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. PB"
                  />
                  {createErrors.province_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.province_abb}</p>
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
                  disabled={createSubmitting || countriesLoading || !!countriesError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:adding', 'Adding...')}
                    </>
                  ) : (
                    t('admin:addProvinceBtn', 'Add Province')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Province Modal */}
      {isEditModalOpen && selectedProvince && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editProvince', 'Edit Province')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:editProvinceDesc', 'Update province reference data.')}</p>
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
                
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country_id"
                    value={editForm.country_id}
                    onChange={handleEditChange}
                    disabled={editSubmitting || countriesLoading || !!countriesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.country_id 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                  >
                    <option value="">
                      {countriesError 
                        ? t('admin:errorLoadingCountries', 'Unable to load countries') 
                        : (countriesLoading 
                            ? t('admin:loadingCountries', 'Loading countries...') 
                            : t('admin:selectCountry', 'Select Country')
                          )
                      }
                    </option>
                    {countries.map(c => (
                      <option key={c.country_id} value={c.country_id}>
                        {c.country_english} {c.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {editErrors.country_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.country_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvinceNameEn', 'Province Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="province_english"
                    value={editForm.province_english}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.province_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. Punjab"
                  />
                  {editErrors.province_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.province_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvinceNameUr', 'Province Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="province_urdu"
                    value={editForm.province_urdu}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      editErrors.province_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="پنجاب"
                  />
                  {editErrors.province_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.province_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="province_abb"
                    value={editForm.province_abb}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.province_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. PB"
                  />
                  {editErrors.province_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.province_abb}</p>
                  )}
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
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
                        className="w-4 h-4 text-[#C59B27] focus:ring-[#C59B27] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{t('admin:active', 'Active')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="false"
                        checked={editForm.is_active === false}
                        onChange={handleEditChange}
                        disabled={editSubmitting}
                        className="w-4 h-4 text-[#C59B27] focus:ring-[#C59B27] border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{t('admin:inactive', 'Inactive')}</span>
                    </label>
                  </div>
                  {editErrors.is_active && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.is_active}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editSubmitting}
                  className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || countriesLoading || !!countriesError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:saving', 'Saving...')}
                    </>
                  ) : (
                    t('admin:saveChanges', 'Save Changes')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Province Modal */}
      {isDeleteModalOpen && selectedProvinceForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteProvinceTitle', 'Delete Province')}</h3>
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
              {/* Error Feedback */}
              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {deleteError}
                  {deleteDependencies.length > 0 && (
                    <div className="mt-2 text-sm text-red-700">
                      <p className="font-semibold mb-1">{t('admin:usedBy', 'Used by:')}</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-1 rtl:mr-1 rtl:ml-0">
                        {deleteDependencies.map((dep, idx) => (
                          <li key={idx}>
                            {friendlyDependencyMap[dep.table] || dep.table}: {dep.count}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-gray-700 text-sm">
                <p>
                  {t('admin:deleteProvinceConfirmMsg', 'Are you sure you want to delete this province?')}
                </p>
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedProvinceForDelete.province_english}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedProvinceForDelete.country_english} &bull; ID: #{selectedProvinceForDelete.province_id}
                  </p>
                </div>
                <p className="mt-3 text-red-600 font-medium text-xs">
                  {t('admin:deleteProvinceWarning', 'This action permanently deletes the province if it is not currently in use.')}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteSubmitting || deleteDependencies.length > 0}
                className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {deleteSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                    {t('admin:deleting', 'Deleting...')}
                  </>
                ) : (
                  t('admin:deleteProvinceBtn', 'Delete Province')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProvinces;
