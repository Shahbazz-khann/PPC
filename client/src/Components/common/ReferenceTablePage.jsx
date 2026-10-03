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
  onAdd,
  pagination
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
      <div className="bg-white p-4 rounded-t-[24px] shadow-sm border-x border-t border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between w-full">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full flex-1 min-w-0">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
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
              className="block w-full sm:w-40 shrink-0 pl-3 pr-8 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
            >
              <option value="all">{t('admin:statusAll', 'All')}</option>
              <option value="active">{t('admin:statusActive', 'Active')}</option>
              <option value="inactive">{t('admin:statusInactive', 'Inactive')}</option>
            </select>
          )}
          
          {extraFilters}
        </div>
        
        <div className="flex items-center shrink-0 mt-2 md:mt-0 w-full md:w-auto">
          <button 
            onClick={onReset}
            className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200">
            {t('admin:resetFilters', 'Reset')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-[24px] overflow-hidden">
        <div className="overflow-x-auto overflow-y-hidden no-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-start text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-16">
                  {t('admin:colSr', 'SR.')}
                </th>
                {columns.map((col, i) => (
                  <th key={i} scope="col" className="px-4 py-3 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-end text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">
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

        {/* Pagination / Placeholder */}
        {!loading && !error && (
          pagination ? (
            <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  {t('admin:showingRecords', {
                    start: pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total,
                    defaultValue: `Showing ${pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.limit) + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} records`
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">{t('admin:rowsLabel', 'Rows')}</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => pagination.onLimitChange && pagination.onLimitChange(Number(e.target.value))}
                    className="border border-gray-200 rounded-md bg-white text-sm py-1 pl-2 pr-6 leading-tight focus:outline-none focus:ring-2 focus:ring-[#C59B27] cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {pagination.totalPages > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => pagination.onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('admin:prevPage', 'Previous page')}
                  >
                    ‹
                  </button>
                  {(() => {
                    const pages = [];
                    const { page, totalPages } = pagination;
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
                        onClick={() => typeof p === 'number' && pagination.onPageChange(p)}
                        disabled={p === '...'}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          p === pagination.page
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
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('admin:nextPage', 'Next page')}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>
                {t('admin:showingAllEntries', { count: rows.length, defaultValue: `Showing all ${rows.length} entries` })}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ReferenceTablePage;
