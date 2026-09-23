import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, Clock, User, Building, ShieldCheck, FileText, HelpCircle, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getApprovalBadge } from './CustomerVerificationReports';
import { getCustomerVerificationReportByPropertyId, resolveMediaUrl } from '../../../Services/customer.services';
import { useTranslation } from 'react-i18next';

const CustomerVerificationDetails = () => {
  const { propertyId } = useParams();
  const { t } = useTranslation(['verificationReports', 'common']);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerVerificationReportByPropertyId(propertyId);
      if (res?.success) {
        setReport(res.data);
      } else {
        setError(res?.message || t('verificationReports:verificationReportNotFound'));
      }
    } catch (err) {
      setError(err.message || t('verificationReports:errorFetchingReport'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-[#1a2b25] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{t('verificationReports:loadingDetails')}</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center font-sans">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || t('verificationReports:verificationReportNotFoundHeader')}</h2>
        <Link to="/customer/verification-reports" className="text-[#B8860B] hover:underline font-bold mt-4">
          {t('verificationReports:returnToVerificationReports')}
        </Link>
      </div>
    );
  }

  const stage = report.approvalStage;
  const badge = getApprovalBadge(stage);
  const property = report.property;
  const verification = report.verification;
  const verificationIdStr = report.verificationId || 'N/A';

  const imageSrc = property?.imageUrl ? resolveMediaUrl(property.imageUrl) : null;
  const locationString = [property?.societyName, property?.cityName].filter(Boolean).join(', ') || t('verificationReports:noLocation');
  const titleString = [property?.propertyType, property?.societyName].filter(Boolean).join(' in ') || t('verificationReports:unknownProperty');

  // Status text map based on rules
  const getStatusText = (st) => {
    switch (st) {
      case 'Pending': return t('verificationReports:waitingForPPCReview');
      case 'Under Review': return t('verificationReports:ppcManagementIsReviewing');
      case 'Approved': return t('verificationReports:approvedPropertiesAreEligible');
      case 'Rejected': return t('verificationReports:propertyNotApproved');
      default: return '';
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-4">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">{t('common:dashboard')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <Link to="/customer/verification-reports" className="hover:text-gray-900 transition-colors">{t('verificationReports:verificationReports')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <span className="text-[#1a2b25]">{t('verificationReports:property')} {propertyId}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-4">
        
        {/* 1. VERIFICATION REPORT HEADER */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-5 min-h-[120px]">
          <div className="relative z-20 flex items-start gap-6 w-full">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border bg-[#fafcfb] ${badge.text.replace('text-white', badge.bg.replace('bg-', 'text-'))} border-current/20`}>
              <ShieldCheck size={36} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{t('verificationReports:property')} {propertyId}</span>
                <span className={`px-3 py-1 bg-opacity-10 backdrop-blur-sm ${badge.text.replace('text-white', badge.bg.replace('bg-', 'text-'))} ${badge.bg.replace('bg-', 'bg-opacity-10 bg-')} text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 border border-current/20`}>
                  {badge.icon} {stage}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                {t('verificationReports:verificationReport')}
              </h1>
              
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                {titleString}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Primary Report Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2. PROPERTY APPROVAL STATUS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('verificationReports:propertyApprovalStatus')}</h3>
              </div>
              <div className="p-4 sm:p-5 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${badge.bg} ${badge.text} shadow-sm`}>
                  {React.cloneElement(badge.icon, { size: 28 })}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{t(`verificationReports:${stage.toLowerCase().replace(' ', '')}`) || stage}</h4>
                  <p className="text-[15px] font-medium text-gray-600">{getStatusText(stage)}</p>
                </div>
              </div>
            </div>

            {/* 4. VERIFICATION INFORMATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <FileText size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('verificationReports:verificationInformation')}</h3>
              </div>
              <div className="p-4 sm:p-4">
                {verification?.verificationDate ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verificationId')}</span>
                      <span className="text-sm font-bold text-gray-800">{verificationIdStr}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verificationDate')}</span>
                      <span className="text-sm font-bold text-gray-800">{verification.verificationDate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verificationTime')}</span>
                      <span className="text-sm font-bold text-gray-800">{verification.verificationTime}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-4 border-t border-gray-50">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:verifiedBy')}</span>
                      <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                        <User size={16} /> 
                        {verification.verifiedBy ? (
                          <>
                            {verification.verifiedBy.name} 
                            <span className="text-xs text-gray-500 font-medium ml-1 rtl:mr-1 rtl:ml-0">({verification.verifiedBy.designation})</span>
                          </>
                        ) : t('verificationReports:notAssignedYet')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-[15px] font-medium text-gray-500 italic">{t('verificationReports:verificationHasNotStartedYet')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. VERIFICATION FINDINGS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('verificationReports:verificationFindings')}</h3>
              </div>
              <div className="p-4 sm:p-5">
                {verification?.findings ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {verification.findings}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">{t('verificationReports:noVerificationFindings')}</p>
                )}
              </div>
            </div>

            {/* 6. VERIFICATION REMARKS */}
            <div className={`rounded-[20px] shadow-sm border overflow-hidden ${stage === 'Rejected' ? 'bg-[#fffafa] border-[#8c3535]/20' : 'bg-[#fafcfb] border-[#1E5631]/10'}`}>
              <div className={`p-4 sm:p-5 border-b flex items-center gap-2 ${stage === 'Rejected' ? 'border-[#8c3535]/10' : 'border-[#1E5631]/10'}`}>
                <HelpCircle size={20} className={stage === 'Rejected' ? 'text-[#8c3535]' : 'text-[#1E5631]'} />
                <h3 className={`text-lg font-serif font-bold ${stage === 'Rejected' ? 'text-[#8c3535]' : 'text-[#1a2b25]'}`}>{t('verificationReports:verificationRemarks')}</h3>
              </div>
              <div className="p-4 sm:p-5">
                {verification?.remarks ? (
                  <p className={`text-[15px] font-medium leading-relaxed whitespace-pre-wrap ${stage === 'Rejected' ? 'text-[#8c3535] font-semibold' : 'text-gray-700'}`}>
                    {verification.remarks}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">{t('verificationReports:noVerificationRemarks')}</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Property & Employee */}
          <div className="space-y-6">
            
            {/* 7. VERIFIED BY */}
            {verification?.verifiedBy && (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                  <User size={18} className="text-[#B8860B]" />
                  <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">{t('verificationReports:reviewedVerifiedBy')}</h3>
                </div>
                <div className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-white ring-2 ring-gray-50">
                    {verification.verifiedBy.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{verification.verifiedBy.name}</h4>
                    <p className="text-xs font-medium text-gray-500">{verification.verifiedBy.designation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. RELATED PROPERTY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <Building size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">{t('verificationReports:relatedProperty')}</h3>
              </div>
              
              {property ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100">
                    {imageSrc ? (
                      <img src={imageSrc} alt="Property" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-gray-400 font-medium absolute inset-0 flex items-center justify-center">${t('verificationReports:noImage')}</span>` }} />
                    ) : (
                      <span className="text-gray-400 font-medium absolute inset-0 flex items-center justify-center">{t('verificationReports:noImage')}</span>
                    )}
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:propertyId')}</span>
                        <span className="font-bold text-gray-800">{propertyId}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:location')}</span>
                        <span className="font-semibold text-gray-600 flex items-center gap-1">
                          <MapPin size={12} /> {locationString}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:type')}</span>
                        <span className="font-semibold text-gray-700">{property.propertyType}</span>
                      </div>
                      {property.propertySize && (
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('verificationReports:size')}</span>
                          <span className="font-semibold text-gray-700">{property.propertySize} {property.propertySizeUom}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <Link 
                        to={`/customer/properties/${propertyId}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-[#1a2b25] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        {t('verificationReports:viewProperty')}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                    <Building size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">{t('verificationReports:unknownProperty')}</p>
                  <p className="text-xs text-gray-400">{t('verificationReports:propertyDetailsNotLoaded')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerVerificationDetails;
