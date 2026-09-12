import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, CheckCircle2, Clock, User, Building, Home, Map, MessageSquare, ShieldCheck } from 'lucide-react';
import { mockVisitsList } from './mockVisitsData';
import { mockPropertiesList } from '../properties/mockPropertyData';

const CustomerVisitDetails = () => {
  const { visitId } = useParams();
  
  // Find mock visit
  const initialVisit = mockVisitsList.find(v => v.id === visitId);
  const [visit, setVisit] = useState(initialVisit);
  
  // Form state for remarks
  const [remarksInput, setRemarksInput] = useState(initialVisit?.visitorRemarks || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!visit) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Visit Not Found</h2>
        <Link to="/customer/visits" className="text-[#B8860B] hover:underline font-bold">Return to Property Visits</Link>
      </div>
    );
  }

  const property = mockPropertiesList.find(p => p.id === visit.propertyId);
  const isCompleted = visit.actualDate !== null;

  const handleSaveRemarks = () => {
    setError('');
    setShowSuccess(false);

    const trimmed = remarksInput.trim();
    if (trimmed === '') {
      setError('Remarks cannot be empty.');
      return;
    }

    if (trimmed.length > 1000) {
      setError('Remarks cannot exceed 1000 characters.');
      return;
    }

    // Mock save
    setIsSaving(true);
    setTimeout(() => {
      setVisit(prev => ({ ...prev, visitorRemarks: trimmed }));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/visits" className="hover:text-gray-900 transition-colors">Property Visits</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">{visit.id}</span>
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
                <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{visit.id}</span>
                {isCompleted ? (
                  <span className="px-3 py-1 bg-[#EAF3EE] text-[#1E5631] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#1E5631]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1E5631]"></span> Completed
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#FFF4E5] text-[#B8860B] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-[#B8860B]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></span> Upcoming
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                Visit Details
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
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">Visit Schedule</h3>
              </div>
              
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Scheduled Time */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                    <Clock size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Scheduled Visit</h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-[#1a2b25]">{visit.scheduledDate}</div>
                    <div className="text-sm font-semibold text-[#B8860B]">{visit.scheduledTime}</div>
                  </div>
                </div>

                {/* Actual Time */}
                <div className={`rounded-2xl p-6 border relative ${isCompleted ? 'bg-[#f6f9f7] border-[#1E5631]/20' : 'bg-white border-dashed border-gray-200'}`}>
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    isCompleted ? 'bg-white text-[#1E5631]' : 'bg-gray-50 text-gray-300'
                  }`}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  </div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isCompleted ? 'text-[#1E5631]/60' : 'text-gray-400'}`}>
                    Actual Visit
                  </h4>
                  
                  {isCompleted ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-[#1E5631]">{visit.actualDate}</div>
                      <div className="text-sm font-semibold text-[#1E5631]/80">{visit.actualTime}</div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-[52px] justify-center">
                      <span className="text-sm font-medium text-gray-500 italic">Visit has not taken place yet.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Employee Remarks */}
            <div className="bg-[#fafcfb] rounded-[20px] shadow-sm border border-[#1E5631]/10 overflow-hidden">
              <div className="p-6 border-b border-[#1E5631]/10 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">PPC Employee Remarks</h3>
              </div>
              <div className="p-8">
                {visit.employeeRemarks ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {visit.employeeRemarks}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">No remarks added by PPC yet.</p>
                )}
              </div>
            </div>

            {/* 3. My Visitor Remarks */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">My Visitor Remarks</h3>
              </div>
              
              <div className="p-8">
                {!isCompleted ? (
                  <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500">
                      You can add your remarks after the visit is completed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Leave a note about your visit</label>
                    <textarea 
                      value={remarksInput}
                      onChange={(e) => setRemarksInput(e.target.value)}
                      placeholder="e.g. Property was well maintained and the location was suitable."
                      className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-medium text-gray-800 bg-gray-50/50 resize-none"
                    ></textarea>
                    
                    {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
                    
                    <div className="flex items-center justify-between">
                      {showSuccess ? (
                        <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                          <CheckCircle2 size={16} /> Remarks saved successfully!
                        </span>
                      ) : (
                        <span></span> // Empty span for flex-between spacing
                      )}
                      
                      <button 
                        onClick={handleSaveRemarks}
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#2c4232] transition-colors disabled:opacity-70 flex items-center gap-2"
                      >
                        {isSaving ? 'Saving...' : 'Save Remarks'}
                      </button>
                    </div>
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
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">PPC Representative</h3>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-white ring-2 ring-gray-50">
                  {visit.conductedBy?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{visit.conductedBy?.name}</h4>
                  <p className="text-xs font-medium text-gray-500">{visit.conductedBy?.role}</p>
                </div>
              </div>
            </div>

            {/* Related Property */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Home size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">Related Property</h3>
              </div>
              
              {property ? (
                <div className="flex-1 flex flex-col">
                  <div className="relative h-48 w-full bg-gray-100">
                    <img src={property.image || '/placeholder-image.jpg'} alt="Property" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Property Title</span>
                        <span className="font-bold text-gray-800 line-clamp-1">{property.propertyType} in {property.society}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</span>
                        <span className="font-semibold text-gray-600 flex items-center gap-1">
                          <MapPin size={12} /> {property.society}, {property.city}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</span>
                        <span className="font-semibold text-gray-700">{property.propertyType}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</span>
                        <span className="font-semibold text-gray-700">{property.propertySize} {property.sizeUom}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <Link 
                        to={`/customer/properties/${property.id}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-[#1a2b25] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        View Property
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                    <Building size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">Unknown Property</p>
                  <p className="text-xs text-gray-400">The property details could not be loaded.</p>
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
