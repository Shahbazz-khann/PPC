import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  SlidersHorizontal,
  ShieldCheck,
  Bell,
  Wrench,
  Database,
  FileText,
  Save,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronRight,
  Sliders
} from 'lucide-react';
import {
  INITIAL_CONFIG_STATS,
  INITIAL_CONFIGURATIONS,
  CONFIG_CATEGORIES
} from './mockSystemConfig';
import {
  getAdminSystemConfigurations,
  getAdminSystemConfigStats,
  updateAdminSystemConfigurations
} from '../../../Services/admin.services';

const AdminSystemConfig = () => {
  const { t } = useTranslation(['admin', 'common']);

  // Core State
  const [configurations, setConfigurations] = useState(INITIAL_CONFIGURATIONS);
  const [initialConfigurations, setInitialConfigurations] = useState(INITIAL_CONFIGURATIONS);
  const [stats, setStats] = useState(INITIAL_CONFIG_STATS);

  // Active Category View: null = Grid Hub Overview (as shown in screenshot), or category key string ('general', 'security', etc.)
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch live configurations from backend API
  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const [resConfigs, resStats] = await Promise.all([
        getAdminSystemConfigurations(),
        getAdminSystemConfigStats().catch(() => null)
      ]);

      if (resConfigs?.success && Array.isArray(resConfigs.data) && resConfigs.data.length > 0) {
        setConfigurations(resConfigs.data);
        setInitialConfigurations(resConfigs.data);
        setIsLiveConnected(true);
      } else {
        setConfigurations(INITIAL_CONFIGURATIONS);
        setInitialConfigurations(INITIAL_CONFIGURATIONS);
      }

      if (resStats?.success && resStats.data) {
        setStats(resStats.data);
      } else {
        setStats(INITIAL_CONFIG_STATS);
      }
    } catch (err) {
      console.warn('System configurations fetch error, falling back to mock dataset:', err);
      setIsLiveConnected(false);
      setConfigurations(INITIAL_CONFIGURATIONS);
      setInitialConfigurations(INITIAL_CONFIGURATIONS);
      setStats(INITIAL_CONFIG_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Track Unsaved Changes
  const modifiedKeys = useMemo(() => {
    const changed = new Set();
    configurations.forEach((curr) => {
      const orig = initialConfigurations.find((o) => o.config_key === curr.config_key);
      if (orig && String(orig.config_value) !== String(curr.config_value)) {
        changed.add(curr.config_key);
      }
    });
    return changed;
  }, [configurations, initialConfigurations]);

  const hasChanges = modifiedKeys.size > 0;

  // Change single parameter value in state
  const handleValueChange = (configKey, newValue) => {
    setConfigurations((prev) =>
      prev.map((item) =>
        item.config_key === configKey ? { ...item, config_value: String(newValue) } : item
      )
    );
  };

  // Discard changes
  const handleDiscard = () => {
    setConfigurations(initialConfigurations);
    showToast('Unsaved changes discarded.', 'info');
  };

  // Save changes to backend PUT /api/v1/admin/system-configuration
  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    const settingsToUpdate = configurations
      .filter((c) => modifiedKeys.has(c.config_key))
      .map((c) => ({
        config_key: c.config_key,
        config_value: c.config_value
      }));

    try {
      const res = await updateAdminSystemConfigurations(settingsToUpdate);
      if (res?.success) {
        showToast(res.message || `${settingsToUpdate.length} configuration setting(s) saved!`, 'success');
        setInitialConfigurations(configurations);
        const updatedStats = await getAdminSystemConfigStats().catch(() => null);
        if (updatedStats?.success && updatedStats.data) {
          setStats(updatedStats.data);
        }
      } else {
        showToast(res?.message || 'Failed to save configuration settings.', 'error');
      }
    } catch (err) {
      console.warn('Backend update error, committing to local mock state:', err);
      setInitialConfigurations(configurations);
      showToast(`${settingsToUpdate.length} setting(s) saved in local state (Demo Mode).`, 'success');
    } finally {
      setSaving(false);
    }
  };

  // Helper to render Category Icon matching the screenshot
  const renderCategoryIcon = (key) => {
    switch (key) {
      case 'general':
        return <SlidersHorizontal className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      case 'notifications':
        return <Bell className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      case 'services':
        return <Wrench className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      case 'maintenance':
        return <Database className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      case 'policies':
        return <FileText className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
      default:
        return <Sliders className="w-5 h-5 text-gray-800 stroke-[1.75]" />;
    }
  };

  // Active Category object when editing
  const activeCategoryMeta = useMemo(() => {
    if (!activeCategoryModal) return null;
    return CONFIG_CATEGORIES.find((c) => c.key === activeCategoryModal);
  }, [activeCategoryModal]);

  // Settings belonging to the active modal category
  const activeCategorySettings = useMemo(() => {
    if (!activeCategoryModal) return [];
    return configurations.filter((c) => c.category === activeCategoryModal);
  }, [configurations, activeCategoryModal]);

  return (
    <div className="font-sans pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold border transition-all ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toast.type === 'info'
              ? 'bg-blue-900 text-white border-blue-700'
              : 'bg-[#002a1b] text-white border-amber-500/40'
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

      {/* Header - Unified Admin Theme */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {t('admin:AdminSystemConfigTitle', 'System Configuration')}
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {t('admin:AdminSystemConfigDesc', 'MANAGE YOUR PLATFORM SETTINGS AND PREFERENCES.')}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3">
          <span className="px-2 py-1.5 text-xs font-bold rounded-lg bg-white text-[#002a1b] border-2 border-[#002a1b]/20 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            {t('admin:navAdministration', 'Administration')}
          </span>

          {/* Connection Status & Refresh */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                isLiveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isLiveConnected ? 'Live DB' : 'Mock Mode'}</span>
            </span>

            <button
              onClick={() => {
                fetchConfigs();
                showToast('Synchronized with backend.', 'info');
              }}
              disabled={loading}
              className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 rounded-lg shadow-2xs transition-colors"
              title="Refresh from server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Accent Divider - Signature PPC Gold Bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C59B27] to-transparent mb-5 rounded-full opacity-80" />

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold text-amber-900">
              You have {modifiedKeys.size} unsaved configuration change(s).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              disabled={saving}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-amber-300 text-amber-800 bg-white hover:bg-amber-100/50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1 text-xs font-bold rounded-lg bg-[#166534] text-white hover:bg-[#14532d] shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Main Container - Exact Reproduction of Screenshot Card Layout */}
      <div className="bg-white rounded-[24px] border border-gray-200/90 shadow-sm p-6 sm:p-8">
        {/* Card Header matching Screenshot */}
        <div className="flex items-start justify-between pb-6 mb-2 border-b border-transparent">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your platform settings and preferences.</p>
          </div>
          <div className="text-gray-700 p-1">
            <SlidersHorizontal className="w-5 h-5 stroke-[1.75]" />
          </div>
        </div>

        {/* 2-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {CONFIG_CATEGORIES.map((cat) => {
            const catModified = configurations.filter((c) => c.category === cat.key && modifiedKeys.has(c.config_key)).length;

            return (
              <div
                key={cat.key}
                onClick={() => setActiveCategoryModal(cat.key)}
                className="group relative p-6 sm:p-7 rounded-[22px] border border-gray-200/90 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  {/* Icon */}
                  <div className="mb-4 text-gray-800">
                    {renderCategoryIcon(cat.key)}
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#002a1b] transition-colors">
                      {cat.label}
                    </h3>

                    {catModified > 0 ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Has unsaved changes" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 mt-2 font-normal">
                    {cat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Notice matching Screenshot */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2 relative">
          <span>Illustrative layout for the PPC admin panel, not live application settings.</span>
          <span className="text-gray-400 font-mono text-[11px]">
            {configurations.length} total parameters • {stats.publicSettings || 0} public • {stats.restrictedSettings || 0} protected
          </span>

          {/* Centered Pill Indicator from Screenshot */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-2xs flex items-center justify-center text-gray-400 pointer-events-none">
            <span className="w-0.5 h-2.5 bg-gray-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* Category Settings Drill-down Modal */}
      {activeCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-gray-200 shadow-2xs">
                  {renderCategoryIcon(activeCategoryModal)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{activeCategoryMeta?.label} Settings</h3>
                  <p className="text-xs text-gray-500">{activeCategoryMeta?.subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveCategoryModal(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - List of parameters in this category */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {activeCategorySettings.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No configuration parameters found for this category.
                </div>
              ) : (
                activeCategorySettings.map((item) => {
                  const isModified = modifiedKeys.has(item.config_key);
                  const isBoolean = item.data_type === 'boolean';
                  const boolValue = item.config_value === 'true';

                  return (
                    <div
                      key={item.config_key}
                      className={`p-4 rounded-xl border transition-all ${
                        isModified
                          ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{item.display_label}</span>
                            {isModified && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Modified" />
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            {item.config_key}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            item.is_public
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.is_public ? 'Public' : 'Protected'}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                      )}

                      {/* Input control */}
                      <div className="pt-1">
                        {isBoolean ? (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-semibold text-gray-700">
                              {boolValue ? 'Enabled' : 'Disabled'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleValueChange(item.config_key, !boolValue)}
                              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                boolValue ? 'bg-[#166534]' : 'bg-gray-300'
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                  boolValue ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        ) : item.data_type === 'number' ? (
                          <input
                            type="number"
                            value={item.config_value}
                            onChange={(e) => handleValueChange(item.config_key, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white font-mono font-medium"
                          />
                        ) : item.config_value.length > 60 ? (
                          <textarea
                            rows={2}
                            value={item.config_value}
                            onChange={(e) => handleValueChange(item.config_key, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white font-medium resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={item.config_value}
                            onChange={(e) => handleValueChange(item.config_key, e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white font-medium"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/70">
              <span className="text-xs text-gray-500">
                {activeCategorySettings.length} setting(s) in this domain
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCategoryModal(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {hasChanges && (
                  <button
                    onClick={() => {
                      handleSave();
                    }}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#166534] text-white hover:bg-[#14532d] shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemConfig;
