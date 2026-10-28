import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Shield, Users, AlertCircle, RefreshCcw, Edit2, Trash2, X, ChevronDown, Check, Filter } from 'lucide-react';
import { getAdminUsers, updateAdminUser, deleteAdminUser, getAdminRoles } from '../../../Services/admin.services';
import Dropdown from '../../../Components/common/Dropdown';

const DEPENDENCY_LABELS = {
  customers: 'Customer Profile',
  customer_requests: 'Customer Requests',
  properties: 'Properties',
  property_visits: 'Property Visits',
  employees: 'Employee Profile',
  property_inspected_details: 'Inspections',
  property_verifications: 'Verifications',
  user_role: 'User Roles',
  customer_request_status_history: 'Status History Logs',
  customer_request_property_requirements: 'Property Requirements',
  property_approvals: 'Property Approvals',
  property_demand: 'Property Demands',
  property_status: 'Property Status Updates',
};

const formatDependencyLabel = (dep) => {
  if (dep?.label) return dep.label;
  if (dep?.table && DEPENDENCY_LABELS[dep.table]) return DEPENDENCY_LABELS[dep.table];
  if (dep?.table) {
    return dep.table
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return 'Related Records';
};

const AdminUsers = () => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isUrdu = i18n?.language === 'ur';

  const getRoleDisplayName = useCallback((r) => {
    if (!r) return '';
    return (isUrdu && r.role_urdu) ? r.role_urdu : (r.role_english || r.role_name || `Role #${r.role_id}`);
  }, [isUrdu]);

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [userTypeId, setUserTypeId] = useState('');
  const [roleId, setRoleId] = useState('');

  // --- Dynamic Option State ---
  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);
  const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
  const rolesDropdownRef = useRef(null);

  // --- Edit User Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    user_first_name: '',
    user_middle_name: '',
    user_last_name: '',
    email: '',
    mobile: '',
    role_ids: [],
    is_active: true,
    user_type_english: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [editApiError, setEditApiError] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // --- Delete User Modal State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteDependencies, setDeleteDependencies] = useState([]);

  // --- Debounce Search (500ms) ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 whenever debounced search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // --- Fetch Users ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
      };

      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }
      if (status && status !== 'all') {
        params.status = status;
      }
      if (userTypeId && userTypeId.trim() !== '') {
        params.userTypeId = userTypeId.trim();
      }
      if (roleId && roleId.trim() !== '') {
        params.roleId = roleId.trim();
      }

      const res = await getAdminUsers(params);

      if (res?.success) {
        const rows = res.data || [];
        setUsers(rows);

        // Dynamically accumulate authoritative user types from API rows
        setUserTypeOptions((prevOptions) => {
          const map = new Map(prevOptions.map((opt) => [opt.id, opt.label]));
          rows.forEach((u) => {
            if (u.user_type_id && u.user_type_english) {
              map.set(String(u.user_type_id), u.user_type_english);
            }
          });
          return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
        });

        if (res.meta) {
          setTotal(Number(res.meta.total) || 0);
          setTotalPages(Number(res.meta.totalPages) || 0);
        }
      } else {
        setError(res?.message || t('admin:unableToLoadUsers', 'Unable to load users.'));
      }
    } catch (err) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        t('admin:unableToLoadUsers', 'Unable to load users.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, userTypeId, roleId, page, limit, t]);

  // --- Fetch Roles from Live Database ---
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const res = await getAdminRoles();
      if (res?.success && Array.isArray(res.data)) {
        setAvailableRoles(res.data);
        // Synchronize table filter role options with all live database roles
        setRoleOptions(
          res.data.map((r) => ({
            id: String(r.role_id),
            label: getRoleDisplayName(r),
          }))
        );
      } else {
        setRolesError(res?.message || t('admin:unableToLoadRoles', 'Unable to load roles.'));
      }
    } catch (err) {
      setRolesError(err?.message || t('admin:unableToLoadRoles', 'Unable to load roles.'));
    } finally {
      setRolesLoading(false);
    }
  }, [getRoleDisplayName, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Close roles dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target)) {
        setIsRolesDropdownOpen(false);
      }
    };
    if (isRolesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRolesDropdownOpen]);

  // --- Reset Filter Handler ---
  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setUserTypeId('');
    setRoleId('');
    setPage(1);
  };

  // --- Edit Modal Handlers ---
  const handleOpenEditModal = (user) => {
    const activeRoleIds = Array.isArray(user.active_roles)
      ? user.active_roles.map((r) => String(r.role_id))
      : [];

    setEditUserId(String(user.user_id));
    setEditForm({
      user_first_name: user.user_first_name || '',
      user_middle_name: user.user_middle_name || '',
      user_last_name: user.user_last_name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role_ids: activeRoleIds,
      is_active: Boolean(user.is_active),
      user_type_english: user.user_type_english || '—',
    });
    setEditErrors({});
    setEditApiError(null);
    setIsRolesDropdownOpen(false);
    setIsEditModalOpen(true);

    if (availableRoles.length === 0 && !rolesLoading) {
      fetchRoles();
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditUserId(null);
    setEditErrors({});
    setEditApiError(null);
    setIsRolesDropdownOpen(false);
  };

  const handleToggleRole = (roleIdStr) => {
    setEditForm((prev) => {
      const current = prev.role_ids || [];
      const updated = current.includes(roleIdStr)
        ? current.filter((id) => id !== roleIdStr)
        : [...current, roleIdStr];
      return { ...prev, role_ids: updated };
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditErrors({});
    setEditApiError(null);

    const newErrors = {};
    const firstName = (editForm.user_first_name || '').trim();
    if (!firstName) {
      newErrors.user_first_name = t('admin:valFirstNameReq', 'First name is required');
    } else if (firstName.length > 100) {
      newErrors.user_first_name = 'First name must not exceed 100 characters';
    }

    const lastName = (editForm.user_last_name || '').trim();
    if (!lastName) {
      newErrors.user_last_name = t('admin:valLastNameReq', 'Last name is required');
    } else if (lastName.length > 100) {
      newErrors.user_last_name = 'Last name must not exceed 100 characters';
    }

    const emailVal = (editForm.email || '').trim();
    if (!emailVal) {
      newErrors.email = t('admin:valEmailReq', 'Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        newErrors.email = t('admin:valEmailInvalid', 'Invalid email format');
      } else if (emailVal.length > 255) {
        newErrors.email = 'Email must not exceed 255 characters';
      }
    }

    const mobileVal = (editForm.mobile || '').trim();
    if (!mobileVal) {
      newErrors.mobile = t('admin:valMobileReq', 'Mobile number is required');
    } else if (mobileVal.length > 20) {
      newErrors.mobile = 'Mobile number must not exceed 20 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    if (rolesLoading) {
      setEditApiError(t('admin:loadingRoles', 'Loading roles...'));
      return;
    }

    if (rolesError && (!availableRoles || availableRoles.length === 0)) {
      setEditApiError(
        t('admin:unableToLoadRoles', 'Unable to load roles.') + ' ' + t('admin:retry', 'Please retry.')
      );
      return;
    }

    const payload = {
      user_first_name: firstName,
      user_middle_name: editForm.user_middle_name && editForm.user_middle_name.trim() !== '' ? editForm.user_middle_name.trim() : null,
      user_last_name: lastName,
      email: emailVal,
      mobile: mobileVal,
      is_active: editForm.is_active,
      role_ids: editForm.role_ids,
    };

    setEditSubmitting(true);
    try {
      const res = await updateAdminUser(editUserId, payload);
      if (res?.success) {
        handleCloseEditModal();
        setSuccessMsg(res?.message || t('admin:userUpdatedSuccess', 'User updated successfully.'));
        await fetchUsers();
      } else {
        setEditApiError(res?.message || t('admin:errorUpdatingUser', 'Unable to update user. Please try again.'));
      }
    } catch (err) {
      setEditApiError(err?.response?.data?.message || err?.message || t('admin:errorUpdatingUser', 'Unable to update user. Please try again.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  // --- Delete Modal Handlers ---
  const handleOpenDeleteModal = (user) => {
    setDeleteTargetUser(user);
    setDeleteError(null);
    setDeleteDependencies([]);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTargetUser(null);
    setDeleteError(null);
    setDeleteDependencies([]);
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTargetUser) return;

    setDeleteSubmitting(true);
    setDeleteError(null);
    setDeleteDependencies([]);

    try {
      const res = await deleteAdminUser(deleteTargetUser.user_id);
      if (res?.success) {
        handleCloseDeleteModal();
        setSuccessMsg(res?.message || t('admin:userDeletedSuccess', 'User deleted successfully.'));
        await fetchUsers();
      } else {
        const deps = res?.data?.dependencies || res?.dependencies;
        setDeleteError(res?.message || t('admin:errorDeletingUser', 'Unable to delete user.'));
        if (Array.isArray(deps) && deps.length > 0) {
          setDeleteDependencies(deps);
        }
      }
    } catch (err) {
      const errPayload = err?.data || err?.response?.data;
      const deps = errPayload?.data?.dependencies || errPayload?.dependencies || err?.dependencies;
      const message =
        errPayload?.message ||
        err?.message ||
        t('admin:errorDeletingUser', 'Unable to delete user.');

      setDeleteError(message);
      if (Array.isArray(deps) && deps.length > 0) {
        setDeleteDependencies(deps);
      }
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="font-sans pb-12">
      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 shadow-sm flex items-center justify-between">
          <span className="font-medium text-sm">{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {t('admin:AdminUsersTitle', 'User Management')}
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {t('admin:AdminUsersDesc', 'Internal PPC account directory.')}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-3">
          <span className="px-2 py-1.5 text-xs font-bold rounded-lg bg-white text-[#002a1b] border-2 border-[#002a1b]/20 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            {t('admin:navAdministration', 'Administration')}
          </span>
        </div>
      </div>

      {/* Accent Divider */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C59B27] to-transparent mb-2 rounded-full opacity-80"></div>

      {/* Filter Card */}
      <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between w-full mb-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full ps-10 pe-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
              placeholder={t('admin:searchPlaceholder', 'Search...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-36 shrink-0">
            <Dropdown
              value={status}
              onChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
              options={[
                { value: 'all', label: t('admin:statusAll', 'All') },
                { value: 'active', label: t('admin:statusActive', 'Active') },
                { value: 'inactive', label: t('admin:statusInactive', 'Inactive') }
              ]}
            />
          </div>

          {/* User Type Filter */}
          <div className="w-full sm:w-44 shrink-0">
            <Dropdown
              value={userTypeId}
              onChange={(val) => {
                setUserTypeId(val);
                setPage(1);
              }}
              placeholder={t('admin:allUserTypes', 'All User Types')}
              options={[
                { value: '', label: t('admin:allUserTypes', 'All User Types') },
                ...userTypeOptions.map((ut) => ({ value: ut.id, label: ut.label }))
              ]}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full sm:w-40 shrink-0">
            <Dropdown
              value={roleId}
              onChange={(val) => {
                setRoleId(val);
                setPage(1);
              }}
              placeholder={t('admin:allRoles', 'All Roles')}
              options={[
                { value: '', label: t('admin:allRoles', 'All Roles') },
                { value: 'no-role', label: t('admin:noRole', 'No Role') },
                ...roleOptions.map((r) => ({ value: r.id, label: r.label }))
              ]}
            />
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center shrink-0 mt-2 md:mt-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="w-full md:w-auto px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 shadow-sm"
          >
            {t('admin:resetFilters', 'Reset')}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden pb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#002a1b] border-b-2 border-gray-100 shadow-sm">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap w-16">
                  {t('admin:colSr', 'SR.')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colUserId', 'USER ID')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colFullName', 'FULL NAME')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colEmail', 'EMAIL')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colMobile', 'MOBILE')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colUserType', 'USER TYPE')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colRoles', 'ROLE(S)')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colStatus', 'STATUS')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colDateRegistered', 'DATE REGISTERED')}
                </th>
                <th scope="col" className="px-4 py-3.5 text-end text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap w-24">
                  {t('admin:colAction', 'ACTION')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/70 [&_td]:font-semibold [&_td]:text-gray-900 [&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-50/90 [&>tr:hover]:!bg-gray-200 transition-colors">
              {loading ? (
                <tr className="bg-white">
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#C59B27] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {t('admin:loading', 'Loading data...')}
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr className="bg-white">
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-10 w-10 mb-4" />
                      <h3 className="text-sm font-medium">{error}</h3>
                      <button
                        type="button"
                        onClick={fetchUsers}
                        className="mt-4 flex items-center gap-2 text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        {t('admin:retry', 'Retry')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-gray-300 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900">
                        {debouncedSearch || status !== 'all' || userTypeId || roleId
                          ? t('admin:noUsersMatch', 'No users match the selected filters.')
                          : t('admin:noUsersFound', 'No users found.')}
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isActive = Boolean(user.is_active);
                  const fullName =
                    user.full_name ||
                    [user.user_first_name, user.user_middle_name, user.user_last_name]
                      .filter(Boolean)
                      .join(' ') ||
                    '—';
                  const isEvenRow = index % 2 === 1;

                  return (
                    <tr
                      key={String(user.user_id)}
                      className={`group ${isEvenRow ? 'bg-gray-50/90' : 'bg-white'} hover:!bg-gray-200 transition-colors`}
                    >
                      {/* SR. */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
                        {((page - 1) * limit + index + 1).toString().padStart(2, '0')}
                      </td>

                      {/* USER ID */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        #{user.user_id}
                      </td>

                      {/* FULL NAME */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[140px]">
                        {fullName}
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[140px]">
                        {user.email || '—'}
                      </td>

                      {/* MOBILE */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 min-w-[120px]">
                        {user.mobile || '—'}
                      </td>

                      {/* USER TYPE */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 min-w-[120px]">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {user.user_type_english || '—'}
                        </span>
                      </td>

                      {/* ROLE(S) */}
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[130px]">
                        {user.active_roles && user.active_roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.active_roles.map((r, rIdx) => (
                              <span
                                key={r.role_id || rIdx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {r.role_name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            {t('admin:noRole', 'No Role')}
                          </span>
                        )}
                      </td>


                      {/* STATUS */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}
                          ></span>
                          {isActive
                            ? t('admin:statusActive', 'Active')
                            : t('admin:statusInactive', 'Inactive')}
                        </span>
                      </td>

                      {/* DATE REGISTERED */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 min-w-[120px]">
                        {user.date_of_registration
                          ? new Date(user.date_of_registration).toLocaleDateString()
                          : '—'}
                      </td>

                      {/* ACTION (Edit / Delete) */}
                      <td className="sticky end-0 px-4 py-3 whitespace-nowrap text-end text-sm w-24 bg-white shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] group-hover:bg-gray-50/50 text-gray-900 font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors"
                            title={t('admin:edit', 'Edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(user)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm transition-colors"
                            title={t('admin:delete', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        {!loading && !error && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                {t('admin:showingRecords', {
                  start: startRecord,
                  end: endRecord,
                  total,
                  defaultValue: `Showing ${startRecord} to ${endRecord} of ${total} records`,
                })}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">
                  {t('admin:rowsLabel', 'Rows')}
                </span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-md bg-white text-sm py-1 ps-2 pe-6 leading-tight focus:outline-none focus:ring-2 focus:ring-[#C59B27] cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalPages > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('admin:prevPage', 'Previous page')}
                >
                  ‹
                </button>
                {(() => {
                  const pages = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    if (page <= 3) {
                      pages.push(1, 2, 3, 4, '...', totalPages);
                    } else if (page >= totalPages - 2) {
                      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
                    }
                  }
                  return pages.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => typeof p === 'number' && setPage(p)}
                      disabled={p === '...'}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${p === page
                          ? 'bg-[#C59B27] text-white border border-[#C59B27]'
                          : p === '...'
                            ? 'text-gray-400 cursor-default border-transparent'
                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {p}
                    </button>
                  ));
                })()}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('admin:nextPage', 'Next page')}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Edit User Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('admin:editUserTitle', 'Edit User')}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{t('admin:editUserDesc', 'Update account details and role assignments.')}</p>
              </div>
              <button
                type="button"
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

              <form id="edit-user-form" onSubmit={handleEditSubmit} className="space-y-4">
                {/* Informational Read-Only Badge */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 block uppercase tracking-wider">{t('admin:userType', 'User Type')}</span>
                  <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white text-gray-800 border border-gray-200">
                    {editForm.user_type_english}
                  </span>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:firstName', 'First Name')} *</label>
                    <input
                      type="text"
                      value={editForm.user_first_name}
                      onChange={(e) => {
                        setEditForm((prev) => ({ ...prev, user_first_name: e.target.value }));
                        setEditErrors((prev) => ({ ...prev, user_first_name: '' }));
                      }}
                      disabled={editSubmitting}
                      className={`block w-full px-3 py-2 bg-gray-50 border ${editErrors.user_first_name ? 'border-red-300' : 'border-gray-200 focus:border-[#C59B27]'} rounded-xl text-sm transition-all`}
                    />
                    {editErrors.user_first_name && <p className="mt-1 text-xs text-red-600">{editErrors.user_first_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:middleName', 'Middle Name')}</label>
                    <input
                      type="text"
                      value={editForm.user_middle_name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, user_middle_name: e.target.value }))}
                      disabled={editSubmitting}
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-[#C59B27] rounded-xl text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:lastName', 'Last Name')} *</label>
                    <input
                      type="text"
                      value={editForm.user_last_name}
                      onChange={(e) => {
                        setEditForm((prev) => ({ ...prev, user_last_name: e.target.value }));
                        setEditErrors((prev) => ({ ...prev, user_last_name: '' }));
                      }}
                      disabled={editSubmitting}
                      className={`block w-full px-3 py-2 bg-gray-50 border ${editErrors.user_last_name ? 'border-red-300' : 'border-gray-200 focus:border-[#C59B27]'} rounded-xl text-sm transition-all`}
                    />
                    {editErrors.user_last_name && <p className="mt-1 text-xs text-red-600">{editErrors.user_last_name}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:email', 'Email')} *</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, email: e.target.value }));
                      setEditErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-3 py-2 bg-gray-50 border ${editErrors.email ? 'border-red-300' : 'border-gray-200 focus:border-[#C59B27]'} rounded-xl text-sm transition-all`}
                  />
                  {editErrors.email && <p className="mt-1 text-xs text-red-600">{editErrors.email}</p>}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:mobile', 'Mobile')} *</label>
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => {
                      setEditForm((prev) => ({ ...prev, mobile: e.target.value }));
                      setEditErrors((prev) => ({ ...prev, mobile: '' }));
                    }}
                    disabled={editSubmitting}
                    className={`block w-full px-3 py-2 bg-gray-50 border ${editErrors.mobile ? 'border-red-300' : 'border-gray-200 focus:border-[#C59B27]'} rounded-xl text-sm transition-all`}
                  />
                  {editErrors.mobile && <p className="mt-1 text-xs text-red-600">{editErrors.mobile}</p>}
                </div>

                {/* Database-Backed Multi-Select Role Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      {t('admin:roles', 'Roles')}
                    </label>
                    {rolesError && (
                      <button
                        type="button"
                        onClick={fetchRoles}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                      >
                        <RefreshCcw className="w-3 h-3" />
                        {t('admin:retry', 'Retry')}
                      </button>
                    )}
                  </div>

                  {rolesError && (
                    <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
                      <span>{rolesError}</span>
                      <button
                        type="button"
                        onClick={fetchRoles}
                        className="px-2 py-0.5 bg-red-100 hover:bg-red-200 font-bold rounded-lg transition-colors text-red-800"
                      >
                        {t('admin:retry', 'Retry')}
                      </button>
                    </div>
                  )}

                  <div className="relative" ref={rolesDropdownRef}>
                    <button
                      type="button"
                      onClick={() => !rolesLoading && !rolesError && setIsRolesDropdownOpen((prev) => !prev)}
                      disabled={editSubmitting || rolesLoading || (rolesError && availableRoles.length === 0)}
                      className={`w-full min-h-[42px] px-3 py-2 bg-gray-50 hover:bg-white border ${
                        isRolesDropdownOpen ? 'border-[#C59B27] ring-2 ring-[#C59B27]/20 bg-white' : 'border-gray-200'
                      } rounded-xl text-sm transition-all text-start flex items-center justify-between gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {rolesLoading ? (
                        <span className="text-gray-400 flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-[#C59B27] border-t-transparent rounded-full animate-spin"></div>
                          {t('admin:loadingRoles', 'Loading roles...')}
                        </span>
                      ) : editForm.role_ids && editForm.role_ids.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                          {editForm.role_ids.map((id) => {
                            const matched = availableRoles.find((r) => String(r.role_id) === String(id));
                            const label = matched ? getRoleDisplayName(matched) : `Role #${id}`;
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                              >
                                <span>{label}</span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!editSubmitting) handleToggleRole(String(id));
                                  }}
                                  className="hover:text-blue-900 cursor-pointer p-0.5 rounded hover:bg-blue-100 transition-colors"
                                  title={t('admin:remove', 'Remove')}
                                >
                                  <X className="w-3 h-3" />
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {t('admin:selectRoles', 'Select Roles')}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${
                          isRolesDropdownOpen ? 'rotate-180 text-[#C59B27]' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Options Menu */}
                    {isRolesDropdownOpen && (
                      <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {availableRoles.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            {t('admin:noRolesFound', 'No roles found.')}
                          </div>
                        ) : (
                          availableRoles.map((role) => {
                            const rId = String(role.role_id);
                            const isChecked = editForm.role_ids?.includes(rId);
                            const isInactive = role.is_active === false;
                            return (
                              <label
                                key={rId}
                                className={`flex items-center justify-between px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-blue-50/70 text-blue-900 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleRole(rId)}
                                    disabled={editSubmitting}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <span className="truncate">
                                    {getRoleDisplayName(role)}
                                    {isInactive && (
                                      <span className="ms-1.5 text-xs text-red-500 font-normal">
                                        ({t('admin:statusInactive', 'Inactive')})
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {isChecked && (
                                  <Check className="w-4 h-4 text-blue-600 shrink-0 ms-2" />
                                )}
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:accountStatus', 'Account Status')}</label>
                  <select
                    value={editForm.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.value === 'active' }))}
                    disabled={editSubmitting}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#C59B27] transition-all"
                  >
                    <option value="active">{t('admin:statusActive', 'Active')}</option>
                    <option value="inactive">{t('admin:statusInactive', 'Inactive')}</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={editSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {t('admin:cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                form="edit-user-form"
                disabled={editSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#C59B27] hover:bg-[#b08a22] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {editSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 rtl:ml-2 rtl:mr-0"></div>
                    {t('admin:updating', 'Updating...')}
                  </>
                ) : (
                  t('admin:updateUserBtn', 'Update User')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Delete User Confirmation Modal --- */}
      {isDeleteModalOpen && deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{t('admin:deleteUserTitle', 'Delete User')}</h3>
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {deleteError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <p className="text-sm text-red-800 font-semibold">{deleteError}</p>
                  {deleteDependencies.length > 0 && (
                    <div className="pt-2 border-t border-red-200">
                      <p className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2">
                        {t('admin:activeDependencies', 'Active Dependencies')}:
                      </p>
                      <ul className="text-sm text-red-800 space-y-1.5">
                        {deleteDependencies.map((dep, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between bg-white/80 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium"
                          >
                            <span>{formatDependencyLabel(dep)}</span>
                            <span className="font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                              {dep.count}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                  <p className="font-bold mb-1">{t('admin:deleteUserPrompt', 'Are you sure you want to delete this user?')}</p>
                  <p>{t('admin:deleteUserWarning', 'This action permanently deletes the user account if no dependencies exist.')}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('admin:userLabel', 'User')}:</span>
                  <span className="font-bold text-gray-900">
                    {deleteTargetUser.full_name || `${deleteTargetUser.user_first_name} ${deleteTargetUser.user_last_name}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('admin:email', 'Email')}:</span>
                  <span className="font-medium text-gray-900">{deleteTargetUser.email}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={deleteSubmitting}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {deleteDependencies.length > 0 ? t('admin:close', 'Close') : t('admin:cancel', 'Cancel')}
              </button>
              {deleteDependencies.length === 0 && (
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
                    t('admin:deleteUserBtn', 'Delete User')
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
