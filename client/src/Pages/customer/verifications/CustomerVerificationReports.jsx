import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, User, FileText, Calendar, Clock, ShieldCheck, CheckCircle2, Clock3, AlertCircle, RefreshCw } from 'lucide-react';
import { mockVerificationsList } from './mockVerificationsData';
import { mockPropertiesList } from '../properties/mockPropertyData';

// Helper for badge styling
export const getApprovalBadge = (stage) => {
  switch(stage) {
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

const VerificationCard = ({ verification }) => {
  const property = mockPropertiesList.find(p => p.id === verification.propertyId);
  const stage = verification.approvalStage.name;
  const badge = getApprovalBadge(stage);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row hover:shadow-md transition-shadow min-h-[180px]">
      
      {/* LEFT: Property Image */}
      <div className="relative w-full lg:w-[300px] h-56 lg:h-auto shrink-0 bg-gray-100 flex flex-col items-center justify-center">
        {property?.image ? (
          <img src={property.image} alt="Property" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 font-medium">No Image</span>
        )}
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={`px-3 py-1.5 ${badge.bg} ${badge.text} text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 w-max backdrop-blur-sm bg-opacity-95`}>
            {badge.icon} {stage}
          </span>
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {verification.propertyId}
          </span>
        </div>
      </div>

      {/* CENTER: Property & Verification Info */}
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
            <span>{property?.propertyType || 'Unknown'}</span>
            {property?.propertySize && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                <span>{property.propertySize} {property.sizeUom}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-12 gap-y-6">
          {verification.verificationDate ? (
            <>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verification Date</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={14} className="text-[#B8860B]" /> {verification.verificationDate}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verification Time</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={14} className="text-[#B8860B]" /> {verification.verificationTime}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verified By</span>
                <span className="text-sm font-bold text-[#1a2b25] flex items-center gap-2">
                  <User size={14} className="text-[#1E5631]" /> {verification.verifiedBy?.name} 
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center h-full py-2">
              <span className="text-sm font-medium text-gray-500 italic">
                {stage === 'Pending' ? 'Verification has not started yet. Waiting for PPC review.' : 'Verification details will appear once recorded.'}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Actions */}
      <div className="p-6 lg:p-8 w-full lg:w-[280px] shrink-0 flex flex-col justify-center bg-gray-50/30 gap-3">
        <Link 
          to={`/customer/verification-reports/${verification.propertyId}`} // Routing primarily via property reference for verifications
          className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck size={16} /> View Verification Report
        </Link>
        <Link 
          to={`/customer/properties/${verification.propertyId}`}
          className="w-full text-center py-3 rounded-xl border border-gray-200 text-[#1a2b25] bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
        >
          View Property
        </Link>
      </div>

    </div>
  );
};

const CustomerVerificationReports = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const totalProperties = mockVerificationsList.length;
  const pendingCount = mockVerificationsList.filter(v => v.approvalStage.name === 'Pending').length;
  const underReviewCount = mockVerificationsList.filter(v => v.approvalStage.name === 'Under Review').length;
  const approvedCount = mockVerificationsList.filter(v => v.approvalStage.name === 'Approved').length;
  const rejectedCount = mockVerificationsList.filter(v => v.approvalStage.name === 'Rejected').length;

  const getDisplayedVerifications = () => {
    if (activeFilter === 'All') return mockVerificationsList;
    return mockVerificationsList.filter(v => v.approvalStage.name === activeFilter);
  };

  const displayedVerifications = getDisplayedVerifications();

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Verification Reports</span>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">Verification Reports</h1>
          <p className="text-gray-600 font-medium max-w-2xl">
            Track PPC verification and approval status for your properties.
          </p>
        </div>

        {/* Summary Cards (Filters) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          
          <button onClick={() => setActiveFilter('All')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#1a2b25] ${activeFilter === 'All' ? 'bg-[#1a2b25] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'All' ? 'text-gray-300' : 'text-gray-400'}`}>Total Properties</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{totalProperties}</h3>
              <FileText size={24} className={activeFilter === 'All' ? 'text-gray-400' : 'text-gray-200'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Pending')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#B8860B] ${activeFilter === 'Pending' ? 'bg-[#B8860B] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Pending' ? 'text-white/80' : 'text-gray-400'}`}>Pending</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{pendingCount}</h3>
              <Clock3 size={24} className={activeFilter === 'Pending' ? 'text-white/30' : 'text-[#B8860B]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Under Review')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#5c6b63] ${activeFilter === 'Under Review' ? 'bg-[#5c6b63] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Under Review' ? 'text-white/80' : 'text-gray-400'}`}>Under Review</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{underReviewCount}</h3>
              <RefreshCw size={24} className={activeFilter === 'Under Review' ? 'text-white/30' : 'text-[#5c6b63]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Approved')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5631] ${activeFilter === 'Approved' ? 'bg-[#1E5631] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Approved' ? 'text-white/80' : 'text-gray-400'}`}>Approved</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{approvedCount}</h3>
              <CheckCircle2 size={24} className={activeFilter === 'Approved' ? 'text-white/30' : 'text-[#1E5631]/20'} />
            </div>
          </button>

          <button onClick={() => setActiveFilter('Rejected')} className={`text-left rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[110px] transition-all focus:outline-none focus:ring-2 focus:ring-[#8c3535] ${activeFilter === 'Rejected' ? 'bg-[#8c3535] text-white' : 'bg-white border border-gray-100 hover:border-gray-300'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${activeFilter === 'Rejected' ? 'text-white/80' : 'text-gray-400'}`}>Rejected</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{rejectedCount}</h3>
              <AlertCircle size={24} className={activeFilter === 'Rejected' ? 'text-white/30' : 'text-[#8c3535]/20'} />
            </div>
          </button>

        </div>

        {/* Verifications List */}
        {displayedVerifications.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedVerifications.map(v => (
              <VerificationCard key={v.propertyId} verification={v} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No properties found.</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              There are no properties matching this verification stage.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerVerificationReports;
