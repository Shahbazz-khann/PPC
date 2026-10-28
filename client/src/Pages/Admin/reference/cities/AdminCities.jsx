import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import {
  getAdminCities,
  getAdminCountries,
  getAdminProvinces,
  getAdminDivisions,
  getAdminDistricts,
  getAdminTehsils,
  createAdminCity,
  updateAdminCity,
  deleteAdminCity
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminCities = () => {
  const { t } = useTranslation(['admin']);

  // --- Cities State ---
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [countryId, setCountryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [tehsilId, setTehsilId] = useState('');

  // --- Create City State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_id: '',
    city_english: '',
    city_urdu: '',
    city_abb: ''
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

  const [createTehsils, setCreateTehsils] = useState([]);
  const [createTehsilsLoading, setCreateTehsilsLoading] = useState(false);
  const [createTehsilsError, setCreateTehsilsError] = useState(null);

  // --- Edit City State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCityId, setEditCityId] = useState(null);
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_id: '',
    city_english: '',
    city_urdu: '',
    city_abb: '',
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

  const [editTehsils, setEditTehsils] = useState([]);
  const [editTehsilsLoading, setEditTehsilsLoading] = useState(false);
  const [editTehsilsError, setEditTehsilsError] = useState(null);

  // --- Delete City State ---
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

  // --- Tehsils Dropdown State ---
  const [tehsils, setTehsils] = useState([]);
  const [tehsilsLoading, setTehsilsLoading] = useState(false);
  const [tehsilsError, setTehsilsError] = useState(null);

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

  const fetchTehsilsForFilter = async (currentCountryId, currentProvinceId, currentDivisionId, currentDistrictId) => {
    try {
      setTehsilsLoading(true);
      setTehsilsError(null);
      const params = { status: 'all', page: 1, limit: 10000 };
      if (currentCountryId) params.countryId = currentCountryId;
      if (currentProvinceId) params.provinceId = currentProvinceId;
      if (currentDivisionId) params.divisionId = currentDivisionId;
      if (currentDistrictId) params.districtId = currentDistrictId;
      const res = await getAdminTehsils(params);
      if (res?.success) {
        setTehsils(res.data || []);
      } else {
        setTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
      }
    } catch (err) {
      setTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } finally {
      setTehsilsLoading(false);
    }
  };

  // --- Fetch Create Modal Dropdowns ---
  const fetchProvincesForCreate = async (currentCountryId) => {
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

  const fetchDistrictsForCreate = async (currentCountryId, currentProvinceId, currentDivisionId) => {
    try {
      setCreateDistrictsLoading(true);
      setCreateDistrictsError(null);
      const res = await getAdminDistricts({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId, divisionId: currentDivisionId, page: 1, limit: 10000 });
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
  };

  const fetchTehsilsForCreate = async (currentCountryId, currentProvinceId, currentDivisionId, currentDistrictId) => {
    try {
      setCreateTehsilsLoading(true);
      setCreateTehsilsError(null);
      const res = await getAdminTehsils({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId, divisionId: currentDivisionId, districtId: currentDistrictId, page: 1, limit: 10000 });
      if (res?.success) {
        setCreateTehsils(res.data || []);
      } else {
        setCreateTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
      }
    } catch (err) {
      setCreateTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } finally {
      setCreateTehsilsLoading(false);
    }
  };

  // --- Fetch Edit Modal Dropdowns ---
  const fetchProvincesForEdit = async (currentCountryId) => {
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

  const fetchDistrictsForEdit = async (currentCountryId, currentProvinceId, currentDivisionId) => {
    try {
      setEditDistrictsLoading(true);
      setEditDistrictsError(null);
      const res = await getAdminDistricts({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId, divisionId: currentDivisionId, page: 1, limit: 10000 });
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
  };

  const fetchTehsilsForEdit = async (currentCountryId, currentProvinceId, currentDivisionId, currentDistrictId) => {
    try {
      setEditTehsilsLoading(true);
      setEditTehsilsError(null);
      const res = await getAdminTehsils({ status: 'all', countryId: currentCountryId, provinceId: currentProvinceId, divisionId: currentDivisionId, districtId: currentDistrictId, page: 1, limit: 10000 });
      if (res?.success) {
        setEditTehsils(res.data || []);
      } else {
        setEditTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
      }
    } catch (err) {
      setEditTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } finally {
      setEditTehsilsLoading(false);
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

  // --- Fetch Cities ---
  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (status !== 'all') params.status = status;
      if (countryId) params.countryId = countryId;
      if (provinceId) params.provinceId = provinceId;
      if (divisionId) params.divisionId = divisionId;
      if (districtId) params.districtId = districtId;
      if (tehsilId) params.tehsilId = tehsilId;
      params.page = page;
      params.limit = limit;

      const res = await getAdminCities(params);

      if (res?.success) {
        setCities(res.data || []);
        if (res.meta) {
          setTotal(res.meta.total);
          setTotalPages(res.meta.totalPages);

          const currentPageNum = Number(page);
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
        setError(res?.message || t('admin:errorLoadingCities', 'Unable to load cities'));
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('admin:errorLoadingCities', 'Unable to load cities'));
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchCountriesForFilter();
  }, []);

  // Sync Cities list on dependencies change
  useEffect(() => {
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, countryId, provinceId, divisionId, districtId, tehsilId, page, limit]);

  // --- Create Handlers ---
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_english: '',
      city_urdu: '',
      city_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_english: '',
      city_urdu: '',
      city_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
  };

  const handleCreateCountryChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '', tehsil_id: '' }));
    setCreateErrors(prev => ({ ...prev, country_id: '' }));
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    if (val) {
      fetchProvincesForCreate(val);
    }
  };

  const handleCreateProvinceChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '', tehsil_id: '' }));
    setCreateErrors(prev => ({ ...prev, province_id: '' }));
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    if (val) {
      fetchDivisionsForCreate(createForm.country_id, val);
    }
  };

  const handleCreateDivisionChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, division_id: val, district_id: '', tehsil_id: '' }));
    setCreateErrors(prev => ({ ...prev, division_id: '' }));
    setCreateDistricts([]);
    setCreateTehsils([]);
    if (val) {
      fetchDistrictsForCreate(createForm.country_id, createForm.province_id, val);
    }
  };

  const handleCreateDistrictChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, district_id: val, tehsil_id: '' }));
    setCreateErrors(prev => ({ ...prev, district_id: '' }));
    setCreateTehsils([]);
    if (val) {
      fetchTehsilsForCreate(createForm.country_id, createForm.province_id, createForm.division_id, val);
    }
  };

  const handleCreateTehsilChange = (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, tehsil_id: val }));
    setCreateErrors(prev => ({ ...prev, tehsil_id: '' }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateErrors({});
    setCreateApiError(null);

    const newErrors = {};
    if (!createForm.country_id) newErrors.country_id = t('admin:requiredCountry', 'Country is required');
    if (!createForm.province_id) newErrors.province_id = t('admin:requiredProvince', 'Province is required');
    if (!createForm.division_id) newErrors.division_id = t('admin:requiredDivision', 'Division is required');
    if (!createForm.district_id) newErrors.district_id = t('admin:requiredDistrict', 'District is required');
    if (!createForm.tehsil_id) newErrors.tehsil_id = t('admin:requiredTehsil', 'Tehsil is required');

    const english = (createForm.city_english || '').trim();
    if (!english) {
      newErrors.city_english = t('admin:requiredCityEnglish', 'City Name (English) is required');
    } else if (english.length > 100) {
      newErrors.city_english = t('admin:maxCityEnglish', 'City Name (English) must not exceed 100 characters');
    }

    const urdu = (createForm.city_urdu || '').trim();
    if (urdu && urdu.length > 100) {
      newErrors.city_urdu = t('admin:maxCityUrdu', 'City Name (Urdu) must not exceed 100 characters');
    }

    const abb = (createForm.city_abb || '').trim();
    if (abb && abb.length > 20) {
      newErrors.city_abb = t('admin:maxCityAbb', 'Abbreviation must not exceed 20 characters');
    }

    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors);
      return;
    }

    const payload = {
      tehsil_id: createForm.tehsil_id,
      city_english: english,
      city_urdu: urdu ? urdu : null,
      city_abb: abb ? abb : null
    };

    setCreateSubmitting(true);
    try {
      const res = await createAdminCity(payload);
      if (res?.success) {
        handleCloseAddModal();
        setSuccessMsg(res?.message || t('admin:cityCreatedSuccess', 'City created successfully'));
        await fetchCities();
      } else {
        if (res?.message?.toLowerCase().includes('already exists')) {
          setCreateErrors(prev => ({ ...prev, city_english: t('admin:cityEnglishDuplicate', 'City with this English name already exists in the selected tehsil') }));
        } else if (res?.message?.toLowerCase().includes('not found')) {
          setCreateErrors(prev => ({ ...prev, tehsil_id: t('admin:tehsilNotFound', 'Tehsil not found. Please select another tehsil.') }));
          // Clear current tehsil selection and refresh tehsils
          setCreateForm(prev => ({ ...prev, tehsil_id: '' }));
          fetchTehsilsForCreate(createForm.country_id, createForm.province_id, createForm.division_id, createForm.district_id);
        } else {
          setCreateApiError(res?.message || t('admin:errorCreatingCity', 'Unable to create city. Please try again.'));
        }
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message?.toLowerCase() || '';
      if (errMsg.includes('already exists')) {
        setCreateErrors(prev => ({ ...prev, city_english: t('admin:cityEnglishDuplicate', 'City with this English name already exists in the selected tehsil') }));
      } else if (errMsg.includes('not found')) {
        setCreateErrors(prev => ({ ...prev, tehsil_id: t('admin:tehsilNotFound', 'Tehsil not found. Please select another tehsil.') }));
        setCreateForm(prev => ({ ...prev, tehsil_id: '' }));
        fetchTehsilsForCreate(createForm.country_id, createForm.province_id, createForm.division_id, createForm.district_id);
      } else {
        setCreateApiError(err?.response?.data?.message || t('admin:errorCreatingCity', 'Unable to create city. Please try again.'));
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Edit Handlers ---
  const handleOpenEditModal = (row) => {
    setEditCityId(String(row.city_id));
    setEditForm({
      country_id: String(row.country_id),
      province_id: String(row.province_id),
      division_id: String(row.division_id),
      district_id: String(row.district_id),
      tehsil_id: String(row.tehsil_id),
      city_english: row.city_english ?? '',
      city_urdu: row.city_urdu ?? '',
      city_abb: row.city_abb ?? '',
      is_active: Boolean(row.is_active)
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);

    fetchProvincesForEdit(String(row.country_id));
    fetchDivisionsForEdit(String(row.country_id), String(row.province_id));
    fetchDistrictsForEdit(String(row.country_id), String(row.province_id), String(row.division_id));
    fetchTehsilsForEdit(String(row.country_id), String(row.province_id), String(row.division_id), String(row.district_id));

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditCityId(null);
    setEditForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_english: '',
      city_urdu: '',
      city_abb: '',
      is_active: true
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
  };

  const handleEditCountryChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '', tehsil_id: '' }));
    setEditErrors(prev => ({ ...prev, country_id: '' }));
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    if (val) {
      fetchProvincesForEdit(val);
    }
  };

  const handleEditProvinceChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '', tehsil_id: '' }));
    setEditErrors(prev => ({ ...prev, province_id: '' }));
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    if (val) {
      fetchDivisionsForEdit(editForm.country_id, val);
    }
  };

  const handleEditDivisionChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, division_id: val, district_id: '', tehsil_id: '' }));
    setEditErrors(prev => ({ ...prev, division_id: '' }));
    setEditDistricts([]);
    setEditTehsils([]);
    if (val) {
      fetchDistrictsForEdit(editForm.country_id, editForm.province_id, val);
    }
  };

  const handleEditDistrictChange = async (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, district_id: val, tehsil_id: '' }));
    setEditErrors(prev => ({ ...prev, district_id: '' }));
    setEditTehsils([]);
    if (val) {
      fetchTehsilsForEdit(editForm.country_id, editForm.province_id, editForm.division_id, val);
    }
  };

  const handleEditTehsilChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, tehsil_id: val }));
    setEditErrors(prev => ({ ...prev, tehsil_id: '' }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErrors({});
    setEditApiError(null);

    const newErrors = {};
    if (!editForm.country_id) newErrors.country_id = t('admin:requiredCountry', 'Country is required');
    if (!editForm.province_id) newErrors.province_id = t('admin:requiredProvince', 'Province is required');
    if (!editForm.division_id) newErrors.division_id = t('admin:requiredDivision', 'Division is required');
    if (!editForm.district_id) newErrors.district_id = t('admin:requiredDistrict', 'District is required');
    if (!editForm.tehsil_id) newErrors.tehsil_id = t('admin:requiredTehsil', 'Tehsil is required');

    const english = (editForm.city_english || '').trim();
    if (!english) {
      newErrors.city_english = t('admin:requiredCityEnglish', 'City Name (English) is required');
    } else if (english.length > 100) {
      newErrors.city_english = t('admin:maxCityEnglish', 'City Name (English) must not exceed 100 characters');
    }

    const urdu = (editForm.city_urdu || '').trim();
    if (urdu && urdu.length > 100) {
      newErrors.city_urdu = t('admin:maxCityUrdu', 'City Name (Urdu) must not exceed 100 characters');
    }

    const abb = (editForm.city_abb || '').trim();
    if (abb && abb.length > 20) {
      newErrors.city_abb = t('admin:maxCityAbb', 'Abbreviation must not exceed 20 characters');
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    const payload = {
      tehsil_id: editForm.tehsil_id,
      city_english: english,
      city_urdu: urdu ? urdu : null,
      city_abb: abb ? abb : null,
      is_active: editForm.is_active
    };

    setEditSubmitting(true);
    try {
      const res = await updateAdminCity(editCityId, payload);
      if (res?.success) {
        handleCloseEditModal();
        setSuccessMsg(t('admin:cityUpdatedSuccess', 'City updated successfully'));
        await fetchCities();
      } else {
        if (res?.message?.toLowerCase().includes('already exists')) {
          setEditErrors(prev => ({ ...prev, city_english: t('admin:cityEnglishDuplicate', 'City with this English name already exists in the selected tehsil') }));
        } else if (res?.message?.toLowerCase().includes('tehsil not found')) {
          setEditErrors(prev => ({ ...prev, tehsil_id: t('admin:tehsilNotFound', 'Tehsil not found. Please select another tehsil.') }));
          setEditForm(prev => ({ ...prev, tehsil_id: '' }));
          fetchTehsilsForEdit(editForm.country_id, editForm.province_id, editForm.division_id, editForm.district_id);
        } else if (res?.message?.toLowerCase().includes('city not found')) {
          handleCloseEditModal();
          setSuccessMsg(t('admin:cityNotFoundListRefreshed', 'City not found. The list has been refreshed.'));
          await fetchCities();
        } else {
          setEditApiError(res?.message || t('admin:errorUpdatingCity', 'Unable to update city. Please try again.'));
        }
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message?.toLowerCase() || '';
      if (errMsg.includes('already exists')) {
        setEditErrors(prev => ({ ...prev, city_english: t('admin:cityEnglishDuplicate', 'City with this English name already exists in the selected tehsil') }));
      } else if (errMsg.includes('tehsil not found')) {
        setEditErrors(prev => ({ ...prev, tehsil_id: t('admin:tehsilNotFound', 'Tehsil not found. Please select another tehsil.') }));
        setEditForm(prev => ({ ...prev, tehsil_id: '' }));
        fetchTehsilsForEdit(editForm.country_id, editForm.province_id, editForm.division_id, editForm.district_id);
      } else if (errMsg.includes('city not found')) {
        handleCloseEditModal();
        setSuccessMsg(t('admin:cityNotFoundListRefreshed', 'City not found. The list has been refreshed.'));
        await fetchCities();
      } else {
        setEditApiError(err?.response?.data?.message || t('admin:errorUpdatingCity', 'Unable to update city. Please try again.'));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteModal = (city) => {
    setDeleteTarget(city);
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (!deleteSubmitting) {
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      setDeleteError(null);
      setDeleteDependencies([]);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    setDeleteSubmitting(true);
    setDeleteError(null);
    setDeleteDependencies([]);

    try {
      const res = await deleteAdminCity(deleteTarget.city_id);
      if (res?.success) {
        setSuccessMsg(t('admin:cityDeletedSuccess', 'City deleted successfully'));
        closeDeleteModal();
        fetchCities();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const payload = err.response?.data;
        setDeleteError(payload?.message || t('admin:cityInUse', 'City cannot be deleted because it is currently in use.'));
        if (payload?.data?.dependencies) {
          setDeleteDependencies(payload.data.dependencies);
        }
      } else {
        setDeleteError(
          err.response?.data?.message || t('admin:errorDeletingCity', 'An error occurred while deleting the city.')
        );
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // --- Filter Handlers ---
  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountryId(val);
    setProvinceId('');
    setDivisionId('');
    setDistrictId('');
    setTehsilId('');
    setProvinces([]);
    setDivisions([]);
    setDistricts([]);
    setTehsils([]);
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
    setTehsilId('');
    setDivisions([]);
    setDistricts([]);
    setTehsils([]);
    setPage(1);

    if (val) {
      fetchDivisionsForFilter(countryId, val);
    }
  };

  const handleDivisionChange = (e) => {
    const val = e.target.value;
    setDivisionId(val);
    setDistrictId('');
    setTehsilId('');
    setDistricts([]);
    setTehsils([]);
    setPage(1);

    if (val) {
      fetchDistrictsForFilter(countryId, provinceId, val);
    }
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setDistrictId(val);
    setTehsilId('');
    setTehsils([]);
    setPage(1);

    if (val) {
      fetchTehsilsForFilter(countryId, provinceId, divisionId, val);
    }
  };

  const handleTehsilChange = (e) => {
    setTehsilId(e.target.value);
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
    setTehsilId('');
    setProvinces([]);
    setDivisions([]);
    setDistricts([]);
    setTehsils([]);
    setPage(1);
  };

  // --- Table Data Transformation ---
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colCountry', 'COUNTRY'),
    t('admin:colProvince', 'PROVINCE'),
    t('admin:colDivision', 'DIVISION'),
    t('admin:colDistrict', 'DISTRICT'),
    t('admin:colTehsil', 'TEHSIL'),
    t('admin:colCityNameEn', 'CITY NAME (ENGLISH)'),
    t('admin:colCityNameUr', 'CITY NAME (URDU)'),
    t('admin:colCityAbb', 'ABBREVIATION'),
    t('admin:colStatus', 'STATUS')
  ];

  const renderRow = (row, index) => {
    const isActive = Boolean(row.is_active);
    return (
      <tr key={row.city_id} className="group hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
          {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          #{row.city_id}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[80px]">{row.country_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[100px]">{row.province_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.division_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.district_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.tehsil_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.city_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 font-urdu min-w-[100px]">{row.city_urdu || '-'}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[80px]">{row.city_abb || '-'}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
            {isActive ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
          </span>
        </td>
        <td className="sticky end-0 px-4 py-3 whitespace-nowrap text-end text-sm w-28 bg-white shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] group-hover:bg-gray-50/50 text-gray-900 font-semibold">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors"
              title={t('admin:edit', 'Edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
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

  const extraFilters = (
    <>
      <select
        value={countryId}
        onChange={handleCountryChange}
        disabled={countriesLoading}
        className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">{countriesLoading ? t('admin:loading', 'Loading...') : (countriesError || t('admin:allCountries', 'All Countries'))}</option>
        {countries.map(c => (
          <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
        ))}
      </select>
      <select
        value={provinceId}
        onChange={handleProvinceChange}
        disabled={!countryId || provincesLoading}
        className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">{provincesLoading ? t('admin:loading', 'Loading...') : (provincesError || t('admin:allProvinces', 'All Provinces'))}</option>
        {provinces.map(p => (
          <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
        ))}
      </select>
      <select
        value={divisionId}
        onChange={handleDivisionChange}
        disabled={!provinceId || divisionsLoading}
        className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">{divisionsLoading ? t('admin:loading', 'Loading...') : (divisionsError || t('admin:allDivisions', 'All Divisions'))}</option>
        {divisions.map(d => (
          <option key={d.division_id} value={d.division_id}>{d.division_english}</option>
        ))}
      </select>
      <select
        value={districtId}
        onChange={handleDistrictChange}
        disabled={!divisionId || districtsLoading}
        className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">{districtsLoading ? t('admin:loading', 'Loading...') : (districtsError || t('admin:allDistricts', 'All Districts'))}</option>
        {districts.map(d => (
          <option key={d.district_id} value={d.district_id}>{d.district_english}</option>
        ))}
      </select>
      <select
        value={tehsilId}
        onChange={handleTehsilChange}
        disabled={!districtId || tehsilsLoading}
        className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
      >
        <option value="">{tehsilsLoading ? t('admin:loadingTehsils', 'Loading tehsils...') : (tehsilsError || t('admin:allTehsils', 'All Tehsils'))}</option>
        {tehsils.map(tData => (
          <option key={tData.tehsil_id} value={tData.tehsil_id}>{tData.tehsil_english}</option>
        ))}
      </select>
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
        title={t('admin:adminCitiesTitle', 'Cities')}
        description={t('admin:adminCitiesDesc', 'Manage cities reference data.')}
        columns={columns}
        rows={cities}
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
        onRetry={() => fetchCities()}
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
          (search || status !== 'all' || countryId || provinceId || divisionId || districtId || tehsilId)
            ? t('admin:noCitiesMatch', 'No cities match the selected filters.')
            : t('admin:noCitiesFound', 'No cities found.')
        }
        renderRow={renderRow}
      />

      {/* --- Add City Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:addCity', 'Add City')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('admin:addCityDesc', 'Add a new city to the location reference data.')}</p>
              </div>
              <button
                onClick={handleCloseAddModal}
                disabled={createSubmitting}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {createApiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{createApiError}</p>
                </div>
              )}

              <form id="create-city-form" onSubmit={handleCreateSubmit} className="space-y-5">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:country', 'Country')} *</label>
                  <select
                    value={createForm.country_id}
                    onChange={handleCreateCountryChange}
                    disabled={createSubmitting || countriesLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.country_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{countriesLoading ? t('admin:loading', 'Loading...') : t('admin:selectCountry', 'Select Country')}</option>
                    {countries.map(c => (
                      <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
                    ))}
                  </select>
                  {createErrors.country_id && <p className="mt-1.5 text-xs text-red-600">{createErrors.country_id}</p>}
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:province', 'Province')} *</label>
                  <select
                    value={createForm.province_id}
                    onChange={handleCreateProvinceChange}
                    disabled={createSubmitting || !createForm.country_id || createProvincesLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.province_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{createProvincesLoading ? t('admin:loadingProvinces', 'Loading provinces...') : (createProvincesError || t('admin:selectProvince', 'Select Province'))}</option>
                    {createProvinces.map(p => (
                      <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
                    ))}
                  </select>
                  {createErrors.province_id && <p className="mt-1.5 text-xs text-red-600">{createErrors.province_id}</p>}
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:division', 'Division')} *</label>
                  <select
                    value={createForm.division_id}
                    onChange={handleCreateDivisionChange}
                    disabled={createSubmitting || !createForm.province_id || createDivisionsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.division_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{createDivisionsLoading ? t('admin:loadingDivisions', 'Loading divisions...') : (createDivisionsError || t('admin:selectDivision', 'Select Division'))}</option>
                    {createDivisions.map(d => (
                      <option key={d.division_id} value={d.division_id}>{d.division_english}</option>
                    ))}
                  </select>
                  {createErrors.division_id && <p className="mt-1.5 text-xs text-red-600">{createErrors.division_id}</p>}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:district', 'District')} *</label>
                  <select
                    value={createForm.district_id}
                    onChange={handleCreateDistrictChange}
                    disabled={createSubmitting || !createForm.division_id || createDistrictsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.district_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{createDistrictsLoading ? t('admin:loadingDistricts', 'Loading districts...') : (createDistrictsError || t('admin:selectDistrict', 'Select District'))}</option>
                    {createDistricts.map(d => (
                      <option key={d.district_id} value={d.district_id}>{d.district_english}</option>
                    ))}
                  </select>
                  {createErrors.district_id && <p className="mt-1.5 text-xs text-red-600">{createErrors.district_id}</p>}
                </div>

                {/* Tehsil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:tehsil', 'Tehsil')} *</label>
                  <select
                    value={createForm.tehsil_id}
                    onChange={handleCreateTehsilChange}
                    disabled={createSubmitting || !createForm.district_id || createTehsilsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.tehsil_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{createTehsilsLoading ? t('admin:loadingTehsils', 'Loading tehsils...') : (createTehsilsError || t('admin:selectTehsil', 'Select Tehsil'))}</option>
                    {createTehsils.map(tData => (
                      <option key={tData.tehsil_id} value={tData.tehsil_id}>{tData.tehsil_english}</option>
                    ))}
                  </select>
                  {createErrors.tehsil_id && <p className="mt-1.5 text-xs text-red-600">{createErrors.tehsil_id}</p>}
                </div>

                {/* City English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:cityNameEnglish', 'City Name (English)')} *</label>
                  <input
                    type="text"
                    value={createForm.city_english}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, city_english: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, city_english: '' }));
                    }}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.city_english ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                    placeholder="Enter city name in English"
                  />
                  {createErrors.city_english && <p className="mt-1.5 text-xs text-red-600">{createErrors.city_english}</p>}
                </div>

                {/* City Urdu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:cityNameUrdu', 'City Name (Urdu)')}</label>
                  <input
                    type="text"
                    dir="auto"
                    value={createForm.city_urdu}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, city_urdu: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, city_urdu: '' }));
                    }}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.city_urdu ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all font-urdu`}
                    placeholder="شہر کا نام درج کریں"
                  />
                  {createErrors.city_urdu && <p className="mt-1.5 text-xs text-red-600">{createErrors.city_urdu}</p>}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:abbreviation', 'Abbreviation')}</label>
                  <input
                    type="text"
                    value={createForm.city_abb}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, city_abb: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, city_abb: '' }));
                    }}
                    disabled={createSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${createErrors.city_abb ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                    placeholder="e.g. LHR"
                  />
                  {createErrors.city_abb && <p className="mt-1.5 text-xs text-red-600">{createErrors.city_abb}</p>}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={handleCloseAddModal}
                disabled={createSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                form="create-city-form"
                disabled={createSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C59B27] hover:bg-[#b08a22] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/50 transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
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
                  t('admin:addCity', 'Add City')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Edit City Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editCity', 'Edit City')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('admin:editCityDesc', 'Update city details and status.')}</p>
              </div>
              <button
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {editApiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{editApiError}</p>
                </div>
              )}

              <form id="edit-city-form" onSubmit={handleEditSubmit} className="space-y-5">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:country', 'Country')} *</label>
                  <select
                    value={editForm.country_id}
                    onChange={handleEditCountryChange}
                    disabled={editSubmitting || countriesLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.country_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{countriesLoading ? t('admin:loading', 'Loading...') : t('admin:selectCountry', 'Select Country')}</option>
                    {countries.map(c => (
                      <option key={c.country_id} value={c.country_id}>{c.country_english}</option>
                    ))}
                  </select>
                  {editErrors.country_id && <p className="mt-1.5 text-xs text-red-600">{editErrors.country_id}</p>}
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:province', 'Province')} *</label>
                  <select
                    value={editForm.province_id}
                    onChange={handleEditProvinceChange}
                    disabled={editSubmitting || !editForm.country_id || editProvincesLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.province_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{editProvincesLoading ? t('admin:loadingProvinces', 'Loading provinces...') : (editProvincesError || t('admin:selectProvince', 'Select Province'))}</option>
                    {editProvinces.map(p => (
                      <option key={p.province_id} value={p.province_id}>{p.province_english}</option>
                    ))}
                  </select>
                  {editErrors.province_id && <p className="mt-1.5 text-xs text-red-600">{editErrors.province_id}</p>}
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:division', 'Division')} *</label>
                  <select
                    value={editForm.division_id}
                    onChange={handleEditDivisionChange}
                    disabled={editSubmitting || !editForm.province_id || editDivisionsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.division_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{editDivisionsLoading ? t('admin:loadingDivisions', 'Loading divisions...') : (editDivisionsError || t('admin:selectDivision', 'Select Division'))}</option>
                    {editDivisions.map(d => (
                      <option key={d.division_id} value={d.division_id}>{d.division_english}</option>
                    ))}
                  </select>
                  {editErrors.division_id && <p className="mt-1.5 text-xs text-red-600">{editErrors.division_id}</p>}
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:district', 'District')} *</label>
                  <select
                    value={editForm.district_id}
                    onChange={handleEditDistrictChange}
                    disabled={editSubmitting || !editForm.division_id || editDistrictsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.district_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{editDistrictsLoading ? t('admin:loadingDistricts', 'Loading districts...') : (editDistrictsError || t('admin:selectDistrict', 'Select District'))}</option>
                    {editDistricts.map(d => (
                      <option key={d.district_id} value={d.district_id}>{d.district_english}</option>
                    ))}
                  </select>
                  {editErrors.district_id && <p className="mt-1.5 text-xs text-red-600">{editErrors.district_id}</p>}
                </div>

                {/* Tehsil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:tehsil', 'Tehsil')} *</label>
                  <select
                    value={editForm.tehsil_id}
                    onChange={handleEditTehsilChange}
                    disabled={editSubmitting || !editForm.district_id || editTehsilsLoading}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.tehsil_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="">{editTehsilsLoading ? t('admin:loadingTehsils', 'Loading tehsils...') : (editTehsilsError || t('admin:selectTehsil', 'Select Tehsil'))}</option>
                    {editTehsils.map(tData => (
                      <option key={tData.tehsil_id} value={tData.tehsil_id}>{tData.tehsil_english}</option>
                    ))}
                  </select>
                  {editErrors.tehsil_id && <p className="mt-1.5 text-xs text-red-600">{editErrors.tehsil_id}</p>}
                </div>

                {/* City English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:cityNameEnglish', 'City Name (English)')} *</label>
                  <input
                    type="text"
                    value={editForm.city_english}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, city_english: e.target.value }));
                      setEditErrors(prev => ({ ...prev, city_english: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.city_english ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                    placeholder="Enter city name in English"
                  />
                  {editErrors.city_english && <p className="mt-1.5 text-xs text-red-600">{editErrors.city_english}</p>}
                </div>

                {/* City Urdu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:cityNameUrdu', 'City Name (Urdu)')}</label>
                  <input
                    type="text"
                    dir="auto"
                    value={editForm.city_urdu}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, city_urdu: e.target.value }));
                      setEditErrors(prev => ({ ...prev, city_urdu: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.city_urdu ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all font-urdu`}
                    placeholder="شہر کا نام درج کریں"
                  />
                  {editErrors.city_urdu && <p className="mt-1.5 text-xs text-red-600">{editErrors.city_urdu}</p>}
                </div>

                {/* Abbreviation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:abbreviation', 'Abbreviation')}</label>
                  <input
                    type="text"
                    value={editForm.city_abb}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, city_abb: e.target.value }));
                      setEditErrors(prev => ({ ...prev, city_abb: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.city_abb ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                    placeholder="e.g. LHR"
                  />
                  {editErrors.city_abb && <p className="mt-1.5 text-xs text-red-600">{editErrors.city_abb}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('admin:status', 'Status')} *</label>
                  <select
                    value={editForm.is_active ? 'true' : 'false'}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, is_active: e.target.value === 'true' }));
                      setEditErrors(prev => ({ ...prev, is_active: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-4 py-2.5 bg-gray-50 border ${editErrors.is_active ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-[#C59B27] focus:ring-[#C59B27]/20'} rounded-xl text-sm transition-all`}
                  >
                    <option value="true">{t('admin:active', 'Active')}</option>
                    <option value="false">{t('admin:inactive', 'Inactive')}</option>
                  </select>
                  {editErrors.is_active && <p className="mt-1.5 text-xs text-red-600">{editErrors.is_active}</p>}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                form="edit-city-form"
                disabled={editSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C59B27] hover:bg-[#b08a22] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C59B27]/50 transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
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
                  t('admin:updateCity', 'Update City')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete City Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteCityTitle', 'Delete City')}</h3>
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
                        const labelMap = {
                          societies: t('admin:societies', 'Societies'),
                          customer_request_property_requirements: t('admin:customerRequests', 'Customer Requests')
                        };
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
                  <p className="font-bold mb-1">{t('admin:deleteCityPrompt', 'Are you sure you want to delete this city?')}</p>
                  <p>{t('admin:deleteCityWarning', 'This action permanently deletes the city if it is not currently in use.')}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('admin:cityLabel', 'City')}:</span>
                  <span className="text-sm font-bold text-gray-900">{deleteTarget.city_english}</span>
                </div>
                {deleteTarget.tehsil_english && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('admin:tehsilLabel', 'Tehsil')}:</span>
                    <span className="text-sm font-medium text-gray-900">{deleteTarget.tehsil_english}</span>
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
                  t('admin:deleteCityBtn', 'Delete City')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCities;
