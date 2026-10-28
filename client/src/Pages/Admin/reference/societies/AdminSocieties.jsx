import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import Dropdown from '../../../../Components/common/Dropdown';
import {
  getAdminSocieties,
  getAdminCountries,
  getAdminProvinces,
  getAdminDivisions,
  getAdminDistricts,
  getAdminTehsils,
  getAdminCities,
  createAdminSociety,
  updateAdminSociety,
  deleteAdminSociety
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X } from 'lucide-react';

const AdminSocieties = () => {
  const { t } = useTranslation(['admin']);

  // --- Societies State ---
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Create Society State ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_id: '',
    city_id: '',
    society_english: '',
    society_urdu: '',
    society_abb: ''
  });
  const [createErrors, setCreateErrors] = useState({});
  const [createApiError, setCreateApiError] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // --- Create Modal Hierarchy Dropdown State ---
  const [createCountries, setCreateCountries] = useState([]);
  const [createCountriesLoading, setCreateCountriesLoading] = useState(false);
  const [createCountriesError, setCreateCountriesError] = useState(null);

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

  const [createCities, setCreateCities] = useState([]);
  const [createCitiesLoading, setCreateCitiesLoading] = useState(false);
  const [createCitiesError, setCreateCitiesError] = useState(null);

  // --- Edit Society State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSocietyId, setEditSocietyId] = useState(null);
  const [editForm, setEditForm] = useState({
    country_id: '',
    province_id: '',
    division_id: '',
    district_id: '',
    tehsil_id: '',
    city_id: '',
    society_english: '',
    society_urdu: '',
    society_abb: '',
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

  const [editCities, setEditCities] = useState([]);
  const [editCitiesLoading, setEditCitiesLoading] = useState(false);
  const [editCitiesError, setEditCitiesError] = useState(null);

  
  // --- Delete Society State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [districtId, setDistrictId] = useState('');
  const [tehsilId, setTehsilId] = useState('');
  const [cityId, setCityId] = useState('');

  // --- Dropdown State ---
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [cities, setCities] = useState([]);

  
  // --- Delete Handlers ---
  const handleOpenDeleteModal = (society) => {
    setDeleteTarget({
      society_id: String(society.society_id),
      society_english: society.society_english,
      city_english: society.city_english
    });
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

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;

    setDeleteSubmitting(true);
    setDeleteError(null);
    setDeleteDependencies([]);

    try {
      const res = await deleteAdminSociety(deleteTarget.society_id);
      if (res?.success) {
        setSuccessMsg(t('admin:societyDeletedSuccess', 'Society deleted successfully'));
        handleCloseDeleteModal();
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const payload = err.response?.data;
        setDeleteError(payload?.message || t('admin:societyInUse', 'Society cannot be deleted because it is currently in use.'));
        if (payload?.data?.dependencies) {
          setDeleteDependencies(payload.data.dependencies);
        }
      } else if (err.response?.status === 404) {
        handleCloseDeleteModal();
        setSuccessMsg(t('admin:societyNotFoundListRefreshed', 'Society not found. The list has been refreshed.'));
        fetchData();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setDeleteError(
          err.response?.data?.message || t('admin:errorDeletingSociety', 'Unable to delete society. Please try again.')
        );
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Fetch Filters
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await getAdminDistricts({ status: 'all' });
        if (res?.success) setDistricts(res.data || []);
      } catch (err) { }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchTehsils = async () => {
      if (!districtId) {
        setTehsils([]);
        setCities([]);
        return;
      }
      try {
        const res = await getAdminTehsils({ status: 'all', districtId });
        if (res?.success) setTehsils(res.data || []);
      } catch (err) { }
    };
    fetchTehsils();
  }, [districtId]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!tehsilId) {
        setCities([]);
        return;
      }
      try {
        const res = await getAdminCities({ status: 'all', tehsilId });
        if (res?.success) setCities(res.data || []);
      } catch (err) { }
    };
    fetchCities();
  }, [tehsilId]);

  // --- Create Handlers ---
  const handleOpenAddModal = async () => {
    setIsAddModalOpen(true);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_id: '',
      society_english: '',
      society_urdu: '',
      society_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    setCreateCities([]);

    setCreateCountriesLoading(true);
    setCreateCountriesError(null);
    try {
      const res = await getAdminCountries({ status: 'all' });
      if (res?.success) {
        setCreateCountries(res.data || []);
      } else {
        setCreateCountriesError(t('admin:errorLoadingCountries', 'Unable to load countries'));
      }
    } catch (err) {
      setCreateCountriesError(t('admin:errorLoadingCountries', 'Unable to load countries'));
    } finally {
      setCreateCountriesLoading(false);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setCreateForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_id: '',
      society_english: '',
      society_urdu: '',
      society_abb: ''
    });
    setCreateErrors({});
    setCreateApiError(null);
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    setCreateCities([]);
  };

  const handleCreateCountryChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '', tehsil_id: '', city_id: '' }));
    setCreateErrors(prev => ({ ...prev, country_id: undefined }));
    setCreateProvinces([]);
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    setCreateCities([]);

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
    setCreateForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '', tehsil_id: '', city_id: '' }));
    setCreateErrors(prev => ({ ...prev, province_id: undefined }));
    setCreateDivisions([]);
    setCreateDistricts([]);
    setCreateTehsils([]);
    setCreateCities([]);

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
    setCreateForm(prev => ({ ...prev, division_id: val, district_id: '', tehsil_id: '', city_id: '' }));
    setCreateErrors(prev => ({ ...prev, division_id: undefined }));
    setCreateDistricts([]);
    setCreateTehsils([]);
    setCreateCities([]);

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

  const handleCreateDistrictChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, district_id: val, tehsil_id: '', city_id: '' }));
    setCreateErrors(prev => ({ ...prev, district_id: undefined }));
    setCreateTehsils([]);
    setCreateCities([]);

    if (val) {
      setCreateTehsilsLoading(true);
      setCreateTehsilsError(null);
      try {
        const res = await getAdminTehsils({ status: 'all', countryId: createForm.country_id, provinceId: createForm.province_id, divisionId: createForm.division_id, districtId: val, page: 1, limit: 10000 });
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
    }
  };

  const handleCreateTehsilChange = async (e) => {
    const val = e.target.value;
    setCreateForm(prev => ({ ...prev, tehsil_id: val, city_id: '' }));
    setCreateErrors(prev => ({ ...prev, tehsil_id: undefined }));
    setCreateCities([]);

    if (val) {
      setCreateCitiesLoading(true);
      setCreateCitiesError(null);
      try {
        const res = await getAdminCities({ status: 'all', tehsilId: val, page: 1, limit: 10000 });
        if (res?.success) {
          setCreateCities(res.data || []);
        } else {
          setCreateCitiesError(t('admin:errorLoadingCities', 'Unable to load cities'));
        }
      } catch (err) {
        setCreateCitiesError(t('admin:errorLoadingCities', 'Unable to load cities'));
      } finally {
        setCreateCitiesLoading(false);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateApiError(null);
    setSuccessMsg('');
    const newErrors = {};

    if (!createForm.country_id) newErrors.country_id = t('admin:requiredField', 'Required');
    if (!createForm.province_id) newErrors.province_id = t('admin:requiredField', 'Required');
    if (!createForm.division_id) newErrors.division_id = t('admin:requiredField', 'Required');
    if (!createForm.district_id) newErrors.district_id = t('admin:requiredField', 'Required');
    if (!createForm.tehsil_id) newErrors.tehsil_id = t('admin:requiredField', 'Required');
    if (!createForm.city_id) newErrors.city_id = t('admin:requiredField', 'Required');

    const english = createForm.society_english.trim();
    if (!english) {
      newErrors.society_english = t('admin:requiredField', 'Required');
    } else if (english.length > 150) {
      newErrors.society_english = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const urdu = createForm.society_urdu.trim();
    if (urdu.length > 150) {
      newErrors.society_urdu = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const abb = createForm.society_abb.trim();
    if (abb.length > 30) {
      newErrors.society_abb = t('admin:maxLength30', 'Maximum 30 characters allowed');
    }

    if (Object.keys(newErrors).length > 0) {
      setCreateErrors(newErrors);
      return;
    }

    setCreateSubmitting(true);
    try {
      const payload = {
        city_id: createForm.city_id,
        society_english: english,
        society_urdu: urdu ? urdu : null,
        society_abb: abb ? abb : null
      };
      const res = await createAdminSociety(payload);
      if (res?.success) {
        handleCloseAddModal();
        setSuccessMsg(t('admin:societyCreatedSuccess', 'Society created successfully'));
        fetchData(); // immediate re-fetch
      } else {
        setCreateApiError(res?.message || t('admin:createSocietyError', 'Unable to create society. Please try again.'));
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setCreateErrors({ society_english: msg || t('admin:societyExistsError', 'Society with this English name already exists in the selected city') });
      } else if (err?.response?.status === 404) {
        setCreateErrors({ city_id: t('admin:cityNotFoundError', 'City not found. Please select another city.') });
        setCreateForm(prev => ({ ...prev, city_id: '' }));
        // Silently reload cities
        handleCreateTehsilChange({ target: { value: createForm.tehsil_id } });
      } else if (err?.response?.status === 400) {
        setCreateApiError(msg || t('admin:validationFailed', 'Validation failed'));
      } else {
        setCreateApiError(t('admin:createSocietyError', 'Unable to create society. Please try again.'));
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  // --- Fetch Edit Modal Dropdowns ---
  const fetchProvincesForEdit = async (currentCountryId) => {
    try {
      setEditProvincesLoading(true);
      setEditProvincesError(null);
      const res = await getAdminProvinces({ status: 'all', countryId: currentCountryId });
      if (res?.success) setEditProvinces(res.data || []);
      else setEditProvincesError(t('admin:errorLoadingProvinces', 'Unable to load provinces'));
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
      if (res?.success) setEditDivisions(res.data || []);
      else setEditDivisionsError(t('admin:errorLoadingDivisions', 'Unable to load divisions'));
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
      if (res?.success) setEditDistricts(res.data || []);
      else setEditDistrictsError(t('admin:errorLoadingDistricts', 'Unable to load districts'));
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
      if (res?.success) setEditTehsils(res.data || []);
      else setEditTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } catch (err) {
      setEditTehsilsError(t('admin:errorLoadingTehsils', 'Unable to load tehsils'));
    } finally {
      setEditTehsilsLoading(false);
    }
  };

  const fetchCitiesForEdit = async (currentCountryId, currentProvinceId, currentDivisionId, currentDistrictId, currentTehsilId) => {
    try {
      setEditCitiesLoading(true);
      setEditCitiesError(null);
      const res = await getAdminCities({ status: 'all', tehsilId: currentTehsilId, page: 1, limit: 10000 });
      if (res?.success) setEditCities(res.data || []);
      else setEditCitiesError(t('admin:errorLoadingCities', 'Unable to load cities'));
    } catch (err) {
      setEditCitiesError(t('admin:errorLoadingCities', 'Unable to load cities'));
    } finally {
      setEditCitiesLoading(false);
    }
  };

  // --- Edit Handlers ---
  const handleOpenEditModal = (row) => {
    setEditSocietyId(String(row.society_id));
    setEditForm({
      country_id: String(row.country_id),
      province_id: String(row.province_id),
      division_id: String(row.division_id),
      district_id: String(row.district_id),
      tehsil_id: String(row.tehsil_id),
      city_id: String(row.city_id),
      society_english: row.society_english ?? '',
      society_urdu: row.society_urdu ?? '',
      society_abb: row.society_abb ?? '',
      is_active: Boolean(row.is_active)
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    setEditCities([]);

    if (createCountries.length === 0) {
      const fetchCountries = async () => {
        try {
           const res = await getAdminCountries({ status: 'all' });
           if (res?.success) setCreateCountries(res.data || []);
        } catch (e) {}
      };
      fetchCountries();
    }

    fetchProvincesForEdit(String(row.country_id));
    fetchDivisionsForEdit(String(row.country_id), String(row.province_id));
    fetchDistrictsForEdit(String(row.country_id), String(row.province_id), String(row.division_id));
    fetchTehsilsForEdit(String(row.country_id), String(row.province_id), String(row.division_id), String(row.district_id));
    fetchCitiesForEdit(String(row.country_id), String(row.province_id), String(row.division_id), String(row.district_id), String(row.tehsil_id));

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditSocietyId(null);
    setEditForm({
      country_id: '',
      province_id: '',
      division_id: '',
      district_id: '',
      tehsil_id: '',
      city_id: '',
      society_english: '',
      society_urdu: '',
      society_abb: '',
      is_active: true
    });
    setEditErrors({});
    setEditApiError(null);
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    setEditCities([]);
  };

  const handleEditCountryChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, country_id: val, province_id: '', division_id: '', district_id: '', tehsil_id: '', city_id: '' }));
    setEditErrors(prev => ({ ...prev, country_id: undefined }));
    setEditProvinces([]);
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    setEditCities([]);
    if (val) fetchProvincesForEdit(val);
  };

  const handleEditProvinceChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, province_id: val, division_id: '', district_id: '', tehsil_id: '', city_id: '' }));
    setEditErrors(prev => ({ ...prev, province_id: undefined }));
    setEditDivisions([]);
    setEditDistricts([]);
    setEditTehsils([]);
    setEditCities([]);
    if (val) fetchDivisionsForEdit(editForm.country_id, val);
  };

  const handleEditDivisionChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, division_id: val, district_id: '', tehsil_id: '', city_id: '' }));
    setEditErrors(prev => ({ ...prev, division_id: undefined }));
    setEditDistricts([]);
    setEditTehsils([]);
    setEditCities([]);
    if (val) fetchDistrictsForEdit(editForm.country_id, editForm.province_id, val);
  };

  const handleEditDistrictChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, district_id: val, tehsil_id: '', city_id: '' }));
    setEditErrors(prev => ({ ...prev, district_id: undefined }));
    setEditTehsils([]);
    setEditCities([]);
    if (val) fetchTehsilsForEdit(editForm.country_id, editForm.province_id, editForm.division_id, val);
  };

  const handleEditTehsilChange = (e) => {
    const val = e.target.value;
    setEditForm(prev => ({ ...prev, tehsil_id: val, city_id: '' }));
    setEditErrors(prev => ({ ...prev, tehsil_id: undefined }));
    setEditCities([]);
    if (val) fetchCitiesForEdit(editForm.country_id, editForm.province_id, editForm.division_id, editForm.district_id, val);
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
    if (!editForm.tehsil_id) newErrors.tehsil_id = t('admin:requiredField', 'Required');
    if (!editForm.city_id) newErrors.city_id = t('admin:requiredField', 'Required');

    const english = (editForm.society_english || '').trim();
    if (!english) {
      newErrors.society_english = t('admin:requiredField', 'Required');
    } else if (english.length > 150) {
      newErrors.society_english = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const urdu = (editForm.society_urdu || '').trim();
    if (urdu && urdu.length > 150) {
      newErrors.society_urdu = t('admin:maxLength150', 'Maximum 150 characters allowed');
    }

    const abb = (editForm.society_abb || '').trim();
    if (abb && abb.length > 30) {
      newErrors.society_abb = t('admin:maxLength30', 'Maximum 30 characters allowed');
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        city_id: editForm.city_id,
        society_english: english,
        society_urdu: urdu ? urdu : null,
        society_abb: abb ? abb : null,
        is_active: Boolean(editForm.is_active)
      };
      
      const res = await updateAdminSociety(editSocietyId, payload);
      if (res?.success) {
        handleCloseEditModal();
        setSuccessMsg(t('admin:societyUpdatedSuccess', 'Society updated successfully'));
        await fetchData();
      } else {
        const msg = res?.message?.toLowerCase() || '';
        if (msg.includes('already exists')) {
          setEditErrors({ society_english: res?.message || t('admin:societyExistsError', 'Society with this English name already exists in the selected city') });
        } else if (msg.includes('city not found')) {
          setEditErrors({ city_id: t('admin:cityNotFoundError', 'City not found. Please select another city.') });
          setEditForm(prev => ({ ...prev, city_id: '' }));
          fetchCitiesForEdit(editForm.country_id, editForm.province_id, editForm.division_id, editForm.district_id, editForm.tehsil_id);
        } else if (msg.includes('society not found')) {
          handleCloseEditModal();
          setSuccessMsg(t('admin:societyNotFoundListRefreshed', 'Society not found. The list has been refreshed.'));
          await fetchData();
        } else {
          setEditApiError(res?.message || t('admin:updateSocietyError', 'Unable to update society. Please try again.'));
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message?.toLowerCase() || '';
      if (msg.includes('already exists') || (err?.response?.status === 409)) {
        setEditErrors({ society_english: err?.response?.data?.message || t('admin:societyExistsError', 'Society with this English name already exists in the selected city') });
      } else if (msg.includes('city not found') || (err?.response?.status === 404 && msg.includes('city'))) {
        setEditErrors({ city_id: t('admin:cityNotFoundError', 'City not found. Please select another city.') });
        setEditForm(prev => ({ ...prev, city_id: '' }));
        fetchCitiesForEdit(editForm.country_id, editForm.province_id, editForm.division_id, editForm.district_id, editForm.tehsil_id);
      } else if (msg.includes('society not found') || (err?.response?.status === 404 && msg.includes('society'))) {
        handleCloseEditModal();
        setSuccessMsg(t('admin:societyNotFoundListRefreshed', 'Society not found. The list has been refreshed.'));
        await fetchData();
      } else if (err?.response?.status === 400) {
        setEditApiError(err?.response?.data?.message || t('admin:validationFailed', 'Validation failed'));
      } else {
        setEditApiError(err?.response?.data?.message || t('admin:updateSocietyError', 'Unable to update society. Please try again.'));
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        status,
        search: debouncedSearch
      };
      if (districtId) params.districtId = districtId;
      if (tehsilId) params.tehsilId = tehsilId;
      if (cityId) params.cityId = cityId;

      const res = await getAdminSocieties(params);
      if (res?.success) {
        setSocieties(res.data || []);
        setTotal(res.meta?.total || 0);
        setTotalPages(res.meta?.totalPages || 0);
      } else {
        setError(res?.message || t('admin:errorLoadingSocieties', 'Unable to load societies data.'));
      }
    } catch (err) {
      setError(t('admin:errorLoadingSocieties', 'Unable to load societies data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, status, debouncedSearch, districtId, tehsilId, cityId]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setDistrictId('');
    setTehsilId('');
    setCityId('');
    setPage(1);
  };

  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colDistrict', 'DISTRICT'),
    t('admin:colTehsil', 'TEHSIL'),
    t('admin:colCity', 'CITY'),
    t('admin:colSocietyNameEn', 'SOCIETY NAME EN'),
    t('admin:colSocietyNameUr', 'SOCIETY NAME UR'),
    t('admin:colAbb', 'ABB'),
    t('admin:colStatus', 'STATUS')
  ];

  const renderRow = (row, index) => {
    const isActive = Boolean(row.is_active);
    return (
      <tr key={row.society_id} className="group hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
          {(((page - 1) * limit) + index + 1).toString().padStart(2, '0')}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          #{row.society_id}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.district_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.tehsil_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.city_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[120px]">{row.society_english}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 font-urdu min-w-[100px]">{row.society_urdu || '-'}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[80px]">{row.society_abb || '-'}</td>
        <td className="px-4 py-3 whitespace-nowrap text-sm">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
            {isActive ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
          </span>
        </td>
        <td className="sticky end-0 px-4 py-3 whitespace-nowrap text-end text-sm font-medium w-28 bg-white shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] group-hover:bg-gray-50/50">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleOpenEditModal(row)}
              className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 transition-colors"
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

  const extraFilters = (
    <>
      <div className="min-w-[145px]">
        <Dropdown
          value={districtId}
          onChange={(val) => {
            setDistrictId(val);
            setTehsilId('');
            setCityId('');
            setPage(1);
          }}
          placeholder={t('admin:allDistricts', 'All Districts')}
          options={[
            { value: '', label: t('admin:allDistricts', 'All Districts') },
            ...districts.map((d) => ({ value: d.district_id, label: d.district_english }))
          ]}
        />
      </div>

      <div className="min-w-[145px]">
        <Dropdown
          value={tehsilId}
          onChange={(val) => {
            setTehsilId(val);
            setCityId('');
            setPage(1);
          }}
          disabled={!districtId}
          placeholder={t('admin:allTehsils', 'All Tehsils')}
          options={[
            { value: '', label: t('admin:allTehsils', 'All Tehsils') },
            ...tehsils.map((t) => ({ value: t.tehsil_id, label: t.tehsil_english }))
          ]}
        />
      </div>

      <div className="min-w-[145px]">
        <Dropdown
          value={cityId}
          onChange={(val) => {
            setCityId(val);
            setPage(1);
          }}
          disabled={!tehsilId}
          placeholder={t('admin:allCities', 'All Cities')}
          options={[
            { value: '', label: t('admin:allCities', 'All Cities') },
            ...cities.map((c) => ({ value: c.city_id, label: c.city_english }))
          ]}
        />
      </div>
    </>
  );

  return (
    <>
      <ReferenceTablePage
        title={t('admin:navSocieties', 'Societies')}
        description={t('admin:AdminSocietiesDesc', 'MANAGE SOCIETIES REFERENCE DATA.')}
        columns={columns}
        rows={societies}
        loading={loading}
        error={error}
        renderRow={renderRow}
        pagination={{
          page,
          limit,
          total,
          totalPages,
          onPageChange: setPage,
          onLimitChange: setLimit
        }}
        search={search}
        onSearchChange={setSearch}
        showStatusFilter={true}
        status={status}
        onStatusChange={setStatus}
        onReset={handleResetFilters}
        extraFilters={extraFilters}
        onAdd={handleOpenAddModal}
      />

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('admin:addSocietyTitle', 'Add Society')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('admin:addSocietyDesc', 'Add a new society to the location reference data.')}</p>
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

              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                  {successMsg}
                </div>
              )}

              <form id="createSocietyForm" onSubmit={handleCreateSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.country_id}
                      onChange={handleCreateCountryChange}
                      disabled={createSubmitting || createCountriesLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.country_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createCountriesLoading ? t('admin:loading', 'Loading...') : t('admin:selectCountry', 'Select Country')}</option>
                      {createCountries.map(c => (
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
                      onChange={handleCreateDistrictChange}
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

                  {/* Tehsil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colTehsil', 'Tehsil')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.tehsil_id}
                      onChange={handleCreateTehsilChange}
                      disabled={createSubmitting || !createForm.district_id || createTehsilsLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.tehsil_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createTehsilsLoading ? t('admin:loadingTehsils', 'Loading tehsils...') : (createTehsilsError || t('admin:selectTehsil', 'Select Tehsil'))}</option>
                      {createTehsils.map(tOption => (
                        <option key={tOption.tehsil_id} value={tOption.tehsil_id}>{tOption.tehsil_english}</option>
                      ))}
                    </select>
                    {createErrors.tehsil_id && <p className="mt-1 text-sm text-red-600">{createErrors.tehsil_id}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCity', 'City')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createForm.city_id}
                      onChange={(e) => {
                        setCreateForm(prev => ({ ...prev, city_id: e.target.value }));
                        setCreateErrors(prev => ({ ...prev, city_id: undefined }));
                      }}
                      disabled={createSubmitting || !createForm.tehsil_id || createCitiesLoading}
                      className={`w-full p-2.5 bg-white border ${createErrors.city_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{createCitiesLoading ? t('admin:loadingCities', 'Loading cities...') : (createCitiesError || t('admin:selectCity', 'Select City'))}</option>
                      {createCities.map(c => (
                        <option key={c.city_id} value={c.city_id}>{c.city_english}</option>
                      ))}
                    </select>
                    {createErrors.city_id && <p className="mt-1 text-sm text-red-600">{createErrors.city_id}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colSocietyNameEn', 'Society Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.society_english}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, society_english: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, society_english: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.society_english ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                    placeholder="Enter society name in English"
                  />
                  {createErrors.society_english && <p className="mt-1 text-sm text-red-600">{createErrors.society_english}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colSocietyNameUr', 'Society Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={createForm.society_urdu}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, society_urdu: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, society_urdu: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.society_urdu ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 font-urdu`}
                    placeholder="سوسائٹی کا نام درج کریں"
                  />
                  {createErrors.society_urdu && <p className="mt-1 text-sm text-red-600">{createErrors.society_urdu}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colAbb', 'Abbreviation')}
                  </label>
                  <input
                    type="text"
                    value={createForm.society_abb}
                    onChange={(e) => {
                      setCreateForm(prev => ({ ...prev, society_abb: e.target.value }));
                      setCreateErrors(prev => ({ ...prev, society_abb: undefined }));
                    }}
                    disabled={createSubmitting}
                    className={`w-full p-2.5 bg-white border ${createErrors.society_abb ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                    placeholder="e.g. DHA"
                  />
                  {createErrors.society_abb && <p className="mt-1 text-sm text-red-600">{createErrors.society_abb}</p>}
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
                form="createSocietyForm"
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
                  t('admin:addSocietyTitle', 'Add Society')
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
                <h3 className="text-lg font-semibold text-gray-900">{t('admin:editSociety', 'Edit Society')}</h3>
                <p className="text-sm text-gray-500 mt-1">{t('admin:editSocietyDesc', 'Update society details in the location reference data.')}</p>
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

              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                  {successMsg}
                </div>
              )}

              <form id="editSocietyForm" onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCountry', 'Country')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.country_id}
                      onChange={handleEditCountryChange}
                      disabled={editSubmitting}
                      className={`w-full p-2.5 bg-white border ${editErrors.country_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{t('admin:selectCountry', 'Select Country')}</option>
                      {createCountries.map(c => (
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
                      onChange={handleEditDistrictChange}
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

                  {/* Tehsil */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colTehsil', 'Tehsil')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.tehsil_id}
                      onChange={handleEditTehsilChange}
                      disabled={editSubmitting || !editForm.district_id || editTehsilsLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.tehsil_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{editTehsilsLoading ? t('admin:loadingTehsils', 'Loading tehsils...') : (editTehsilsError || t('admin:selectTehsil', 'Select Tehsil'))}</option>
                      {editTehsils.map(tOption => (
                        <option key={tOption.tehsil_id} value={tOption.tehsil_id}>{tOption.tehsil_english}</option>
                      ))}
                    </select>
                    {editErrors.tehsil_id && <p className="mt-1 text-sm text-red-600">{editErrors.tehsil_id}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colCity', 'City')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.city_id}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, city_id: e.target.value }));
                        setEditErrors(prev => ({ ...prev, city_id: undefined }));
                      }}
                      disabled={editSubmitting || !editForm.tehsil_id || editCitiesLoading}
                      className={`w-full p-2.5 bg-white border ${editErrors.city_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 disabled:bg-gray-50`}
                    >
                      <option value="">{editCitiesLoading ? t('admin:loadingCities', 'Loading cities...') : (editCitiesError || t('admin:selectCity', 'Select City'))}</option>
                      {editCities.map(c => (
                        <option key={c.city_id} value={c.city_id}>{c.city_english}</option>
                      ))}
                    </select>
                    {editErrors.city_id && <p className="mt-1 text-sm text-red-600">{editErrors.city_id}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colSocietyNameEn', 'Society Name (English)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.society_english}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, society_english: e.target.value }));
                      setEditErrors(prev => ({ ...prev, society_english: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.society_english ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                    placeholder="Enter society name in English"
                  />
                  {editErrors.society_english && <p className="mt-1 text-sm text-red-600">{editErrors.society_english}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('admin:colSocietyNameUr', 'Society Name (Urdu)')}
                  </label>
                  <input
                    type="text"
                    dir="auto"
                    value={editForm.society_urdu}
                    onChange={(e) => {
                      setEditForm(prev => ({ ...prev, society_urdu: e.target.value }));
                      setEditErrors(prev => ({ ...prev, society_urdu: undefined }));
                    }}
                    disabled={editSubmitting}
                    className={`w-full p-2.5 bg-white border ${editErrors.society_urdu ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900 font-urdu`}
                    placeholder="سوسائٹی کا نام درج کریں"
                  />
                  {editErrors.society_urdu && <p className="mt-1 text-sm text-red-600">{editErrors.society_urdu}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colAbb', 'Abbreviation')}
                    </label>
                    <input
                      type="text"
                      value={editForm.society_abb}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, society_abb: e.target.value }));
                        setEditErrors(prev => ({ ...prev, society_abb: undefined }));
                      }}
                      disabled={editSubmitting}
                      className={`w-full p-2.5 bg-white border ${editErrors.society_abb ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg text-sm text-gray-900`}
                      placeholder="e.g. DHA"
                    />
                    {editErrors.society_abb && <p className="mt-1 text-sm text-red-600">{editErrors.society_abb}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin:colStatus', 'Status')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.is_active ? 'true' : 'false'}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, is_active: e.target.value === 'true' }));
                      }}
                      disabled={editSubmitting}
                      className="w-full p-2.5 bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm text-gray-900"
                    >
                      <option value="true">{t('admin:statusActive', 'Active')}</option>
                      <option value="false">{t('admin:statusInactive', 'Inactive')}</option>
                    </select>
                  </div>
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
                form="editSocietyForm"
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
                  t('admin:updateSociety', 'Update Society')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Society Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteSocietyTitle', 'Delete Society')}</h3>
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-medium">{deleteError}</p>
                  {deleteDependencies.length > 0 && (
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {deleteDependencies.map((dep, idx) => {
                        const labelMap = { 
                          areas: t('admin:depAreas', 'Areas'),
                          customer_request_property_requirements: t('admin:depCustomerRequests', 'Customer Request Property Requirements')
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
                  <p className="font-bold mb-1">{t('admin:deleteSocietyPrompt', 'Are you sure you want to delete this society?')}</p>
                  <p>{t('admin:deleteSocietyWarning', 'This action permanently deletes the society if it is not currently in use.')}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('admin:societyLabel', 'Society')}:</span>
                  <span className="text-sm font-bold text-gray-900">{deleteTarget.society_english}</span>
                </div>
                {deleteTarget.city_english && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">{t('admin:colCity', 'City')}:</span>
                    <span className="text-sm font-medium text-gray-900">{deleteTarget.city_english}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
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
                  t('admin:deleteSocietyBtn', 'Delete Society')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default AdminSocieties;
