import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, User, CheckCircle2, Clock, Edit2, Plus, MessageSquare } from 'lucide-react';
import { mockVisitsList } from './mockVisitsData';
import { mockPropertiesList } from '../properties/mockPropertyData';

const VisitCard = ({ visit }) => {
  const property = mockPropertiesList.find(p => p.id === visit.propertyId);
  const isCompleted = visit.actualDate !== null;
  const hasRemarks = visit.visitorRemarks && visit.visitorRemarks.trim() !== '';

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row hover:shadow-md transition-shadow min-h-[200px]">
      
      {/* LEFT: Property Image */}
      <div className="relative w-full lg:w-[300px] h-56 lg:h-auto shrink-0 bg-gray-100">
        <img src={property?.image || '/placeholder-image.jpg'} alt="Property" className="w-full h-full object-cover" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isCompleted ? (
            <span className="px-3 py-1.5 bg-[#1E5631]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Completed
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-[#B8860B]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5">
              <Clock size={14} /> Upcoming
            </span>
          )}
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {visit.id}
          </span>
        </div>
      </div>

      {/* CENTER: Property & Visit Info */}
      <div className="p-6 lg:p-8 flex-1 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
        
        <div className="mb-6">
          <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2">
            {property ? `${property.propertyType} in ${property.society}` : 'Unknown Property'}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
            <span className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="text-gray-400" />
              {property ? `${property.society}, ${property.city}` : 'No location'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span>{property?.propertyType}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span>{property?.propertySize} {property?.sizeUom}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Scheduled Date</span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={14} className="text-[#B8860B]" /> {visit.scheduledDate}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Scheduled Time</span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Clock size={14} className="text-[#B8860B]" /> {visit.scheduledTime}
            </span>
          </div>
          
          {isCompleted && (
            <>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Actual Visit Date</span>
                <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                  <CheckCircle2 size={14} /> {visit.actualDate}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Actual Visit Time</span>
                <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                  <Clock size={14} /> {visit.actualTime}
                </span>
              </div>
            </>
          )}

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Visit Conducted By</span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <User size={14} className="text-gray-400" /> {visit.conductedBy?.name} <span className="text-xs text-gray-400 font-medium ml-1">({visit.conductedBy?.role})</span>
            </span>
          </div>
        </div>

      </div>

      {/* RIGHT: Actions & Remarks */}
      <div className="p-6 lg:p-8 w-full lg:w-[320px] shrink-0 flex flex-col bg-gray-50/30">
        
        {isCompleted && (
          <div className="mb-6 flex-1">
            {hasRemarks ? (
              <div className="bg-[#fafcfb] p-4 rounded-xl border border-[#1E5631]/10">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare size={12} className="text-[#1E5631]" /> Your Remarks
                </span>
                <p className="text-xs font-semibold text-gray-600 line-clamp-3 leading-relaxed mb-3">"{visit.visitorRemarks}"</p>
                <Link to={`/customer/visits/${visit.id}`} className="text-[#B8860B] text-xs font-bold hover:underline flex items-center gap-1">
                  <Edit2 size={12} /> Edit Remarks
                </Link>
              </div>
            ) : (
              <div className="bg-[#FFF4E5]/50 p-4 rounded-xl border border-[#B8860B]/20 flex flex-col items-start">
                <span className="block text-[10px] font-bold text-[#B8860B] uppercase tracking-wider mb-1">Remarks Pending</span>
                <p className="text-xs font-medium text-gray-600 mb-3">You can add your remarks for this completed visit.</p>
                <Link to={`/customer/visits/${visit.id}`} className="text-xs font-bold bg-white text-[#B8860B] border border-[#B8860B]/20 px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#faf7f2] flex items-center gap-1.5 transition-colors">
                  <Plus size={12} /> Add Remarks
                </Link>
              </div>
            )}
          </div>
        )}

        <div className={`flex flex-col gap-3 ${!isCompleted ? 'mt-auto justify-center flex-1' : 'mt-auto'}`}>
          <Link 
            to={`/customer/visits/${visit.id}`}
            className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors"
          >
            View Visit Details
          </Link>
          <Link 
            to={`/customer/properties/${visit.propertyId}`}
            className="w-full text-center py-3 rounded-xl border border-gray-200 text-[#1a2b25] bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            View Property
          </Link>
        </div>
      </div>

    </div>
  );
};

const CustomerPropertyVisits = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingVisits = mockVisitsList.filter(v => v.actualDate === null);
  const completedVisits = mockVisitsList.filter(v => v.actualDate !== null);

  const getDisplayedVisits = () => {
    if (activeTab === 'upcoming') return upcomingVisits;
    if (activeTab === 'completed') return completedVisits;
    return mockVisitsList;
  };

  const displayedVisits = getDisplayedVisits();

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Property Visits</span>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">Property Visits</h1>
          <p className="text-gray-600 font-medium max-w-2xl">
            View property visits organized for you by PPC. You can review details of upcoming visits or leave your remarks on completed ones.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'upcoming' 
                ? 'border-[#B8860B] text-[#B8860B]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upcoming Visits ({upcomingVisits.length})
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'completed' 
                ? 'border-[#B8860B] text-[#B8860B]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Completed Visits ({completedVisits.length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'all' 
                ? 'border-[#B8860B] text-[#B8860B]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            All Visits ({mockVisitsList.length})
          </button>
        </div>

        {/* Visits Grid */}
        {displayedVisits.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedVisits.map(visit => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No visits found</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              There are currently no property visits in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPropertyVisits;
