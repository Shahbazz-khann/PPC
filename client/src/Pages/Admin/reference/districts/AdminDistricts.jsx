import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import Dropdown from '../../../../Components/common/Dropdown';
import { getAdminDistricts, getAdminCountries, getAdminProvinces, getAdminDivisions, createAdminDistrict, updateAdminDistrict, deleteAdminDistrict } from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminDistricts = () => {
  const { t } = useTranslation(['admin']);

  // --- Districts State ---
  const [districts, setDistricts] = useState([]);
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
  const [divisionId, setDivisionId] = useState('');

  // --- Countries Dropdown State ---
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  // --- Provinces Dropdown State ---
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [provincesError, setProvincesError] = useState(null);

  // --- Divisions Dropdown State ---
  const [divisions, setDivisions] = useState([]);
  const [divisionsLoading, setDivisionsLoading] = useState(true);
  const [divisionsError, setDivisionsError] = useState(null);

  // --- Create Modal State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_english: '',
    district_urdu: '',
    district_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [pageSuccess, setPageSuccess] = useState('');

  // --- Create Modal Province Options ---
  const [createProvinces, setCreateProvinces] = useState([]);
  const [createProvincesLoading, setCreateProvincesLoading] = useState(false);
  const [createProvincesError, setCreateProvincesError] = useState(null);

  // --- Create Modal Division Options ---
  const [createDivisions, setCreateDivisions] = useState([]);
  const [createDivisionsLoading, setCreateDivisionsLoading] = useState(false);
  const [createDivisionsError, setCreateDivisionsError] = useState(null);

  // --- Edit Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDistrictId, setEditDistrictId] = useState('');
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_english: '',
    district_urdu: '',
    district_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [editProvinces, setEditProvinces] = useState([]);
  const [editProvincesLoading, setEditProvincesLoading] = useState(false);
  const [editProvincesError, setEditProvincesError] = useState(null);

  const [editDivisions, setEditDivisions] = useState([]);
  const [editDivisionsLoading, setEditDivisionsLoading] = useState(false);
  const [editDivisionsError, setEditDivisionsError] = useState(null);

  // --- Delete Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteDependencies, setDeleteDependencies] = useState([]);

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

  // Fetch divisions for the filter dropdown
  const fetchDivisionsForFilter = async (currentCountryId, currentProvinceId) => {
    try {
      setDivisionsLoading(true);
      setDivisionsError(null);
      const params = { status: 'all' };
      if (currentCountryId) params.countryId = currentCountryId;
      if (currentProvinceId) params.provinceId = currentProvinceId;
      const res = await getAdminDivisions(params);
      if (res?.success) {
        setDivisions(res.data || []);
      } else {
        setDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
      }
    } catch (err) {
      setDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
    } finally {
      setDivisionsLoading(false);
    }
  };

  // Fetch districts based on current filters
  const fetchDistricts = async (
    searchQuery = search,
    statusQuery = status,
    countryQuery = countryId,
    provinceQuery = provinceId,
    divisionQuery = divisionId,
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
      if (divisionQuery) params.divisionId = divisionQuery;
      params.page = pageQuery;
      params.limit = limitQuery;

      const res = await getAdminDistricts(params);

      if (res?.success) {
        setDistricts(res.data || []);
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

  // Fetch divisions dropdown when country/province changes
  useEffect(() => {
    fetchDivisionsForFilter(countryId, provinceId);
  }, [countryId, provinceId]);

  // Debounced load for districts
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDistricts(search, status, countryId, provinceId, divisionId, page, limit);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, countryId, provinceId, divisionId, page, limit]);

  const handleCountryChange = (e) => {
    setCountryId(e.target.value);
    setProvinceId(''); // Reset province when country changes
    setDivisionId(''); // Reset division when country changes
    setPage(1);
  };

  const handleProvinceChange = (e) => {
    setProvinceId(e.target.value);
    setDivisionId(''); // Reset division when province changes
    setPage(1);
  };

  const handleDivisionChange = (e) => {
    setDivisionId(e.target.value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setCountryId('');
    setProvinceId('');
    setDivisionId('');
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

  const fetchDivisionsForCreate = async (currentCountryId, currentProvinceId) => {
    if (!currentProvinceId) {
      setCreateDivisions([]);
      return;
    }
    try {
      setCreateDivisionsLoading(true);
      setCreateDivisionsError(null);
      const res = await getAdminDivisions({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId });
      if (res?.success) {
        setCreateDivisions(res.data || []);
      } else {
        setCreateDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
      }
    } catch (err) {
      setCreateDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
    } finally {
      setCreateDivisionsLoading(false);
    }
  };

  const openAddModal = () => {
    setCreateForm({ country_id: '', province_id: '', division_id: '', district_english: '', district_urdu: '', district_abb: '' });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
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
        updated.division_id = '';
      } else if (name === 'province_id') {
        updated.division_id = '';
      }
      return updated;
    });

    if (name === 'country_id') {
      if (createErrors.country_id) setCreateErrors(prev => ({ ...prev, country_id: null }));
      if (createErrors.province_id) setCreateErrors(prev => ({ ...prev, province_id: null }));
      if (createErrors.division_id) setCreateErrors(prev => ({ ...prev, division_id: null }));
      setCreateProvinces([]);
      setCreateDivisions([]);
      fetchProvincesForCreate(value);
    } else if (name === 'province_id') {
      if (createErrors.province_id) setCreateErrors(prev => ({ ...prev, province_id: null }));
      if (createErrors.division_id) setCreateErrors(prev => ({ ...prev, division_id: null }));
      setCreateDivisions([]);
      fetchDivisionsForCreate(createForm.country_id, value);
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
    if (!createForm.division_id) {
      errors.division_id = t('admin:valDivisionReq', 'Division is required.');
    }

    const engTrim = createForm.district_english.trim();
    if (!engTrim) {
      errors.district_english = t('admin:valEngReq', 'District Name (English) is required.');
    } else if (engTrim.length > 100) {
      errors.district_english = t('admin:valEngMax100', 'District Name (English) must not exceed 100 characters.');
    }

    const urduTrim = createForm.district_urdu.trim();
    if (urduTrim.length > 100) {
      errors.district_urdu = t('admin:valUrduMax100', 'District Name (Urdu) must not exceed 100 characters.');
    }

    const abbTrim = createForm.district_abb.trim();
    if (abbTrim.length > 20) {
      errors.district_abb = t('admin:valAbbMax20', 'Abbreviation must not exceed 20 characters.');
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    // Normalize Payload
    const payload = {
      division_id: createForm.division_id,
      district_english: engTrim,
      district_urdu: urduTrim ? urduTrim : null,
      district_abb: abbTrim ? abbTrim : null
    };

    try {
      setCreateSubmitting(true);
      const res = await createAdminDistrict(payload);

      if (res?.success) {
        setPageSuccess(t('admin:createDistrictSuccess', 'District created successfully.'));
        closeAddModal();
        setCreateForm({ country_id: '', province_id: '', division_id: '', district_english: '', district_urdu: '', district_abb: '' });
        setCreateErrors({});
        setCreateApiError(null);
        setCreateProvinces([]);
        setCreateDivisions([]);
        await fetchDistricts();
      }
    } catch (err) {
      const msg = err.message || t('admin:createUnknownError', 'Unable to create district. Please try again.');

      if (err.status === 404 && msg.toLowerCase().includes('division')) {
        setCreateErrors({ division_id: t('admin:divisionNotFoundForm', 'Division not found. Please select another division.') });
        setCreateForm(prev => ({ ...prev, division_id: '' }));
        if (createForm.country_id && createForm.province_id) fetchDivisionsForCreate(createForm.country_id, createForm.province_id);
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setCreateErrors({ district_english: msg || t('admin:districtExists', 'District with this English name already exists in the selected division') });
      } else if (err.status === 400 && err.data?.errors) {
        setCreateApiError(err.data.errors.join(', '));
      } else {
        setCreateApiError(msg);
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Modal Helpers ---
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

  const fetchDivisionsForEdit = async (currentCountryId, currentProvinceId) => {
    if (!currentCountryId || !currentProvinceId) {
      setEditDivisions([]);
      return;
    }
    try {
      setEditDivisionsLoading(true);
      setEditDivisionsError(null);
      const res = await getAdminDivisions({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId });
      if (res?.success) {
        setEditDivisions(res.data || []);
      } else {
        setEditDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
      }
    } catch (err) {
      setEditDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
    } finally {
      setEditDivisionsLoading(false);
    }
  };

  const openEditModal = (row) => {
    setEditDistrictId(String(row.district_id));
    setEditForm({
      country_id: String(row.country_id || ''),
      province_id: String(row.province_id || ''),
      division_id: String(row.division_id || ''),
      district_english: row.district_english || '',
      district_urdu: row.district_urdu || '',
      district_abb: row.district_abb || '',
      is_active: row.is_active
    });
    setEditErrors({});
    setEditApiError(null);
    setIsEditModalOpen(true);

    if (row.country_id) {
      fetchProvincesForEdit(row.country_id);
    }
    if (row.country_id && row.province_id) {
      fetchDivisionsForEdit(row.country_id, row.province_id);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditDistrictId('');
    setEditForm({ country_id: '', province_id: '', division_id: '', district_english: '', district_urdu: '', district_abb: '', is_active: true });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
  };

  const handleEditCountryChange = (e) => {
    const selectedCountryId = e.target.value;
    setEditForm(prev => ({
      ...prev,
      country_id: selectedCountryId,
      province_id: '',
      division_id: ''
    }));
    setEditProvinces([]);
    setEditDivisions([]);
    setEditErrors(prev => ({ ...prev, country_id: '', province_id: '', division_id: '' }));

    if (selectedCountryId) {
      fetchProvincesForEdit(selectedCountryId);
    }
  };

  const handleEditProvinceChange = (e) => {
    const selectedProvinceId = e.target.value;
    setEditForm(prev => ({
      ...prev,
      province_id: selectedProvinceId,
      division_id: ''
    }));
    setEditDivisions([]);
    setEditErrors(prev => ({ ...prev, province_id: '', division_id: '' }));

    if (editForm.country_id && selectedProvinceId) {
      fetchDivisionsForEdit(editForm.country_id, selectedProvinceId);
    }
  };

  const handleEditDivisionChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, division_id: val }));
    if (val) {
      setEditErrors(prev => ({ ...prev, division_id: '' }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'is_active') {
      setEditForm(prev => ({ ...prev, is_active: value === 'true' }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }

    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!editForm.country_id) errors.country_id = t('admin:countryRequired', 'Country is required');
    if (!editForm.province_id) errors.province_id = t('admin:provinceRequired', 'Province is required');
    if (!editForm.division_id) errors.division_id = t('admin:divisionRequired', 'Division is required');

    const eng = editForm.district_english.trim();
    if (!eng) {
      errors.district_english = t('admin:districtEnRequired', 'District Name (English) is required');
    } else if (eng.length > 100) {
      errors.district_english = t('admin:districtEnMax', 'Must be 100 characters or less');
    }

    const urdu = editForm.district_urdu.trim();
    if (urdu.length > 100) {
      errors.district_urdu = t('admin:districtUrMax', 'Must be 100 characters or less');
    }

    const abb = editForm.district_abb.trim();
    if (abb.length > 20) {
      errors.district_abb = t('admin:districtAbbMax', 'Must be 20 characters or less');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditSubmitting(true);
    setEditApiError(null);

    try {
      const payload = {
        division_id: editForm.division_id,
        district_english: eng,
        district_urdu: urdu || null,
        district_abb: abb || null,
        is_active: editForm.is_active
      };

      const res = await updateAdminDistrict(editDistrictId, payload);
      if (res?.success) {
        setPageSuccess(t('admin:districtUpdated', 'District updated successfully.'));
        closeEditModal();
        await fetchDistricts();
      }
    } catch (err) {
      const msg = err.message || t('admin:updateUnknownError', 'Unable to update district. Please try again.');

      if (err.status === 404 && msg.toLowerCase().includes('district')) {
        setPageSuccess('');
        setEditApiError(t('admin:districtNotFoundFlow', 'District not found. The list has been refreshed.'));
        closeEditModal();
        await fetchDistricts();
      } else if (err.status === 404 && msg.toLowerCase().includes('division')) {
        setEditErrors({ division_id: t('admin:divisionNotFoundForm', 'Division not found. Please select another division.') });
        setEditForm(prev => ({ ...prev, division_id: '' }));
        if (editForm.country_id && editForm.province_id) fetchDivisionsForEdit(editForm.country_id, editForm.province_id);
      } else if (err.status === 409 || msg.toLowerCase().includes('english') || msg.toLowerCase().includes('exists')) {
        setEditErrors({ district_english: msg || t('admin:districtExists', 'District with this English name already exists in the selected division') });
      } else if (err.status === 400 && err.data?.errors) {
        setEditApiError(err.data.errors.join(', '));
      } else {
        setEditApiError(msg);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteModal = (row) => {
    setDeleteTarget({
      district_id: String(row.district_id),
      district_english: row.district_english,
      division_english: row.division_english
    });
    setDeleteError('');
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError('');
    setDeleteDependencies([]);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget || !deleteTarget.district_id) return;

    setDeleteSubmitting(true);
    setDeleteError('');
    setDeleteDependencies([]);

    try {
      const res = await deleteAdminDistrict(deleteTarget.district_id);

      if (res?.success) {
        setPageSuccess(t('admin:deleteDistrictSuccess', 'District deleted successfully.'));
        closeDeleteModal();
        await fetchDistricts();
      } else {
        setDeleteError(res?.message || t('admin:deleteDistrictUnknownError', 'Unable to delete district. Please try again.'));
      }
    } catch (err) {
      if (err.status === 404) {
        setPageSuccess('');
        setError(t('admin:districtNotFoundFlow', 'District not found. The list has been refreshed.'));
        closeDeleteModal();
        await fetchDistricts();
      } else if (err.status === 409) {
        setDeleteError(err.message || t('admin:deleteDistrictConflict', 'District cannot be deleted because it is currently in use.'));
        if (err.data && Array.isArray(err.data.dependencies)) {
          setDeleteDependencies(err.data.dependencies);
        }
      } else {
        setDeleteError(err.message || t('admin:deleteDistrictUnknownError', 'Unable to delete district. Please try again.'));
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colCountry', 'Country'),
    t('admin:colProvince', 'Province'),
    t('admin:colDivision', 'Division'),
    t('admin:colDistrictNameEn', 'District Name (English)'),
    t('admin:colDistrictNameUr', 'District Name (Urdu)'),
    t('admin:colAbb', 'Abbreviation'),
    t('admin:colStatus', 'Status')
  ];

  const renderRow = (row, index) => (
    <tr key={row.district_id} className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap text-sm w-16 text-gray-900 font-semibold">
        {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
        #{row.district_id}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[80px] text-gray-900 font-semibold">
        {row.country_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[100px] text-gray-900 font-semibold">
        {row.province_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[120px] text-gray-900 font-semibold">
        {row.division_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[120px] text-gray-900 font-semibold">
        {row.district_english}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 font-urdu min-w-[100px] text-gray-900 font-semibold">
        {row.district_urdu || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 min-w-[80px] text-gray-900 font-semibold">
        {row.district_abb || '-'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${row.is_active
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${row.is_active ? 'bg-green-600' : 'bg-red-600'}`}></span>
          {row.is_active ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-end text-sm font-semibold w-24 text-gray-900">
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
      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={countryId}
          onChange={(val) => handleCountryChange({ target: { value: val } })}
          disabled={countriesLoading}
          placeholder={
            countriesError
              ? t('admin:errorLoadingCountries', 'Unable to load countries')
              : countriesLoading
              ? t('admin:loadingCountries', 'Loading countries...')
              : t('admin:allCountries', 'All Countries')
          }
          options={[
            {
              value: '',
              label: countriesError
                ? t('admin:errorLoadingCountries', 'Unable to load countries')
                : countriesLoading
                ? t('admin:loadingCountries', 'Loading countries...')
                : t('admin:allCountries', 'All Countries')
            },
            ...countries.map((c) => ({ value: c.country_id, label: c.country_english }))
          ]}
        />
      </div>

      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={provinceId}
          onChange={(val) => handleProvinceChange({ target: { value: val } })}
          disabled={provincesLoading || countriesLoading}
          placeholder={
            provincesError
              ? t('admin:errorLoadingProvinces', 'Unable to load provinces')
              : provincesLoading
              ? t('admin:loadingProvinces', 'Loading provinces...')
              : t('admin:allProvinces', 'All Provinces')
          }
          options={[
            {
              value: '',
              label: provincesError
                ? t('admin:errorLoadingProvinces', 'Unable to load provinces')
                : provincesLoading
                ? t('admin:loadingProvinces', 'Loading provinces...')
                : t('admin:allProvinces', 'All Provinces')
            },
            ...provinces.map((p) => ({ value: p.province_id, label: p.province_english }))
          ]}
        />
      </div>

      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={divisionId}
          onChange={(val) => handleDivisionChange({ target: { value: val } })}
          disabled={divisionsLoading || provincesLoading || countriesLoading}
          placeholder={
            divisionsError
              ? t('admin:errorLoadingDivisions', 'Unable to load divisions')
              : divisionsLoading
              ? t('admin:loadingDivisions', 'Loading divisions...')
              : t('admin:allDivisions', 'All Divisions')
          }
          options={[
            {
              value: '',
              label: divisionsError
                ? t('admin:errorLoadingDivisions', 'Unable to load divisions')
                : divisionsLoading
                ? t('admin:loadingDivisions', 'Loading divisions...')
                : t('admin:allDivisions', 'All Divisions')
            },
            ...divisions.map((d) => ({ value: d.division_id, label: d.division_english }))
          ]}
        />
      </div>
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
        title={t('admin:AdminDistrictsTitle', 'Districts')}
        description={t('admin:AdminDistrictsDesc', 'Manage district reference data.')}
        columns={columns}
        rows={districts}

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
        onRetry={() => fetchDistricts(search, status, countryId, provinceId, divisionId, page, limit)}
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
          (search || status !== 'all' || countryId || provinceId || divisionId)
            ? t('admin:noDistrictsMatch', 'No districts match the selected filters.')
            : t('admin:noDistrictsFound', 'No districts found.')
        }
        renderRow={renderRow}
      />
      {/* Add District Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addDistrictTitle', 'Add District')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:addDistrictDesc', 'Add a new district to the location reference data.')}</p>
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
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.country_id
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
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.province_id
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

                {/* Division Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivision', 'Division')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="division_id"
                    value={createForm.division_id}
                    onChange={handleCreateChange}
                    disabled={createSubmitting || !createForm.province_id || createDivisionsLoading || !!createDivisionsError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.division_id
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                  >
                    <option value="">
                      {!createForm.province_id
                        ? t('admin:selectDivision', 'Select Division')
                        : (createDivisionsError
                          ? t('admin:errorLoadingDivisions', 'Unable to load divisions')
                          : (createDivisionsLoading
                            ? t('admin:loadingDivisions', 'Loading divisions...')
                            : t('admin:selectDivision', 'Select Division')
                          )
                        )
                      }
                    </option>
                    {createDivisions.map(d => (
                      <option key={d.division_id} value={d.division_id}>
                        {d.division_english} {d.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {createErrors.division_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.division_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDistrictNameEn', 'District Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district_english"
                    value={createForm.district_english}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.district_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. Lahore District"
                  />
                  {createErrors.district_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.district_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDistrictNameUr', 'District Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="district_urdu"
                    value={createForm.district_urdu}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${createErrors.district_urdu
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="ضلع لاہور"
                  />
                  {createErrors.district_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.district_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="district_abb"
                    value={createForm.district_abb}
                    onChange={handleCreateChange}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${createErrors.district_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. LHR"
                  />
                  {createErrors.district_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{createErrors.district_abb}</p>
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
                  disabled={createSubmitting || countriesLoading || !!countriesError || createProvincesLoading || !!createProvincesError || createDivisionsLoading || !!createDivisionsError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {createSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:adding', 'Adding...')}
                    </>
                  ) : (
                    t('admin:addDistrictBtn', 'Add District')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit District Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editDistrictTitle', 'Edit District')}</h3>
                <p className="text-xs text-gray-500 mt-1">{t('admin:editDistrictDesc', 'Update district details and status.')}</p>
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
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-5">
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
                    onChange={handleEditCountryChange}
                    disabled={editSubmitting || countriesLoading || !!countriesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.country_id
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
                    onChange={handleEditProvinceChange}
                    disabled={editSubmitting || !editForm.country_id || editProvincesLoading || !!editProvincesError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.province_id
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

                {/* Division Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDivision', 'Division')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="division_id"
                    value={editForm.division_id}
                    onChange={handleEditDivisionChange}
                    disabled={editSubmitting || !editForm.province_id || editDivisionsLoading || !!editDivisionsError}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.division_id
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                  >
                    <option value="">
                      {!editForm.province_id
                        ? t('admin:selectDivision', 'Select Division')
                        : (editDivisionsError
                          ? t('admin:errorLoadingDivisions', 'Unable to load divisions')
                          : (editDivisionsLoading
                            ? t('admin:loadingDivisions', 'Loading divisions...')
                            : t('admin:selectDivision', 'Select Division')
                          )
                        )
                      }
                    </option>
                    {editDivisions.map(d => (
                      <option key={d.division_id} value={d.division_id}>
                        {d.division_english} {d.is_active === false && `(${t('admin:inactive', 'Inactive')})`}
                      </option>
                    ))}
                  </select>
                  {editErrors.division_id && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.division_id}</p>
                  )}
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDistrictNameEn', 'District Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district_english"
                    value={editForm.district_english}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.district_english
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. Lahore District"
                  />
                  {editErrors.district_english && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.district_english}</p>
                  )}
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colDistrictNameUr', 'District Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    name="district_urdu"
                    value={editForm.district_urdu}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    dir="auto"
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors font-urdu ${editErrors.district_urdu
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="ضلع لاہور"
                  />
                  {editErrors.district_urdu && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.district_urdu}</p>
                  )}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    name="district_abb"
                    value={editForm.district_abb}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.district_abb
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'
                      }`}
                    placeholder="e.g. LHR"
                  />
                  {editErrors.district_abb && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{editErrors.district_abb}</p>
                  )}
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="is_active"
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={handleEditChange}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 border rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 sm:text-sm transition-colors ${editErrors.is_active
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
                  disabled={editSubmitting || countriesLoading || !!countriesError || editProvincesLoading || !!editProvincesError || editDivisionsLoading || !!editDivisionsError}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white bg-[#C59B27] hover:bg-[#b08920] rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {editSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                      {t('admin:updating', 'Updating...')}
                    </>
                  ) : (
                    t('admin:updateDistrictBtn', 'Update District')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete District Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteDistrictTitle', 'Delete District')}</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-medium">{deleteError}</p>
                  {deleteDependencies.length > 0 && (
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {deleteDependencies.map((dep, idx) => {
                        const labelMap = { tehsils: t('admin:tehsils', 'Tehsils') };
                        const label = labelMap[dep.table] || dep.table;
                        return (
                          <li key={idx}>
                            {label}: {dep.count}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                  <p className="font-bold mb-1">{t('admin:deleteDistrictPrompt', 'Are you sure you want to delete this district?')}</p>
                  <p>{t('admin:deleteDistrictWarning', 'This action permanently deletes the district if it is not currently in use.')}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('admin:districtLabel', 'District')}:</span>
                  <span className="text-sm font-bold text-gray-900">{deleteTarget.district_english}</span>
                </div>
                {deleteTarget.division_english && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('admin:divisionLabel', 'Division')}:</span>
                    <span className="text-sm font-semibold text-gray-900">{deleteTarget.division_english}</span>
                  </div>
                )}
              </div>
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
                  t('admin:deleteDistrictBtn', 'Delete District')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDistricts;

