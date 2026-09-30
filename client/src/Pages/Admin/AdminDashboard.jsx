import React from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Users, Building2, ClipboardList, Eye, CheckSquare, ShieldCheck, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getToken } from '../../Services/AuthSession';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation(['admin', 'common']);

  const token = getToken();
  let decodedUser = null;
  if (token) {
    decodedUser = parseJwt(token);
  }

  const firstName = user?.user_first_name || decodedUser?.user_first_name;
  const middleName = user?.user_middle_name || decodedUser?.user_middle_name;
  const lastName = user?.user_last_name || decodedUser?.user_last_name;

  const displayName = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-[#FAF8F3] font-sans pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('admin:welcomeBack', 'Welcome back')}, {displayName}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('admin:managePpc', 'Manage PPC operations from one place')}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Customers */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:customersModule', 'Customers')}</h3>
              <Users className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>

          {/* Card 2: Properties */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:propertiesModule', 'Properties')}</h3>
              <Building2 className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>

          {/* Card 3: Active Requests */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:activeRequests', 'Active Requests')}</h3>
              <ClipboardList className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>

          {/* Card 4: Visits */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:visitsModule', 'Visits')}</h3>
              <Eye className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>

          {/* Card 5: Inspections */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:inspectionsModule', 'Inspections')}</h3>
              <CheckSquare className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>

          {/* Card 6: Verifications */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('admin:verificationsModule', 'Verifications')}</h3>
              <ShieldCheck className="text-[#C59B27] w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-gray-900">--</p>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900">{t('admin:needsAttention', 'Needs Attention')}</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
              <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{t('admin:requestsAwaiting', 'Requests Awaiting Review')}</span>
              <Link to="/admin/requests" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#1a2b25] hover:bg-gray-50 transition-colors">
                {t('admin:viewRequests', 'View Requests')}
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{t('admin:pendingVisits', 'Pending Property Visits')}</span>
              <Link to="/admin/property-visits" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#1a2b25] hover:bg-gray-50 transition-colors">
                {t('admin:viewVisitsAction', 'View Visits')}
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
              <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{t('admin:pendingInspections', 'Pending Inspections')}</span>
              <Link to="/admin/inspection-reports" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#1a2b25] hover:bg-gray-50 transition-colors">
                {t('admin:viewInspections', 'View Inspections')}
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="font-semibold text-gray-800 mb-2 sm:mb-0">{t('admin:pendingVerifications', 'Pending Verifications')}</span>
              <Link to="/admin/verification-reports" className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#1a2b25] hover:bg-gray-50 transition-colors">
                {t('admin:viewVerifications', 'View Verifications')}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Operations Overview */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#C59B27]" />
              <h3 className="text-lg font-bold text-gray-900">{t('admin:operationsOverview', 'Operations Overview')}</h3>
            </div>
            <div className="space-y-2">
              <Link to="/admin/requests" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                <span className="font-semibold text-gray-700 group-hover:text-[#1a2b25]">{t('admin:customerRequests', 'Customer Requests')}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors rtl:-scale-x-100" />
              </Link>
              <Link to="/admin/property-visits" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                <span className="font-semibold text-gray-700 group-hover:text-[#1a2b25]">{t('admin:propertyVisits', 'Property Visits')}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors rtl:-scale-x-100" />
              </Link>
              <Link to="/admin/inspection-reports" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                <span className="font-semibold text-gray-700 group-hover:text-[#1a2b25]">{t('admin:inspectionReports', 'Inspection Reports')}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors rtl:-scale-x-100" />
              </Link>
              <Link to="/admin/verification-reports" className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group">
                <span className="font-semibold text-gray-700 group-hover:text-[#1a2b25]">{t('admin:verificationReports', 'Verification Reports')}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#C59B27] transition-colors rtl:-scale-x-100" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('admin:quickActions', 'Quick Actions')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/customers" className="flex items-center justify-center p-4 bg-[#FAF8F3] hover:bg-[#f1eed9] rounded-xl text-sm font-bold text-[#1a2b25] transition-colors text-center border border-transparent hover:border-[#e4d7be]">
                {t('admin:viewCustomers', 'View Customers')}
              </Link>
              <Link to="/admin/properties" className="flex items-center justify-center p-4 bg-[#FAF8F3] hover:bg-[#f1eed9] rounded-xl text-sm font-bold text-[#1a2b25] transition-colors text-center border border-transparent hover:border-[#e4d7be]">
                {t('admin:manageProperties', 'Manage Properties')}
              </Link>
              <Link to="/admin/requests" className="flex items-center justify-center p-4 bg-[#FAF8F3] hover:bg-[#f1eed9] rounded-xl text-sm font-bold text-[#1a2b25] transition-colors text-center border border-transparent hover:border-[#e4d7be]">
                {t('admin:reviewRequests', 'Review Requests')}
              </Link>
              <Link to="/admin/ppc-services" className="flex items-center justify-center p-4 bg-[#FAF8F3] hover:bg-[#f1eed9] rounded-xl text-sm font-bold text-[#1a2b25] transition-colors text-center border border-transparent hover:border-[#e4d7be]">
                {t('admin:manageServices', 'Manage PPC Services')}
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{t('admin:recentActivity', 'Recent Activity')}</h3>
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
            <p className="text-sm font-medium text-gray-400">{t('admin:noActivity', 'No activity data connected yet.')}</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
