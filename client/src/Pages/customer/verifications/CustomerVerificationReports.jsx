import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, User, FileText, Calendar, Clock, ShieldCheck, CheckCircle2, Clock3, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { getCustomerVerificationReports, resolveMediaUrl } from '../../../Services/customer.services';
import { useTranslation } from 'react-i18next';

// Helper for badge styling
export const getApprovalBadge = (stage) => {
  switch (stage) {
    case 'Approved':
      return { bg: 'bg-[#1E5631]', text: 'text-white', icon: <CheckCircle2 size={12} /> };
    case 'Pending':
      return { bg: 'bg-[#B8860B]', text: 'text-white', icon: <Clock3 size={12} /> };
    case 'Under Review':
      return { bg: 'bg-[#5c6b63]', text: 'text-white', icon: <RefreshCw size={12} /> };
    case 'Rejected':
      return { bg: 'bg-[#8c3535]', text: 'text-white', icon: <AlertCircle size={12} /> };
    default:
      return { bg: 'bg-gray-500', text: 'text-white', icon: <ShieldCheck size={12} /> };
  }
};

const VerificationCard = ({ report }) => {
  const { t } = useTranslation(['verificationReports']);
  const stage = report.approvalStage;
  const badge = getApprovalBadge(stage);
  
  const imageSrc = report.imageUrl ? resolveMediaUrl(report.imageUrl) : null;
  
  // Format the location and title safely
  const locationString = [report.societyName, report.cityName].filter(Boolean).join(', ') || t('verificationReports:noLocation');
  const titleString = [report.propertyType, report.societyName].filter(Boolean).join(' in ') || t('verificationReports:unknownProperty');

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow min-h-[180px]">

      {/* LEFT: Property Image */}
      <div className="relative w-full md:w-[35%] xl:w-[28%] shrink-0 h-56 md:h-auto bg-gray-100 flex flex-col items-center justify-center">
        {imageSrc ? (
          <img src={imageSrc} alt="Property" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-gray-400 font-medium z-10 relative">${t('verificationReports:noImage')}</span>` }} />
        ) : (
          <span className="text-gray-400 font-medium">{t('verificationReports:noImage')}</span>
        )}

        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-col gap-2">
          <span className={`px-3 py-1.5 ${badge.bg} ${badge.text} text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 w-max backdrop-blur-sm bg-opacity-95`}>
            {badge.icon} {stage}
          </span>
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {report.propertyId}
          </span>
        </div>
      </div>

      {/* RIGHT WRAPPER (Info + Actions) */}
      <div className="flex-1 flex flex-col xl:flex-row min-w-0">

        {/* CENTER: Property & Verification Info */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col justify-center border-b xl:border-b-0 xl:border-e border-gray-100 min-w-0">

          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2 leading-snug break-words">
              {titleString}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {locationString}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span>{report.propertyType || t('verificationReports:unknown')}</span>
              {report.propertySize && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{report.propertySize} {report.propertySizeUom}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {report.verificationDate ? (
              <>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verificationDate')}</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={14} className="text-[#B8860B]" /> {report.verificationDate}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verificationTime')}</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={14} className="text-[#B8860B]" /> {report.verificationTime}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verifiedBy')}</span>
                  <span className="text-sm font-bold text-[#1a2b25] flex items-center gap-2">
                    <User size={14} className="text-[#1E5631]" /> {report.verifiedBy ? `${report.verifiedBy.name} - ${report.verifiedBy.designation}` : t('verificationReports:notAssignedYet')}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center h-full py-2">
                <span className="text-sm font-medium text-gray-500 italic">
                  {stage === 'Pending' ? t('verificationReports:verificationNotStarted') : t('verificationReports:verificationDetailsWillAppear')}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Actions */}
        <div className="p-5 lg:p-6 w-full xl:w-[280px] shrink-0 flex flex-col justify-center bg-gray-50/30 gap-3">
          <Link
            to={`/customer/verification-reports/${report.propertyId}`} 
            className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} /> {t('verificationReports:viewVerificationReport')}
          </Link>
          <Link
            to={`/customer/properties/${report.propertyId}`}
            className="w-full text-center py-3 rounded-xl border border-gray-200 text-[#1a2b25] bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            {t('verificationReports:viewProperty')}
          </Link>
        </div>
      </div>

    </div>
  );
};

