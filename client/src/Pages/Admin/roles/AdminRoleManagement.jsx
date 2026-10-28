import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  ShieldCheck,
  Search,
  Check,
  Minus,
  Lock,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Users,
  Crown,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  INITIAL_ROLES,
  INITIAL_ROLE_MATRICES,
  ROLE_GROUPS
} from './mockAdminRoles';
import {
  getAdminRoles,
  getAdminRolePageAccess,
  updateAdminRolePageAccess
} from '../../../Services/admin.services';

const AdminRoleManagement = () => {
  const { t } = useTranslation(['admin', 'common']);

  // Active top-level tab ('access' = Page Access, 'assignable' = Assignable Roles)
  const [activeTab, setActiveTab] = useState('access');

  // Core Roles State
  const [roles, setRoles] = useState(INITIAL_ROLES);
  // Default to Super Admin (Admin) or Management
  const [selectedRoleId, setSelectedRoleId] = useState('3'); // '3' is Super Admin in DB
  const [roleMatrices, setRoleMatrices] = useState(INITIAL_ROLE_MATRICES);
  const [activePermissions, setActivePermissions] = useState([]);
  const [initialPermissions, setInitialPermissions] = useState([]);

  // Accordion collapsed state: Map of group_key -> boolean (default all expanded = true)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const init = {};
    ROLE_GROUPS.forEach((g) => {
      init[g.key] = true;
    });
    return init;
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Assignable Roles state for second tab demo
  const [assignableConfig, setAssignableConfig] = useState({
    '3': ['1', '2', '3'], // Super Admin can assign all
    '1': ['2'],           // Management can assign Inspector
    '2': []               // Inspector cannot assign
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch live roles from backend API
  const fetchRolesList = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await getAdminRoles();
      if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
        setRoles(res.data);
        setIsLiveConnected(true);
      } else {
        setRoles(INITIAL_ROLES);
      }
    } catch (err) {
      console.warn('Admin roles fetch error, falling back to mock dataset:', err);
      setIsLiveConnected(false);
      setRoles(INITIAL_ROLES);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchRolesList();
  }, [fetchRolesList]);

  // 2. Fetch permission matrix for selected role
  const fetchMatrix = useCallback(async (roleId) => {
    if (!roleId) return;
    setLoadingMatrix(true);
    try {
      const res = await getAdminRolePageAccess(roleId);
      if (res?.success && res?.data?.permissions) {
        const matrixData = res.data;
        setRoleMatrices((prev) => ({
          ...prev,
          [roleId]: matrixData
        }));
        setActivePermissions(matrixData.permissions);
        setInitialPermissions(matrixData.permissions);
        setIsLiveConnected(true);
      } else {
        const fallback = roleMatrices[roleId] || INITIAL_ROLE_MATRICES[roleId];
        const perms = fallback?.permissions || [];
        setActivePermissions(perms);
        setInitialPermissions(perms);
      }
    } catch (err) {
      console.warn(`Role ${roleId} page-access fetch error, using local fallback matrix:`, err);
      setIsLiveConnected(false);
      const fallback = roleMatrices[roleId] || INITIAL_ROLE_MATRICES[roleId];
      const perms = fallback?.permissions || [];
      setActivePermissions(perms);
      setInitialPermissions(perms);
    } finally {
      setLoadingMatrix(false);
    }
  }, [roleMatrices]);

  useEffect(() => {
    fetchMatrix(selectedRoleId);
  }, [selectedRoleId]);

  // Sorted Roles: Super Admin always above
  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      const aIsSuperAdmin =
        a.role_english?.trim().toLowerCase() === 'admin' ||
        a.role_english?.trim().toLowerCase() === 'super admin';
      const bIsSuperAdmin =
        b.role_english?.trim().toLowerCase() === 'admin' ||
        b.role_english?.trim().toLowerCase() === 'super admin';

      if (aIsSuperAdmin && !bIsSuperAdmin) return -1;
      if (!aIsSuperAdmin && bIsSuperAdmin) return 1;
      return Number(a.role_id) - Number(b.role_id);
    });
  }, [roles]);

  // Active Role Metadata
  const currentRole = useMemo(() => {
    return sortedRoles.find((r) => String(r.role_id) === String(selectedRoleId)) || sortedRoles[0];
  }, [sortedRoles, selectedRoleId]);

  const isRoleSuperAdmin = useMemo(() => {
    return (
      currentRole?.role_english?.trim().toLowerCase() === 'admin' ||
      currentRole?.role_english?.trim().toLowerCase() === 'super admin'
    );
  }, [currentRole]);

  // Unsaved Changes check
  const hasChanges = useMemo(() => {
    if (isRoleSuperAdmin || !initialPermissions.length) return false;
    return JSON.stringify(activePermissions) !== JSON.stringify(initialPermissions);
  }, [activePermissions, initialPermissions, isRoleSuperAdmin]);

  // Stats
  const grantedCount = useMemo(() => {
    if (isRoleSuperAdmin) return 37;
    return activePermissions.filter((p) => p.can_access).length;
  }, [activePermissions, isRoleSuperAdmin]);

  // Accordion toggle
  const toggleGroupExpand = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Toggle single permission
  const handleTogglePermission = (pageKey) => {
    if (isRoleSuperAdmin) return;
    setActivePermissions((prev) =>
      prev.map((item) =>
        item.page_key === pageKey ? { ...item, can_access: !item.can_access } : item
      )
    );
  };

  // Toggle group "All"
  const handleToggleGroupAll = (groupKey, currentAllState) => {
    if (isRoleSuperAdmin) return;
    const targetState = !currentAllState;
    setActivePermissions((prev) =>
      prev.map((item) =>
        item.group_key === groupKey ? { ...item, can_access: targetState } : item
      )
    );
  };

  // Global "Select all" / "Clear all"
  const handleGlobalSelectAll = (select) => {
    if (isRoleSuperAdmin) return;
    setActivePermissions((prev) =>
      prev.map((item) => ({ ...item, can_access: select }))
    );
  };

  // Discard changes
  const handleDiscard = () => {
    setActivePermissions(initialPermissions);
    showToast('Changes discarded.', 'info');
  };

  // Commit changes to backend PUT
  const handleSave = async () => {
    if (isRoleSuperAdmin || !hasChanges) return;
    setSaving(true);
    const payload = activePermissions.map((p) => ({
      page_key: p.page_key,
      can_access: Boolean(p.can_access)
    }));

    try {
      const res = await updateAdminRolePageAccess(selectedRoleId, payload);
      if (res?.success) {
        showToast(`Permissions for "${currentRole?.role_english}" saved successfully!`, 'success');
        const updatedPermissions = res.data?.permissions || activePermissions;
        setInitialPermissions(updatedPermissions);
        setActivePermissions(updatedPermissions);
        setRoleMatrices((prev) => ({
          ...prev,
          [selectedRoleId]: {
            ...prev[selectedRoleId],
            permissions: updatedPermissions
          }
        }));
      } else {
        showToast(res?.message || 'Failed to save permissions', 'error');
      }
    } catch (err) {
      console.warn('Backend save error, updating local state (Mock Fallback):', err);
      setInitialPermissions(activePermissions);
      setRoleMatrices((prev) => ({
        ...prev,
        [selectedRoleId]: {
          ...prev[selectedRoleId],
          permissions: activePermissions
        }
      }));
      showToast(`Permissions for "${currentRole?.role_english}" updated in local state (Demo Mode).`, 'success');
    } finally {
      setSaving(false);
    }
  };

  // Filter permissions based on search
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return activePermissions;
    const q = searchQuery.toLowerCase();
    return activePermissions.filter(
      (p) =>
        (p.default_label || '').toLowerCase().includes(q) ||
        (p.page_key || '').toLowerCase().includes(q) ||
        (p.route || '').toLowerCase().includes(q)
    );
  }, [activePermissions, searchQuery]);

  // Group items by category
  const groupedData = useMemo(() => {
    const map = new Map();
    ROLE_GROUPS.forEach((g) => {
      map.set(g.key, []);
    });

    filteredPermissions.forEach((item) => {
      const gKey = item.group_key || 'operations';
      if (!map.has(gKey)) {
        map.set(gKey, []);
      }
      map.get(gKey).push(item);
    });

    if (searchQuery.trim()) {
      for (const [key, items] of map.entries()) {
        if (items.length === 0) {
          map.delete(key);
        }
      }
    }

    return map;
  }, [filteredPermissions, searchQuery]);

  return (
    <div className="font-sans pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold border transition-all ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toast.type === 'info'
              ? 'bg-blue-900 text-white border-blue-700'
              : 'bg-[#0f3d2e] text-white border-emerald-500/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-300" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header - Identical Theme to User Management */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {t('admin:AdminRoleManagementTitle', 'Role Management')}
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {t('admin:AdminRoleManagementDesc', "Assign which pages each role can access. Users see only their role's pages.")}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          <span className="px-2 py-1.5 text-xs font-bold rounded-lg bg-white text-[#002a1b] border-2 border-[#002a1b]/20 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            {t('admin:navAdministration', 'Administration')}
          </span>

          {/* Top Right View Tabs (Page Access vs Assignable Roles) */}
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-gray-200/80 shadow-2xs">
            <button
              onClick={() => setActiveTab('access')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'access'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
              <span>Page Access</span>
            </button>

            <button
              onClick={() => setActiveTab('assignable')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assignable'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assignable Roles</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accent Divider - Signature PPC Gold Bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C59B27] to-transparent mb-5 rounded-full opacity-80" />

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Roles Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-2 block">
                ROLES
              </span>

              <div className="space-y-1.5">
                {sortedRoles.map((r) => {
                  const isSelected = String(r.role_id) === String(selectedRoleId);
                  const isSuperAdmin =
                    r.role_english?.trim().toLowerCase() === 'admin' ||
                    r.role_english?.trim().toLowerCase() === 'super admin';

                  return (
                    <button
                      key={r.role_id}
                      onClick={() => setSelectedRoleId(String(r.role_id))}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#ecf7f1] text-[#0f3d2e] border border-[#a7dfbf] shadow-sm font-bold'
                          : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{isSuperAdmin ? 'Super Admin' : r.role_english}</span>
                        {r.role_urdu && (
                          <span className="text-[11px] font-normal text-gray-400 font-serif">
                            {r.role_urdu}
                          </span>
                        )}
                      </div>

                      {/* Crown icon for Super Admin */}
                      {isSuperAdmin && (
                        <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status footer inside sidebar */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between px-2 text-[11px] text-gray-400">
                <span>{roles.length} system roles</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isLiveConnected ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  {isLiveConnected ? 'Live DB' : 'Mock'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'access' ? (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-7">
                {/* Header of Main Panel */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      {isRoleSuperAdmin ? 'Super Admin' : currentRole?.role_english}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isRoleSuperAdmin
                        ? 'Full access to all pages'
                        : `${grantedCount} of 37 pages granted`}
                    </p>
                  </div>

                  {/* Search Pages Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search pages..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 w-56 sm:w-64 placeholder:text-gray-400 transition-all"
                    />
                  </div>
                </div>

                {/* Sub-Header: Buttons for Configurable Roles OR Notice for Super Admin */}
                {isRoleSuperAdmin ? (
                  <div className="mb-6 p-3.5 rounded-xl bg-[#fff9ed] border border-[#fde8be] text-[#8a5300] text-xs flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-[#b46c00] shrink-0" />
                    <span>
                      Super Admin always has access to every page — access can't be restricted.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between pb-5 pt-1 border-b border-gray-100 gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGlobalSelectAll(true)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
                      >
                        Select all
                      </button>
                      <button
                        onClick={() => handleGlobalSelectAll(false)}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
                      >
                        Clear all
                      </button>
                    </div>

                    {/* Commit / Discard Bar when changes occur */}
                    {hasChanges && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDiscard}
                          disabled={saving}
                          className="px-3 py-1 text-xs font-semibold text-gray-600 hover:text-gray-800"
                        >
                          Discard
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-1 rounded-lg text-xs font-bold bg-[#166534] text-white hover:bg-[#14532d] shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion Groups List */}
                <div className="divide-y divide-gray-100">
                  {loadingMatrix ? (
                    <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      Loading page access matrix...
                    </div>
                  ) : filteredPermissions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No matching pages found for "{searchQuery}".
                    </div>
                  ) : (
                    Array.from(groupedData.entries()).map(([groupKey, pages]) => {
                      if (pages.length === 0) return null;

                      const groupMeta = ROLE_GROUPS.find((g) => g.key === groupKey) || {
                        label: groupKey
                      };

                      const isExpanded = expandedGroups[groupKey] ?? true;
                      const groupGrantedCount = isRoleSuperAdmin
                        ? pages.length
                        : pages.filter((p) => p.can_access).length;
                      const isAllChecked = groupGrantedCount === pages.length;
                      const isPartiallyChecked =
                        groupGrantedCount > 0 && groupGrantedCount < pages.length;

                      return (
                        <div key={groupKey} className="py-4.5 first:pt-2">
                          {/* Accordion Header */}
                          <div className="flex items-center justify-between select-none">
                            <div
                              onClick={() => toggleGroupExpand(groupKey)}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
                              )}
                              <span className="font-bold text-sm text-gray-900 group-hover:text-emerald-900">
                                {groupMeta.label}
                              </span>
                              <span className="text-xs text-gray-400 font-normal">
                                ({groupGrantedCount}/{pages.length})
                              </span>
                            </div>

                            {/* Right side: Group "All" checkbox toggle */}
                            {!isRoleSuperAdmin ? (
                              <button
                                onClick={() => handleToggleGroupAll(groupKey, isAllChecked)}
                                className="flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
                              >
                                {isAllChecked ? (
                                  <div className="w-4 h-4 rounded bg-[#0f766e] text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : isPartiallyChecked ? (
                                  <div className="w-4 h-4 rounded bg-[#0f766e] text-white flex items-center justify-center">
                                    <Minus className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded border border-gray-300 bg-white" />
                                )}
                                <span className="text-xs text-gray-600 font-medium">All</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 opacity-60">
                                <div className="w-4 h-4 rounded bg-gray-300 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">All</span>
                              </div>
                            )}
                          </div>

                          {/* 2-Column Grid of Pages inside Group */}
                          {isExpanded && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5 pt-3.5 pl-6">
                              {pages.map((p) => {
                                const isChecked = isRoleSuperAdmin ? true : Boolean(p.can_access);
                                const isDisabled = isRoleSuperAdmin;

                                return (
                                  <div
                                    key={p.page_key}
                                    onClick={() => !isDisabled && handleTogglePermission(p.page_key)}
                                    className={`flex items-start gap-2.5 ${
                                      !isDisabled ? 'cursor-pointer group' : 'cursor-default'
                                    }`}
                                  >
                                    {/* Custom Checkbox */}
                                    {isRoleSuperAdmin ? (
                                      <div className="w-4 h-4 rounded bg-gray-300 text-white flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    ) : isChecked ? (
                                      <div className="w-4 h-4 rounded bg-[#0f766e] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:bg-[#0d655f] transition-colors">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded border border-gray-300 bg-white shrink-0 mt-0.5 group-hover:border-gray-400 transition-colors" />
                                    )}

                                    {/* Page Title & Route */}
                                    <div className="min-w-0">
                                      <span
                                        className={`text-xs block leading-tight ${
                                          isRoleSuperAdmin
                                            ? 'font-medium text-gray-700'
                                            : isChecked
                                            ? 'font-semibold text-gray-900'
                                            : 'font-normal text-gray-700'
                                        }`}
                                      >
                                        {p.default_label}
                                      </span>
                                      <span className="text-[11px] text-gray-400 block -mt-0.5 font-normal truncate">
                                        {p.route}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Assignable Roles Tab Content */
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-7">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    Assignable Roles for {isRoleSuperAdmin ? 'Super Admin' : currentRole?.role_english}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define which user roles an employee holding "{currentRole?.role_english}" is authorized to grant to other users.
                  </p>
                </div>

                <div className="pt-6 space-y-4">
                  {sortedRoles.map((targetRole) => {
                    const isTargetAdmin =
                      targetRole.role_english?.trim().toLowerCase() === 'admin' ||
                      targetRole.role_english?.trim().toLowerCase() === 'super admin';
                    const currentAllowed = assignableConfig[selectedRoleId] || [];
                    const isAllowed = isRoleSuperAdmin ? true : currentAllowed.includes(String(targetRole.role_id));

                    return (
                      <div
                        key={targetRole.role_id}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50"
                      >
                        <div>
                          <span className="text-sm font-bold text-gray-900 block">
                            {isTargetAdmin ? 'Super Admin' : targetRole.role_english}
                          </span>
                          <span className="text-xs text-gray-400">
                            {isTargetAdmin
                              ? 'Root administrator with full system oversight'
                              : `Operational role for ${targetRole.role_english}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            disabled={isRoleSuperAdmin || (isTargetAdmin && !isRoleSuperAdmin)}
                            onChange={() => {
                              const existing = assignableConfig[selectedRoleId] || [];
                              const updated = existing.includes(String(targetRole.role_id))
                                ? existing.filter((id) => id !== String(targetRole.role_id))
                                : [...existing, String(targetRole.role_id)];
                              setAssignableConfig((prev) => ({
                                ...prev,
                                [selectedRoleId]: updated
                              }));
                              showToast(`Assignable roles updated for ${currentRole?.role_english}`, 'success');
                            }}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <span className="text-xs text-gray-600 font-medium">Can Assign</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default AdminRoleManagement;
