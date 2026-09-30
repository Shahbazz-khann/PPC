import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, ShieldCheck, Home, FileText, Eye, CheckSquare, Shield } from 'lucide-react';

const AdminCustomerDetails = () => {
  const { customerId } = useParams();
  const { t } = useTranslation(['admin', 'common']);

  // Placeholder static data structure for frontend readiness
  const customer = null;

  return (
    <div className="font-sans pb-12">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-6 flex items-center text-sm font-medium text-gray-500">
        <Link to="/admin/customers" className="hover:text-[#C59B27] flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1 rtl:rotate-180" />
          {t('admin:backToCustomers', 'Back to Customers')}
        </Link>
      </div>

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#002a1b] text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {customer ? customer.initials : 'C'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {customer ? customer.fullName : t('admin:customerDetailsPending', 'Customer Details')}
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                #{customerId}
              </span>
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t('admin:customerProfileSubtitle', 'Manage customer profile and view activity history.')}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            {t('admin:statusPending', 'Status Unknown')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile */}
        <div className="col-span-1 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#C59B27]" />
                {t('admin:customerProfile', 'Customer Profile')}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin:fullName', 'Full Name')}</p>
                <p className="text-sm font-semibold text-gray-900">{customer ? customer.fullName : '--'}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin:emailAddress', 'Email Address')}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {customer ? customer.email : '--'}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin:mobileNumber', 'Mobile Number')}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {customer ? customer.mobile : '--'}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin:country', 'Country')}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {customer ? customer.country : '--'}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin:registrationDate', 'Registration Date')}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {customer ? customer.registrationDate : '--'}
                </div>
              </div>

            </div>
          </div>

          {/* Activity Overview Card */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                {t('admin:customerActivity', 'Customer Activity')}
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('admin:propertiesCol', 'Properties')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">--</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('admin:requestsCol', 'Requests')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">--</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('admin:propertyVisits', 'Property Visits')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">--</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('admin:inspectionReports', 'Inspection Reports')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">--</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{t('admin:verificationReports', 'Verification Reports')}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">--</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detail Modules */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* Properties Section */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('admin:propertiesCol', 'Properties')}</h3>
            </div>
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Home className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">{t('admin:noPropertyData', 'No property data connected yet.')}</p>
            </div>
          </div>

          {/* Requests Section */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('admin:customerRequests', 'Customer Requests')}</h3>
            </div>
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <FileText className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">{t('admin:noRequestData', 'No request data connected yet.')}</p>
            </div>
          </div>

          {/* Visits Section */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">{t('admin:propertyVisits', 'Property Visits')}</h3>
            </div>
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Eye className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">{t('admin:noVisitData', 'No property visit data connected yet.')}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminCustomerDetails;
