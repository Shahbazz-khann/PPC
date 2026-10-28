import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, Search, Filter, RotateCcw, AlertCircle, RefreshCw, UserCheck, UserX, UserPlus, Eye } from 'lucide-react';
import { getAdminCustomers, getAdminCustomerStats } from '../../../Services/admin.services';
import Dropdown from '../../../Components/common/Dropdown';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
};

const AdminCustomers = () => {
  const { t } = useTranslation(['admin', 'common']);

  // --- Customers List State ---
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Stats State ---
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // --- Filter State ---
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');

  // --- Pagination State ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when debounced search or status filter changes
  const isInitialFilterMount = useRef(true);
  useEffect(() => {
    if (isInitialFilterMount.current) {
      isInitialFilterMount.current = false;
      return;
    }
    setPage(1);
  }, [debouncedSearch, status]);

  // Fetch Customer Statistics (Global, independent of table filters)
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getAdminCustomerStats();
      if (res?.success && res?.data) {
        setStats(res.data);
      } else {
        setStatsError(res?.message || 'Unable to load statistics');
      }
    } catch (err) {
      setStatsError(err?.message || 'Unable to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch Customer List
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        status,
        page,
        limit,
      };
      if (debouncedSearch && debouncedSearch.trim() !== '') {
        params.search = debouncedSearch.trim();
      }

      const res = await getAdminCustomers(params);
      if (res?.success) {
        setCustomers(res.data || []);
        const p = res.pagination || {};
        const metaTotal = Number(p.total) || 0;
        const metaTotalPages = Number(p.totalPages) || 0;
        setTotal(metaTotal);
        setTotalPages(metaTotalPages);

        // Safe out-of-range page stabilization
        if (metaTotal > 0 && page > metaTotalPages && metaTotalPages > 0) {
          setPage(metaTotalPages);
        }
      } else {
        setError(res?.message || t('admin:loadCustomersError', 'Unable to load customers.'));
      }
    } catch (err) {
      setError(err?.message || t('admin:loadCustomersError', 'Unable to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page, limit, t]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle Reset Filter
  const handleReset = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="font-sans pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('admin:customersPageTitle', 'Customers')}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {t('admin:customersPageDesc', 'Manage PPC customer accounts and activity.')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Customers */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('admin:totalCustomers', 'Total Customers')}
            </h3>
            <Users className="text-[#C59B27] w-6 h-6" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
          ) : statsError ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500 font-medium">{t('admin:statsUnavailable', 'Unavailable')}</span>
              <button
                type="button"
                onClick={fetchStats}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                title="Retry"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.total_customers ?? '0'}</p>
          )}
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('admin:activeCustomers', 'Active Customers')}
            </h3>
            <UserCheck className="text-emerald-500 w-6 h-6" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
          ) : statsError ? (
            <span className="text-xs text-red-500 font-medium">{t('admin:statsUnavailable', 'Unavailable')}</span>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.active_customers ?? '0'}</p>
          )}
        </div>

        {/* Inactive Customers */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('admin:inactiveCustomers', 'Inactive Customers')}
            </h3>
            <UserX className="text-red-400 w-6 h-6" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
          ) : statsError ? (
            <span className="text-xs text-red-500 font-medium">{t('admin:statsUnavailable', 'Unavailable')}</span>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.inactive_customers ?? '0'}</p>
          )}
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {t('admin:newCustomers', 'New Customers')}
            </h3>
            <UserPlus className="text-blue-500 w-6 h-6" />
          </div>
          {statsLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded" />
          ) : statsError ? (
            <span className="text-xs text-red-500 font-medium">{t('admin:statsUnavailable', 'Unavailable')}</span>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{stats?.new_customers ?? '0'}</p>
          )}
        </div>
      </div>

      {/* Toolbar - Separated Card */}
      <div className="bg-white px-4 py-3 rounded-[24px] shadow-sm border border-gray-100 mb-3 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
            placeholder={t('admin:searchCustomersPlaceholder', 'Search by name, email, mobile or customer ID...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter & Reset */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Dropdown
              icon={Filter}
              value={status}
              onChange={(val) => setStatus(val)}
              options={[
                { value: 'all', label: t('admin:statusAll', 'All Statuses') },
                { value: 'active', label: t('admin:statusActive', 'Active') },
                { value: 'inactive', label: t('admin:statusInactive', 'Inactive') }
              ]}
            />
          </div>

          {(search !== '' || status !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4 text-gray-500" />
              <span>{t('admin:reset', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container - Standalone Card */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-[24px] overflow-hidden">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchCustomers}
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('common:retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#002a1b] text-white">
              <tr>
                <th scope="col" className="px-4 py-4 text-start text-xs font-bold text-white uppercase tracking-wider w-12">
                  {t('admin:sr', 'SR')}
                </th>
                <th scope="col" className="px-4 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:customerId', 'Customer ID')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:customerName', 'Customer Name')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:emailAddress', 'Email')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:mobileNumber', 'Mobile')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:cnic', 'CNIC')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:registrationDate', 'Registration Date')}
                </th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:propertiesCol', 'Properties')}
                </th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:requestsCol', 'Requests')}
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:status', 'Status')}
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {t('admin:colAction', 'Action')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                /* Loading Skeleton Rows */
                Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-6" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                    <td className="px-4 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded w-8 mx-auto" /></td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        {t('admin:noCustomersFound', 'No customers found.')}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t('admin:noCustomersFoundDesc', 'Try adjusting your search or status filter.')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                customers.map((cust, idx) => {
                  const srNo = (page - 1) * limit + idx + 1;
                  return (
                    <tr key={cust.customer_id} className="hover:bg-gray-50/80 transition-colors">
                      {/* SR */}
                      <td className="px-4 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                        {srNo}
                      </td>

                      {/* Customer ID */}
                      <td className="px-4 py-4 text-sm font-mono font-bold text-gray-900 whitespace-nowrap">
                        <Link
                          to={`/admin/customers/${cust.customer_id}`}
                          className="hover:text-[#1E5631] hover:underline transition-colors"
                        >
                          #{cust.customer_id}
                        </Link>
                      </td>

                      {/* Customer Name */}
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                        <Link
                          to={`/admin/customers/${cust.customer_id}`}
                          className="hover:text-[#1E5631] hover:underline transition-colors"
                        >
                          {cust.customer_name || '-'}
                        </Link>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {cust.email ? (
                          <span className="font-mono text-gray-800">{cust.email}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Mobile */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap" dir="ltr">
                        {cust.mobile ? (
                          <span className="font-mono text-gray-800">{cust.mobile}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* CNIC */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap" dir="ltr">
                        {cust.customer_id_number ? (
                          <span className="font-mono text-gray-800">{cust.customer_id_number}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                        {formatDate(cust.date_of_registration)}
                      </td>

                      {/* Properties Count */}
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                          {cust.total_properties ?? '0'}
                        </span>
                      </td>

                      {/* Requests Count */}
                      <td className="px-4 py-4 text-sm font-bold text-gray-900 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                          {cust.total_requests ?? '0'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {cust.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t('admin:statusActive', 'Active')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {t('admin:statusInactive', 'Inactive')}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <Link
                          to={`/admin/customers/${cust.customer_id}`}
                          className="inline-flex items-center justify-center p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-sm transition-colors"
                          title={t('admin:viewDetails', 'View Details')}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && !error && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            {/* Showing Info & Rows Selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <span>
                {t('admin:showingRecords', {
                  start: total === 0 ? 0 : (page - 1) * limit + 1,
                  end: Math.min(page * limit, total),
                  total,
                  defaultValue: `Showing ${total === 0 ? 0 : (page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${total} records`,
                })}
              </span>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{t('admin:rowsLabel', 'Rows')}</span>
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

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        p === page
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
                  className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('admin:nextPage', 'Next page')}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
