import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Database, AlertCircle, RefreshCcw } from 'lucide-react';

const ReferenceTablePage = ({ 
  title, 
  description, 
  columns = [], 
  rows = [],
  loading = false,
  error = null,
  search = '',
  status = 'all',
  onSearchChange,
  onStatusChange,
  onReset,
  onRetry,
  emptyMessage,
  renderRow,
  showStatusFilter = false,
  extraFilters,
  onAdd
}) => {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="font-sans pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#002a1b]/10 text-[#002a1b] border border-[#002a1b]/20 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              {t('admin:referenceTableBadge', 'Reference Table')}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onAdd}
            disabled={!onAdd} 
            title={!onAdd ? t('admin:comingNext', 'Coming next') : undefined}
            className="inline-flex items-center justify-center px-4 py-2 bg-[#C59B27] hover:bg-[#b08920] text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Plus className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('admin:addNew', 'Add New')}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-[24px] shadow-sm border-x border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
              placeholder={t('admin:searchPlaceholder', 'Search...')}
              value={search}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
          </div>
          
          {showStatusFilter && (
            <select
              value={status}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="block w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
            >
              <option value="all">{t('admin:statusAll', 'All')}</option>
              <option value="active">{t('admin:statusActive', 'Active')}</option>
              <option value="inactive">{t('admin:statusInactive', 'Inactive')}</option>
            </select>
          )}
          
          {extraFilters}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            {t('admin:resetFilters', 'Reset')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-16">
                  {t('admin:colSr', 'SR.')}
                </th>
                {columns.map((col, i) => (
                  <th key={i} scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider w-24">
                  {t('admin:action', 'Action')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#C59B27] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <h3 className="text-sm font-medium text-gray-900">{t('admin:loading', 'Loading data...')}</h3>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="h-10 w-10 mb-4" />
                      <h3 className="text-sm font-medium">{error}</h3>
                      {onRetry && (
                        <button onClick={onRetry} className="mt-4 flex items-center gap-2 text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100">
                          <RefreshCcw className="w-4 h-4" /> {t('admin:retry', 'Retry')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Database className="h-10 w-10 text-gray-300 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900">{emptyMessage || t('admin:noDataFound', 'No data found.')}</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => renderRow(row, index))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        {!loading && !error && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              {t('admin:showingAllEntries', { count: rows.length, defaultValue: `Showing all ${rows.length} entries` })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceTablePage;
