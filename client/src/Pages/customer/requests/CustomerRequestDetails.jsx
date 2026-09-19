import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, FileText, Home, Wrench, Calendar, MapPin, 
  AudioLines, AlertTriangle, X, Info, Clock, Check, Phone, Headset, MessageSquare
} from 'lucide-react';
import { getCustomerRequestById, resolveMediaUrl } from '../../../Services/customer.services';
import PropVilla from '../../../assets/prop_villa.png'; // Fallback aesthetic image

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700 border border-gray-200';
  let dotColor = 'bg-gray-400';

  if (status === 'Completed') {
    color = 'bg-[#EAF3EE] text-[#1E5631] border border-[#1E5631]/20'; 
    dotColor = 'bg-[#1E5631]';
  } else if (status === 'Pending' || status === 'Under Review') {
    color = 'bg-[#FFF4E5] text-[#B8860B] border border-[#B8860B]/20'; 
    dotColor = 'bg-[#B8860B]';
  } else if (status === 'Assigned' || status === 'In Progress') {
    color = 'bg-blue-50 text-blue-700 border border-blue-200';
    dotColor = 'bg-blue-600';
  } else if (status === 'Withdrawn') {
    color = 'bg-red-50 text-red-700 border border-red-200';
    dotColor = 'bg-red-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

const ProgressTimeline = ({ currentStatus }) => {
  const stages = [
    { key: 'Submitted', label: 'Submitted', statuses: ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Completed'] },
    { key: 'Under Review', label: 'Under Review', statuses: ['Under Review', 'Assigned', 'In Progress', 'Completed'] },
    { key: 'Assigned', label: 'Assigned', statuses: ['Assigned', 'In Progress', 'Completed'] },
    { key: 'In Progress', label: 'In Progress', statuses: ['In Progress', 'Completed'] },
    { key: 'Completed', label: 'Completed', statuses: ['Completed'] }
  ];

  if (currentStatus === 'Withdrawn') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          <span className="font-bold text-lg">This Request has been Withdrawn</span>
        </div>
      </div>
    );
  }

  let currentIndex = stages.findIndex(s => s.key === currentStatus);
  if (currentIndex === -1) currentIndex = 0;
  if (currentStatus === 'Completed') currentIndex = 4;
  
  // Mapping 'Pending' to the Submitted stage
  if (currentStatus === 'Pending') currentIndex = 0;

  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8 mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center justify-between min-w-[600px] relative">
        {/* Background Line */}
        <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-200 z-0"></div>
        
        {/* Active Line */}
        <div 
          className="absolute top-4 left-6 h-[2px] bg-[#B8860B] z-0 transition-all duration-500 ease-in-out"
          style={{ width: `calc(${(currentIndex / (stages.length - 1)) * 100}% - 48px)` }}
        ></div>

        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-3 w-32">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                isCompleted 
                  ? 'bg-[#B8860B] text-white shadow-[0_0_0_4px_#FFF4E5]' 
                  : 'bg-gray-200 text-gray-400 border-4 border-white'
              }`}>
                {isCompleted ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
              </div>
              <div className="text-center">
                <span className={`block text-xs font-bold ${isCompleted ? 'text-[#1a2b25]' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
                {idx === 0 && <span className="block text-[10px] text-gray-400 mt-0.5">15 Oct 2025</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomerRequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const res = await getCustomerRequestById(requestId);
        if (res?.success) {
          setRequest(res.data);
          setError(null);
        } else {
          setError(res?.message || 'Request not found');
        }
      } catch (err) {
        setError(err.message || 'Error fetching request details');
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-gray-500">Loading Request Details...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Request Not Found'}</h2>
        <Link to="/customer/requests" className="text-[#B8860B] hover:underline font-bold">Return to My Requests</Link>
      </div>
    );
  }

  const propertyDisplay = request.propertyId 
    ? `${request.propertyType || 'Property'} in ${request.societyName || 'Unknown Location'}`
    : 'No linked property';

  const canWithdraw = request.status === 'Pending' || request.status === 'Under Review';

  const handleWithdraw = () => {
    setWithdrawError("Withdraw action is not yet connected to the backend API. This is a frontend demo.");
  };

  const isPropertyReq = request.category === 'PROPERTY';
  const titleText = request.purpose || request.service;

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Breadcrumb */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/requests" className="hover:text-gray-900 transition-colors">My Requests</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">{request.id}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto">
        
        {/* HERO CARD */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 mb-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center p-6 sm:p-8 min-h-[160px]">
          
          {/* Decorative Right Background */}
          <div className="absolute right-0 top-0 bottom-0 w-[40%] md:w-[60%] pointer-events-none opacity-20 sm:opacity-90">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
            <img src={PropVilla} alt="Premium Background" className="w-full h-full object-cover object-right" />
          </div>

          <div className="relative z-20 flex items-start gap-6 w-full">
            {/* Icon Box */}
            <div className="w-20 h-20 rounded-2xl bg-[#eaf1ec] border border-[#1E5631]/10 flex items-center justify-center shrink-0">
              {isPropertyReq ? <Home size={32} className="text-[#1E5631]" /> : <Wrench size={32} className="text-[#B8860B]" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-gray-500">{request.id}</span>
                <StatusBadge status={request.status} />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1a2b25] mb-4">
                {titleText}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-800 underline decoration-gray-300 underline-offset-4">{propertyDisplay}</span>
                </div>
                <div className="hidden sm:block w-[1px] h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Created: {new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {canWithdraw && (
              <div className="relative z-20 hidden md:block shrink-0 pl-6 py-8">
                <button 
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-6 py-2 bg-white border border-red-300 text-red-600 rounded-full font-bold text-sm hover:bg-red-50 hover:border-red-400 shadow-sm transition-all"
                >
                  Withdraw Request
                </button>
              </div>
            )}
          </div>

          {/* Mobile Withdraw Button */}
          {canWithdraw && (
            <div className="relative z-20 w-full mt-6 md:hidden border-t border-gray-100 pt-4">
              <button 
                onClick={() => setShowWithdrawModal(true)}
                className="w-full py-2.5 bg-white border border-red-300 text-red-600 rounded-full font-bold text-sm hover:bg-red-50 shadow-sm"
              >
                Withdraw Request
              </button>
            </div>
          )}
        </div>

        {/* PROGRESS TIMELINE */}
        <ProgressTimeline currentStatus={request.status} />

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Request Description Card */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#B8860B]" /> Request Description
              </h3>
              <p className="text-[15px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>

            {/* Request Information Card */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2">
                <Info size={20} className="text-[#B8860B]" /> Request Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex gap-4 border-b border-gray-50 pb-4">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Category</span>
                  <span className="flex-1 text-sm font-semibold text-gray-800">
                    {isPropertyReq ? 'Property Request' : 'PPC Service Request'}
                  </span>
                </div>
                
                <div className="flex gap-4 border-b border-gray-50 pb-4">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Status</span>
                  <div className="flex-1">
                    <StatusBadge status={request.status} />
                  </div>
                </div>

                <div className="flex gap-4 border-b border-gray-50 pb-4">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">
                    {isPropertyReq ? 'Purpose' : 'Service'}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-[#1a2b25]">{titleText}</span>
                </div>

                <div className="flex gap-4 border-b border-gray-50 pb-4">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Created Date</span>
                  <span className="flex-1 text-sm font-semibold text-gray-800">
                    {new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </span>
                </div>

                <div className="flex gap-4 sm:col-span-2 items-center">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Linked Property</span>
                  <span className="flex-1 flex items-center gap-2 text-sm font-semibold text-gray-800 underline decoration-gray-300 underline-offset-4">
                    <Home size={16} className="text-[#1E5631]" />
                    {propertyDisplay}
                  </span>
                </div>

                <div className="flex gap-4 sm:col-span-2 items-start mt-2">
                  <span className="w-32 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mt-3">Audio Attachment</span>
                  <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 flex items-center gap-4 max-w-sm">
                    {request.audioUrl ? (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#B8860B]">
                          <AudioLines size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 truncate max-w-[200px]">Audio Note</p>
                          <a href={resolveMediaUrl(request.audioUrl)} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-500 hover:underline">Listen to audio</a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                          <AudioLines size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-500">No audio message attached</p>
                          <p className="text-[11px] font-medium text-gray-400">You can share additional details via audio</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Activity Card */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-8">
              <h3 className="text-lg font-serif font-bold text-[#1a2b25] mb-8 flex items-center gap-2">
                <Clock size={20} className="text-[#B8860B]" /> Timeline & Activity
              </h3>
              
              <div className="relative pl-8 space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-4 w-[2px] bg-gray-100"></div>

                {/* Event 1 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 border-white bg-[#B8860B] shadow-sm"></div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Request Created</h4>
                      <p className="text-[13px] font-medium text-gray-500 mt-1">Your request has been submitted successfully.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                      {new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                    ['Under Review', 'Assigned', 'In Progress', 'Completed'].includes(request.status) ? 'bg-[#B8860B]' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Awaiting Management Review</h4>
                      <p className="text-[13px] font-medium text-gray-500 mt-1">Your request is being reviewed by our team.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">-</span>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative">
                  <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                    ['Assigned', 'In Progress', 'Completed'].includes(request.status) ? 'bg-[#B8860B]' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Inspector Assigned</h4>
                      <p className="text-[13px] font-medium text-gray-500 mt-1">An inspector will be assigned once the review is complete.</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400">-</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* Related Property Card */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <MapPin size={18} className="text-[#B8860B]" />
                <h3 className="text-[15px] font-serif font-bold text-[#1a2b25]">Related Property</h3>
              </div>
              
              {request.propertyId ? (
                <div className="flex-1 flex flex-col">
                  {/* Property Image with embedded badge */}
                  <div className="relative h-48 w-full bg-gray-100">
                    <img src={PropVilla} alt="Property" className="w-full h-full object-cover" />
                    {isPropertyReq && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-[#1a2b25] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg">
                        Request Purpose: {titleText}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 text-sm">
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Property ID</span>
                        <span className="font-bold text-gray-800">{request.propertyId}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</span>
                        <span className="font-semibold text-gray-700">{request.propertyType || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</span>
                        <span className="font-semibold text-gray-700">{request.societyName || '-'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-2">
                      <Link 
                        to={`/customer/properties/${request.propertyId}`} 
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B8860B] to-[#d4af37] text-white rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(184,134,11,0.2)] hover:shadow-lg transition-all"
                      >
                        View Property Profile <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-3">
                    <MapPin size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600 mb-1">No property linked</p>
                  <p className="text-xs text-gray-400">This request is not associated with any specific property.</p>
                </div>
              )}
            </div>

            {/* Support Card */}
            <div className="bg-[#fafcfb] rounded-[20px] shadow-sm border border-[#1E5631]/10 p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#eaf1ec] rounded-full flex items-center justify-center text-[#1E5631] mb-4">
                <Headset size={24} />
              </div>
              <h3 className="text-[15px] font-serif font-bold text-[#1a2b25] mb-2">Contact / PPC Support</h3>
              <p className="text-xs font-medium text-gray-500 mb-6 leading-relaxed">
                Need help with this request? <br/>Our team is here to assist you.
              </p>
              
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-[#1a2b25] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm mb-3">
                <MessageSquare size={16} className="text-[#B8860B]" /> Send a Message
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a2b25]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[24px] p-8 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2">Withdraw Request?</h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed px-2">
                Are you sure you want to withdraw this request? This action cannot be undone.
              </p>
            </div>
            
            {withdrawError && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Info size={16} className="shrink-0" />
                {withdrawError}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => { setShowWithdrawModal(false); setWithdrawError(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-600 border border-red-600 hover:bg-red-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!withdrawError}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRequestDetails;