const CustomerVerificationReports = () => {
  const { t } = useTranslation(['verificationReports']);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerVerificationReports();
      if (res?.success) {
        setReports(res.data || []);
      } else {
        setError(res?.message || t('verificationReports:failedToLoadVerificationReports'));
      }
    } catch (err) {
      setError(err.message || t('verificationReports:errorFetchingReports'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const totalProperties = reports.length;
  const pendingCount = reports.filter(v => v.approvalStage === 'Pending').length;
  const underReviewCount = reports.filter(v => v.approvalStage === 'Under Review').length;
  const approvedCount = reports.filter(v => v.approvalStage === 'Approved').length;
  const rejectedCount = reports.filter(v => v.approvalStage === 'Rejected').length;

  const getDisplayedVerifications = () => {
    if (activeFilter === 'All') return reports;
    return reports.filter(v => v.approvalStage === activeFilter);
  };

  const displayedVerifications = getDisplayedVerifications();

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4 ">

        <div className="mb-4">
          <h1 className="text-3xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-1">{t('verificationReports:verificationReports')}</h1>
          <p className="text-gray-600 font-medium max-w-2xl">
            {t('verificationReports:verificationReportsDesc')}
          </p>
        </div>

        {/* Summary Cards (Filters) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">

          <button onClick={() => setActiveFilter('All')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2b25] ${activeFilter === 'All' ? 'bg-[#1a2b25] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'All' ? 'text-gray-300' : 'text-gray-400'}`}>{t('verificationReports:totalProperties')}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{totalProperties}</h3>
              <FileText size={24} className={activeFilter === 'All' ? 'text-gray-400' : 'text-gray-200'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Pending')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#B8860B] ${activeFilter === 'Pending' ? 'bg-[#B8860B] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Pending' ? 'text-white/80' : 'text-gray-400'}`}>{t('verificationReports:pending')}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{pendingCount}</h3>
              <Clock3 size={24} className={activeFilter === 'Pending' ? 'text-white/30' : 'text-[#B8860B]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Under Review')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#5c6b63] ${activeFilter === 'Under Review' ? 'bg-[#5c6b63] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Under Review' ? 'text-white/80' : 'text-gray-400'}`}>{t('verificationReports:underReview')}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{underReviewCount}</h3>
              <RefreshCw size={24} className={activeFilter === 'Under Review' ? 'text-white/30' : 'text-[#5c6b63]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Approved')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5631] ${activeFilter === 'Approved' ? 'bg-[#1E5631] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Approved' ? 'text-white/80' : 'text-gray-400'}`}>{t('verificationReports:approved')}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{approvedCount}</h3>
              <CheckCircle2 size={24} className={activeFilter === 'Approved' ? 'text-white/30' : 'text-[#1E5631]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Rejected')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#8c3535] ${activeFilter === 'Rejected' ? 'bg-[#8c3535] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Rejected' ? 'text-white/80' : 'text-gray-400'}`}>{t('verificationReports:rejected')}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{rejectedCount}</h3>
              <AlertCircle size={24} className={activeFilter === 'Rejected' ? 'text-white/30' : 'text-[#8c3535]/20'} />
            </div>
          </button>

        </div>
        
        {/* State Handling: Loading, Error, Data */}
        {loading ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
             <Loader2 className="w-8 h-8 text-[#1a2b25] animate-spin mb-4" />
             <p className="text-gray-500 font-medium text-sm">{t('verificationReports:loadingVerificationReports')}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-red-100 p-10 flex flex-col items-center text-center">
             <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
             <h3 className="text-xl font-bold text-gray-900 mb-2">{t('verificationReports:errorLoadingData')}</h3>
             <p className="text-gray-600 mb-6 max-w-md">{error}</p>
             <button onClick={fetchReports} className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2">
               <RefreshCw size={16} /> {t('verificationReports:retry')}
             </button>
          </div>
        ) : displayedVerifications.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedVerifications.map(report => (
              <VerificationCard key={report.propertyId} report={report} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{t('verificationReports:noPropertiesFound')}</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              {t('verificationReports:noPropertiesMatchingStage')}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerVerificationReports;

