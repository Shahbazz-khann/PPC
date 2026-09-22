import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import {
  Home,
  FileText,
  Wrench,
  ArrowRight,
  MapPin,
  Maximize,
  Bell,
  ChevronRight,
  MoreHorizontal,
  Plus,
  AlertTriangle
} from 'lucide-react';
import CustomerAccountMenu from '../../Components/common/CustomerAccountMenu';
import { getCustomerDashboardSummary, getCustomerDashboardProperties, getCustomerRequests } from '../../Services/customer.services';
import { resolveMediaUrl } from '../../Services/Api';
import { useAuth } from '../../Context/AuthContext';

// Assets
import PropVilla from '../../assets/prop_villa.png';
import PropApartment from '../../assets/prop_apartment.png';
import HeroBg from '../../assets/hero_bg_villa.jpg';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  let dotColor = 'bg-gray-400';

  if (status === 'Active' || status === 'Completed') {
    color = 'bg-[#EAF3EE] text-[#1E5631]'; // soft green
    dotColor = 'bg-[#1E5631]';
  } else if (status === 'Pending' || status === 'Under Review') {
    color = 'bg-[#FFF4E5] text-[#B8860B]'; // soft gold
    dotColor = 'bg-[#B8860B]';
  } else if (status === 'In Progress' || status === 'Assigned') {
    color = 'bg-[#E6F0FA] text-[#0066CC]'; // soft blue
    dotColor = 'bg-[#0066CC]';
  } else if (status === 'Rejected' || status === 'Withdrawn') {
    color = 'bg-[#faebe9] text-[#c46a62]'; // soft red
    dotColor = 'bg-[#c46a62]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

const SummaryCard = ({ title, value, subtitle, icon: Icon, colorClass, iconBgColor }) => (
  <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all hover:shadow-md h-[180px]">
    {/* Decorative shape top right */}
    <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-[0.15] transition-transform group-hover:scale-110 ${colorClass.split(' ')[0]}`}></div>

    <div className="flex justify-between items-start z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor}`}>
        <Icon size={24} className={colorClass.split(' ')[1]} />
      </div>
    </div>

    <div className="z-10 mt-auto">
      <p className="text-[13px] font-semibold text-gray-600 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className="text-4xl font-serif font-bold text-[#2a211f]">{value}</h3>
        <div className="w-8 h-8 rounded-full bg-[#FAF8F3] flex items-center justify-center text-[#B8860B] group-hover:bg-[#B8860B] group-hover:text-white transition-colors">
          <ArrowRight size={16} />
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-2 font-medium">{subtitle}</p>
    </div>
  </div>
);

const CustomerDashboard = () => {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  
  const customerName = [
    user?.user_first_name,
    user?.user_middle_name,
    user?.user_last_name,
  ].filter(Boolean).join(' ') || 'Customer';

  const [summary, setSummary] = useState({
    forSale: 0,
    forRent: 0,
    serviceRequests: 0,
    totalProperties: 0
  });
  const [loading, setLoading] = useState(true);

  const [myProperties, setMyProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setPropertiesLoading(true);

        const [summaryRes, propsRes] = await Promise.all([
          getCustomerDashboardSummary(),
          getCustomerDashboardProperties()
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }
        
        if (propsRes.success) {
          setMyProperties(propsRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err.message);
      } finally {
        setLoading(false);
        setPropertiesLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      const res = await getCustomerRequests();
      if (res?.success) {
        setRequests(res.data || []);
      } else {
        setRequestsError(res?.message || 'Failed to fetch requests');
      }
    } catch (err) {
      setRequestsError(err.message || 'Error loading requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Property Request' && req.category === 'PROPERTY') return true;
    if (activeTab === 'Service Requests' && req.category === 'SERVICE') return true;
    return false;
  }).slice(0, 5);

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16  font-sans">

      {/* --- HERO AREA --- */}
      <div className="relative w-full bg-[#FAF8F3] pt-4 pb-20 sm:pb-28 overflow-hidden">

        {/* Background Image & Gradient */}
        <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full z-0">
          <img src={HeroBg} alt="Hero background" className="w-full h-full object-cover object-right" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F3] via-[#FAF8F3]/95 lg:via-[#FAF8F3]/80 to-transparent"></div>
        </div>

        {/* Inner Container for alignment */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
          {/* Top Navigation inside Hero */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm font-semibold text-gray-500 gap-2">
              <Home size={18} />
              <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
              <span className="text-gray-700">{t('common:dashboard')}</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              {/* Language Toggle */}
              <div className="hidden sm:flex bg-white border border-gray-200 rounded-full p-1 shadow-sm items-center">
                <button 
                  onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('ppc-language', 'en'); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    i18n.language === 'en' 
                      ? 'bg-[#1a2b25] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t('common:english')}
                </button>
                <button 
                  onClick={() => { i18n.changeLanguage('ur'); localStorage.setItem('ppc-language', 'ur'); }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                    i18n.language === 'ur' 
                      ? 'bg-[#1a2b25] text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t('common:urdu')}
                </button>
              </div>

              <button className="relative p-2.5 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow-sm border border-gray-100">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <CustomerAccountMenu />
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-2xl mt-4">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-serif font-bold text-[#1a2b25] mb-4 sm:mb-0.5 tracking-tight leading-tight">
              {t('dashboard:greeting', { name: customerName })}
            </h1>
            <p 
              className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl" 
              dangerouslySetInnerHTML={{ __html: t('dashboard:subtitle') }}
            />

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Link to="/customer/properties/new" className="flex items-center gap-2 px-6 py-3 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] hover:-translate-y-0.5 transition-all duration-300">
                <Plus size={18} />
                {t('dashboard:addProperty')}
              </Link>
              <Link to="/customer/requests/new" className="flex items-center gap-2 px-6 py-3 bg-white text-[#1a2b25] border border-[#e4d7be] rounded-full font-bold text-sm shadow-sm hover:bg-[#faf7f2] hover:border-[#B8860B] hover:text-[#B8860B] hover:-translate-y-0.5 transition-all duration-300">
                <Plus size={18} />
                {t('dashboard:createRequest')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">

        {/* Summary Stats (Overlapping Hero) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-20 mt-4 sm:-mt-12 lg:-mt-20 mb-6">
          <SummaryCard
            title={t('dashboard:forSale')}
            value={loading ? "-" : String(summary.forSale).padStart(2, '0')}
            subtitle={t('dashboard:propertiesForSale')}
            icon={Home}
            colorClass="bg-[#eaf1ec] text-[#36684a]"
            iconBgColor="bg-[#f0f6f3]"
          />
          <SummaryCard
            title={t('dashboard:forRent')}
            value={loading ? "-" : String(summary.forRent).padStart(2, '0')}
            subtitle={t('dashboard:propertiesForRent')}
            icon={FileText}
            colorClass="bg-[#fcf3e6] text-[#b48742]"
            iconBgColor="bg-[#fdf7ee]"
          />
          <SummaryCard
            title={t('dashboard:serviceRequests')}
            value={loading ? "-" : String(summary.serviceRequests).padStart(2, '0')}
            subtitle={t('dashboard:serviceRequestInProgress')}
            icon={Wrench}
            colorClass="bg-[#eef2f9] text-[#4d70a3]"
            iconBgColor="bg-[#f4f7fb]"
          />
          <SummaryCard
            title={t('dashboard:totalProperties')}
            value={loading ? "-" : String(summary.totalProperties).padStart(2, '0')}
            subtitle={t('dashboard:acrossPortfolio')}
            icon={Home}
            colorClass="bg-[#faebe9] text-[#c46a62]"
            iconBgColor="bg-[#fdf3f2]"
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-8">

          {/* LEFT: MY PROPERTIES */}
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-2xl font-serif font-bold text-[#1a2b25]">{t('common:myProperties')}</h2>
              <Link to="/customer/properties" className="text-sm font-bold text-[#B8860B] hover:text-[#966d09] flex items-center transition-colors">
                {t('common:viewAll')} <ArrowRight size={16} className="ms-1 rtl:rotate-180" />
              </Link>
            </div>

            <div className="space-y-5">
              {propertiesLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b25] mb-4"></div>
                  <p className="text-sm font-medium text-gray-500">{t('dashboard:loadingProperties')}</p>
                </div>
              ) : myProperties.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-gray-100/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <Home size={40} className="text-gray-200 mb-4" />
                  <p className="text-sm font-medium text-gray-500">{t('dashboard:noPropertiesFound')}</p>
                  <Link to="/customer/properties/new" className="mt-4 px-4 py-2 bg-[#FAF8F3] text-[#B8860B] rounded-full text-xs font-bold hover:bg-[#f3eedd] transition-colors">
                    {t('dashboard:addFirstProperty')}
                  </Link>
                </div>
              ) : (
                myProperties.map((property) => (
                  <div key={property.property_id} className="bg-white rounded-[24px] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.08)]">
                    {/* Image */}
                    <div className="h-[200px] sm:h-[180px] sm:w-[260px] shrink-0 relative rounded-[16px] overflow-hidden bg-gray-100">
                      <img 
                        src={property.image_url ? resolveMediaUrl(property.image_url) : PropVilla} 
                        alt={property.property_type} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={property.current_status || 'Not Available'} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-center flex-1 py-2 pr-2 relative">
                      <button className="absolute top-1 right-1 text-gray-300 hover:text-gray-500">
                        <MoreHorizontal size={20} />
                      </button>

                      <div className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.2em] mb-2">
                        {property.property_type}
                      </div>
                      <h3 className="text-[22px] font-serif font-bold text-[#1a2b25] mb-5 pr-8 leading-tight">
                        {property.property_type} in {property.society}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6">
                        <div className="flex items-center text-[13px] font-semibold text-gray-500">
                          <MapPin size={15} className="me-2 text-gray-400 shrink-0" />
                          <span className="truncate">{property.society}, {property.city}</span>
                        </div>
                        <div className="flex items-center text-[13px] font-semibold text-gray-500">
                          <Maximize size={15} className="me-2 text-gray-400 shrink-0" />
                          {property.property_size} {property.size_uom}
                        </div>
                      </div>

                      <div className="mt-auto flex justify-end">
                        <button className="px-5 py-2 rounded-full border border-[#e4d7be] text-[13px] font-bold text-[#1a2b25] hover:border-[#B8860B] hover:bg-[#faf7f2] transition-colors flex items-center gap-2">
                          {t('dashboard:viewDetails')} <ArrowRight size={14} className="rtl:rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* RIGHT: MY REQUESTS */}
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-2xl font-serif font-bold text-[#1a2b25]">{t('common:myRequests')}</h2>
              <Link to="/customer/requests" className="text-sm font-bold text-[#B8860B] hover:text-[#966d09] flex items-center transition-colors">
                {t('common:viewAll')} <ArrowRight size={16} className="ms-1 rtl:rotate-180" />
              </Link>
            </div>

            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 flex flex-col min-h-[420px]">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {[
                  { key: 'All', label: t('common:all') },
                  { key: 'Property Request', label: t('dashboard:propertyRequest') },
                  { key: 'Service Requests', label: t('dashboard:serviceRequests') }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${activeTab === tab.key
                        ? 'bg-[#2c4232] text-white shadow-sm'
                        : 'bg-[#f4f2ef] text-gray-600 hover:bg-[#ebe7e1]'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-2 flex-1">
                {requestsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b25] mb-4"></div>
                    <p className="text-sm font-medium text-gray-500">{t('dashboard:loadingRequests')}</p>
                  </div>
                ) : requestsError ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                       <span className="text-red-500 font-bold">!</span>
                    </div>
                    <p className="text-sm font-medium text-red-500 mb-4">{requestsError}</p>
                    <button onClick={fetchRequests} className="px-4 py-2 bg-[#FAF8F3] text-gray-600 rounded-full text-xs font-bold hover:bg-[#f3eedd] transition-colors">
                      {t('common:retry')}
                    </button>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <FileText size={40} className="text-gray-200 mb-4" />
                    <p className="text-sm font-medium text-gray-500">
                      {activeTab === 'Property Request' 
                        ? t('dashboard:noPropertyRequestsFound') 
                        : activeTab === 'Service Requests' 
                          ? t('dashboard:noServiceRequestsFound') 
                          : t('dashboard:noRequestsFound')}
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((req, idx) => {
                    const isProperty = req.category === 'PROPERTY';
                    const displayType = isProperty ? t('dashboard:propertyRequest') : t('dashboard:ppcServiceRequest');
                    const displaySubType = isProperty ? req.purpose : req.service;
                    const displayDate = req.createdAt ? new Date(req.createdAt).toLocaleDateString(i18n.language === 'ur' ? 'ur-PK' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                    const displayTitle = `${displayType} · ${displaySubType || ''}`;

                    return (
                      <React.Fragment key={req.id}>
                        <Link to={`/customer/requests/${req.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer p-3 hover:bg-[#faf9f7] rounded-2xl transition-colors gap-4">
                          <div className="flex items-start sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
                            <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center ${isProperty ? 'bg-[#faebe9] text-[#c46a62]' : 'bg-[#eaf1ec] text-[#36684a]'
                              }`}>
                              {isProperty ? <Home size={18} /> : <Wrench size={18} />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-[#1a2b25] mb-0.5">#{req.id}</div>
                              <div className="text-[11px] font-semibold text-gray-400 mb-1">{displayDate}</div>
                              <div className="text-[13px] font-medium text-gray-600">{displayTitle}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto ps-[62px] sm:ps-0">
                            <StatusBadge status={req.status} />
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors rtl:rotate-180" />
                          </div>
                        </Link>
                        {idx < filteredRequests.length - 1 && (
                          <div className="px-4"><hr className="border-gray-50" /></div>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              <div className="mt-8 flex justify-end items-center gap-4 text-[9px] font-bold text-gray-300 uppercase tracking-[0.25em]">
                <span className="hover:text-gray-400 cursor-pointer transition-colors">{t('dashboard:people')}</span>
                <span className="hover:text-gray-400 cursor-pointer transition-colors">{t('dashboard:properties')}</span>
                <span className="hover:text-gray-400 cursor-pointer transition-colors">{t('dashboard:progress')}</span>
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
