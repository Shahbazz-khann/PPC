import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Home,
  FileText,
  Eye,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Clock,
  Fingerprint,
} from 'lucide-react';
import { getAdminCustomerById } from '../../../Services/admin.services';

/**
 * Format ISO timestamp to UK date string (e.g., 08 Sep 2026).
 */
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

/**
 * Format ISO timestamp to UK date & time string (e.g., 08 Sep 2026, 12:46).
 */
const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    const datePart = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${datePart}, ${timePart}`;
  } catch {
    return '-';
  }
};

/**
 * Extracts uppercase initials from full customer name.
 */
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'C';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const AdminCustomerDetails = () => {
  const { customerId } = useParams();
  const { t } = useTranslation(['admin', 'common']);

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [invalidId, setInvalidId] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    // Structural ID guard (positive integer string)
    if (!customerId || !/^[1-9]\d*$/.test(String(customerId).trim())) {
      setInvalidId(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setInvalidId(false);

    try {
      const res = await getAdminCustomerById(String(customerId).trim());

      if (res?.success && res?.data) {
        setCustomer(res.data);
      } else if (res?.status === 404 || res?.message?.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else if (res?.status === 400 || res?.message?.toLowerCase().includes('positive integer')) {
        setInvalidId(true);
      } else {
        setError(res?.message || t('admin:errorLoadingCustomer', 'Unable to load customer details. Please try again.'));
      }
    } catch (err) {
      if (err?.status === 404 || err?.message?.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else if (err?.status === 400 || err?.message?.toLowerCase().includes('positive integer')) {
        setInvalidId(true);
      } else {
        setError(err?.message || t('admin:errorLoadingCustomer', 'Unable to load customer details. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  }, [customerId, t]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // --- Render: Invalid ID State ---
  if (invalidId) {
    return (
      <div className="font-sans pb-12">
        <div className="mb-6">
          <Link
            to="/admin/customers"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1E5631] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
            {t('admin:backToCustomers', 'Back to Customers')}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('admin:invalidCustomerId', 'Invalid customer ID.')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('admin:invalidCustomerIdDesc', 'The customer ID must be a valid positive integer.')}
          </p>
          <Link
            to="/admin/customers"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#002a1b] text-white text-sm font-bold shadow-sm hover:bg-[#1E5631] transition-colors"
          >
            {t('admin:backToCustomers', 'Back to Customers')}
          </Link>
        </div>
      </div>
    );
  }

  // --- Render: 404 Not Found State ---
  if (notFound) {
    return (
      <div className="font-sans pb-12">
        <div className="mb-6">
          <Link
            to="/admin/customers"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1E5631] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
            {t('admin:backToCustomers', 'Back to Customers')}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('admin:customerNotFound', 'Customer not found.')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('admin:customerNotFoundDesc', 'The customer profile you are looking for does not exist or has been removed.')}
          </p>
          <Link
            to="/admin/customers"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#002a1b] text-white text-sm font-bold shadow-sm hover:bg-[#1E5631] transition-colors"
          >
            {t('admin:backToCustomers', 'Back to Customers')}
          </Link>
        </div>
      </div>
    );
  }

  // --- Render: Unexpected Error State ---
  if (error && !loading) {
    return (
      <div className="font-sans pb-12">
        <div className="mb-6">
          <Link
            to="/admin/customers"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1E5631] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
            {t('admin:backToCustomers', 'Back to Customers')}
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {t('admin:error', 'Error')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchCustomerDetails}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('admin:retry', 'Retry')}
            </button>
            <Link
              to="/admin/customers"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#002a1b] text-white text-sm font-bold shadow-sm hover:bg-[#1E5631] transition-colors"
            >
              {t('admin:backToCustomers', 'Back to Customers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Loading Skeleton ---
  if (loading) {
    return (
      <div className="font-sans pb-12 animate-pulse">
        {/* Back link skeleton */}
        <div className="h-4 bg-gray-200 rounded w-36 mb-6" />

        {/* Header skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200" />
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded-full w-24" />
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 h-28" />
          ))}
        </div>

        {/* Information sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-gray-100 h-64" />
          ))}
        </div>
      </div>
    );
  }

  const initials = getInitials(customer?.customer_name);

  return (
    <div className="font-sans pb-12">
      {/* 1. Breadcrumb / Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/admin/customers"
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1E5631] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
          {t('admin:backToCustomers', 'Back to Customers')}
        </Link>
      </div>

      {/* 2. Page Header Area */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#002a1b] text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">
                {customer?.customer_name || t('admin:customerDetails', 'Customer Details')}
              </h1>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                #{customer?.customer_id}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t('admin:customerProfileSubtitle', 'View customer profile and activity summary.')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center shrink-0">
          {customer?.is_active ? (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('admin:statusActive', 'Active')}
            </span>
          ) : (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('admin:statusInactive', 'Inactive')}
            </span>
          )}
        </div>
      </div>

      {/* 3. Summary Metric Cards (Top Authoritative Counters) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Properties Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t('admin:propertiesCol', 'Properties')}
            </p>
            <p className="text-2xl font-bold font-mono text-gray-900 mt-0.5">
              {customer?.total_properties ?? '0'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('admin:totalPropertiesOwned', 'Total properties registered')}
            </p>
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t('admin:requestsCol', 'Requests')}
            </p>
            <p className="text-2xl font-bold font-mono text-gray-900 mt-0.5">
              {customer?.total_requests ?? '0'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('admin:totalCustomerRequests', 'Total service requests submitted')}
            </p>
          </div>
        </div>

        {/* Property Visits Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t('admin:propertyVisits', 'Property Visits')}
            </p>
            <p className="text-2xl font-bold font-mono text-gray-900 mt-0.5">
              {customer?.total_property_visits ?? '0'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('admin:totalVisitsAttended', 'Total property visits attended')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Structured Information Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section A: Basic / Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <User className="w-5 h-5 text-[#C59B27]" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('admin:basicInformation', 'Basic Information')}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:customerId', 'Customer ID')}
              </p>
              <p className="text-sm font-mono font-bold text-gray-900">
                #{customer?.customer_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:linkedUserId', 'Linked User ID')}
              </p>
              <p className="text-sm font-mono font-bold text-gray-900">
                #{customer?.user_id}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:fullName', 'Full Name')}
              </p>
              <p className="text-sm font-bold text-gray-900">
                {customer?.customer_name || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:title', 'Title')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {customer?.title_abb ? (
                  <span>
                    {customer.title_abb}
                    {customer.title_description ? (
                      <span className="text-gray-500 text-xs ml-1.5 rtl:mr-1.5 rtl:ml-0 font-normal">
                        ({customer.title_description})
                      </span>
                    ) : null}
                  </span>
                ) : (
                  '-'
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:gender', 'Gender')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {customer?.gender_english || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:firstName', 'First Name')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {customer?.customer_first_name || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:middleName', 'Middle Name')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {customer?.customer_middle_name || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:lastName', 'Last Name')}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {customer?.customer_last_name || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:status', 'Status')}
              </p>
              <p className="text-sm font-semibold">
                {customer?.is_active ? (
                  <span className="text-emerald-700">{t('admin:statusActive', 'Active')}</span>
                ) : (
                  <span className="text-rose-700">{t('admin:statusInactive', 'Inactive')}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Section B: Contact Information & Permissions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#C59B27]" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('admin:contactInformation', 'Contact Information')}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:email', 'Email')}
              </p>
              <div className="flex items-center gap-2 text-sm font-mono font-semibold text-gray-900" dir="ltr">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{customer?.email || '-'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:mobile', 'Mobile')}
              </p>
              <div className="flex items-center gap-2 text-sm font-mono font-semibold text-gray-900" dir="ltr">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{customer?.mobile || '-'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                {t('admin:communicationPermissions', 'Communication Permissions')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Communication */}
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      {t('admin:mobileAllowed', 'Mobile Communication')}
                    </span>
                  </div>
                  {customer?.mobile_allowed === true ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('admin:allowed', 'Allowed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                      {t('admin:notAllowed', 'Not Allowed')}
                    </span>
                  )}
                </div>

                {/* Web Communication */}
                <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700">
                      {t('admin:webAllowed', 'Web Communication')}
                    </span>
                  </div>
                  {customer?.web_allowed === true ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t('admin:allowed', 'Allowed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                      {t('admin:notAllowed', 'Not Allowed')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section C: Identity & Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-[#C59B27]" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('admin:identityInformation', 'Identity & Location')}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:identityType', 'Identity Type')}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>{customer?.identity_description || '-'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:identityNumber', 'Identity Number')}
              </p>
              <p className="text-sm font-mono font-bold text-gray-900" dir="ltr">
                {customer?.customer_id_number || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:country', 'Country')}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{customer?.country_english || '-'}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:gpsCoordinates', 'GPS Coordinates')}
              </p>
              <p className="text-sm font-mono text-gray-700" dir="ltr">
                {customer?.gps_coordinates || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Section D: System & Audit Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C59B27]" />
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('admin:systemInformation', 'System & Audit Information')}
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:registrationDate', 'Registration Date')}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{formatDate(customer?.date_of_registration)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:createdBy', 'Created By')}
              </p>
              <p className="text-sm font-mono text-gray-900">
                {customer?.created_by_user ? `#${customer.created_by_user}` : '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:createdAt', 'Record Created')}
              </p>
              <p className="text-sm text-gray-700">
                {formatDateTime(customer?.creation_date_time)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:updatedAt', 'Last Updated')}
              </p>
              <p className="text-sm text-gray-700">
                {formatDateTime(customer?.update_date_time)}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                {t('admin:urlUsed', 'Registration URL')}
              </p>
              <p className="text-sm font-mono text-gray-600 break-all" dir="ltr">
                {customer?.url_used || '-'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCustomerDetails;
