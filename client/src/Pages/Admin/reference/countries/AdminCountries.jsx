import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import { getAdminCountries, createAdminCountry, updateAdminCountry, deleteAdminCountry } from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminCountries = () => {
  const { t } = useTranslation(['admin']);

  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  // --- Create Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_english: '',
    country_urdu: '',
    country_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [editForm, setEditForm] = useState({
    country_english: '',
    country_urdu: '',
    country_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteCountry, setSelectedDeleteCountry] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchCountries = async (searchQuery = search, statusQuery = status) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminCountries({ search: searchQuery, status: statusQuery });
      if (res?.success) {
        setCountries(res.data || []);
      } else {
        setError(res?.message || t('admin:errorFetching', 'Failed to fetch countries'));
      }
    } catch (err) {
      setError(err?.message || t('admin:errorFetching', 'Failed to fetch countries'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCountries(search, status);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
  };

  // --- Modal Helpers ---
  const openAddModal = () => {
    setCreateForm({ country_english: '', country_urdu: '', country_abb: '' });
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
    // Clear field-specific error on typing
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: null }));
    }
    setCreateApiError(null);
    setCreateSuccess(false);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateApiError(null);
    
    // Frontend Validation
    const errors = {};
    const engTrim = createForm.country_english.trim();
    if (!engTrim) {
      errors.country_english = t('admin:valEngReq', 'Country Name (English) is required');
    } else if (engTrim.length > 100) {
      errors.country_english = t('admin:valEngMax', 'Country Name (English) must not exceed 100 characters');
    }

    const urduTrim = createForm.country_urdu.trim();
    if (urduTrim.length > 100) {
      errors.country_urdu = t('admin:valUrduMax', 'Country Name (Urdu) must not exceed 100 characters');
    }

    const abbTrim = createForm.country_abb.trim();
    if (abbTrim.length > 20) {
      errors.country_abb = t('admin:valAbbMax', 'Abbreviation must not exceed 20 characters');
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      country_english: engTrim,
      country_urdu: urduTrim ? urduTrim : null,
      country_abb: abbTrim ? abbTrim : null
    };

    try {
      setCreateSubmitting(true);
      const res = await createAdminCountry(payload);
      
      if (res?.success) {
        setCreateSuccess(true);
        setTimeout(() => {
          closeAddModal();
          fetchCountries();
        }, 1000);
      }
    } catch (err) {
      const msg = err.message || t('admin:createUnknownError', 'Unable to create country. Please try again.');
      
      // Associate known 409 messages with fields
      if (msg.toLowerCase().includes('english')) {
        setCreateErrors({ country_english: msg });
      } else if (msg.toLowerCase().includes('abbreviation')) {
        setCreateErrors({ country_abb: msg });
      } else {
        setCreateApiError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Helpers ---
  const openEditModal = (country) => {
    setSelectedCountry(country);
    setEditForm({
      country_english: country.country_english || '',
      country_urdu: country.country_urdu || '',
      country_abb: country.country_abb || '',
      is_active: country.is_active === true
    });
    setEditErrors({});
    setEditApiError(null);
    setEditSuccess(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) return;
    setIsEditModalOpen(false);
    setSelectedCountry(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'radio' ? value === 'true' : value;
    
    setEditForm(prev => ({ ...prev, [name]: parsedValue }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
    setEditApiError(null);
    setEditSuccess(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditApiError(null);
    
    if (!selectedCountry?.country_id) return;

    // Frontend Validation
    const errors = {};
    const engTrim = editForm.country_english.trim();
    if (!engTrim) {
      errors.country_english = t('admin:valEngReq', 'Country Name (English) is required');
    } else if (engTrim.length > 100) {
      errors.country_english = t('admin:valEngMax', 'Country Name (English) must not exceed 100 characters');
    }

    const urduTrim = editForm.country_urdu.trim();
    if (urduTrim.length > 100) {
      errors.country_urdu = t('admin:valUrduMax', 'Country Name (Urdu) must not exceed 100 characters');
    }

    const abbTrim = editForm.country_abb.trim();
    if (abbTrim.length > 20) {
      errors.country_abb = t('admin:valAbbMax', 'Abbreviation must not exceed 20 characters');
    }

    if (typeof editForm.is_active !== 'boolean') {
      errors.is_active = t('admin:valStatusBool', 'Status must be a boolean');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      country_english: engTrim,
      country_urdu: urduTrim ? urduTrim : null,
      country_abb: abbTrim ? abbTrim : null,
      is_active: editForm.is_active
    };

    try {
      setEditSubmitting(true);
      const res = await updateAdminCountry(selectedCountry.country_id, payload);
      
      if (res?.success) {
        setEditSuccess(true);
        setTimeout(() => {
          closeEditModal();
          fetchCountries(); // Uses current search/status from state natively
        }, 1000);
      }
    } catch (err) {
      const msg = err.message || t('admin:updateUnknownError', 'Unable to update country. Please try again.');
      
      if (err.status === 404) {
        setEditApiError(t('admin:countryNotFound', 'Country not found'));
      } else if (msg.toLowerCase().includes('english')) {
        setEditErrors({ country_english: msg });
      } else if (msg.toLowerCase().includes('abbreviation')) {
        setEditErrors({ country_abb: msg });
      } else {
        setEditApiError(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Helpers ---
  const openDeleteModal = (country) => {
    setSelectedDeleteCountry(country);
    setDeleteError(null);
    setDeleteDependencies([]);
    setDeleteSuccess(false);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteSubmitting) return;
    setIsDeleteModalOpen(false);
    setSelectedDeleteCountry(null);
  };

  const friendlyDependencyMap = {
    customers: t('admin:depCustomers', 'Customers'),
    provinces: t('admin:depProvinces', 'Provinces'),
    pending_users: t('admin:depPendingUsers', 'Pending Users')
  };

  const handleDeleteSubmit = async () => {
    if (!selectedDeleteCountry?.country_id) return;
    
    setDeleteError(null);
    setDeleteDependencies([]);
    setDeleteSubmitting(true);
    
    try {
      const res = await deleteAdminCountry(selectedDeleteCountry.country_id);
      
      if (res?.success) {
        setDeleteSuccess(true);
        // Do not artificially wait, just close and refetch. (But UI might flicker without a short pause for the success message to show).
        // Let's refetch immediately and close.
        closeDeleteModal();
        fetchCountries();
      } else {
        setDeleteError(res?.message || t('admin:deleteUnknownError', 'Unable to delete country. Please try again.'));
      }
    } catch (err) {
      if (err.status === 404) {
        setDeleteError(t('admin:countryNotFoundDelete', 'Country not found. It may have already been deleted.'));
        setTimeout(() => {
          closeDeleteModal();
          fetchCountries();
        }, 1500);
      } else if (err.status === 409) {
        setDeleteError(err.message || t('admin:countryInUse', 'Country cannot be deleted because it is currently in use.'));
        if (err.data?.dependencies) {
          setDeleteDependencies(err.data.dependencies);
        }
      } else if (err.status === 400) {
        setDeleteError(t('admin:invalidId', 'Invalid Country ID.'));
      } else {
        setDeleteError(err.message || t('admin:deleteUnknownError', 'Unable to delete country. Please try again.'));
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'Name (English)'),
    t('admin:colNameUr', 'Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  const renderRow = (row, index) => (
    <tr key={row.country_id} className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {index + 1}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {row.country_id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {row.country_english}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-urdu">
        {row.country_urdu || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {row.country_abb || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
          row.is_active === true
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${
            row.is_active === true ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          {row.is_active === true ? t('admin:active', 'Active') : t('admin:inactive', 'Inactive')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => openEditModal(row)}
            title={t('admin:edit', 'Edit')}
            className="p-1.5 text-gray-500 hover:text-[#C59B27] bg-white border border-gray-200 rounded-lg shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openDeleteModal(row)}
            title={t('admin:deleteCountryBtn', 'Delete Country')}
            className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <>
      <ReferenceTablePage
        title={t('admin:AdminCountriesTitle', 'Countries')}
        description={t('admin:AdminCountriesDesc', 'Manage Countries reference data.')}
        columns={columns}
        rows={countries}
        loading={loading}
        error={error}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onReset={handleReset}
        onRetry={() => fetchCountries()}
        onAdd={openAddModal}
        emptyMessage={
          search || status !== 'all' 
            ? t('admin:noCountriesSearch', 'No countries match your search.') 
            : t('admin:noCountriesFound', 'No countries found.')
        }
        renderRow={renderRow}
        showStatusFilter={true}
      />

      {/* Add Country Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addCountryTitle', 'Add Country')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:addCountryDesc', 'Add a new country to the location reference data.')}</p>
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
                
                {/* Global Success Feedback */}
                {createSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                    {t('admin:createCountrySuccess', 'Country created successfully.')}
                  </div>
                )}

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colNameEn', 'Country Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country_english"
                    value={createForm.country_english}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || createSuccess}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.country_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. United Kingdom"
                  />
                  {createErrors.country_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.country_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colNameUr', 'Country Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="country_urdu"
                    value={createForm.country_urdu}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || createSuccess}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      createErrors.country_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="برطانیہ"
                  />
                  {createErrors.country_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.country_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="country_abb"
                    value={createForm.country_abb}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || createSuccess}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.country_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. UK"
                  />
                  {createErrors.country_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.country_abb}</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={createSubmitting || createSuccess}
                  className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting || createSuccess}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:adding', 'Adding...')}
                    </>
                  ) : (
                    t('admin:addCountryBtn', 'Add Country')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Country Modal */}
      {isEditModalOpen && selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editCountryTitle', 'Edit Country')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:editCountryDesc', 'Update country reference data.')}</p>
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
                
                {/* Global Success Feedback */}
                {editSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
                    {t('admin:updateCountrySuccess', 'Country updated successfully.')}
                  </div>
                )}

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colNameEn', 'Country Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country_english"
                    value={editForm.country_english}
                    onChange={handleEditChange}
                    disabled={editSubmitting || editSuccess}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.country_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. United Kingdom"
                  />
                  {editErrors.country_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.country_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colNameUr', 'Country Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="country_urdu"
                    value={editForm.country_urdu}
                    onChange={handleEditChange}
                    disabled={editSubmitting || editSuccess}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      editErrors.country_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="برطانیہ"
                  />
                  {editErrors.country_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.country_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="country_abb"
                    value={editForm.country_abb}
                    onChange={handleEditChange}
                    disabled={editSubmitting || editSuccess}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.country_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. UK"
                  />
                  {editErrors.country_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.country_abb}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="true"
                        checked={editForm.is_active === true}
                        onChange={handleEditChange}
                        disabled={editSubmitting || editSuccess}
                        className="w-4 h-4 text-[#C59B27] bg-gray-100 border-gray-300 focus:ring-[#C59B27] focus:ring-2"
                      />
                      <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm text-gray-900">{t('admin:active', 'Active')}</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="false"
                        checked={editForm.is_active === false}
                        onChange={handleEditChange}
                        disabled={editSubmitting || editSuccess}
                        className="w-4 h-4 text-[#C59B27] bg-gray-100 border-gray-300 focus:ring-[#C59B27] focus:ring-2"
                      />
                      <span className="ml-2 rtl:mr-2 rtl:ml-0 text-sm text-gray-900">{t('admin:inactive', 'Inactive')}</span>
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
                  disabled={editSubmitting || editSuccess}
                  className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t('admin:cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting || editSuccess}
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

      {/* Delete Country Modal */}
      {isDeleteModalOpen && selectedDeleteCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteCountryTitle', 'Delete Country')}</h3>
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
                  {t('admin:deleteConfirmMsg', 'Are you sure you want to delete this country?')}
                </p>
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedDeleteCountry.country_english}</p>
                  <p className="text-xs text-gray-500 mt-0.5">ID: #{selectedDeleteCountry.country_id}</p>
                </div>
                <p className="mt-3 text-red-600 font-medium text-xs">
                  {t('admin:deleteWarning', 'This permanently removes the country reference record and cannot be undone.')}
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
                  t('admin:deleteCountryBtn', 'Delete Country')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCountries;
