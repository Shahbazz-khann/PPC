import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, MapPin, Calendar, Clock, User, Building, ShieldCheck, FileText, HelpCircle, CheckCircle2 } from 'lucide-react';
import { mockVerificationsList } from './mockVerificationsData';
import { mockPropertiesList } from '../properties/mockPropertyData';
import { getApprovalBadge } from './CustomerVerificationReports';

const CustomerVerificationDetails = () => {
  const { verificationId } = useParams();
  
  // Note: Since a property might be Pending (verificationId = null), we route using propertyId in this context.
  const verification = mockVerificationsList.find(v => v.propertyId === verificationId || v.verificationId === verificationId);

  if (!verification) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Report Not Found</h2>
        <Link to="/customer/verification-reports" className="text-[#B8860B] hover:underline font-bold">Return to Verification Reports</Link>
      </div>
    );
  }

  const property = mockPropertiesList.find(p => p.id === verification.propertyId);
  const stage = verification.approvalStage.name;
  const badge = getApprovalBadge(stage);

  // Status text map based on rules
  const getStatusText = (st) => {
    switch (st) {
      case 'Pending': return 'Waiting for PPC Management review.';
      case 'Under Review': return 'PPC Management is reviewing this property.';
      case 'Approved': return 'Approved properties are eligible to appear in the PPC property listing.';
      case 'Rejected': return 'This property has not been approved for listing.';
      default: return '';
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/verification-reports" className="hover:text-gray-900 transition-colors">Verification Reports</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">{verification.verificationId || 'Pending Verification'}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-6">
        
        {/* 1. VERIFICATION REPORT HEADER */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-6 sm:p-8 min-h-[140px]">
          <div className="relative z-20 flex items-start gap-6 w-full">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border bg-[#fafcfb] ${badge.text.replace('text-white', badge.bg.replace('bg-', 'text-'))} border-current/20`}>
              <ShieldCheck size={36} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-gray-500 tracking-wide uppercase">{verification.verificationId || 'N/A'}</span>
                <span className={`px-3 py-1 bg-opacity-10 backdrop-blur-sm ${badge.text.replace('text-white', badge.bg.replace('bg-', 'text-'))} ${badge.bg.replace('bg-', 'bg-opacity-10 bg-')} text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1.5 border border-current/20`}>
                  {badge.icon} {stage}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                Verification Report
              </h1>
              
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                {property ? `${property.propertyType} in ${property.society}` : 'Unknown Property'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Primary Report Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 2. PROPERTY APPROVAL STATUS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">Property Approval Status</h3>
              </div>
              <div className="p-8 flex items-start gap-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${badge.bg} ${badge.text} shadow-sm`}>
                  {React.cloneElement(badge.icon, { size: 28 })}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{stage}</h4>
                  <p className="text-[15px] font-medium text-gray-600">{getStatusText(stage)}</p>
                </div>
              </div>
            </div>

            {/* 4. VERIFICATION INFORMATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <FileText size={20} className="text-[#B8860B]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">Verification Information</h3>
              </div>
              <div className="p-6">
                {verification.verificationDate ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verification ID</span>
                      <span className="text-sm font-bold text-gray-800">{verification.verificationId}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verification Date</span>
                      <span className="text-sm font-bold text-gray-800">{verification.verificationDate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verification Time</span>
                      <span className="text-sm font-bold text-gray-800">{verification.verificationTime}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-3 pt-4 border-t border-gray-50">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Verified By</span>
                      <span className="text-sm font-bold text-[#1E5631] flex items-center gap-2">
                        <User size={16} /> {verification.verifiedBy?.name} <span className="text-xs text-gray-500 font-medium ml-1">({verification.verifiedBy?.role})</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[15px] font-medium text-gray-500 italic">Verification has not started yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. VERIFICATION FINDINGS */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#1E5631]" />
                <h3 className="text-lg font-serif font-bold text-[#1a2b25]">Verification Findings</h3>
              </div>
              <div className="p-8">
                {verification.findings ? (
                  <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {verification.findings}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">No verification findings recorded yet.</p>
                )}
              </div>
            </div>

            {/* 6. VERIFICATION REMARKS */}
            <div className={`rounded-[20px] shadow-sm border overflow-hidden ${stage === 'Rejected' ? 'bg-[#fffafa] border-[#8c3535]/20' : 'bg-[#fafcfb] border-[#1E5631]/10'}`}>
              <div className={`p-6 border-b flex items-center gap-2 ${stage === 'Rejected' ? 'border-[#8c3535]/10' : 'border-[#1E5631]/10'}`}>
                <HelpCircle size={20} className={stage === 'Rejected' ? 'text-[#8c3535]' : 'text-[#1E5631]'} />
                <h3 className={`text-lg font-serif font-bold ${stage === 'Rejected' ? 'text-[#8c3535]' : 'text-[#1a2b25]'}`}>Verification Remarks</h3>
              </div>
              <div className="p-8">
                {verification.remarks ? (
                  <p className={`text-[15px] font-medium leading-relaxed whitespace-pre-wrap ${stage === 'Rejected' ? 'text-[#8c3535] font-semibold' : 'text-gray-700'}`}>
                    {verification.remarks}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-gray-500 italic">No verification remarks recorded yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Property & Employee */}
          <div className="space-y-6">
            
            {/* 7. VERIFIED BY */}
            {verification.verifiedBy && (
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                  <User size={18} className="text-[#B8860B]" />
                  <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">Reviewed / Verified By</h3>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-white ring-2 ring-gray-50">
                    {verification.verifiedBy.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{verification.verifiedBy.name}</h4>
                    <p className="text-xs font-medium text-gray-500">{verification.verifiedBy.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. RELATED PROPERTY */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <Building size={18} className="text-[#B8860B]" />
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
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Property ID</span>
                        <span className="font-bold text-gray-800">{property.id}</span>
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
                      {property.propertySize && (
                        <div>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Size</span>
                          <span className="font-semibold text-gray-700">{property.propertySize} {property.sizeUom}</span>
                        </div>
                      )}
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

export default CustomerVerificationDetails;
