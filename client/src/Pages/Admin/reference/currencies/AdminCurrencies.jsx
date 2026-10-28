import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReferenceTablePage from '../../../../Components/common/ReferenceTablePage';
import {
  getAdminCurrencies,
  createAdminCurrency,
  updateAdminCurrency,
  deleteAdminCurrency
} from '../../../../Services/admin.services';
import { Edit2, Trash2, X, Plus, AlertCircle, CheckCircle2, Coins, RefreshCw } from 'lucide-react';

const AdminCurrencies = () => {
  const { t } = useTranslation(['admin', 'common']);

  // Data & Filter State
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [toast, setToast] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [createForm, setCreateForm] = useState({
    currency_english: '',
    currency_urdu: '',
    currency_code: '',
    currency_symbol: '',
    is_active: true
  });
  const [createErrors, setCreateErrors] = useState({});

  const [editForm, setEditForm] = useState({
    currency_id: null,
    currency_english: '',
    currency_urdu: '',
    currency_code: '',
    currency_symbol: '',
    is_active: true
  });
  const [editErrors, setEditErrors] = useState({});

  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Fetch Currencies from Backend GET API ---
  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminCurrencies({ search, status });
      if (res?.success && Array.isArray(res.data)) {
        setCurrencies(res.data);
      } else {
        setCurrencies([]);
      }
    } catch (err) {
      console.warn('Error fetching currencies:', err);
      setError(err?.message || 'Failed to fetch currencies from server.');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCurrencies();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCurrencies]);

  // Paginated Slices
  const totalRecords = currencies.length;
  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const paginatedCurrencies = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return currencies.slice(startIndex, startIndex + limit);
  }, [currencies, page, limit]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  // --- Add Currency Handlers ---
  const openAddModal = () => {
    setCreateForm({
      currency_english: '',
      currency_urdu: '',
      currency_code: '',
      currency_symbol: '',
      is_active: true
    });
    setCreateErrors({});
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    if (submitting) return;
    setIsAddModalOpen(false);
    setCreateErrors({});
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!createForm.currency_english.trim()) {
      errors.currency_english = t('admin:errCurrencyEnglishRequired', 'Currency English name is required.');
    }
    if (!createForm.currency_code.trim()) {
      errors.currency_code = t('admin:errCurrencyCodeRequired', 'Currency code is required (e.g. PKR, USD).');
    } else if (createForm.currency_code.trim().length > 5) {
      errors.currency_code = 'Code must be 5 characters or fewer.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAdminCurrency({
        currency_english: createForm.currency_english.trim(),
        currency_urdu: createForm.currency_urdu.trim() || null,
        currency_code: createForm.currency_code.trim().toUpperCase(),
        currency_symbol: createForm.currency_symbol.trim() || null,
        is_active: createForm.is_active
      });

      if (res?.success) {
        showToast(res.message || 'Currency created successfully!');
        closeAddModal();
        fetchCurrencies();
      } else {
        setCreateErrors({ api: res?.message || 'Failed to create currency.' });
      }
    } catch (err) {
      setCreateErrors({ api: err?.message || 'Error communicating with server.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Edit Currency Handlers ---
  const openEditModal = (currency) => {
    setSelectedCurrency(currency);
    setEditForm({
      currency_id: currency.currency_id,
      currency_english: currency.currency_english,
      currency_urdu: currency.currency_urdu || '',
      currency_code: currency.currency_code,
      currency_symbol: currency.currency_symbol || '',
      is_active: currency.is_active
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (submitting) return;
    setIsEditModalOpen(false);
    setSelectedCurrency(null);
    setEditErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!editForm.currency_english.trim()) {
      errors.currency_english = t('admin:errCurrencyEnglishRequired', 'Currency English name is required.');
    }
    if (!editForm.currency_code.trim()) {
      errors.currency_code = t('admin:errCurrencyCodeRequired', 'Currency code is required.');
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateAdminCurrency(editForm.currency_id, {
        currency_english: editForm.currency_english.trim(),
        currency_urdu: editForm.currency_urdu.trim() || null,
        currency_code: editForm.currency_code.trim().toUpperCase(),
        currency_symbol: editForm.currency_symbol.trim() || null,
        is_active: editForm.is_active
      });

      if (res?.success) {
        showToast(res.message || 'Currency updated successfully!');
        closeEditModal();
        fetchCurrencies();
      } else {
        setEditErrors({ api: res?.message || 'Failed to update currency.' });
      }
    } catch (err) {
      setEditErrors({ api: err?.message || 'Error communicating with server.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteModal = (currency) => {
    setSelectedCurrency(currency);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (submitting) return;
    setIsDeleteModalOpen(false);
    setSelectedCurrency(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCurrency) return;
    setSubmitting(true);
    try {
      const res = await deleteAdminCurrency(selectedCurrency.currency_id);
      if (res?.success) {
        showToast(res.message || `Currency "${selectedCurrency.currency_english}" deleted.`, 'info');
        closeDeleteModal();
        fetchCurrencies();
      } else {
        showToast(res?.message || 'Failed to delete currency.', 'error');
      }
    } catch (err) {
      showToast(err?.message || 'Error deleting currency.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Definition
  const columns = [
    t('admin:colId', 'ID'),
    t('admin:colNameEn', 'NAME (ENGLISH)'),
    t('admin:colNameUr', 'NAME (URDU)'),
    t('admin:colCode', 'CODE'),
    t('admin:colSymbol', 'SYMBOL'),
    t('admin:colStatus', 'STATUS')
  ];

  // Row Renderer
  const renderRow = (row, index) => {
    const isEven = index % 2 === 1;

    return (
      <tr
        key={row.currency_id}
        className={`group ${isEven ? 'bg-gray-50/90' : 'bg-white'} hover:!bg-gray-200 transition-colors`}
      >
        {/* SR. */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 w-16">
          {(page - 1) * limit + index + 1}
        </td>

        {/* ID */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          #{row.currency_id}
        </td>

        {/* NAME (ENGLISH) */}
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 min-w-[160px]">
          {row.currency_english}
        </td>

        {/* NAME (URDU) */}
        <td className="px-4 py-3 text-sm font-semibold text-gray-900 font-urdu min-w-[140px]">
          {row.currency_urdu || '—'}
        </td>

        {/* CODE */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {row.currency_code}
          </span>
        </td>

        {/* SYMBOL */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
          {row.currency_symbol ? (
            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-1.5 rounded bg-amber-50 text-amber-900 border border-amber-200/70 text-xs font-bold font-mono">
              {row.currency_symbol}
            </span>
          ) : (
            '—'
          )}
        </td>

        {/* STATUS */}
        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
              row.is_active
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 rtl:ml-1.5 rtl:mr-0 ${
                row.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {row.is_active ? t('admin:statusActive', 'Active') : t('admin:statusInactive', 'Inactive')}
          </span>
        </td>

        {/* ACTION */}
        <td className="px-4 py-3 whitespace-nowrap text-end text-sm font-semibold w-24 text-gray-900">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEditModal(row)}
              title={t('admin:edit', 'Edit')}
              className="p-1.5 text-gray-500 hover:text-[#C59B27] bg-white border border-gray-200 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row)}
              title={t('admin:delete', 'Delete')}
              className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold border transition-all ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : toast.type === 'info'
              ? 'bg-blue-900 text-white border-blue-700'
              : 'bg-[#002a1b] text-white border-[#C59B27]/40'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Reference Table Component */}
      <ReferenceTablePage
        title={t('admin:AdminCurrenciesTitle', 'Currencies')}
        description={t('admin:AdminCurrenciesDesc', 'MANAGE CURRENCIES REFERENCE DATA.')}
        columns={columns}
        rows={paginatedCurrencies}
        loading={loading}
        error={error}
        search={search}
        status={status}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        onReset={handleReset}
        onRetry={fetchCurrencies}
        onAdd={openAddModal}
        showStatusFilter={true}
        emptyMessage={
          search || status !== 'all'
            ? 'No currencies match your filter criteria.'
            : 'No currencies found in the database.'
        }
        renderRow={renderRow}
        pagination={{
          page,
          totalPages,
          total: totalRecords,
          limit,
          onPageChange: (newPage) => setPage(newPage),
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }
        }}
      />

      {/* Add Currency Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white border border-gray-200 text-[#002a1b] shadow-2xs">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add Currency</h3>
                  <p className="text-xs text-gray-500">Configure new monetary currency</p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createErrors.api && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                  {createErrors.api}
                </div>
              )}

              {/* Currency English */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pakistani Rupee, US Dollar"
                  value={createForm.currency_english}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, currency_english: e.target.value });
                    if (createErrors.currency_english) setCreateErrors({ ...createErrors, currency_english: null });
                  }}
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all ${
                    createErrors.currency_english ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {createErrors.currency_english && (
                  <p className="text-xs text-red-500 mt-1">{createErrors.currency_english}</p>
                )}
              </div>

              {/* Currency Urdu */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Name (Urdu)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: پاکستانی روپیہ، امریکی ڈالر"
                  value={createForm.currency_urdu}
                  onChange={(e) => setCreateForm({ ...createForm, currency_urdu: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white font-urdu transition-all"
                />
              </div>

              {/* Grid: Code and Symbol */}
              <div className="grid grid-cols-2 gap-3">
                {/* Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="e.g. PKR, USD"
                    value={createForm.currency_code}
                    onChange={(e) => {
                      setCreateForm({ ...createForm, currency_code: e.target.value.toUpperCase() });
                      if (createErrors.currency_code) setCreateErrors({ ...createErrors, currency_code: null });
                    }}
                    className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all ${
                      createErrors.currency_code ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  {createErrors.currency_code && (
                    <p className="text-xs text-red-500 mt-1">{createErrors.currency_code}</p>
                  )}
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rs, $, €"
                    value={createForm.currency_symbol}
                    onChange={(e) => setCreateForm({ ...createForm, currency_symbol: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Active Status
                </span>
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, is_active: !createForm.is_active })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    createForm.is_active ? 'bg-[#166534]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      createForm.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#002a1b] hover:bg-[#003824] text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {submitting ? 'Saving...' : 'Save Currency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Currency Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white border border-gray-200 text-[#002a1b] shadow-2xs">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Currency</h3>
                  <p className="text-xs text-gray-500">Update currency details (#{editForm.currency_id})</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editErrors.api && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                  {editErrors.api}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.currency_english}
                  onChange={(e) => {
                    setEditForm({ ...editForm, currency_english: e.target.value });
                    if (editErrors.currency_english) setEditErrors({ ...editErrors, currency_english: null });
                  }}
                  className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all ${
                    editErrors.currency_english ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {editErrors.currency_english && (
                  <p className="text-xs text-red-500 mt-1">{editErrors.currency_english}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Currency Name (Urdu)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={editForm.currency_urdu}
                  onChange={(e) => setEditForm({ ...editForm, currency_urdu: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white font-urdu transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={editForm.currency_code}
                    onChange={(e) => {
                      setEditForm({ ...editForm, currency_code: e.target.value.toUpperCase() });
                      if (editErrors.currency_code) setEditErrors({ ...editErrors, currency_code: null });
                    }}
                    className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-xl font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all ${
                      editErrors.currency_code ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  {editErrors.currency_code && (
                    <p className="text-xs text-red-500 mt-1">{editErrors.currency_code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={editForm.currency_symbol}
                    onChange={(e) => setEditForm({ ...editForm, currency_symbol: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Active Status
                </span>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    editForm.is_active ? 'bg-[#166534]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      editForm.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#002a1b] hover:bg-[#003824] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Currency</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-gray-800">{selectedCurrency.currency_english}</span> ({selectedCurrency.currency_code})?
                This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCurrencies;
