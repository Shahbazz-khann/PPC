import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronRight, 
  ChevronLeft, 
  Image as ImageIcon, 
  MapPin, 
  Home, 
  Tag, 
  Printer, 
  Share2, 
  Phone, 
  Bed, 
  Bath, 
  MessageCircle,
  Copy,
  Check,
  FileText,
  Video,
  Play
} from 'lucide-react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { useAuth } from '../../Context/AuthContext';
import { resolveMediaUrl } from '../../Services/Api';
import { getPublicPropertyById } from '../../Services/property.service';
import { formatPriceInWords } from '../../utils/priceFormatter';

const OFFICIAL_WHATSAPP_DISPLAY = '+92 300 9562656';
const OFFICIAL_WHATSAPP_CLEAN = '923009562656';
const OFFICIAL_PHONE_DISPLAY = '+92 333 5373095';
const OFFICIAL_PHONE_TEL = '+923335373095';

const PublicPropertyDetails = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['public']);
  const { user } = useAuth();

  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!location.state?.property);
  const [error, setError] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCreateRequest = () => {
    const selectedPropId = propertyId || property?.property_id;
    const targetUrl = `/customer/requests/new?property_id=${selectedPropId}`;
    const isCustomer = user && (user.user_type?.toLowerCase() === 'customer' || user.user_type_english?.toLowerCase() === 'customer');

    if (isCustomer) {
      navigate(targetUrl);
    } else {
      sessionStorage.setItem('pending_request_property_id', String(selectedPropId));
      navigate(`/signup?redirect=${encodeURIComponent(targetUrl)}`);
    }
  };

  useEffect(() => {
    // If state was not provided or property ID doesn't match the current route, fetch from API
    if (!property || String(property.property_id) !== String(propertyId)) {
      setLoading(true);
      setError(null);
      getPublicPropertyById(propertyId)
        .then((res) => {
          if (res.success && res.data) {
            setProperty(res.data);
          } else {
            setError(res.message || 'Property not found or not currently active');
          }
        })
        .catch((err) => {
          console.error('Error fetching property details:', err);
          setError('Failed to load property details. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#063B29] mb-4"></div>
          <p className="text-sm font-semibold text-gray-500">
            {t('public:loadingProperties') || 'Loading property details...'}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a2b25] mb-4">
            {error || t('public:propertyUnavailable') || 'Property Unavailable'}
          </h2>
          <button
            onClick={() => navigate('/properties')}
            className="px-6 py-3 bg-[#063B29] text-white rounded-lg font-bold hover:bg-[#04281c] transition-colors cursor-pointer"
          >
            {t('public:backToProperties') || 'Back to Properties'}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = (Array.isArray(property.images) && property.images.length > 0)
    ? property.images.map((img) => resolveMediaUrl(img)).filter(Boolean)
    : (property.image_url ? [resolveMediaUrl(property.image_url)].filter(Boolean) : []);

  const videoUrl = property.video_url ? resolveMediaUrl(property.video_url) : null;

  // Unified media items list: all images first, then video right after images
  const mediaItems = [
    ...images.map((url) => ({ type: 'image', url })),
    ...(videoUrl ? [{ type: 'video', url: videoUrl }] : [])
  ];

  const handleNextMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
    }
  };

  const handlePrevMedia = () => {
    if (mediaItems.length > 0) {
      setCurrentMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    }
  };

  const title = `${Number(property.property_size || 0)}${property.size_uom || ''} ${property.property_type || ''} For ${property.demand_type || ''}`;
  const locationText = property.society || property.city || 'Location';
  const priceDisplayInWords = formatPriceInWords(property.current_price, property.currency_code);
  const priceDisplayNumeric = `${property.currency_code || 'PKR'} ${Number(property.current_price || 0).toLocaleString()}`;

  // Dynamic Phone Formatter & Action Helpers
  const formatPhoneDisplay = (phoneStr) => {
    if (!phoneStr) return '+92 300 1234567';
    const digits = String(phoneStr).replace(/\D/g, '');
    if (digits.startsWith('92') && digits.length === 12) {
      return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 11 && digits.startsWith('0')) {
      return `+92 ${digits.slice(1, 4)} ${digits.slice(4)}`;
    }
    if (digits.length === 10) {
      return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return phoneStr;
  };

  const getCleanTel = (phoneStr) => {
    if (!phoneStr) return '+923001234567';
    const digits = String(phoneStr).replace(/\D/g, '');
    if (digits.startsWith('92')) return `+${digits}`;
    if (digits.startsWith('0')) return `+92${digits.slice(1)}`;
    if (digits.length === 10) return `+92${digits}`;
    return phoneStr;
  };

  const getWhatsAppLink = (cleanNumber, propTitle, propCode) => {
    const codeTag = propCode ? ` (${propCode})` : '';
    const msg = encodeURIComponent(`Hello Pakistan Property Care, I am inquiring about property${codeTag}: ${propTitle || 'this listing'}. Please provide more details.`);
    return `https://wa.me/${cleanNumber}?text=${msg}`;
  };

  const handleCopyPhone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_PHONE_DISPLAY);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans text-gray-800">
      <Navbar />

      <main className="flex-grow pb-16 pt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Image & Header */}
          <div className="lg:col-span-2">
            
            {/* Header: Title and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
                  {title}
                </h1>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {locationText}
                </p>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <button 
                  onClick={() => window.print()}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Print"
                >
                  <Printer size={17} />
                </button>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title, url: window.location.href }).catch(() => {});
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                  title="Share"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>

            {/* Media Container (Images & Video Walkthrough) */}
            <div className="w-full h-[400px] md:h-[500px] relative bg-black/90 rounded-2xl overflow-hidden mb-5 group shadow-sm flex items-center justify-center">
              {mediaItems.length > 0 ? (
                <>
                  {mediaItems[currentMediaIndex].type === 'video' ? (
                    <video
                      key={mediaItems[currentMediaIndex].url}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain bg-black"
                      poster={images[0] || undefined}
                    >
                      <source src={mediaItems[currentMediaIndex].url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={mediaItems[currentMediaIndex].url}
                      alt={property.formatted_id || title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                    />
                  )}
                  
                  {mediaItems.length > 1 && (
                    <>
                      <button 
                        type="button"
                        onClick={handlePrevMedia} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 z-20"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button 
                        type="button"
                        onClick={handleNextMedia} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 z-20"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}

                  {/* Overlays on Media */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5 z-10 pointer-events-none">
                    {mediaItems[currentMediaIndex].type === 'video' ? (
                      <div className="bg-red-600/95 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm shadow-md">
                        <Video size={14} className="animate-pulse" /> Video Walkthrough ({currentMediaIndex + 1}/{mediaItems.length})
                      </div>
                    ) : (
                      <div className="bg-black/65 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                        <ImageIcon size={14} /> {currentMediaIndex + 1} / {mediaItems.length}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                  <Home size={56} className="mb-2 opacity-40" />
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip (Images + Video at the end) */}
            {mediaItems.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-2xs ${
                      currentMediaIndex === idx
                        ? 'border-[#063B29] ring-2 ring-[#063B29]/30 scale-102'
                        : 'border-transparent opacity-65 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-[#1a2b25] flex flex-col items-center justify-center text-white relative">
                        {images[0] && (
                          <img
                            src={images[0]}
                            alt="Video thumbnail poster"
                            className="w-full h-full object-cover opacity-35"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play size={18} className="text-white fill-white" />
                        </div>
                        <span className="absolute bottom-1 text-[8px] font-bold uppercase tracking-wider text-white bg-red-600/90 px-1 py-0.2 rounded">
                          Video
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={`Gallery thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Property Details Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm p-6 space-y-6">
              
              {/* Dynamic Contact Number Banner - Positioned Above Price */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all duration-200">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-900 tracking-wider uppercase">
                      Contact Agent
                    </span>
                  </div>
                  
                  {/* WhatsApp Quick Action Button */}
                  <a
                    href={getWhatsAppLink(OFFICIAL_WHATSAPP_CLEAN, title, property?.formatted_id || property?.property_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-2xs transition-all hover:scale-105 cursor-pointer shrink-0"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={14} className="fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Direct Call / Phone Number */}
                <div className="flex items-center justify-between gap-2 bg-white/95 border border-emerald-100 rounded-xl p-2.5 shadow-2xs hover:border-emerald-300 transition-colors">
                  <a
                    href={`tel:${OFFICIAL_PHONE_TEL}`}
                    className="flex items-center gap-3 text-slate-900 hover:text-[#063B29] transition-colors group flex-1 min-w-0"
                    title="Click to Call"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#063B29] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Phone size={18} className="fill-current" />
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">
                        Contact Number
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-[#063B29]">
                        {OFFICIAL_PHONE_DISPLAY}
                      </span>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                    title="Copy phone number"
                  >
                    {copiedPhone ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Demand Price
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {priceDisplayInWords}
                </h2>
                {Number(property.current_price) >= 100000 && (
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    ({priceDisplayNumeric})
                  </p>
                )}
              </div>

              {/* 5 Feature Badges Row */}
              <div className="grid grid-cols-5 gap-1.5 text-center py-4 border-y border-gray-100">
                {/* Type */}
                <div className="flex flex-col items-center">
                  <div className="text-slate-800 mb-1">
                    <Home size={22} className="stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate w-full">
                    {property.property_type || '-'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Type</span>
                </div>

                {/* Bedrooms */}
                <div className="flex flex-col items-center">
                  <div className="text-slate-800 mb-1">
                    <Bed size={22} className="stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {property.rooms ?? '-'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Bedrooms</span>
                </div>

                {/* Bath(s) */}
                <div className="flex flex-col items-center">
                  <div className="text-slate-800 mb-1">
                    <Bath size={22} className="stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {property.bathrooms ?? '-'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Bath(s)</span>
                </div>

                {/* Area */}
                <div className="flex flex-col items-center">
                  <div className="text-slate-800 mb-1">
                    <MapPin size={22} className="stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate w-full">
                    {property.property_size ? `${Number(property.property_size)} ${property.size_uom || ''}` : '-'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Area</span>
                </div>

                {/* Purpose */}
                <div className="flex flex-col items-center">
                  <div className="text-slate-800 mb-1">
                    <Tag size={22} className="stroke-[1.75]" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate w-full">
                    {property.demand_type || 'Sale'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Purpose</span>
                </div>
              </div>

              {/* Property Details Section */}
              <div>
                <h3 className="text-base font-bold text-[#063B29] mb-3">
                  Property Details
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Type</span>
                    <span className="font-semibold text-gray-800">{property.property_type || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Price</span>
                    <span className="font-semibold text-gray-800">{priceDisplayInWords}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Location</span>
                    <span className="font-semibold text-gray-800">{property.society || property.city || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Area</span>
                    <span className="font-semibold text-gray-800">
                      {property.property_size ? `${Number(property.property_size)} ${property.size_uom || ''}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Bath(s)</span>
                    <span className="font-semibold text-gray-800">{property.bathrooms ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-50">
                    <span className="text-gray-500 font-normal">Bedrooms</span>
                    <span className="font-semibold text-gray-800">{property.rooms ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 font-normal">Purpose</span>
                    <span className="font-semibold text-gray-800">{property.demand_type || 'Sale'}</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="pt-2">
                <h3 className="text-base font-bold text-[#063B29] mb-2">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {property.property_description || `Villa in ${property.society || 'DHA Defence Phase 1'}`}
                </p>
              </div>

              {/* Create Request CTA */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCreateRequest}
                  className="w-full py-3.5 px-4 bg-[#063B29] hover:bg-[#04281c] text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group hover:scale-[1.01]"
                >
                  <FileText size={18} className="text-[#B8860B] transition-transform group-hover:scale-110" />
                  <span>Create Request</span>
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">
                  Submit an official request to inquire or purchase this property
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicPropertyDetails;
