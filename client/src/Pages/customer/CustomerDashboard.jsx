import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import CustomerAccountMenu from '../../Components/common/CustomerAccountMenu';

// Assets
import PropVilla from '../../assets/prop_villa.png';
import PropApartment from '../../assets/prop_apartment.png';
import HeroBg from '../../assets/hero_bg_villa.jpg';

const mockProperties = [
  {
    id: 'PRP-001',
    name: 'Luxury Villa in DHA Phase 8',
    type: 'Villa',
    location: 'DHA Phase 8, Lahore',
    size: '1 Kanal',
    status: 'Active',
    image: PropVilla
  },
  {
    id: 'PRP-002',
    name: 'Commercial Plaza Shop',
    type: 'Commercial',
    location: 'Gulberg III, Lahore',
    size: '500 sq ft',
    status: 'Pending',
    image: PropApartment
  }
];

const mockRequests = [
  { id: '#101', type: 'Property Request', subType: 'Sale', status: 'Pending', date: 'Oct 12, 2026' },
  { id: '#103', type: 'Property Request', subType: 'Rent', status: 'Completed', date: 'Sep 28, 2026' },
  { id: '#102', type: 'PPC Service Request', subType: 'Property Care', status: 'In Progress', date: 'Oct 10, 2026' }
];

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  let dotColor = 'bg-gray-400';

  if (status === 'Active' || status === 'Completed') {
    color = 'bg-[#EAF3EE] text-[#1E5631]'; // soft green
    dotColor = 'bg-[#1E5631]';
  } else if (status === 'Pending') {
    color = 'bg-[#FFF4E5] text-[#B8860B]'; // soft gold
    dotColor = 'bg-[#B8860B]';
  } else if (status === 'In Progress') {
    color = 'bg-[#E6F0FA] text-[#0066CC]'; // soft blue
    dotColor = 'bg-[#0066CC]';
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
  const [activeTab, setActiveTab] = useState('All');
  const customerName = 'Ahmed';

  const filteredRequests = mockRequests.filter(req => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Property Request' && req.type === 'Property Request') return true;
    if (activeTab === 'Service Requests' && req.type === 'PPC Service Request') return true;
    return false;
  });

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* --- HERO AREA --- */}
      <div className="relative w-full bg-[#FAF8F3] pt-4 pb-20 sm:pb-28 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden">
        
        {/* Background Image & Gradient */}
        <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full z-0">
          <img src={HeroBg} alt="Hero background" className="w-full h-full object-cover object-right" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F3] via-[#FAF8F3]/95 lg:via-[#FAF8F3]/80 to-transparent"></div>
        </div>

        {/* Top Navigation inside Hero */}
        <div className="relative z-10 flex justify-between items-center mb-4">
          <div className="flex items-center text-sm font-semibold text-gray-500 gap-2">
            <Home size={18} />
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-700">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow-sm border border-gray-100">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <CustomerAccountMenu />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl mt-4  ">
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-serif font-bold text-[#1a2b25] mb-4 sm:mb-0.5 tracking-tight leading-tight">
            Good afternoon, {customerName}.
          </h1>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
            Here's what's happening across your properties this week — <br className="hidden sm:block"/>
            two listings are live, one service request is in progress.
          </p>
          
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link to="/customer/properties" className="flex items-center gap-2 px-6 py-3 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] hover:-translate-y-0.5 transition-all duration-300">
              <Plus size={18} />
              Add Property
            </Link>
            <Link to="/customer/requests" className="flex items-center gap-2 px-6 py-3 bg-white text-[#1a2b25] border border-[#e4d7be] rounded-full font-bold text-sm shadow-sm hover:bg-[#faf7f2] hover:border-[#B8860B] hover:text-[#B8860B] hover:-translate-y-0.5 transition-all duration-300">
              <Plus size={18} />
              Create Request
            </Link>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="px-4 sm:px-8 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
        
        {/* Summary Stats (Overlapping Hero) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-20 mt-4 sm:-mt-12 lg:-mt-20 mb-6">
          <SummaryCard
            title="For Sale"
            value="02"
            subtitle="Properties listed for sale"
            icon={Home}
            colorClass="bg-[#eaf1ec] text-[#36684a]"
            iconBgColor="bg-[#f0f6f3]"
          />
          <SummaryCard
            title="For Rent"
            value="03"
            subtitle="Properties listed for rent"
            icon={FileText}
            colorClass="bg-[#fcf3e6] text-[#b48742]"
            iconBgColor="bg-[#fdf7ee]"
          />
          <SummaryCard
            title="PPC Service Requests"
            value="01"
            subtitle="Service request in progress"
            icon={Wrench}
            colorClass="bg-[#eef2f9] text-[#4d70a3]"
            iconBgColor="bg-[#f4f7fb]"
          />
          <SummaryCard
            title="Total Properties"
            value="02"
            subtitle="Across your portfolio"
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
              <h2 className="text-2xl font-serif font-bold text-[#1a2b25]">My Properties</h2>
              <Link to="/customer/properties" className="text-sm font-bold text-[#B8860B] hover:text-[#966d09] flex items-center transition-colors">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="space-y-5">
              {mockProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-[24px] p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 flex flex-col sm:flex-row gap-6 transition-all hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.08)]">
                  {/* Image */}
                  <div className="h-[200px] sm:h-[180px] sm:w-[260px] shrink-0 relative rounded-[16px] overflow-hidden bg-gray-100">
                    <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={property.status} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center flex-1 py-2 pr-2 relative">
                    <button className="absolute top-1 right-1 text-gray-300 hover:text-gray-500">
                      <MoreHorizontal size={20} />
                    </button>
                    
                    <div className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.2em] mb-2">
                      {property.type}
                    </div>
                    <h3 className="text-[22px] font-serif font-bold text-[#1a2b25] mb-5 pr-8 leading-tight">{property.name}</h3>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-6">
                      <div className="flex items-center text-[13px] font-semibold text-gray-500">
                        <MapPin size={15} className="mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex items-center text-[13px] font-semibold text-gray-500">
                        <Maximize size={15} className="mr-2 text-gray-400 shrink-0" />
                        {property.size}
                      </div>
                    </div>

                    <div className="mt-auto flex justify-end">
                      <button className="px-5 py-2 rounded-full border border-[#e4d7be] text-[13px] font-bold text-[#1a2b25] hover:border-[#B8860B] hover:bg-[#faf7f2] transition-colors flex items-center gap-2">
                        View details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: MY REQUESTS */}
          <section className="space-y-5">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-2xl font-serif font-bold text-[#1a2b25]">My Requests</h2>
              <Link to="/customer/requests" className="text-sm font-bold text-[#B8860B] hover:text-[#966d09] flex items-center transition-colors">
                View all <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-[24px] p-7 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 flex flex-col min-h-[420px]">
              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {['All', 'Property Request', 'Service Requests'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-[#2c4232] text-white shadow-sm'
                        : 'bg-[#f4f2ef] text-gray-600 hover:bg-[#ebe7e1]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-2 flex-1">
                {filteredRequests.map((req, idx) => (
                  <React.Fragment key={req.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer p-3 hover:bg-[#faf9f7] rounded-2xl transition-colors gap-4">
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
                        <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center ${
                          req.type === 'Property Request' ? 'bg-[#faebe9] text-[#c46a62]' : 'bg-[#eaf1ec] text-[#36684a]'
                        }`}>
                          {req.type === 'Property Request' ? <Home size={18} /> : <Wrench size={18} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#1a2b25] mb-0.5">{req.id}</div>
                          <div className="text-[11px] font-semibold text-gray-400 mb-1">{req.date}</div>
                          <div className="text-[13px] font-medium text-gray-600">{req.type} · {req.subType}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pl-[62px] sm:pl-0">
                        <StatusBadge status={req.status} />
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                    {idx < filteredRequests.length - 1 && (
                      <div className="px-4"><hr className="border-gray-50" /></div>
                    )}
                  </React.Fragment>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <FileText size={40} className="text-gray-200 mb-4" />
                    <p className="text-sm font-medium text-gray-500">No requests found.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end items-center gap-4 text-[9px] font-bold text-gray-300 uppercase tracking-[0.25em]">
                <span className="hover:text-gray-400 cursor-pointer transition-colors">People</span>
                <span className="hover:text-gray-400 cursor-pointer transition-colors">Properties</span>
                <span className="hover:text-gray-400 cursor-pointer transition-colors">Progress</span>
              </div>
            </div>
          </section>

        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;
