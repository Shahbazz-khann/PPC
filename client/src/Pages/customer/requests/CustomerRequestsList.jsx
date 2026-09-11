import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, ChevronRight, Filter, 
  FileText, Home, Wrench, Calendar, MapPin
} from 'lucide-react';
import { mockRequestsList, REQUEST_CATEGORIES, PROPERTY_PURPOSES } from './mockRequestsData';
import { mockPropertiesList } from '../properties/mockPropertyData';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  let dotColor = 'bg-gray-400';

  if (status === 'Completed') {
    color = 'bg-[#EAF3EE] text-[#1E5631]'; 
    dotColor = 'bg-[#1E5631]';
  } else if (status === 'Pending' || status === 'Under Review') {
    color = 'bg-[#FFF4E5] text-[#B8860B]'; 
    dotColor = 'bg-[#B8860B]';
  } else if (status === 'Assigned' || status === 'In Progress') {
    color = 'bg-blue-50 text-blue-700';
    dotColor = 'bg-blue-600';
  } else if (status === 'Withdrawn') {
    color = 'bg-red-50 text-red-700';
    dotColor = 'bg-red-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

const CustomerRequestsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PROPERTY, SERVICE
  const [activePurpose, setActivePurpose] = useState('ALL'); // ALL, Sale, Purchase, etc.
  const navigate = useNavigate();

  const getPropertyName = (propertyId) => {
    if (!propertyId) return 'No linked property';
    const prop = mockPropertiesList.find(p => p.id === propertyId);
    return prop ? `${prop.propertyType} in ${prop.society}` : 'Unknown Property';
  };

  const filteredRequests = mockRequestsList.filter(req => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.service || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'ALL' || req.category === activeTab;
    const matchesPurpose = activeTab !== 'PROPERTY' || activePurpose === 'ALL' || req.purpose === activePurpose;

    return matchesSearch && matchesTab && matchesPurpose;
  });

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      {/* Header Breadcrumb Area */}
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">My Requests</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2 tracking-tight">
              My Requests
            </h1>
            <p className="text-gray-500 font-medium text-sm max-w-md">
              View, track, and manage your property and PPC service requests.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/customer/requests/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Create Request
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-2 flex flex-col xl:flex-row gap-4 items-center">
          <div className="flex w-full xl:w-auto p-1 bg-gray-50/80 rounded-xl overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => { setActiveTab('ALL'); setActivePurpose('ALL'); }}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab(REQUEST_CATEGORIES.PROPERTY)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === REQUEST_CATEGORIES.PROPERTY ? 'bg-white text-[#1E5631] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Home size={16} /> Property Requests
            </button>
            <button
              onClick={() => setActiveTab(REQUEST_CATEGORIES.SERVICE)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === REQUEST_CATEGORIES.SERVICE ? 'bg-white text-[#B8860B] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <Wrench size={16} /> PPC Service Requests
            </button>
          </div>

          <div className="relative w-full flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-medium text-gray-800"
            />
          </div>
        </div>

        {/* Secondary Purpose Filter for Property Requests */}
        {activeTab === REQUEST_CATEGORIES.PROPERTY && (
          <div className="flex flex-wrap gap-2 animate-fadeIn">
            <button
              onClick={() => setActivePurpose('ALL')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activePurpose === 'ALL' ? 'bg-[#1a2b25] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              All Purposes
            </button>
            {PROPERTY_PURPOSES.map(purpose => (
              <button
                key={purpose}
                onClick={() => setActivePurpose(purpose)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${activePurpose === purpose ? 'bg-[#1a2b25] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {purpose}
              </button>
            ))}
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div 
              key={req.id} 
              onClick={() => navigate(`/customer/requests/${req.id}`)}
              className="bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex gap-4 sm:gap-6 items-start sm:items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                  req.category === REQUEST_CATEGORIES.PROPERTY 
                    ? 'bg-[#eaf1ec] border-[#1E5631]/20 text-[#1E5631]' 
                    : 'bg-[#faf7f2] border-[#B8860B]/20 text-[#B8860B]'
                }`}>
                  {req.category === REQUEST_CATEGORIES.PROPERTY ? <Home size={22} /> : <Wrench size={22} />}
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{req.id}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider">
                      {req.category === REQUEST_CATEGORIES.PROPERTY ? 'Property Request' : 'PPC Service'}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-serif font-bold text-[#1a2b25] mb-2 sm:mb-1">
                    {req.purpose || req.service}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      <span className={req.propertyId ? 'text-gray-700' : 'text-gray-400 italic'}>
                        {getPropertyName(req.propertyId)}
                      </span>
                    </div>
                    <div className="hidden sm:block w-[1px] h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:flex-col md:items-end gap-4 shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                <StatusBadge status={req.status} />
                <button className="text-sm font-bold text-[#1a2b25] flex items-center gap-1 hover:text-[#B8860B] transition-colors group-hover:translate-x-1 duration-300">
                  View Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-gray-200 shadow-sm">
              <FileText size={48} className="text-gray-200 mb-4" />
              <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">No requests found</h3>
              <p className="text-sm font-medium text-gray-500 max-w-sm">
                We couldn't find any requests matching your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRequestsList;
