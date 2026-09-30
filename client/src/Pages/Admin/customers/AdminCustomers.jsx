import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Users, Search, Filter, ChevronRight, UserCheck, UserX, UserPlus } from 'lucide-react';

const AdminCustomers = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:totalCustomers', 'Total Customers')}</h3>
            <Users className="text-[#C59B27] w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>
        
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:activeCustomers', 'Active Customers')}</h3>
            <UserCheck className="text-emerald-500 w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:inactiveCustomers', 'Inactive Customers')}</h3>
            <UserX className="text-red-400 w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:newCustomers', 'New Customers')}</h3>
            <UserPlus className="text-blue-500 w-6 h-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-[24px] shadow-sm border-x border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] sm:text-sm transition-colors"
            placeholder={t('admin:searchCustomersPlaceholder', 'Search by name, email, mobile or customer ID...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#C59B27] focus:border-[#C59B27] appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">{t('admin:statusAll', 'All Statuses')}</option>
            <option value="Active">{t('admin:statusActive', 'Active')}</option>
            <option value="Inactive">{t('admin:statusInactive', 'Inactive')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-b-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:customerId', 'Customer ID')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:customerName', 'Customer')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:contact', 'Contact')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:registered', 'Registered')}
                </th>
                <th scope="col" className="px-6 py-4 text-start text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:status', 'Status')}
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:propertiesCol', 'Properties')}
                </th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:requestsCol', 'Requests')}
                </th>
                <th scope="col" className="px-6 py-4 text-end text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('admin:action', 'Action')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {/* Empty State */}
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900">{t('admin:noCustomerData', 'Customer data is not connected yet.')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('admin:noCustomerDataDesc', 'The backend API integration is pending.')}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
