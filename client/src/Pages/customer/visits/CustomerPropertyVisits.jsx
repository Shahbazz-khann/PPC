import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, User, CheckCircle2, Clock, Edit2, Plus, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { getCustomerPropertyVisits, resolveMediaUrl } from '../../../Services/customer.services';
import { useTranslation } from 'react-i18next';

const VisitCard = ({ visit }) => {
  const { t } = useTranslation(['visits']);
  const isCompleted = visit.actualDate !== null;
  const hasRemarks = visit.visitorRemarks && visit.visitorRemarks.trim() !== '';

  const propertyTitle = [visit.propertyType, visit.societyName].filter(Boolean).join(' in ') || t('visits:unknownProperty');
  const propertyLocation = [visit.societyName, visit.cityName].filter(Boolean).join(', ') || t('visits:noLocation');
  const sizeString = (visit.propertySize && visit.propertySizeUom) ? `${visit.propertySize} ${visit.propertySizeUom}` : '';
  const imageSrc = visit.imageUrl ? resolveMediaUrl(visit.imageUrl) : '/placeholder-image.jpg';

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow min-h-[200px]">

      {/* LEFT: Property Image */}
      <div className="relative w-full md:w-[35%] xl:w-[28%] shrink-0 h-56 md:h-auto bg-gray-100">
        <img 
          src={imageSrc} 
          alt="Property" 
          className="w-full h-full object-cover" 
          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
        />

        <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 flex flex-col gap-2">
          {isCompleted ? (
            <span className="px-3 py-1.5 bg-[#1E5631]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
              <CheckCircle2 size={14} /> {t('visits:completed')}
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-[#B8860B]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
              <Clock size={14} /> {t('visits:upcoming')}
            </span>
          )}
          {/* We do NOT generate a formatted ID, we just use raw ID or remove it if not needed. But UI previously showed visit.id. We will just show raw ID. */}
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {visit.visitId}
          </span>
        </div>
      </div>

      {/* RIGHT WRAPPER (Info + Actions) */}
      <div className="flex-1 flex flex-col xl:flex-row min-w-0">

        {/* CENTER: Property & Visit Info */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col justify-center border-b xl:border-b-0 xl:border-e border-gray-100 min-w-0">

          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2 leading-snug break-words">
              {propertyTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {propertyLocation}
              </span>
              {visit.propertyType && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{visit.propertyType}</span>
                </>
              )}
              {sizeString && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{sizeString}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:scheduledDate')}</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={14} className="text-[#B8860B]" /> {visit.scheduledDate || t('visits:tbd')}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:scheduledTime')}</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Clock size={14} className="text-[#B8860B]" /> {visit.scheduledTime || t('visits:tbd')}
              </span>
            </div>

            {isCompleted && (
              <>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:actualVisitDate')}</span>
                  <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                    <CheckCircle2 size={14} /> {visit.actualDate}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:actualVisitTime')}</span>
                  <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                    <Clock size={14} /> {visit.actualTime || '-'}
                  </span>
                </div>
              </>
            )}

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('visits:visitConductedBy')}</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                {visit.conductedBy ? (
                  <>
                    {visit.conductedBy.name} <span className="text-xs text-gray-400 font-medium ml-1 rtl:mr-1 rtl:ml-0">({visit.conductedBy.designation})</span>
                  </>
                ) : (
                  <span className="text-gray-500 font-normal">{isCompleted ? t('visits:repInfoUnavailable') : t('visits:repNotAssigned')}</span>
                )}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT: Actions & Remarks */}
        <div className="p-5 lg:p-6 w-full xl:w-[300px] shrink-0 flex flex-col bg-gray-50/30">

          {isCompleted && (
            <div className="mb-6 flex-1">
              {hasRemarks ? (
                <div className="bg-[#fafcfb] p-4 rounded-xl border border-[#1E5631]/10">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-[#1E5631]" /> {t('visits:yourRemarks')}
                  </span>
                  <p className="text-xs font-semibold text-gray-600 line-clamp-3 leading-relaxed mb-3">"{visit.visitorRemarks}"</p>
                  <Link to={`/customer/visits/${visit.visitId}`} className="text-[#B8860B] text-xs font-bold hover:underline flex items-center gap-1">
                    <Edit2 size={12} /> {t('visits:editRemarks')}
                  </Link>
                </div>
              ) : (
                <div className="bg-[#FFF4E5]/50 p-4 rounded-xl border border-[#B8860B]/20 flex flex-col items-start">
                  <span className="block text-[10px] font-bold text-[#B8860B] uppercase tracking-wider mb-1">{t('visits:remarksPending')}</span>
                  <p className="text-xs font-medium text-gray-600 mb-3">{t('visits:canAddRemarks')}</p>
                  <Link to={`/customer/visits/${visit.visitId}`} className="text-xs font-bold bg-white text-[#B8860B] border border-[#B8860B]/20 px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#faf7f2] flex items-center gap-1.5 transition-colors">
                    <Plus size={12} /> {t('visits:addRemarks')}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className={`flex flex-col gap-3 ${!isCompleted ? 'mt-auto justify-center flex-1' : 'mt-auto'}`}>
            <Link
              to={`/customer/visits/${visit.visitId}`}
              className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors"
            >
              {t('visits:viewVisitDetails')}
            </Link>
            {visit.propertyId && (
              <Link
                to={`/customer/properties/${visit.propertyId}`}
                className="w-full text-center py-3 rounded-xl border border-gray-200 text-[#1a2b25] bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
              >
                {t('visits:viewProperty')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerPropertyVisits = () => {
  const { t } = useTranslation(['visits']);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerPropertyVisits();
      if (res?.success) {
        setVisits(res.data || []);
      } else {
        setError(res?.message || 'Failed to fetch property visits');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const upcomingVisits = visits.filter(v => v.actualDate === null);
  const completedVisits = visits.filter(v => v.actualDate !== null);

  const getDisplayedVisits = () => {
    if (activeTab === 'upcoming') return upcomingVisits;
    if (activeTab === 'completed') return completedVisits;
    return visits;
  };

  const displayedVisits = getDisplayedVisits();

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4 ">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-1">{t('visits:propertyVisits')}</h1>
          <p className="text-gray-600 font-medium max-w-2xl">
            {t('visits:propertyVisitsDesc')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'upcoming'
              ? 'border-[#B8860B] text-[#B8860B]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            {t('visits:upcomingVisits')} ({upcomingVisits.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'completed'
              ? 'border-[#B8860B] text-[#B8860B]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            {t('visits:completedVisits')} ({completedVisits.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === 'all'
              ? 'border-[#B8860B] text-[#B8860B]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
          >
            {t('visits:allVisits')} ({visits.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-[#B8860B] mb-4" size={32} />
            <h3 className="text-lg font-serif font-bold text-gray-900">{t('visits:loadingVisits')}</h3>
            <p className="text-sm font-medium text-gray-500 mt-2">{t('visits:pleaseWait')}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-red-100 p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">{t('visits:errorLoading')}</h3>
            <p className="text-sm font-medium text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchVisits}
              className="px-6 py-2.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2c4232] transition-colors"
            >
              {t('visits:tryAgain')}
            </button>
          </div>
        ) : displayedVisits.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedVisits.map(visit => (
              <VisitCard key={visit.visitId} visit={visit} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center min-h-[300px] justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{t('visits:noVisitsFound')}</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              {activeTab === 'upcoming' 
                ? t('visits:noUpcomingDesc')
                : activeTab === 'completed'
                  ? t('visits:noCompletedDesc')
                  : t('visits:noVisitsCategoryDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPropertyVisits;
