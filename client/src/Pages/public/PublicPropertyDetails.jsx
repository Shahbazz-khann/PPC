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
  Check
} from 'lucide-react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { resolveMediaUrl } from '../../Services/Api';
import { getPublicPropertyById } from '../../Services/property.service';

const PublicPropertyDetails = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['public']);

  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!location.state?.property);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const handleNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  const handlePrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const title = `${Number(property.property_size || 0)}${property.size_uom || ''} ${property.property_type || ''} For ${property.demand_type || ''}`;
  const locationText = property.society || property.city || 'Location';
  const priceDisplay = `${property.currency_code || 'PKR'} ${Number(property.current_price || 0).toLocaleString()}`;

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

  const getWhatsAppLink = (phoneStr, propTitle) => {
    const cleanNumber = getCleanTel(phoneStr).replace('+', '');
    const msg = encodeURIComponent(`Hello, I am inquiring about: ${propTitle || 'this property'}. Please provide more details.`);
    return `https://wa.me/${cleanNumber}?text=${msg}`;
  };

  const handleCopyPhone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = formatPhoneDisplay(property?.contact_phone);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F3]/50 font-sans text-gray-800">
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

            {/* Image Container */}
            <div className="w-full h-[400px] md:h-[500px] relative bg-gray-100 rounded-2xl overflow-hidden mb-5 group shadow-sm">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={property.formatted_id || title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        type="button"
                        onClick={handlePrevImage} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button 
                        type="button"
                        onClick={handleNextImage} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}

                  {/* Overlays on Image */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
                    <div className="bg-black/65 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                      <ImageIcon size={14} /> {images.length}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 h-full">
                  <Home size={56} className="mb-2 opacity-40" />
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer shadow-2xs ${
                      currentImageIndex === idx
                        ? 'border-[#063B29] ring-2 ring-[#063B29]/30 scale-102'
                        : 'border-transparent opacity-65 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Gallery thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
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
                    href={getWhatsAppLink(property.contact_phone, title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-2xs transition-all hover:scale-105 cursor-pointer shrink-0"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={14} className="fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 bg-white/95 border border-emerald-100 rounded-xl p-2.5 shadow-2xs">
                  <a
                    href={`tel:${getCleanTel(property.contact_phone)}`}
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
                        {formatPhoneDisplay(property.contact_phone)}
                      </span>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                    title="Copy phone number"
                  >
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                  Demand Price
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {priceDisplay}
                </h2>
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
                    <span className="font-semibold text-gray-800">{priceDisplay}</span>
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

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicPropertyDetails;
