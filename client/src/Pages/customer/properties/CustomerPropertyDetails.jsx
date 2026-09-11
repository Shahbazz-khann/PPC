import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, Edit2, MapPin, Maximize, 
  Home, CheckSquare, List, Image as ImageIcon, Video,
  Map, Ruler, Navigation, Tag
} from 'lucide-react';
import { mockPropertiesList } from './mockPropertyData';
import PricingAndDemand from './components/PricingAndDemand';

const CustomerPropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  // Handle auto-scroll if navigating from success page
  useEffect(() => {
    if (window.location.search.includes('tab=pricing')) {
      setTimeout(() => {
        const el = document.getElementById('pricing-demand-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const property = mockPropertiesList.find(p => p.id === propertyId);

  const allImages = useMemo(() => {
    if (!property) return [];
    let imgs = [];
    if (property.media?.pictures?.length > 0) {
      imgs = property.media.pictures.map(p => p.url || p);
    } else if (property.image) {
      imgs = [property.image];
    }
    return imgs;
  }, [property]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
        <Link to="/customer/properties" className="text-[#B8860B] hover:underline font-bold">Return to My Properties</Link>
      </div>
    );
  }

  const SectionTitle = ({ icon: Icon, title }) => (
    <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
      <Icon size={22} className="text-[#B8860B]" /> {title}
    </h3>
  );

  const DetailItem = ({ label, value }) => {
    const displayValue = (value !== undefined && value !== null && value !== '') ? value : '--';
    return (
      <div className="space-y-1.5">
        <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <span className={`block text-sm font-semibold ${displayValue === '--' ? 'text-gray-300' : 'text-gray-800'}`}>
          {displayValue}
        </span>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    let color = 'bg-gray-100 text-gray-700';
    let dotColor = 'bg-gray-400';
    if (status === 'Active' || status === 'Completed') {
      color = 'bg-[#EAF3EE] text-[#1E5631]'; 
      dotColor = 'bg-[#1E5631]';
    } else if (status === 'Pending Verification' || status === 'Pending') {
      color = 'bg-[#FFF4E5] text-[#B8860B]'; 
      dotColor = 'bg-[#B8860B]';
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Header Breadcrumb Area */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-6">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/properties" className="hover:text-gray-900 transition-colors">My Properties</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Property Details</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14 max-w-[1200px] mx-auto space-y-8">
        
        {/* LARGE PROPERTY IMAGE CAROUSEL & OVERVIEW */}
        <div className="bg-white rounded-[28px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden mb-8">
          
          {/* Image Slider */}
          <div className="w-full h-[350px] md:h-[500px] relative bg-[#FAF8F3] flex items-center justify-center group overflow-hidden">
            {allImages.length > 0 ? (
              <>
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${property.propertyType} - Image ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                
                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                  <ImageIcon size={14} /> {currentImageIndex + 1} / {allImages.length}
                </div>

                {/* Left/Right Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a2b25] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} className="mr-0.5" />
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a2b25] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} className="ml-0.5" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`rounded-full transition-all duration-300 shadow-sm ${
                            idx === currentImageIndex 
                              ? 'w-6 h-2.5 bg-white' 
                              : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Home size={64} className="text-[#e4d7be] mb-4" />
                <span className="text-sm font-bold">No images available</span>
              </div>
            )}
            
            {/* Approval / Status Badge on top left */}
            <div className="absolute top-4 left-4 z-10">
              <StatusBadge status={property.status} />
            </div>
          </div>

          {/* Property Overview (Below Image) */}
          <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
            <div className="flex-1">
              <div className="text-xs font-bold text-[#B8860B] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Tag size={14} /> {property.id}
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                {property.propertyType} in {property.society}
              </h1>
              
              <div className="text-gray-600 font-medium text-sm sm:text-base mb-4 flex items-center">
                <MapPin size={16} className="mr-2 text-[#B8860B]" />
                {[property.area, property.society, property.city].filter(Boolean).join(', ')}
              </div>
              
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#2c4232]">
                <div className="flex items-center gap-1.5">
                  <Home size={16} className="text-gray-400" />
                  {property.propertyType}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-normal">Use:</span> {property.propertyUse}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <Maximize size={16} className="text-gray-400" />
                  {property.propertySize} {property.sizeUom}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => navigate(`/customer/properties/${property.id}/edit`)}
                className="w-full md:w-auto px-8 py-3 rounded-full bg-[#1a2b25] text-white text-sm font-bold shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edit Property
              </button>
            </div>
          </div>
        </div>

        {/* DETAILED SECTIONS */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Classification & Location Box */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={Map} title="Location Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
              <DetailItem label="Country" value={property.country} />
              <DetailItem label="Province" value={property.province} />
              <DetailItem label="City" value={property.city} />
              <DetailItem label="District" value={property.district} />
              <DetailItem label="Tehsil" value={property.tehsil} />
              <DetailItem label="Society" value={property.society} />
              <DetailItem label="Area / Block" value={property.area} />
              <DetailItem label="Property Location" value={property.propertyLocation} />
            </div>
          </div>

          {/* Size & Area Box */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={Ruler} title="Size & Area" />
            
            <h4 className="text-sm font-bold text-[#1a2b25] mb-5">Primary Size</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6 mb-8">
              <DetailItem label="Property Size" value={property.propertySize} />
              <DetailItem label="Size UOM" value={property.sizeUom} />
              <DetailItem label="Marla Size Ref" value={property.marlaSize} />
            </div>

            <h4 className="text-sm font-bold text-[#1a2b25] mb-5 border-t border-gray-100 pt-6">Calculated Areas</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-6 mb-8">
              <DetailItem label="Area (Marla)" value={property.areaMarla} />
              <DetailItem label="Area (Kanal)" value={property.areaKanal} />
              <DetailItem label="Area (Acre)" value={property.areaAcre} />
              <DetailItem label="Area (Sq Ft)" value={property.areaSqFt} />
              <DetailItem label="Area (Sq Yard)" value={property.areaSqYard} />
            </div>

            <h4 className="text-sm font-bold text-[#1a2b25] mb-5 border-t border-gray-100 pt-6">Construction Area</h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
              <DetailItem label="Covered Area (Sq Ft)" value={property.coveredAreaSqFt} />
              <DetailItem label="Open Area (Sq Ft)" value={property.openAreaSqFt} />
            </div>
          </div>

          {/* Property Particulars & Road Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
              <SectionTitle icon={List} title="Property Particulars" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                <DetailItem label="Rooms" value={property.rooms} />
                <DetailItem label="Bathrooms" value={property.bathrooms} />
                <DetailItem label="Floors" value={property.floors} />
                <DetailItem label="Lounges" value={property.lounges} />
                <DetailItem label="Kitchens" value={property.kitchens} />
                <DetailItem label="Drawing Rooms" value={property.drawingRooms} />
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
              <SectionTitle icon={Navigation} title="Road / Access Dimensions" />
              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <DetailItem label="Front Road (ft)" value={property.roadFrontFt} />
                <DetailItem label="Back Road (ft)" value={property.roadBackFt} />
                <DetailItem label="Left Road (ft)" value={property.roadLeftFt} />
                <DetailItem label="Right Road (ft)" value={property.roadRightFt} />
              </div>
            </div>
          </div>

          {/* Features & Amenities Box */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={CheckSquare} title="Features & Amenities" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 mb-10">
              <DetailItem label="Swimming Pool" value={property.swimmingPool ? 'Yes' : 'No'} />
              <DetailItem label="Media Room" value={property.mediaRoom ? 'Yes' : 'No'} />
              <DetailItem label="Solar Installed" value={property.solarInstalled ? `Yes (${property.solarCapacity})` : 'No'} />
              <DetailItem label="Electric Meters" value={property.electricMeters} />
              <DetailItem label="Gas Meters" value={property.gasMeters} />
              <DetailItem label="Electricity Backup" value={property.electricityBackup === 'Other' ? property.otherBackup : property.electricityBackup} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Amenities</h4>
                <div className="flex flex-wrap gap-3">
                  {property.amenities?.length > 0 ? (
                    property.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#FAF8F3] border border-[#e4d7be] rounded-xl text-sm font-bold text-[#1a2b25]">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">No amenities listed</span>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Additional Features</h4>
                <div className="flex flex-wrap gap-3">
                  {property.additionalFeatures?.length > 0 ? (
                    property.additionalFeatures.map((feature, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#f4f2ea] border border-[#e4d7be] rounded-xl text-sm font-bold text-[#B8860B]">
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">No additional features</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media Box */}
          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <SectionTitle icon={ImageIcon} title="Pictures" />
                {property.media?.pictures?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {property.media.pictures.map((pic, idx) => (
                      <div key={idx} className="aspect-square rounded-[16px] overflow-hidden border border-gray-200">
                        <img src={pic.url || pic} alt={`Property Pic ${idx}`} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 bg-[#FAF8F3]">
                    No pictures provided
                  </div>
                )}
              </div>
              <div>
                <SectionTitle icon={Video} title="Videos" />
                {property.media?.videos?.length > 0 ? (
                  <div className="space-y-4">
                    {property.media.videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-[16px] bg-[#FAF8F3]">
                        <div className="w-12 h-12 bg-white shadow-sm text-[#4d70a3] rounded-xl flex items-center justify-center shrink-0">
                          <Video size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 truncate">{vid.name || `Video ${idx+1}`}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 bg-[#FAF8F3]">
                    No videos provided
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Demand Section */}
          <div id="pricing-demand-section" className="pt-4">
            <PricingAndDemand propertyId={property.id} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerPropertyDetails;
