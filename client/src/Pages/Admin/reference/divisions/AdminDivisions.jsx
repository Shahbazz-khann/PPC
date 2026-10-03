import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import { getAdminDivisions, getAdminCountries, getAdminProvinces, createAdminDivision, updateAdminDivision, deleteAdminDivision } from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminDivisions = () => {
  const { t } = useTranslation(['admin']);

  // --- Divisions State ---
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [countryId, setCountryId] = useState('');
  const [provinceId, setProvinceId] = useState('');

  // --- Create Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_id: '',
    division_english: '',
    division_urdu: '',
    division_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [pageSuccess, setPageSuccess] = useState('');

  // --- Create Modal Province Options ---
  const [createProvinces, setCreateProvinces] = useState([]);
  const [createProvincesLoading, setCreateProvincesLoading] = useState(false);
  const [createProvincesError, setCreateProvincesError] = useState(null);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDivisionId, setEditDivisionId] = useState(null);
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_id: '',
    division_english: '',
    division_urdu: '',
    division_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- Edit Modal Province Options ---
  const [editProvinces, setEditProvinces] = useState([]);
  const [editProvincesLoading, setEditProvincesLoading] = useState(false);
  const [editProvincesError, setEditProvincesError] = useState(null);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // --- Countries Dropdown State ---
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  // --- Provinces Dropdown State ---
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesError, setProvincesError] = useState(null);

  // Fetch parent countries for the filter dropdown
  const fetchCountriesForFilter = async () => {
    try {
      setCountriesLoading(true);
      setCountriesError(null);
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

  // Fetch provinces for the filter dropdown
  const fetchProvincesForFilter = async (currentCountryId) => {
    try {
      setProvincesLoading(true);
      setProvincesError(null);
      const params = { status: 'all' };
      if (currentCountryId) {
        params.countryId = currentCountryId;
      }
      const res = await getAdminProvinces(params);
      if (res?.success) {
        setProvinces(res.data || []);
      } else {
        setProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
      }
    } catch (err) {
      setProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
    } finally {
      setProvincesLoading(false);
    }
  };

  // Fetch divisions based on current filters
  const fetchDivisions = async (
    searchQuery = search,
    statusQuery = status,
    countryQuery = countryId,
    provinceQuery = provinceId,
    pageQuery = page,
    limitQuery = limit
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusQuery) params.status = statusQuery;
      if (countryQuery) params.countryId = countryQuery;
      if (provinceQuery) params.provinceId = provinceQuery;
      params.page = pageQuery;
      params.limit = limitQuery;

      const res = await getAdminDivisions(params);
      
      if (res?.success) {
        setDivisions(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);
          
          // Pagination edge case: if we are on a page that no longer exists after delete, go to last valid page
          const currentPageNum = Number(pageQuery);
          const metaPageNum = Number(res.meta.page) || 1;
          const metaTotalPagesNum = Number(res.meta.totalPages) || 1;
          
          const validPage = Math.min(currentPageNum, Math.max(1, metaTotalPagesNum));
          if (validPage !== currentPageNum) {
            setPage(validPage);
            // It will trigger another fetch via useEffect
          } else if (metaPageNum !== page) {
            setPage(metaPageNum);
          }
          
          if (Number(res.meta.limit) !== limit) {
             setLimit(Number(res.meta.limit) || 10);
          }
        }
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

  // Fetch provinces dropdown when country changes
  useEffect(() => {
    fetchProvincesForFilter(countryId);
  }, [countryId]);

  // Debounced load for divisions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDivisions(search, status, countryId, provinceId, page, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, countryId, provinceId, page, limit]);

  const handleCountryChange = (e) => {
    setCountryId(e.target.value);
    setProvinceId(''); // Reset province when country changes
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCountryId('');
    setProvinceId('');
    setPage(1);
  };

  // --- Modal Helpers ---
  const fetchProvincesForCreate = async (currentCountryId) => {
    if (!currentCountryId) {
      setCreateProvinces([]);
      return;
    }
    try {
      setCreateProvincesLoading(true);
      setCreateProvincesError(null);
      const res = await getAdminProvinces({ status: 'all', countryId: currentCountryId });
      if (res?.success) {
        setCreateProvinces(res.data || []);
      } else {
        setCreateProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
      }
    } catch (err) {
      setCreateProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
    } finally {
      setCreateProvincesLoading(false);
    }
  };

  const openAddModal = () => {
    setCreateForm({ country_id: '', province_id: '', division_english: '', division_urdu: '', division_abb: '' });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setPageSuccess('');
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    if (createSubmitting) return;
    setIsAddModalOpen(false);
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    
    setCreateForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'country_id') {
        updated.province_id = '';
      }
      return updated;
    });

    if (name === 'country_id') {
      if (createErrors.country_id) setCreateErrors(prev => ({ ...prev, country_id: null }));
      if (createErrors.province_id) setCreateErrors(prev => ({ ...prev, province_id: null }));
      fetchProvincesForCreate(value);
    } else {
      if (createErrors[name]) setCreateErrors(prev => ({ ...prev, [name]: null }));
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
    if (!createForm.province_id) {
      errors.province_id = t('admin:valProvReq', 'Province is required.');
    }
    
    const engTrim = createForm.division_english.trim();
    if (!engTrim) {
      errors.division_english = t('admin:valEngReq', 'Division Name (English) is required.');
    } else if (engTrim.length > 255) {
      errors.division_english = t('admin:valEngMax255', 'Division Name (English) must not exceed 255 characters.');
    }

    const urduTrim = createForm.division_urdu.trim();
    if (urduTrim.length > 255) {
      errors.division_urdu = t('admin:valUrduMax255', 'Division Name (Urdu) must not exceed 255 characters.');
    }

    const abbTrim = createForm.division_abb.trim();
    if (abbTrim.length > 50) {
      errors.division_abb = t('admin:valAbbMax50', 'Abbreviation must not exceed 50 characters.');
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      province_id: createForm.province_id,
      division_english: engTrim,
      division_urdu: urduTrim ? urduTrim : null,
      division_abb: abbTrim ? abbTrim : null
    };

    try {
      setCreateSubmitting(true);
      const res = await createAdminDivision(payload);
      
      if (res?.success) {
        setPageSuccess(t('admin:createDivisionSuccess', 'Division created successfully.'));
        closeAddModal();
        setCreateForm({ country_id: '', province_id: '', division_english: '', division_urdu: '', division_abb: '' });
        setCreateErrors({});
        setCreateApiError(null);
        setCreateProvinces([]);
        await fetchDivisions();
      }
    } catch (err) {
      const msg = err.message || t('admin:createUnknownError', 'Unable to create division. Please try again.');
      
      if (err.status === 404) {
        setCreateErrors({ province_id: t('admin:provinceNotFound', 'Province not found. Please select another province.') });
        setCreateForm(prev => ({ ...prev, province_id: '' }));
        if (createForm.country_id) fetchProvincesForCreate(createForm.country_id);
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setCreateErrors({ division_english: msg || t('admin:divisionExists', 'Division with this English name already exists in the selected province') });
      } else if (err.status === 400 && err.data?.errors) {
        setCreateApiError(err.data.errors.join(', '));
      } else {
        setCreateApiError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Handlers ---
  const fetchProvincesForEdit = async (currentCountryId) => {
    if (!currentCountryId) {
      setEditProvinces([]);
      return;
    }
    try {
      setEditProvincesLoading(true);
      setEditProvincesError(null);
      const res = await getAdminProvinces({ status: 'all', countryId: currentCountryId });
      if (res?.success) {
        setEditProvinces(res.data || []);
      } else {
        setEditProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
      }
    } catch (err) {
      setEditProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
    } finally {
      setEditProvincesLoading(false);
    }
  };

  const openEditModal = (row) => {
    setEditDivisionId(String(row.division_id));
    setEditForm({
      country_id: String(row.country_id),
      province_id: String(row.province_id),
      division_english: row.division_english ?? '',
      division_urdu: row.division_urdu ?? '',
      division_abb: row.division_abb ?? '',
      is_active: row.is_active
    });
    setEditErrors({});
    setEditApiError(null);
    setPageSuccess('');
    
    // Fetch provinces for this country
    fetchProvincesForEdit(String(row.country_id));
    
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (editSubmitting) return;
    setIsEditModalOpen(false);
    setEditDivisionId(null);
    setEditForm({ country_id: '', province_id: '', division_english: '', division_urdu: '', division_abb: '', is_active: true });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    let parsedValue = value;
    if (name === 'is_active') {
      parsedValue = value === 'true';
    }

    setEditForm(prev => {
      const updated = { ...prev, [name]: parsedValue };
      if (name === 'country_id') {
        updated.province_id = '';
      }
      return updated;
    });

    if (name === 'country_id') {
      if (editErrors.country_id) setEditErrors(prev => ({ ...prev, country_id: null }));
      if (editErrors.province_id) setEditErrors(prev => ({ ...prev, province_id: null }));
      fetchProvincesForEdit(value);
    } else {
      if (editErrors[name]) setEditErrors(prev => ({ ...prev, [name]: null }));
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
    if (!editForm.province_id) {
      errors.province_id = t('admin:valProvReq', 'Province is required.');
    }
    
    const engTrim = editForm.division_english.trim();
    if (!engTrim) {
      errors.division_english = t('admin:valEngReq', 'Division Name (English) is required.');
    } else if (engTrim.length > 255) {
      errors.division_english = t('admin:valEngMax255', 'Division Name (English) must not exceed 255 characters.');
    }

    const urduTrim = editForm.division_urdu.trim();
    if (urduTrim.length > 255) {
      errors.division_urdu = t('admin:valUrduMax255', 'Division Name (Urdu) must not exceed 255 characters.');
    }

    const abbTrim = editForm.division_abb.trim();
    if (abbTrim.length > 50) {
      errors.division_abb = t('admin:valAbbMax50', 'Abbreviation must not exceed 50 characters.');
    }

    if (typeof editForm.is_active !== 'boolean') {
      errors.is_active = t('admin:valStatusReq', 'Status is required.');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      province_id: editForm.province_id,
      division_english: engTrim,
      division_urdu: urduTrim ? urduTrim : null,
      division_abb: abbTrim ? abbTrim : null,
      is_active: editForm.is_active
    };

    try {
      setEditSubmitting(true);
      const res = await updateAdminDivision(editDivisionId, payload);
      
      if (res?.success) {
        setPageSuccess(t('admin:updateDivisionSuccess', 'Division updated successfully.'));
        closeEditModal();
        await fetchDivisions();
      }
    } catch (err) {
      const msg = err.message || t('admin:updateUnknownError', 'Unable to update division. Please try again.');
      
      if (err.status === 404 && msg.toLowerCase().includes('division')) {
        setEditApiError(t('admin:divisionNotFound', 'Division not found. The list has been refreshed.'));
        setTimeout(() => {
          closeEditModal();
          fetchDivisions();
        }, 1500);
      } else if (err.status === 404 && msg.toLowerCase().includes('province')) {
        setEditErrors({ province_id: t('admin:provinceNotFound', 'Province not found. Please select another province.') });
        setEditForm(prev => ({ ...prev, province_id: '' }));
        if (editForm.country_id) fetchProvincesForEdit(editForm.country_id);
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setEditErrors({ division_english: msg || t('admin:divisionExists', 'Division with this English name already exists in the selected province') });
      } else if (err.status === 400 && err.data?.errors) {
        setEditApiError(err.data.errors.join(', '));
      } else {
        setEditApiError(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Handlers ---
  const openDeleteModal = (row) => {
    setDeleteTarget(row);
    setDeleteError(null);
    setDeleteDependencies([]);
    setPageSuccess('');
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
    if (!deleteTarget || !deleteTarget.division_id) return;
    
    setDeleteError(null);
    setDeleteDependencies([]);
    setPageSuccess('');
    
    try {
      setDeleteSubmitting(true);
      const res = await deleteAdminDivision(deleteTarget.division_id);
      
      if (res?.success) {
        closeDeleteModal();
        setPageSuccess(t('admin:deleteDivisionSuccess', 'Division deleted successfully.'));
        await fetchDivisions();
      }
    } catch (err) {
      const msg = err.message || t('admin:deleteUnknownError', 'Unable to delete division. Please try again.');
      
      if (err.status === 404) {
        setDeleteError(t('admin:divisionNotFound', 'Division not found. The list has been refreshed.'));
        setTimeout(() => {
          closeDeleteModal();
          fetchDivisions();
        }, 2000);
      } else if (err.status === 409) {
        setDeleteError(msg || t('admin:deleteDivisionInUse', 'Division cannot be deleted because it is currently in use.'));
        if (err.data?.dependencies) {
          setDeleteDependencies(err.data.dependencies);
        }
      } else {
        setDeleteError(msg);
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colCountry', 'Country'),
    t('admin:colProvinceNameEn', 'Province'),
    t('admin:colDivisionNameEn', 'Division Name (English)'),
    t('admin:colDivisionNameUr', 'Division Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  const renderRow = (row, index) => (
    <tr key={row.division_id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 w-16">
        {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
        #{row.division_id}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[100px]">
        {row.country_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[120px]">
        {row.province_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[150px]">
        {row.division_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 font-urdu min-w-[120px]">
        {row.division_urdu || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[100px]">
        {row.division_abb || '-'}
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
            title={t('admin:edit', 'Edit')}
            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => openDeleteModal(row)}
            title={t('admin:delete', 'Delete')}
            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const extraFilters = (
    <>
      <select
        value={countryId}
        onChange={handleCountryChange}
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
      <select
        value={provinceId}
        onChange={(e) => {
          setProvinceId(e.target.value);
          setPage(1);
        }}
        disabled={provincesLoading || countriesLoading}
        className="block w-full sm:w-48 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">
          {provincesError 
            ? t('admin:errorLoadingProvinces', 'Unable to load provinces') 
            : (provincesLoading 
                ? t('admin:loadingProvinces', 'Loading provinces...') 
                : t('admin:allProvinces', 'All Provinces')
              )
          }
        </option>
        {provinces.map(p => (
          <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
        ))}
      </select>
    </>
  );

  return (
    <>
      {pageSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
          {pageSuccess}
        </div>
      )}
      <ReferenceTablePage
        title={t('admin:AdminDivisionsTitle', 'Divisions')}
        description={t('admin:AdminDivisionsDesc', 'Manage Divisions reference data.')}
        columns={columns}
        rows={divisions}
      
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
      
      status={status}
      showStatusFilter={true}
      onStatusChange={(v) => {
        setStatus(v);
        setPage(1);
      }}
      
      extraFilters={extraFilters}

      loading={loading}
      error={error}
      onReset={handleReset}
      onRetry={() => fetchDivisions(search, status, countryId, provinceId, page, limit)}
      
      onAdd={openAddModal}
      
      pagination={{
        page,
        limit,
        total,
        totalPages,
        onPageChange: (newPage) => setPage(newPage),
        onLimitChange: (newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }
      }}

      emptyMessage={
        (search || status !== 'all' || countryId || provinceId) 
          ? t('admin:noDivisionsMatch', 'No divisions match the selected filters.')
          : t('admin:noDivisionsFound', 'No divisions found.')
      }
      renderRow={renderRow}
    />
      {/* Add Division Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addDivisionTitle', 'Add Division')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:addDivisionDesc', 'Add a new division to the location reference data.')}</p>
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

                {/* Province Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvince', 'Province')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province_id"
                    value={createForm.province_id}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || !createForm.country_id || createProvincesLoading || !!createProvincesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.province_id 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                  >
                    <option value="">
                      {!createForm.country_id 
                        ? t('admin:selectProvince', 'Select Province')
                        : (createProvincesError 
                            ? t('admin:errorLoadingProvinces', 'Unable to load provinces') 
                            : (createProvincesLoading 
                                ? t('admin:loadingProvinces', 'Loading provinces...') 
                                : t('admin:selectProvince', 'Select Province')
                              )
                          )
                      }
                    </option>
                    {createProvinces.map(p => (
                      <option key={p.province_id} value={p.province_id}>
                        {p.province_english} {p.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {createErrors.province_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.province_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivisionNameEn', 'Division Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="division_english"
                    value={createForm.division_english}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.division_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. Lahore Division"
                  />
                  {createErrors.division_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.division_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivisionNameUr', 'Division Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="division_urdu"
                    value={createForm.division_urdu}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      createErrors.division_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="لاہور ڈویژن"
                  />
                  {createErrors.division_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.division_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="division_abb"
                    value={createForm.division_abb}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      createErrors.division_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. LHR"
                  />
                  {createErrors.division_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.division_abb}</p>
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
                  disabled={createSubmitting || countriesLoading || !!countriesError || createProvincesLoading || !!createProvincesError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:adding', 'Adding...')}
                    </>
                  ) : (
                    t('admin:addDivisionBtn', 'Add Division')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Division Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editDivisionTitle', 'Edit Division')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:editDivisionDesc', 'Update division details and status.')}</p>
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

                {/* Province Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colProvince', 'Province')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province_id"
                    value={editForm.province_id}
                    onChange={handleEditChange}
                    disabled={editSubmitting || !editForm.country_id || editProvincesLoading || !!editProvincesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.province_id 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                  >
                    <option value="">
                      {!editForm.country_id 
                        ? t('admin:selectProvince', 'Select Province')
                        : (editProvincesError 
                            ? t('admin:errorLoadingProvinces', 'Unable to load provinces') 
                            : (editProvincesLoading 
                                ? t('admin:loadingProvinces', 'Loading provinces...') 
                                : t('admin:selectProvince', 'Select Province')
                              )
                          )
                      }
                    </option>
                    {editProvinces.map(p => (
                      <option key={p.province_id} value={p.province_id}>
                        {p.province_english} {p.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {editErrors.province_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.province_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivisionNameEn', 'Division Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="division_english"
                    value={editForm.division_english}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.division_english 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. Lahore Division"
                  />
                  {editErrors.division_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.division_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivisionNameUr', 'Division Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="division_urdu"
                    value={editForm.division_urdu}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${
                      editErrors.division_urdu
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="لاہور ڈویژن"
                  />
                  {editErrors.division_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.division_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="division_abb"
                    value={editForm.division_abb}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.division_abb
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                    placeholder="e.g. LHR"
                  />
                  {editErrors.division_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.division_abb}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="is_active"
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${
                      editErrors.is_active
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                    }`}
                  >
                    <option value="true">{t('admin:statusActive', 'Active')}</option>
                    <option value="false">{t('admin:statusInactive', 'Inactive')}</option>
                  </select>
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
                  disabled={editSubmitting || countriesLoading || !!countriesError || editProvincesLoading || !!editProvincesError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:updating', 'Updating...')}
                    </>
                  ) : (
                    t('admin:updateDivisionBtn', 'Update Division')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Division Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteDivisionTitle', 'Delete Division')}</h3>
              <button 
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {deleteError ? (
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm font-medium text-red-800">
                    {deleteError}
                  </p>
                  
                  {deleteDependencies && deleteDependencies.length > 0 && (
                    <div className="mt-3 text-sm text-red-700">
                      <p className="font-bold mb-1">{t('admin:dependencies', 'Dependencies')}:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {deleteDependencies.map((dep, idx) => {
                          let label = dep.table;
                          if (dep.table === 'districts') label = t('admin:districts', 'Districts');
                          return (
                            <li key={idx}>
                              {label}: <span className="font-bold">{dep.count}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {t('admin:deleteDivisionConfirm', 'Are you sure you want to delete this division?')}
                  </p>
                  
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-0.5">{t('admin:colDivisionNameEn', 'Division Name (English)')}</span>
                      <span className="text-sm font-medium text-gray-900">{deleteTarget.division_english}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-0.5">{t('admin:colProvince', 'Province')}</span>
                      <span className="text-sm text-gray-700">{deleteTarget.province_english}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-0.5">{t('admin:colCountry', 'Country')}</span>
                      <span className="text-sm text-gray-700">{deleteTarget.country_english}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-red-600">
                    {t('admin:deleteUndone', 'This action cannot be undone.')}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              
              {!deleteDependencies?.length && !deleteError && (
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={deleteSubmitting}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {deleteSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:deleting', 'Deleting...')}
                    </>
                  ) : (
                    t('admin:deleteDivisionBtn', 'Delete Division')
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDivisions;
