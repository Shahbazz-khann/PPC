import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, CheckCircle2, Clock, User, Building, Home, MessageSquare, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { getCustomerPropertyVisitById, submitCustomerPropertyVisitRemarks, resolveMediaUrl } from '../../../Services/customer.services';
import { useTranslation } from 'react-i18next';

const CustomerVisitDetails = () => {
  const { visitId } = useParams();
  const { t } = useTranslation(['visits', 'common']);
  const [visit, setVisit] = useState(null);
  
  // API State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for remarks
  const [remarksInput, setRemarksInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      setError('');
      setSubmitError('');
      const res = await getCustomerPropertyVisitById(visitId);
      
      if (res?.success) {
        setVisit(res.data);
      } else {
        setError(res?.message || 'Failed to fetch visit details');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visitId) {
      fetchVisitDetails();
    }
  }, [visitId]);

  if (loading) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen flex flex-col items-center justify-center font-sans">
        <Loader2 className="animate-spin text-[#B8860B] mb-4" size={40} />
        <h3 className="text-xl font-serif font-bold text-gray-900">{t('visits:loadingVisitDetails')}</h3>
        <p className="text-sm font-medium text-gray-500 mt-2">{t('visits:pleaseWaitDot')}</p>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[24px] shadow-sm border border-red-100 p-8 sm:p-12 flex flex-col items-center justify-center max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{t('visits:visitNotFound')}</h3>
          <p className="text-sm font-medium text-red-600 mb-8">{error || t('visits:visitNotFoundDesc')}</p>
          <div className="flex gap-4">
            <Link 
              to="/customer/visits" 
              className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl shadow-sm hover:bg-gray-200 transition-colors"
            >
              {t('visits:returnToVisits')}
            </Link>
            <button
              onClick={fetchVisitDetails}
              className="px-6 py-2.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2c4232] transition-colors"
            >
              {t('visits:tryAgain')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const property = visit.property;
  const isCompleted = visit.actualDate !== null;
  const propertyTitle = [property?.propertyType, property?.societyName].filter(Boolean).join(' in ') || t('visits:unknownProperty');
  const propertyLocation = [property?.societyName, property?.cityName].filter(Boolean).join(', ') || t('visits:noLocation');
  const sizeString = (property?.propertySize && property?.propertySizeUom) ? `${property.propertySize} ${property.propertySizeUom}` : '';
  const imageSrc = property?.imageUrl ? resolveMediaUrl(property.imageUrl) : '/placeholder-image.jpg';

  const handleSaveRemarks = async () => {
    setSubmitError('');
    const trimmedRemarks = remarksInput.trim();
    if (!trimmedRemarks) return;

    try {
      setIsSubmitting(true);
      const res = await submitCustomerPropertyVisitRemarks(visit.visitId, trimmedRemarks);
      if (res?.success) {
        setVisit(prev => ({
          ...prev,
          visitorRemarks: res.data.visitorRemarks
        }));
        setRemarksInput('');
      } else {
        setSubmitError(res?.message || t('visits:submitRemarksFailed'));
        // If the error implies state desync, gracefully refetch.
        if (res?.message === 'Remarks have already been submitted for this property visit.') {
           fetchVisitDetails();
        }
      }
    } catch (err) {
      setSubmitError(err.message || t('visits:unexpectedErrorRemarks'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">{t('common:dashboard')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <Link to="/customer/visits" className="hover:text-gray-900 transition-colors">{t('visits:propertyVisits')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <span className="text-[#1a2b25]">{visit.visitId}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-6">
        
        {/* HERO */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-6 sm:p-8 min-h-[140px]">
          <div className="relative z-20 flex items-start gap-6 w-full">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border ${
              isCompleted ? 'bg-[#eaf1ec] border-[#1E5631]/20 text-[#1E5631]' : 'bg-[#faf7f2] border-[#B8860B]/20 text-[#B8860B]'
            }`}>
              {isCompleted ? <CheckCircle2 size={36} /> : <Clock size={36} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{visit.visitId}</span>
                {isCompleted ? (
                  <span className="px-3 py-1 bg-[#EAF3EE] text-[#1E5631] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#1E5631]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5631]"></span> {t('visits:completed')}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#FFF4E5] text-[#B8860B] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#B8860B]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></span> {t('visits:upcoming')}
                  </span>
                )}
                {/* Request ID Display */}
                {visit.requestId && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-gray-200 ml-2 rtl:mr-2 rtl:ml-0">
                    {t('visits:req')} {visit.requestId}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                {t('visits:visitDetails')}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Visit Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Schedule vs Actual */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Calendar size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('visits:visitSchedule')}</h3>
              </div>
              
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Scheduled Time */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                  <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                    <Clock size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('visits:scheduledVisit')}</h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-[#1a2b25]">{visit.scheduledDate || t('visits:tbd')}</div>
                    <div className="text-sm font-semibold text-[#B8860B]">{visit.scheduledTime || t('visits:tbd')}</div>
                  </div>
                </div>

                {/* Actual Time */}
                <div className={`rounded-2xl p-6 border relative ${isCompleted ? 'bg-[#f6f9f7] border-[#1E5631]/20' : 'bg-white border-dashed border-gray-200'}`}>
                  <div className={`absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    isCompleted ? 'bg-white text-[#1E5631]' : 'bg-gray-50 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isCompleted ? 'text-[#1E5631]/60' : 'text-gray-400'}`}>
                    {t('visits:actualVisit')}
                  </h4>
                  
                  {isCompleted ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-[#1E5631]">{visit.actualDate}</div>
                      <div className="text-sm font-semibold text-[#1E5631]/80">{visit.actualTime || '-'}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-[52px] justify-center">
                      <span className="text-sm font-medium text-gray-500 italic">{t('visits:visitNotTakenPlace')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Employee Remarks */}
            <div className="bg-[#fafcfb] rounded-[20px] shadow-sm border border-[#1E5631]/10 overflow-hidden">
              <div className="p-6 border-b border-[#1E5631]/10 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('visits:ppcEmployeeRemarks')}</h3>
              </div>
              <div className="p-8">
                {visit.employeeRemarks ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {visit.employeeRemarks}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">{t('visits:noPpcEmployeeRemarks')}</p>
                )}
              </div>
            </div>

            {/* 3. My Visitor Remarks */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">{t('visits:myVisitorRemarks')}</h3>
              </div>
              
              <div className="p-8">
                {!isCompleted ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500">
                      {t('visits:canAddRemarksAfter')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visit.visitorRemarks ? (
                       <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {visit.visitorRemarks}
                      </p>
                    ) : (
                      <>
                        <label className="block text-sm font-bold text-gray-700">{t('visits:leaveNote')}</label>
                        <textarea 
                          value={remarksInput}
                          onChange={(e) => setRemarksInput(e.target.value)}
                          placeholder={t('visits:leaveNotePlaceholder')}
                          disabled={isSubmitting}
                          className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-medium text-gray-800 bg-gray-50/50 resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                        ></textarea>
                        
                        {submitError && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm font-semibold text-red-600">{submitError}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={handleSaveRemarks}
                            disabled={isSubmitting || !remarksInput.trim()}
                            className="px-8 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-sm hover:bg-[#2c4232] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> {t('visits:submittingText')}
                              </>
                            ) : (
                              t('visits:submitRemarksText')
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Property & Representative */}
          <div className="space-y-6">
            
            {/* PPC Representative */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <User size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">{t('visits:ppcRepresentative')}</h3>
              </div>
              <div className="p-6 flex items-center gap-4">
                {visit.conductedBy ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-white ring-2 ring-gray-50">
                      {visit.conductedBy.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{visit.conductedBy.name}</h4>
                      <p className="text-xs font-medium text-gray-500">{visit.conductedBy.designation}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      {isCompleted ? t('visits:repInfoUnavailable') : t('visits:repNotAssigned')}
                    </h4>
                  </div>
                )}
              </div>
            </div>

            {/* Related Property */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Home size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">{t('visits:relatedProperty')}</h3>
              </div>
              
              {property ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100">
                    <img 
                      src={imageSrc} 
                      alt="Property" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:propertyTitle')}</span>
                        <span className="font-bold text-gray-800 line-clamp-1">{propertyTitle}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:location')}</span>
                        <span className="font-semibold text-gray-600 flex items-center gap-1">
                          <MapPin size={12} /> {propertyLocation}
                        </span>
                      </div>
                      {property.propertyType && (
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:type')}</span>
                          <span className="font-semibold text-gray-700">{property.propertyType}</span>
                        </div>
                      )}
                      {sizeString && (
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:size')}</span>
                          <span className="font-semibold text-gray-700">{sizeString}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-2">
                      <Link 
                        to={`/customer/properties/${visit.propertyId}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-[#1a2b25] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        {t('visits:viewProperty')}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                    <Building size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">{t('visits:unknownProperty')}</p>
                  <p className="text-xs text-gray-400">{t('visits:propertyDetailsNotLoaded')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerVisitDetails;
