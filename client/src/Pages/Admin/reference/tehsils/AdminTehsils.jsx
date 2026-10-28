import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import Dropdown from '../../../../Components/common/Dropdown';
import {
  getAdminTehsils,
  getAdminCountries,
  getAdminProvinces,
  getAdminDivisions,
  getAdminDistricts,
  createAdminTehsil,
  updateAdminTehsil,
  deleteAdminTehsil
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminTehsils = () => {
  const { t } = useTranslation(['admin']);

  // --- Tehsils State ---
  const [tehsils, setTehsils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Create Tehsil State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_english: '',
    tehsil_urdu: '',
    tehsil_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // --- Create Modal Hierarchy Dropdown State ---
  const [createProvinces, setCreateProvinces] = useState([]);
  const [createProvincesLoading, setCreateProvincesLoading] = useState(false);
  const [createProvincesError, setCreateProvincesError] = useState(null);

  const [createDivisions, setCreateDivisions] = useState([]);
  const [createDivisionsLoading, setCreateDivisionsLoading] = useState(false);
  const [createDivisionsError, setCreateDivisionsError] = useState(null);

  const [createDistricts, setCreateDistricts] = useState([]);
  const [createDistrictsLoading, setCreateDistrictsLoading] = useState(false);
  const [createDistrictsError, setCreateDistrictsError] = useState(null);


  // --- Edit Tehsil State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTehsilId, setEditTehsilId] = useState('');
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_english: '',
    tehsil_urdu: '',
    tehsil_abb: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- Edit Modal Hierarchy Dropdown State ---
  const [editProvinces, setEditProvinces] = useState([]);
  const [editProvincesLoading, setEditProvincesLoading] = useState(false);
  const [editProvincesError, setEditProvincesError] = useState(null);

  const [editDivisions, setEditDivisions] = useState([]);
  const [editDivisionsLoading, setEditDivisionsLoading] = useState(false);
  const [editDivisionsError, setEditDivisionsError] = useState(null);

  const [editDistricts, setEditDistricts] = useState([]);
  const [editDistrictsLoading, setEditDistrictsLoading] = useState(false);
  const [editDistrictsError, setEditDistrictsError] = useState(null);

  // --- Delete Tehsil State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [countryId, setCountryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');

  // --- Countries Dropdown State ---
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);

  // --- Provinces Dropdown State ---
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [provincesError, setProvincesError] = useState(null);

  // --- Divisions Dropdown State ---
  const [divisions, setDivisions] = useState([]);
  const [divisionsLoading, setDivisionsLoading] = useState(false);
  const [divisionsError, setDivisionsError] = useState(null);

  // --- Districts Dropdown State ---
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState(null);

  // --- Fetch Filter Dropdowns ---
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

  const fetchProvincesForFilter = async (currentCountryId) => {
    try {
      setProvincesLoading(true);
      setProvincesError(null);
      const params = { status: 'all' };
      if (currentCountryId) params.countryId = currentCountryId;
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

  const fetchDistrictsForFilter = async (currentCountryId, currentProvinceId, currentDivisionId) => {
    try {
      setDistrictsLoading(true);
      setDistrictsError(null);
      const params = { status: 'all', page: 1, limit: 10000 };
      if (currentCountryId) params.countryId = currentCountryId;
      if (currentProvinceId) params.provinceId = currentProvinceId;
      if (currentDivisionId) params.divisionId = currentDivisionId;
      const res = await getAdminDistricts(params);
      if (res?.success) {
        setDistricts(res.data || []);
      } else {
        setDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
      }
    } catch (err) {
      setDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
    } finally {
      setDistrictsLoading(false);
    }
  };

  // --- Debounce Search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // --- Create Handlers ---
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_english: '',
      tehsil_urdu: '',
      tehsil_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_english: '',
      tehsil_urdu: '',
      tehsil_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
  };

  const handleCreateCountryChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '' }));
    setCreateErrors(prev => ({ ...prev, country_id: undefined }));
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);

    if (val) {
      setCreateProvincesLoading(true);
      setCreateProvincesError(null);
      try {
        const res = await getAdminProvinces({ status: 'all', countryId: val });
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
    }
  };

  const handleCreateProvinceChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '' }));
    setCreateErrors(prev => ({ ...prev, province_id: undefined }));
    setCreateDivisions([]);
    setCreateDistricts([]);

    if (val) {
      setCreateDivisionsLoading(true);
      setCreateDivisionsError(null);
      try {
        const res = await getAdminDivisions({ status: 'all', countryId: createForm.country_id, provinceId: val });
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
    }
  };

  const handleCreateDivisionChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, division_id: val, district_id: '' }));
    setCreateErrors(prev => ({ ...prev, division_id: undefined }));
    setCreateDistricts([]);

    if (val) {
      setCreateDistrictsLoading(true);
      setCreateDistrictsError(null);
      try {
        const res = await getAdminDistricts({ status: 'all', countryId: createForm.country_id, provinceId: createForm.province_id, divisionId: val, page: 1, limit: 10000 });
        if (res?.success) {
          setCreateDistricts(res.data || []);
        } else {
          setCreateDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
        }
      } catch (err) {
        setCreateDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
      } finally {
        setCreateDistrictsLoading(false);
      }
    }
  };

  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateApiError(null);
    setSuccessMsg('');
    const newErrors = {};

    if (!createForm.country_id) newErrors.country_id = t('admin:requiredField', 'Required');
    if (!createForm.province_id) newErrors.province_id = t('admin:requiredField', 'Required');
    if (!createForm.division_id) newErrors.division_id = t('admin:requiredField', 'Required');
    if (!createForm.district_id) newErrors.district_id = t('admin:requiredField', 'Required');

    const english = createForm.tehsil_english.trim();
    if (!english) {
      newErrors.tehsil_english = t('admin:requiredField', 'Required');
    } else if (english.length > 100) {
      newErrors.tehsil_english = t('admin:maxLength100', 'Maximum 100 characters allowed');
    }

    const urdu = createForm.tehsil_urdu.trim();
    if (urdu.length > 100) {
      newErrors.tehsil_urdu = t('admin:maxLength100', 'Maximum 100 characters allowed');
    }

    const abb = createForm.tehsil_abb.trim();
    if (abb.length > 20) {
      newErrors.tehsil_abb = t('admin:maxLength20', 'Maximum 20 characters allowed');
    }

    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors);
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        district_id: createForm.district_id,
        tehsil_english: english,
        tehsil_urdu: urdu ? urdu : null,
        tehsil_abb: abb ? abb : null
      };
      const res = await createAdminTehsil(payload);
      if (res?.success) {
        handleCloseAddModal();
        setSuccessMsg(t('admin:tehsilCreatedSuccess', 'Tehsil created successfully'));
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchTehsils();
      } else {
        setCreateApiError(res?.message || t('admin:createTehsilError', 'Unable to create tehsil. Please try again.'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setCreateErrors({ tehsil_english: msg || t('admin:tehsilExistsError', 'Tehsil with this English name already exists in the selected district') });
      } else if (err?.response?.status === 404) {
        setCreateErrors({ district_id: t('admin:districtNotFoundError', 'District not found. Please select another district.') });
        setCreateForm(prev => ({ ...prev, district_id: '' }));
        // Silently reload districts so it updates cleanly
        handleCreateDivisionChange({ target: { value: createForm.division_id } });
      } else if (err?.response?.status === 400) {
        setCreateApiError(msg || t('admin:validationFailed', 'Validation failed'));
      } else {
        setCreateApiError(t('admin:createTehsilError', 'Unable to create tehsil. Please try again.'));
      }
    } finally {
      setCreateSubmitting(false);
    }
  };


  // --- Edit Handlers ---
  const handleOpenEditModal = async (row) => {
    setIsEditModalOpen(true);
    setEditTehsilId(String(row.tehsil_id));
    setEditForm({
      country_id: String(row.country_id || ''),
      province_id: String(row.province_id || ''),
      division_id: String(row.division_id || ''),
      district_id: String(row.district_id || ''),
      tehsil_english: row.tehsil_english || '',
      tehsil_urdu: row.tehsil_urdu || '',
      tehsil_abb: row.tehsil_abb || '',
      is_active: Boolean(row.is_active)
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);

    if (row.country_id) {
      setEditProvincesLoading(true);
      try {
        const res = await getAdminProvinces({ status: 'all', countryId: row.country_id });
        if (res?.success) setEditProvinces(res.data || []);
      } finally {
        setEditProvincesLoading(false);
      }
    }
    if (row.country_id && row.province_id) {
      setEditDivisionsLoading(true);
      try {
        const res = await getAdminDivisions({ status: 'all', countryId: row.country_id, provinceId: row.province_id });
        if (res?.success) setEditDivisions(res.data || []);
      } finally {
        setEditDivisionsLoading(false);
      }
    }
    if (row.country_id && row.province_id && row.division_id) {
      setEditDistrictsLoading(true);
      try {
        const res = await getAdminDistricts({ status: 'all', countryId: row.country_id, provinceId: row.province_id, divisionId: row.division_id, page: 1, limit: 10000 });
        if (res?.success) setEditDistricts(res.data || []);
      } finally {
        setEditDistrictsLoading(false);
      }
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditTehsilId('');
    setEditForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_english: '',
      tehsil_urdu: '',
      tehsil_abb: '',
      is_active: true
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
  };

  const handleEditCountryChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '' }));
    setEditErrors(prev => ({ ...prev, country_id: undefined }));
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);

    if (val) {
      setEditProvincesLoading(true);
      setEditProvincesError(null);
      try {
        const res = await getAdminProvinces({ status: 'all', countryId: val });
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
    }
  };

  const handleEditProvinceChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '' }));
    setEditErrors(prev => ({ ...prev, province_id: undefined }));
    setEditDivisions([]);
    setEditDistricts([]);

    if (val) {
      setEditDivisionsLoading(true);
      setEditDivisionsError(null);
      try {
        const res = await getAdminDivisions({ status: 'all', countryId: editForm.country_id, provinceId: val });
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
    }
  };

  const handleEditDivisionChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, division_id: val, district_id: '' }));
    setEditErrors(prev => ({ ...prev, division_id: undefined }));
    setEditDistricts([]);

    if (val) {
      setEditDistrictsLoading(true);
      setEditDistrictsError(null);
      try {
        const res = await getAdminDistricts({ status: 'all', countryId: editForm.country_id, provinceId: editForm.province_id, divisionId: val, page: 1, limit: 10000 });
        if (res?.success) {
          setEditDistricts(res.data || []);
        } else {
          setEditDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
        }
      } catch (err) {
        setEditDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
      } finally {
        setEditDistrictsLoading(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditApiError(null);
    setSuccessMsg('');
    const newErrors = {};

    if (!editForm.country_id) newErrors.country_id = t('admin:requiredField', 'Required');
    if (!editForm.province_id) newErrors.province_id = t('admin:requiredField', 'Required');
    if (!editForm.division_id) newErrors.division_id = t('admin:requiredField', 'Required');
    if (!editForm.district_id) newErrors.district_id = t('admin:requiredField', 'Required');

    const english = editForm.tehsil_english.trim();
    if (!english) {
      newErrors.tehsil_english = t('admin:requiredField', 'Required');
    } else if (english.length > 100) {
      newErrors.tehsil_english = t('admin:maxLength100', 'Maximum 100 characters allowed');
    }

    const urdu = editForm.tehsil_urdu.trim();
    if (urdu.length > 100) {
      newErrors.tehsil_urdu = t('admin:maxLength100', 'Maximum 100 characters allowed');
    }

    const abb = editForm.tehsil_abb.trim();
    if (abb.length > 20) {
      newErrors.tehsil_abb = t('admin:maxLength20', 'Maximum 20 characters allowed');
    }

    if (typeof editForm.is_active !== 'boolean') {
      newErrors.is_active = t('admin:requiredField', 'Required');
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        district_id: editForm.district_id,
        tehsil_english: english,
        tehsil_urdu: urdu ? urdu : null,
        tehsil_abb: abb ? abb : null,
        is_active: editForm.is_active
      };
      const res = await updateAdminTehsil(editTehsilId, payload);
      if (res?.success) {
        handleCloseEditModal();
        setSuccessMsg(t('admin:tehsilUpdatedSuccess', 'Tehsil updated successfully'));
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchTehsils();
      } else {
        setEditApiError(res?.message || t('admin:updateTehsilError', 'Unable to update tehsil. Please try again.'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setEditErrors({ tehsil_english: msg || t('admin:tehsilExistsError', 'Tehsil with this English name already exists in the selected district') });
      } else if (err?.response?.status === 404) {
        if (msg === 'Tehsil not found') {
          handleCloseEditModal();
          setSuccessMsg(t('admin:tehsilNotFoundError', 'Tehsil not found. The list has been refreshed.'));
          setTimeout(() => setSuccessMsg(''), 3000);
          await fetchTehsils();
        } else {
          setEditErrors({ district_id: t('admin:districtNotFoundError', 'District not found. Please select another district.') });
          setEditForm(prev => ({ ...prev, district_id: '' }));
          handleEditDivisionChange({ target: { value: editForm.division_id } });
        }
      } else if (err?.response?.status === 400) {
        setEditApiError(msg || t('admin:validationFailed', 'Validation failed'));
      } else {
        setEditApiError(t('admin:updateTehsilError', 'Unable to update tehsil. Please try again.'));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const handleOpenDeleteModal = (row) => {
    setDeleteTarget({
      tehsil_id: String(row.tehsil_id),
      tehsil_english: row.tehsil_english,
      district_english: row.district_english,
      division_english: row.division_english
    });
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    setDeleteError(null);
    setDeleteDependencies([]);
    setDeleteSubmitting(false);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget?.tehsil_id) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    setDeleteDependencies([]);

    try {
      const res = await deleteAdminTehsil(deleteTarget.tehsil_id);
      if (res?.success) {
        handleCloseDeleteModal();
        setSuccessMsg(t('admin:deleteTehsilSuccess', 'Tehsil deleted successfully.'));
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchTehsils();
      } else {
        setDeleteError(res?.message || t('admin:deleteUnknownError', 'Unable to delete tehsil. Please try again.'));
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setDeleteError(err.response.data.message || t('admin:deleteTehsilInUse', 'Tehsil cannot be deleted because it is currently in use.'));
        if (err.response.data.data?.dependencies) {
          setDeleteDependencies(err.response.data.data.dependencies);
        }
      } else if (err?.response?.status === 404) {
        handleCloseDeleteModal();
        setSuccessMsg(t('admin:tehsilNotFoundDelete', 'Tehsil not found. The list has been refreshed.'));
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchTehsils();
      } else {
        setDeleteError(t('admin:deleteUnknownError', 'Unable to delete tehsil. Please try again.'));
      }
    } finally {
      if (isDeleteModalOpen) {
        setDeleteSubmitting(false);
      }
    }
  };

  // --- Fetch Tehsils List ---
  const fetchTehsils = async (
    searchQuery = debouncedSearch,
    statusQuery = status,
    countryQuery = countryId,
    provinceQuery = provinceId,
    divisionQuery = divisionId,
    districtQuery = districtId,
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
      if (districtQuery) params.districtId = districtQuery;
      params.page = pageQuery;
      params.limit = limitQuery;

      const res = await getAdminTehsils(params);

      if (res?.success) {
        setTehsils(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);

          const currentPageNum = Number(pageQuery);
          const metaPageNum = Number(res.meta.page) || 1;
          const metaTotalPagesNum = Number(res.meta.totalPages) || 1;

          const validPage = Math.min(currentPageNum, Math.max(1, metaTotalPagesNum));
          if (validPage !== currentPageNum) {
            setPage(validPage);
          } else if (metaPageNum !== page) {
            setPage(metaPageNum);
          }

          if (Number(res.meta.limit) !== limit) {
            setLimit(Number(res.meta.limit) || 10);
          }
        }
      } else {
        setError(res?.message || t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchCountriesForFilter();
  }, []);

  // Sync Tehsils list on dependencies change
  useEffect(() => {
    fetchTehsils();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, countryId, provinceId, divisionId, districtId, page, limit]);

  // --- Filter Handlers ---
  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountryId(val);
    setProvinceId('');
    setDivisionId('');
    setDistrictId('');
    setProvinces([]);
    setDivisions([]);
    setDistricts([]);
    setPage(1);

    if (val) {
      fetchProvincesForFilter(val);
    }
  };

  const handleProvinceChange = (e) => {
    const val = e.target.value;
    setProvinceId(val);
    setDivisionId('');
    setDistrictId('');
    setDivisions([]);
    setDistricts([]);
    setPage(1);

    if (val) {
      fetchDivisionsForFilter(countryId, val);
    }
  };

  const handleDivisionChange = (e) => {
    const val = e.target.value;
    setDivisionId(val);
    setDistrictId('');
    setDistricts([]);
    setPage(1);

    if (val) {
      fetchDistrictsForFilter(countryId, provinceId, val);
    }
  };

  const handleDistrictChange = (e) => {
    setDistrictId(e.target.value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setCountryId('');
    setProvinceId('');
    setDivisionId('');
    setDistrictId('');
    setProvinces([]);
    setDivisions([]);
    setDistricts([]);
    setPage(1);
  };

  // --- Table Data Transformation ---
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colCountry', 'COUNTRY'),
    t('admin:colProvince', 'PROVINCE'),
    t('admin:colDivision', 'DIVISION'),
    t('admin:colDistrict', 'DISTRICT'),
    t('admin:colNameEn', 'TEHSIL NAME EN'),
    t('admin:colNameUr', 'TEHSIL NAME UR'),
    t('admin:colAbb', 'ABB'),
    t('admin:colStatus', 'STATUS')
  ];

  const renderRow = (row, index) => {
    const isActive = Boolean(row.is_active);
    return (
      <tr key={row.tehsil_id} className="group hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
          {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          #{row.tehsil_id}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[80px]">{row.country_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[100px]">{row.province_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.division_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.district_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.tehsil_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 font-urdu min-w-[100px]">{row.tehsil_urdu || '-'}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[80px]">{row.tehsil_abb || '-'}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
            {isActive ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
          </span>
        </td>
        <td className="sticky end-0 px-4 py-3 whitespace-nowrap text-end text-sm w-28 bg-white shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] group-hover:bg-gray-50/50 text-gray-900 font-semibold">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => handleOpenEditModal(row)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors hover:disabled:bg-blue-50" title={t('admin:edit', 'Edit')}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleOpenDeleteModal(row)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm transition-colors hover:disabled:bg-red-50" title={t('admin:delete', 'Delete')}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const extraFilters = (
    <>
      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={countryId}
          onChange={(val) => handleCountryChange({ target: { value: val } })}
          disabled={countriesLoading}
          placeholder={countriesLoading ? t('admin:loading', 'Loading...') : (countriesError || t('admin:allCountries', 'All Countries'))}
          options={[
            { value: '', label: countriesLoading ? t('admin:loading', 'Loading...') : (countriesError || t('admin:allCountries', 'All Countries')) },
            ...countries.map((c) => ({ value: c.country_id, label: c.country_english }))
          ]}
        />
      </div>

      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={provinceId}
          onChange={(val) => handleProvinceChange({ target: { value: val } })}
          disabled={!countryId || provincesLoading}
          placeholder={provincesLoading ? t('admin:loading', 'Loading...') : (provincesError || t('admin:allProvinces', 'All Provinces'))}
          options={[
            { value: '', label: provincesLoading ? t('admin:loading', 'Loading...') : (provincesError || t('admin:allProvinces', 'All Provinces')) },
            ...provinces.map((p) => ({ value: p.province_id, label: p.province_english }))
          ]}
        />
      </div>

      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={divisionId}
          onChange={(val) => handleDivisionChange({ target: { value: val } })}
          disabled={!provinceId || divisionsLoading}
          placeholder={divisionsLoading ? t('admin:loading', 'Loading...') : (divisionsError || t('admin:allDivisions', 'All Divisions'))}
          options={[
            { value: '', label: divisionsLoading ? t('admin:loading', 'Loading...') : (divisionsError || t('admin:allDivisions', 'All Divisions')) },
            ...divisions.map((d) => ({ value: d.division_id, label: d.division_english }))
          ]}
        />
      </div>

      <div className="w-full sm:w-40 shrink-0">
        <Dropdown
          value={districtId}
          onChange={(val) => handleDistrictChange({ target: { value: val } })}
          disabled={!divisionId || districtsLoading}
          placeholder={districtsLoading ? t('admin:loading', 'Loading...') : (districtsError || t('admin:allDistricts', 'All Districts'))}
          options={[
            { value: '', label: districtsLoading ? t('admin:loading', 'Loading...') : (districtsError || t('admin:allDistricts', 'All Districts')) },
            ...districts.map((d) => ({ value: d.district_id, label: d.district_english }))
          ]}
        />
      </div>
    </>
  );

  return (
    <>
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200 shadow-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <ReferenceTablePage
        title={t('admin:adminTehsilsTitle', 'Tehsils')}
        description={t('admin:adminTehsilsDesc', 'Manage tehsil reference data.')}
        columns={columns}
        rows={tehsils}
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
        onRetry={() => fetchTehsils(search, status, countryId, provinceId, divisionId, districtId, page, limit)}
        onAdd={handleOpenAddModal}
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
          (search || status !== 'all' || countryId || provinceId || divisionId || districtId)
            ? t('admin:noTehsilsMatch', 'No tehsils match the selected filters.')
            : t('admin:noTehsilsFound', 'No tehsils found.')
        }
        renderRow={renderRow}
      />

      {/* Create Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('admin:addTehsilTitle', 'Add Tehsil')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('admin:addTehsilDesc', 'Add a new tehsil reference record.')}</p>
              </div>
              <button
                onClick={handleCloseAddModal}
                disabled={createSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {createApiError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  {createApiError}
                </div>
              )}

              <form id="createTehsilForm" onSubmit={handleCreateSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.country_id}
                      onChange={handleCreateCountryChange}
                      disabled={createSubmitting || countriesLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.country_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{countriesLoading ? t('admin:loading', 'Loading...') : t('admin:selectCountry', 'Select Country')}</option>
                      {countries.map(c => (
                        <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
                      ))}
                    </select>
                    {createErrors.country_id && <p className="mt-1 text-sm text-red-600">{createErrors.country_id}</p>}
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colProvince', 'Province')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.province_id}
                      onChange={handleCreateProvinceChange}
                      disabled={createSubmitting || !createForm.country_id || createProvincesLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.province_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createProvincesLoading ? t('admin:loadingProvinces', 'Loading provinces...') : (createProvincesError || t('admin:selectProvince', 'Select Province'))}</option>
                      {createProvinces.map(p => (
                        <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
                      ))}
                    </select>
                    {createErrors.province_id && <p className="mt-1 text-sm text-red-600">{createErrors.province_id}</p>}
                  </div>

                  {/* Division */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colDivision', 'Division')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.division_id}
                      onChange={handleCreateDivisionChange}
                      disabled={createSubmitting || !createForm.province_id || createDivisionsLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.division_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createDivisionsLoading ? t('admin:loadingDivisions', 'Loading divisions...') : (createDivisionsError || t('admin:selectDivision', 'Select Division'))}</option>
                      {createDivisions.map(d => (
                        <option key={d.division_id} value={d.division_id}>{d.division_english}</option>
                      ))}
                    </select>
                    {createErrors.division_id && <p className="mt-1 text-sm text-red-600">{createErrors.division_id}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colDistrict', 'District')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.district_id}
                      onChange={(e) => {
                        setCreateForm(prev => ({ ...prev, district_id: e.target.value }));
                        setCreateErrors(prev => ({ ...prev, district_id: undefined }));
                      }}
                      disabled={createSubmitting || !createForm.division_id || createDistrictsLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.district_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createDistrictsLoading ? t('admin:loadingDistricts', 'Loading districts...') : (createDistrictsError || t('admin:selectDistrict', 'Select District'))}</option>
                      {createDistricts.map(d => (
                        <option key={d.district_id} value={d.district_id}>{d.district_english}</option>
                      ))}
                    </select>
                    {createErrors.district_id && <p className="mt-1 text-sm text-red-600">{createErrors.district_id}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colNameEn', 'Tehsil Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.tehsil_english}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, tehsil_english: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, tehsil_english: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.tehsil_english ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                    placeholder="Enter tehsil name in English"
                  />
                  {createErrors.tehsil_english && <p className="mt-1 text-sm text-red-600">{createErrors.tehsil_english}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colNameUr', 'Tehsil Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={createForm.tehsil_urdu}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, tehsil_urdu: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, tehsil_urdu: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.tehsil_urdu ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 font-urdu`}
                    placeholder="تحصیل کا نام درج کریں"
                  />
                  {createErrors.tehsil_urdu && <p className="mt-1 text-sm text-red-600">{createErrors.tehsil_urdu}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    value={createForm.tehsil_abb}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, tehsil_abb: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, tehsil_abb: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.tehsil_abb ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                    placeholder="e.g. THS"
                  />
                  {createErrors.tehsil_abb && <p className="mt-1 text-sm text-red-600">{createErrors.tehsil_abb}</p>}
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={createSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                form="createTehsilForm"
                disabled={createSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {createSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('admin:adding', 'Adding...')}
                  </>
                ) : (
                  t('admin:addTehsilTitle', 'Add Tehsil')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('admin:editTehsilTitle', 'Edit Tehsil')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('admin:editTehsilDesc', 'Update tehsil details and status.')}</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {editApiError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  {editApiError}
                </div>
              )}

              <form id="editTehsilForm" onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.country_id}
                      onChange={handleEditCountryChange}
                      disabled={editSubmitting || countriesLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.country_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{countriesLoading ? t('admin:loading', 'Loading...') : t('admin:selectCountry', 'Select Country')}</option>
                      {countries.map(c => (
                        <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
                      ))}
                    </select>
                    {editErrors.country_id && <p className="mt-1 text-sm text-red-600">{editErrors.country_id}</p>}
                  </div>

                  {/* Province */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colProvince', 'Province')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.province_id}
                      onChange={handleEditProvinceChange}
                      disabled={editSubmitting || !editForm.country_id || editProvincesLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.province_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{editProvincesLoading ? t('admin:loadingProvinces', 'Loading provinces...') : (editProvincesError || t('admin:selectProvince', 'Select Province'))}</option>
                      {editProvinces.map(p => (
                        <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
                      ))}
                    </select>
                    {editErrors.province_id && <p className="mt-1 text-sm text-red-600">{editErrors.province_id}</p>}
                  </div>

                  {/* Division */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colDivision', 'Division')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.division_id}
                      onChange={handleEditDivisionChange}
                      disabled={editSubmitting || !editForm.province_id || editDivisionsLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.division_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{editDivisionsLoading ? t('admin:loadingDivisions', 'Loading divisions...') : (editDivisionsError || t('admin:selectDivision', 'Select Division'))}</option>
                      {editDivisions.map(d => (
                        <option key={d.division_id} value={d.division_id}>{d.division_english}</option>
                      ))}
                    </select>
                    {editErrors.division_id && <p className="mt-1 text-sm text-red-600">{editErrors.division_id}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colDistrict', 'District')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.district_id}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, district_id: e.target.value }));
                        setEditErrors(prev => ({ ...prev, district_id: undefined }));
                      }}
                      disabled={editSubmitting || !editForm.division_id || editDistrictsLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.district_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{editDistrictsLoading ? t('admin:loadingDistricts', 'Loading districts...') : (editDistrictsError || t('admin:selectDistrict', 'Select District'))}</option>
                      {editDistricts.map(d => (
                        <option key={d.district_id} value={d.district_id}>{d.district_english}</option>
                      ))}
                    </select>
                    {editErrors.district_id && <p className="mt-1 text-sm text-red-600">{editErrors.district_id}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colNameEn', 'Tehsil Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.tehsil_english}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, tehsil_english: e.target.value }));
                      setEditErrors(prev => ({ ...prev, tehsil_english: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.tehsil_english ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                  />
                  {editErrors.tehsil_english && <p className="mt-1 text-sm text-red-600">{editErrors.tehsil_english}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colNameUr', 'Tehsil Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={editForm.tehsil_urdu}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, tehsil_urdu: e.target.value }));
                      setEditErrors(prev => ({ ...prev, tehsil_urdu: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.tehsil_urdu ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 font-urdu`}
                  />
                  {editErrors.tehsil_urdu && <p className="mt-1 text-sm text-red-600">{editErrors.tehsil_urdu}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    value={editForm.tehsil_abb}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, tehsil_abb: e.target.value }));
                      setEditErrors(prev => ({ ...prev, tehsil_abb: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.tehsil_abb ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                  />
                  {editErrors.tehsil_abb && <p className="mt-1 text-sm text-red-600">{editErrors.tehsil_abb}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, is_active: e.target.value === 'true' }));
                      setEditErrors(prev => ({ ...prev, is_active: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.is_active ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                  >
                    <option value="true">{t('admin:statusActive', 'Active')}</option>
                    <option value="false">{t('admin:statusInactive', 'Inactive')}</option>
                  </select>
                  {editErrors.is_active && <p className="mt-1 text-sm text-red-600">{editErrors.is_active}</p>}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                form="editTehsilForm"
                disabled={editSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {editSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('admin:updating', 'Updating...')}
                  </>
                ) : (
                  t('admin:updateTehsil', 'Update Tehsil')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('admin:deleteTehsilTitle', 'Delete Tehsil')}</h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">{deleteError}</p>
                  {deleteDependencies.length > 0 && (
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {deleteDependencies.map((dep, idx) => {
                        const labelMap = { cities: t('admin:cities', 'Cities') };
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <p className="font-semibold mb-1">{t('admin:deleteTehsilPrompt', 'Are you sure you want to delete this tehsil?')}</p>
                  <p>{t('admin:deleteTehsilWarning', 'This action permanently deletes the tehsil if it is not currently in use.')}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('admin:tehsilLabel', 'Tehsil')}:</span>
                  <span className="text-sm font-semibold text-gray-900">{deleteTarget.tehsil_english}</span>
                </div>
                {deleteTarget.district_english && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('admin:districtLabel', 'District')}:</span>
                    <span className="text-sm font-medium text-gray-900">{deleteTarget.district_english}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {deleteSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('admin:deleting', 'Deleting...')}
                  </>
                ) : (
                  t('admin:deleteTehsilBtn', 'Delete Tehsil')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTehsils;

