import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Edit2, MapPin, Maximize,
  Home, CheckSquare, List, Image as ImageIcon, Video,
  Map, Ruler, Navigation, Tag, DollarSign, Calendar, X
} from 'lucide-react';
import { getCustomerPropertyDetail, resolveMediaUrl, getPropertyFormReference, setCustomerPropertyDemand } from '../../../Services/customer.services';

const CustomerPropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation();

  const [propertyData, setPropertyData] = useState(null);
  const [demandTypes, setDemandTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demand Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDemandType, setSelectedDemandType] = useState(null); // Full object: { demand_type_id, demand_type_english }
  const [demandAmountInput, setDemandAmountInput] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resDetail, resRef] = await Promise.all([
        getCustomerPropertyDetail(propertyId),
        getPropertyFormReference()
      ]);
      setPropertyData(resDetail.data);
      if (resRef?.data?.demandTypes) {
        setDemandTypes(resRef.data.demandTypes);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [propertyId]);

  useEffect(() => {
    if (locationRouter.search.includes('tab=pricing')) {
      const section = document.getElementById('pricing-demand-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [locationRouter.search, propertyData]);

  const property = propertyData?.property;
  const location = propertyData?.location;
  const pictures = propertyData?.pictures || [];
  const video = propertyData?.video;
  const amenities = propertyData?.amenities || [];
  const approval = propertyData?.approval;
  const status = propertyData?.status;
  const demand = propertyData?.demand;

  const allImages = useMemo(() => {
    if (!pictures.length) return [];
    return pictures.map(p => resolveMediaUrl(p.picture_url));
  }, [pictures]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const [demandPageError, setDemandPageError] = useState(null);

  const openDemandModal = (typeEnglish) => {
    setDemandPageError(null);
    if (!demandTypes || demandTypes.length === 0) {
      setDemandPageError('Reference data is still loading. Please wait.');
      return;
    }
    const matchedType = demandTypes.find(d => d.demand_type_english?.toLowerCase() === typeEnglish.toLowerCase());
    if (!matchedType) {
      setDemandPageError(`Demand type ${typeEnglish} not found in reference data.`);
      return;
    }
    setSelectedDemandType(matchedType);
    setDemandAmountInput('');
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleSubmitDemand = async (e) => {
    e.preventDefault();
    if (!demandAmountInput || isNaN(demandAmountInput) || Number(demandAmountInput) <= 0) {
      setSubmitError('Please enter a valid amount greater than 0.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      await setCustomerPropertyDemand(propertyId, {
        demand_type_id: selectedDemandType.demand_type_id,
        demand_amount: Number(demandAmountInput)
      });
      setIsModalOpen(false);
      // Refetch property details to get official backend values
      await fetchDetail();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save demand.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800 animate-pulse">Loading property details...</h2>
      </div>
    );
  }

  if (error || !propertyData) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-800 mb-2">{error || 'Property Not Found'}</h2>
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

  const StatusBadge = ({ currentStatus }) => {
    let color = 'bg-gray-100 text-gray-700';
    let dotColor = 'bg-gray-400';
    const statusText = currentStatus || 'Unknown';
    if (statusText === 'Active' || statusText === 'Completed') {
      color = 'bg-[#EAF3EE] text-[#1E5631]';
      dotColor = 'bg-[#1E5631]';
    } else if (statusText === 'Pending Verification' || statusText === 'Pending' || statusText === 'Inactive') {
      color = 'bg-[#FFF4E5] text-[#B8860B]';
      dotColor = 'bg-[#B8860B]';
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
        {statusText}
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
                  alt={`${property.property_type} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10">
                  <ImageIcon size={14} /> {currentImageIndex + 1} / {allImages.length}
                </div>

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a2b25] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    >
                      <ChevronLeft size={24} className="mr-0.5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#1a2b25] flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    >
                      <ChevronRight size={24} className="ml-0.5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex
                              ? 'w-6 h-2.5 bg-white'
                              : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                            }`}
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

            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <StatusBadge currentStatus={status?.status} />
              {approval?.approval_stage && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                  {approval.approval_stage}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white">
            <div className="flex-1">
              <div className="text-xs font-bold text-[#B8860B] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Tag size={14} /> {property.formatted_id}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1a2b25] mb-2">
                {property.property_type} in {location?.society_english || 'Unknown'}
              </h1>

              <div className="text-gray-600 font-medium text-sm sm:text-base mb-4 flex items-center">
                <MapPin size={16} className="mr-2 text-[#B8860B]" />
                {[location?.area_english, location?.society_english, location?.city_english].filter(Boolean).join(', ')}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#2c4232]">
                <div className="flex items-center gap-1.5">
                  <Home size={16} className="text-gray-400" />
                  {property.property_type}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-normal">Use:</span> {property.property_use || '--'}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                  <Maximize size={16} className="text-gray-400" />
                  {property.property_size} {property.uom_english}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => navigate(`/customer/properties/${property.property_id}/edit`)}
                className="w-full md:w-auto px-8 py-3 rounded-full bg-[#1a2b25] text-white text-sm font-bold shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Edit Property
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">

          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={Map} title="Location Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
              <DetailItem label="Country" value={location?.country_english} />
              <DetailItem label="Province" value={location?.province_english} />
              <DetailItem label="Division" value={location?.division_english} />
              <DetailItem label="District" value={location?.district_english} />
              <DetailItem label="Tehsil" value={location?.tehsil_english} />
              <DetailItem label="City" value={location?.city_english} />
              <DetailItem label="Society" value={location?.society_english} />
              <DetailItem label="Area / Block" value={location?.area_english} />
              <DetailItem label="Location Type" value={property.property_location} />
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={Ruler} title="Size & Area" />

            <h4 className="text-sm font-bold text-[#1a2b25] mb-5">Primary Size</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-6 mb-8">
              <DetailItem label="Property Size" value={property.property_size} />
              <DetailItem label="Size UOM" value={property.uom_english} />
              <DetailItem label="Marla Size Ref" value={property.marla_size_sqft ? `${property.marla_size_sqft} SqFt` : '--'} />
            </div>

            <h4 className="text-sm font-bold text-[#1a2b25] mb-5 border-t border-gray-100 pt-6">Calculated Areas</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-6 mb-8">
              <DetailItem label="Area (Marla)" value={property.property_area_marla} />
              <DetailItem label="Area (Kanal)" value={property.property_area_kanal} />
              <DetailItem label="Area (Acre)" value={property.property_area_acre} />
              <DetailItem label="Area (Sq Ft)" value={property.property_area_sqft} />
              <DetailItem label="Area (Sq Yard)" value={property.property_area_sqyard} />
            </div>

            <h4 className="text-sm font-bold text-[#1a2b25] mb-5 border-t border-gray-100 pt-6">Construction Area & Dimensions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6">
              <DetailItem label="Covered Area (Sq Ft)" value={property.property_covered_area_sqft} />
              <DetailItem label="Open Area (Sq Ft)" value={property.property_open_area_sqft} />
              <DetailItem label="Dimension (Front)" value={property.property_size_front} />
              <DetailItem label="Dimension (Back)" value={property.property_size_back} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
              <SectionTitle icon={List} title="Property Particulars" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                <DetailItem label="Rooms" value={property.property_rooms} />
                <DetailItem label="Bathrooms" value={property.property_bath_rooms} />
                <DetailItem label="Floors" value={property.property_floors} />
                <DetailItem label="Lounges" value={property.property_lounges} />
                <DetailItem label="Kitchens" value={property.property_kitchens} />
                <DetailItem label="Drawing Rooms" value={property.property_drawing_rooms} />
              </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
              <SectionTitle icon={Navigation} title="Road / Access Dimensions" />
              <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                <DetailItem label="Front Road (ft)" value={property.property_road_size_front_ft} />
                <DetailItem label="Back Road (ft)" value={property.property_road_size_back_ft} />
                <DetailItem label="Left Road (ft)" value={property.property_road_size_left_ft} />
                <DetailItem label="Right Road (ft)" value={property.property_road_size_right_ft} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <SectionTitle icon={CheckSquare} title="Features & Amenities" />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-6 mb-10">
              <DetailItem label="Swimming Pool" value={property.property_swimming_pool ? 'Yes' : 'No'} />
              <DetailItem label="Media Room" value={property.property_media_room ? 'Yes' : 'No'} />
              <DetailItem label="Solar Installed" value={property.property_solar_is_installed ? `Yes (${property.property_solar_capacity || 'Unknown Capacity'})` : 'No'} />
              <DetailItem label="Electric Meters" value={property.property_electric_meters} />
              <DetailItem label="Gas Meters" value={property.property_gas_meters} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Amenities</h4>
                <div className="flex flex-wrap gap-3">
                  {amenities.length > 0 ? (
                    amenities.map((amenity, idx) => (
                      <span key={idx} className="px-4 py-2 bg-[#FAF8F3] border border-[#e4d7be] rounded-xl text-sm font-bold text-[#1a2b25]">
                        {amenity.amenity_description}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">No amenities listed</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Description</h4>
                <div className="bg-[#f4f2ea] p-4 rounded-xl text-sm text-[#1a2b25]">
                  {property.property_description || <span className="text-gray-400 font-semibold">No description provided</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 p-8 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <SectionTitle icon={ImageIcon} title="Pictures" />
                {pictures.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {pictures.map((pic, idx) => (
                      <div key={idx} className="aspect-square rounded-[16px] overflow-hidden border border-gray-200">
                        <img src={resolveMediaUrl(pic.picture_url)} alt={`Property Pic ${idx}`} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" />
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
                {video ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 p-4 border border-gray-200 rounded-[16px] bg-[#FAF8F3]">
                      <div className="w-full h-48 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                        <video controls className="w-full h-full object-cover">
                          <source src={resolveMediaUrl(video.video_url)} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <span className="text-sm font-bold text-gray-700 truncate mt-2">{video.video_url.split('/').pop()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400 bg-[#FAF8F3]">
                    No videos provided
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Demand & Pricing */}
          <div id="pricing-demand-section" className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e4d7be] overflow-hidden">
            <div className="bg-[#FAF8F3] px-8 py-6 border-b border-[#e4d7be]">
              <h3 className="text-xl font-serif font-bold text-[#1a2b25] flex items-center gap-2">
                <DollarSign size={24} className="text-[#B8860B]" />
                Pricing & Demand
              </h3>
            </div>
            {demandPageError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-8 mt-6">
                <p className="text-sm text-red-700 font-bold">{demandPageError}</p>
              </div>
            )}
            <div className="p-8 flex items-center justify-center">
              {demand ? (
                <div className="max-w-md w-full bg-[#FAF8F3] rounded-3xl p-8 border border-[#e4d7be]/60 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-12 -mt-12 bg-[#B8860B]/10" />
                  <div className="relative">
                    <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-6">
                      FOR {demand.demand_type}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Current Demand</p>
                      <p className="text-4xl font-bold text-[#1a2b25] mb-3">PKR {Number(demand.final_amount ?? demand.demand_amount).toLocaleString()}</p>
                      <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} />
                        Effective from {new Date(demand.effective_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => openDemandModal(demand.demand_type)}
                      className="w-full mt-4 px-6 py-3.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#2c4232] transition-colors"
                    >
                      Change Demand
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex flex-col items-center justify-center text-gray-400 py-6 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                      <DollarSign size={32} className="text-gray-300" />
                    </div>
                    <span className="text-lg font-bold text-[#1a2b25]">Pricing not set</span>
                    <p className="text-sm font-medium mt-2">What would you like to offer this property for?</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto pb-4">
                    <button
                      onClick={() => openDemandModal('Sale')}
                      className="p-8 border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#1a2b25] hover:bg-[#FAF8F3] transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1a2b25] group-hover:text-white transition-colors">
                        <Tag size={28} />
                      </div>
                      <span className="text-lg font-bold text-[#1a2b25]">For Sale</span>
                    </button>

                    <button
                      onClick={() => openDemandModal('Rent')}
                      className="p-8 border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#B8860B] hover:bg-[#FAF8F3] transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#B8860B] group-hover:text-white transition-colors">
                        <Tag size={28} />
                      </div>
                      <span className="text-lg font-bold text-[#1a2b25]">For Rent</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* UPDATE MODAL */}
      {isModalOpen && selectedDemandType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F3]">
              <h3 className="text-lg font-bold text-[#1a2b25]">
                {demand ? `Change ${selectedDemandType.demand_type_english} Demand` : `Set ${selectedDemandType.demand_type_english} Demand`}
              </h3>
              <button onClick={() => !submitLoading && setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1" disabled={submitLoading}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitDemand} className="p-6">

              {demand && demand.demand_type === selectedDemandType.demand_type_english && (
                <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Amount</span>
                  <span className="text-xl font-bold text-gray-800">PKR {Number(demand.final_amount ?? demand.demand_amount).toLocaleString()}</span>
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-semibold">
                  {submitError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#1a2b25] mb-2">New Demand Amount (PKR) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={demandAmountInput}
                    onChange={(e) => setDemandAmountInput(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-colors text-lg font-bold text-[#1a2b25]"
                    placeholder="e.g. 50000000"
                    min="1"
                    disabled={submitLoading}
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-3 bg-[#1a2b25] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Save New Demand'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerPropertyDetails;
