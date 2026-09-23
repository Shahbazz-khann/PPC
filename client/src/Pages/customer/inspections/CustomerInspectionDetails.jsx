import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, Clock, User, Building, Home, FileText, ClipboardList, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { getCustomerInspectionReportById, resolveMediaUrl } from '../../../Services/customer.services';
import { useTranslation } from 'react-i18next';

const CustomerInspectionDetails = () => {
  const { inspectionId } = useParams();
  const { t } = useTranslation(['inspectionReports', 'common']);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerInspectionReportById(inspectionId);
      if (res?.success) {
        setReport(res.data);
      } else {
        setError(res?.message || t('inspectionReports:inspectionReportNotFound'));
      }
    } catch (err) {
      setError(err.message || t('inspectionReports:errorFetchingReport'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inspectionId) {
      fetchReport();
    }
  }, [inspectionId]);

  // Helper for checklist icon/color (compatible with both old mocks and future DB statuses)
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Verified':
      case 'Satisfactory':
        return { bg: 'bg-[#EAF3EE]', text: 'text-[#1E5631]', border: 'border-[#1E5631]/20', icon: <CheckCircle2 size={16} /> };
      case 'Needs Attention':
      case 'Partially Verified':
        return { bg: 'bg-[#FFF4E5]', text: 'text-[#B8860B]', border: 'border-[#B8860B]/20', icon: <AlertCircle size={16} /> };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', icon: <HelpCircle size={16} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#1E5631] mb-4" size={32} />
        <p className="text-gray-500 font-medium">{t('inspectionReports:loadingInspectionDetails')}</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || t('inspectionReports:inspectionReportNotFoundHeader')}</h2>
        <div className="flex gap-4 mt-4">
          <Link to="/customer/inspection-reports" className="px-6 py-2.5 bg-white border border-gray-200 text-[#1a2b25] text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            {t('inspectionReports:returnToList')}
          </Link>
          {error && (
            <button onClick={fetchReport} className="px-6 py-2.5 bg-[#1E5631] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#2c4232] transition-colors">
              {t('inspectionReports:retry')}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Derived properties safely
  const propertyTitle = [report.property?.propertyType, report.property?.societyName].filter(Boolean).join(' in ') || t('inspectionReports:unknownProperty');
  const propertyLocation = [report.property?.societyName, report.property?.cityName].filter(Boolean).join(', ') || t('inspectionReports:noLocation');
  const imageSrc = report.property?.imageUrl ? resolveMediaUrl(report.property.imageUrl) : '/placeholder-image.jpg';

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">{t('common:dashboard')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <Link to="/customer/inspection-reports" className="hover:text-gray-900 transition-colors">{t('inspectionReports:inspectionReports')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <span className="text-[#1a2b25]">{report.inspectionId}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-6">
        
        {/* 1. INSPECTION REPORT HEADER */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-5 sm:p-6 min-h-[120px]">
          <div className="relative z-20 flex items-start gap-6 w-full">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border bg-[#fafcfb] border-[#1E5631]/20 text-[#1E5631]">
              <FileText size={36} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{report.inspectionId}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                {t('inspectionReports:inspectionReport')}
              </h1>
              
              <p className="text-sm font-semibold text-gray-600 flex flex-wrap items-center gap-2">
                <Calendar size={14} className="text-gray-400" /> {report.inspectionDate || 'N/A'}
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mx-1"></span>
                <Home size={14} className="text-gray-400" /> {propertyTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Primary Report Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 3. INSPECTION INFORMATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <FileText size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('inspectionReports:inspectionInformation')}</h3>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:inspectionId')}</span>
                  <span className="text-sm font-bold text-gray-800">{report.inspectionId}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:inspectionDate')}</span>
                  <span className="text-sm font-bold text-gray-800">{report.inspectionDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:inspectionTime')}</span>
                  <span className="text-sm font-bold text-gray-800">{report.inspectionTime || 'N/A'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-4 border-t border-gray-50">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:inspectedBy')}</span>
                  <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                    <User size={16} /> 
                    {report.inspectedBy ? (
                      <>
                        {report.inspectedBy.name}
                        <span className="text-xs text-gray-500 font-medium ml-1 rtl:mr-1 rtl:ml-0">({report.inspectedBy.designation})</span>
                      </>
                    ) : (
                      <span className="text-gray-500 font-normal text-sm">{t('inspectionReports:inspectorInformationUnavailable')}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. INSPECTION FINDINGS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('inspectionReports:inspectionFindings')}</h3>
              </div>
              <div className="p-4 sm:p-5">
                {report.findings ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.findings}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">{t('inspectionReports:noInspectionFindings')}</p>
                )}
              </div>
            </div>

            {/* 5. INSPECTION REMARKS */}
            <div className="bg-[#fafcfb] rounded-[20px] shadow-sm border border-[#1E5631]/10 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#1E5631]/10 flex items-center gap-2">
                <HelpCircle size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('inspectionReports:inspectionRemarks')}</h3>
              </div>
              <div className="p-4 sm:p-5">
                {report.remarks ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {report.remarks}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">{t('inspectionReports:noInspectionRemarks')}</p>
                )}
              </div>
            </div>

            {/* 6. INSPECTION CHECKLIST */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <ClipboardList size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('inspectionReports:inspectionChecklist')}</h3>
              </div>
              <div className="p-4 sm:p-5 space-y-4">
                {report.checklist && report.checklist.length > 0 ? (
                  report.checklist.map((item, idx) => {
                    const style = getStatusStyle(item.status);
                    return (
                      <div key={idx} className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <h4 className="text-sm font-bold text-gray-800">{item.item}</h4>
                          {item.remarks ? (
                            <p className="text-xs font-medium text-gray-600 leading-relaxed max-w-xl">
                              <span className="font-bold text-gray-400 mr-1 rtl:ml-1 rtl:mr-0">Remarks:</span>
                              "{item.remarks}"
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-gray-400 italic">{t('inspectionReports:noRemarksForItem')}</p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border}`}>
                            {style.icon} {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic text-center py-6">{t('inspectionReports:noChecklistAvailable')}</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Property & Inspector */}
          <div className="space-y-6">
            
            {/* 7. INSPECTOR INFORMATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <User size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">{t('inspectionReports:inspectedBy')}</h3>
              </div>
              <div className="p-4 sm:p-5 flex items-center gap-4">
                {report.inspectedBy ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-white ring-2 ring-gray-50 uppercase">
                      {report.inspectedBy.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{report.inspectedBy.name}</h4>
                      <p className="text-xs font-medium text-gray-500">{report.inspectedBy.designation}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 font-normal text-sm">{t('inspectionReports:inspectorInformationUnavailable')}</p>
                )}
              </div>
            </div>

            {/* 2. RELATED PROPERTY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center gap-2">
                <Home size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">Related Property</h3>
              </div>
              
              {report.property ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100">
                    <img 
                      src={imageSrc} 
                      alt="Property" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                  
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:propertyTitle')}</span>
                        <span className="font-bold text-gray-800 line-clamp-1">{propertyTitle}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:location')}</span>
                        <span className="font-semibold text-gray-600 flex items-center gap-1">
                          <MapPin size={12} /> {propertyLocation}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:type')}</span>
                        <span className="font-semibold text-gray-700">{report.property.propertyType}</span>
                      </div>
                      {report.property.propertySize && (
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('inspectionReports:size')}</span>
                          <span className="font-semibold text-gray-700">{report.property.propertySize} {report.property.propertySizeUom}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <Link 
                        to={`/customer/properties/${report.propertyId}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-[#1a2b25] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        {t('inspectionReports:viewProperty')}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                    <Building size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">{t('inspectionReports:unknownProperty')}</p>
                  <p className="text-xs text-gray-400">{t('inspectionReports:propertyDetailsNotLoaded')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInspectionDetails;
