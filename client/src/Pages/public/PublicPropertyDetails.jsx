import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Image as ImageIcon, MapPin, Maximize, Home, Tag, User, Printer, Share2, Phone, MessageCircle, Heart, Map, Mail } from 'lucide-react';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import { resolveMediaUrl } from '../../Services/Api';

const PublicPropertyDetails = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(['public']);

  const property = location.state?.property;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a2b25] mb-4">
            {t('public:propertyUnavailable')}
          </h2>
          <button
            onClick={() => navigate('/properties')}
            className="px-6 py-3 bg-[#063B29] text-white rounded-lg font-bold hover:bg-[#04281c] transition-colors"
          >
            {t('public:backToProperties')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.image_url ? [resolveMediaUrl(property.image_url)] : [];

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

  const title = `${Number(property.property_size)}${property.size_uom} ${property.property_type} For ${property.demand_type}`;
  const locationText = property.society; // Would be full location if available
  const priceDisplay = `${property.currency_code} ${Number(property.current_price).toLocaleString()}`;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-800">
      <Navbar />

      <main className="flex-grow pb-16 pt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2">
            
            {/* Header: Title and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
                <p className="text-sm text-gray-500">{locationText}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <button className="hover:text-gray-900 transition-colors">
                  <Printer size={18} />
                </button>
                <button className="hover:text-gray-900 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="w-full h-[400px] md:h-[500px] relative bg-gray-100 flex items-center justify-center overflow-hidden mb-6 group">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={property.formatted_id}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={20} />
                      </button>
                      <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Overlays on Image */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 backdrop-blur-sm">
                      <ImageIcon size={14} /> {images.length}
                    </div>
                    <div className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 backdrop-blur-sm cursor-pointer hover:bg-black/80">
                      <Map size={14} /> Map
                    </div>
                  </div>
                  <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 backdrop-blur-sm transition-colors">
                     <Heart size={18} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Home size={48} className="mb-2 opacity-50" />
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-8 mb-8 pb-6 border-b border-gray-200">
               {property.rooms && (
                 <div className="flex flex-col gap-1 text-center">
                    <div className="flex items-center justify-center text-gray-600 mb-1"><Home size={22} /></div>
                    <span className="text-sm font-semibold">{property.rooms} Beds</span>
                 </div>
               )}
               {property.bathrooms && (
                 <div className="flex flex-col gap-1 text-center">
                    <div className="flex items-center justify-center text-gray-600 mb-1"><div className="w-5 h-5 border-2 border-gray-600 rounded-sm"></div></div>
                    <span className="text-sm font-semibold">{property.bathrooms} Baths</span>
                 </div>
               )}
               <div className="flex flex-col gap-1 text-center">
                  <div className="flex items-center justify-center text-gray-600 mb-1"><Maximize size={22} /></div>
                  <span className="text-sm font-semibold">{Number(property.property_size).toLocaleString()} {property.size_uom}</span>
               </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-[#1a1a1a] text-white flex items-center rounded-t overflow-x-auto whitespace-nowrap hide-scrollbar">
               <button className="px-6 py-4 text-sm font-medium bg-white text-[#1a1a1a] rounded-t-lg">Overview</button>
               <button className="px-6 py-4 text-sm font-medium hover:text-gray-300">Location & Nearby</button>
               <button className="px-6 py-4 text-sm font-medium hover:text-gray-300">Home Finance</button>
               <button className="px-6 py-4 text-sm font-medium hover:text-gray-300">Price Index</button>
               <button className="px-6 py-4 text-sm font-medium hover:text-gray-300">Trends</button>
            </div>

            {/* Overview Content (Placeholder based on design) */}
            <div className="py-8">
               <h2 className="text-xl font-bold mb-4">Details</h2>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 mb-8 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Type</span><span className="font-semibold">{property.property_type}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Price</span><span className="font-semibold">{priceDisplay}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Location</span><span className="font-semibold">{property.society}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bath(s)</span><span className="font-semibold">{property.bathrooms || '-'}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bedroom(s)</span><span className="font-semibold">{property.rooms || '-'}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Area</span><span className="font-semibold">{Number(property.property_size)} {property.size_uom}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Purpose</span><span className="font-semibold">{property.demand_type}</span></div>
               </div>

               {property.property_description && (
                 <>
                   <h2 className="text-xl font-bold mb-4">Description</h2>
                   <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                     {property.property_description}
                   </p>
                 </>
               )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sidebar Form & Owner Profile */}
          <div className="lg:col-span-1">
             <div className="space-y-6 sticky top-24">
               {/* Contact Form Card */}
               <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{priceDisplay}</h2>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     {/* TODO: Add official PPC numbers */}
                     <button 
                       disabled
                       className="flex items-center justify-center gap-2 py-2.5 border-2 border-[#25d366] text-[#25d366] rounded-lg font-bold text-sm hover:bg-[#25d366]/5 transition-colors cursor-not-allowed opacity-70"
                     >
                       <MessageCircle size={18} /> WhatsApp
                     </button>
                     <button 
                       disabled
                       className="flex items-center justify-center gap-2 py-2.5 bg-[#42b72a] text-white rounded-lg font-bold text-sm hover:bg-[#36a420] transition-colors cursor-not-allowed opacity-70"
                     >
                       <Phone size={18} /> Call
                     </button>
                  </div>

                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                     <div className="w-full bg-[#f8f9fa] border border-gray-200 rounded-md px-3 py-1.5 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                       <label className="block text-[10px] text-gray-500 mb-0.5">NAME*</label>
                       <input 
                         type="text" 
                         className="w-full bg-transparent text-sm focus:outline-none text-gray-800"
                       />
                     </div>
                     
                     <div className="w-full bg-[#f8f9fa] border border-gray-200 rounded-md px-3 py-1.5 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                       <label className="block text-[10px] text-gray-500 mb-0.5">EMAIL*</label>
                       <input 
                         type="email" 
                         className="w-full bg-transparent text-sm focus:outline-none text-gray-800"
                       />
                     </div>
                     
                     <div className="w-full bg-[#f8f9fa] border border-gray-200 rounded-md px-3 py-1.5 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                       <label className="block text-[10px] text-gray-500 mb-0.5">PHONE*</label>
                       <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-800 flex items-center gap-1 shrink-0">
                            <img src="https://flagcdn.com/w20/pk.png" alt="PK" className="w-4" /> +92
                         </span>
                         <input 
                           type="tel" 
                           className="w-full bg-transparent text-sm focus:outline-none text-gray-800"
                         />
                       </div>
                     </div>
                     
                     <div className="w-full bg-[#f8f9fa] border border-gray-200 rounded-md px-3 py-1.5 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                       <label className="block text-[10px] text-gray-500 mb-0.5">MESSAGE*</label>
                       <textarea 
                         rows="3"
                         defaultValue={`I would like to inquire about your property. Please contact me at your earliest convenience.`}
                         className="w-full bg-transparent text-sm focus:outline-none text-gray-800 resize-none"
                       ></textarea>
                     </div>

                     <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 mb-2">
                        <span className="font-medium mr-1">I am a:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" name="userType" defaultChecked className="accent-[#42b72a]" /> Buyer/Tenant
                        </label>
                     </div>

                     <label className="flex items-start gap-2 cursor-pointer mb-6 group">
                       <input type="checkbox" defaultChecked className="mt-1 accent-[#1877f2] rounded" />
                       <span className="text-xs text-gray-700 group-hover:text-gray-900 leading-snug">Keep me informed about similar properties.</span>
                     </label>

                     <button 
                       type="submit"
                       className="w-full py-3.5 border-2 border-[#42b72a] text-[#42b72a] font-bold text-sm tracking-wide rounded-md hover:bg-[#42b72a]/5 transition-colors uppercase flex items-center justify-center gap-2"
                     >
                       <Mail size={16} /> SEND EMAIL
                     </button>
                  </form>
               </div>

               {/* Owner Profile Panel */}
               <div className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6 text-center flex flex-col items-center">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 w-full text-start border-b border-gray-100 pb-3">
                    {t('public:propertyOwner')}
                  </h3>
                  <div className="w-20 h-20 bg-[#FAF8F3] rounded-full flex items-center justify-center border-2 border-gray-100 mb-4 text-gray-300">
                    <User size={32} />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 px-4">
                    {t('public:ownerInfoAvailableHere')}
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
