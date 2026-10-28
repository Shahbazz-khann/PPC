import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getPublicProperties } from '../Services/property.service';
import { resolveMediaUrl } from '../Services/Api';
import { useTranslation } from 'react-i18next';
import { MapPin, Maximize, Home as HomeIcon, ChevronRight } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import PropertySearch from '../Components/PropertySearch';

const Properties = () => {
  const { t } = useTranslation(['public', 'properties']);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams(location.search);
        const filters = {};
        for (const [key, value] of queryParams.entries()) {
          filters[key] = value;
        }

        const res = await getPublicProperties(filters);
        if (res.success) {
          setProperties(res.data);
        } else {
          setError(res.message || 'Failed to fetch properties.');
        }
      } catch (err) {
        console.error("Error fetching properties", err);
        setError('An error occurred while fetching properties.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [location.search]);

  const handleFilterSearch = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    navigate(`/properties?${params.toString()}`);
  };

  const handleFilterReset = () => {
    navigate('/properties');
  };

  const filteredProperties = properties;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans">
      <Navbar />

      <main className="flex-grow pt-8 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          
          {/* Page Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1a2b25] mb-2 tracking-tight">
                {t('public:propertySearchResults') || 'Properties'}
              </h1>
              <p className="text-gray-500 font-medium text-sm max-w-xl">
                Browse our complete catalog of available properties. Use the search and filters to find exactly what you are looking for.
              </p>
            </div>
            {!loading && (
              <span className="text-sm font-bold text-gray-500 shrink-0">
                {filteredProperties.length} Properties found
              </span>
            )}
          </div>

          {/* Advanced Search & Filter Card */}
          <div className="mb-8">
            <PropertySearch
              heroOverlap={false}
              defaultAdvancedOpen={false}
              onSearch={handleFilterSearch}
              onReset={handleFilterReset}
            />
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b25] mb-4"></div>
                <p className="text-sm font-medium text-gray-500">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-red-500 mb-4">{error}</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-gray-200 shadow-sm">
                <HomeIcon size={64} className="text-gray-200 mb-6" />
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">No Properties Found</h3>
                <p className="text-sm font-medium text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <Link
                  key={property.property_id}
                  to={`/properties/${property.property_id}`}
                  state={{ property }}
                  className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-xs border border-gray-100 flex flex-col md:flex-row gap-5 lg:gap-6 transition-all duration-200 hover:shadow-md hover:border-gray-200 group cursor-pointer block"
                >
                  {/* Image Container */}
                  <div className="w-full md:w-64 lg:w-72 xl:w-80 h-52 sm:h-60 md:h-auto md:min-h-[220px] shrink-0 relative rounded-xl lg:rounded-2xl overflow-hidden bg-[#FAF8F3] flex items-center justify-center">
                    <img
                      src={resolveMediaUrl(property.image_url) || '/placeholder-image.jpg'}
                      alt={property.formatted_id || property.property_type}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 start-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider shadow-xs bg-[#063B29] text-white uppercase">
                        {property.demand_type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
                      </span>
                    </div>
                  </div>

                  {/* Information & Action Content */}
                  <div className="flex flex-col flex-1 justify-between min-w-0">
                    <div>
                      {/* Top Row: Type/Demand & Price (Price on mobile) */}
                      <div className="flex flex-row items-center justify-between gap-2 mb-2">
                        <div className="text-[11px] font-bold text-[#B8860B] uppercase tracking-wider flex items-center gap-2">
                          <span>{property.property_type}</span>
                          <span className="w-1 h-1 rounded-full bg-[#B8860B]/60"></span>
                          <span>{property.demand_type}</span>
                        </div>
                        {/* Price visible on mobile */}
                        <div className="md:hidden">
                          <span className="text-lg font-bold text-[#1a2b25]">
                            {property.currency_code} {Number(property.current_price).toLocaleString()}
                          </span>
                          {property.demand_type === 'Rent' && (
                            <span className="text-xs text-gray-500 ms-1 font-medium">/mo</span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#1a2b25] mb-1.5 leading-snug line-clamp-1 group-hover:text-[#063B29] transition-colors">
                        {property.property_type} in {property.society || property.city || 'Prime Area'}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs sm:text-sm font-medium text-gray-500">
                        <MapPin size={15} className="text-[#063B29] shrink-0" />
                        <span className="truncate">
                          {[property.society, property.city, property.province].filter(Boolean).join(', ')}
                        </span>
                      </div>

                      {/* Horizontal Specs Row */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-[13px] font-semibold text-gray-700 mb-3 py-2 border-y border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Maximize size={15} className="text-gray-400" />
                          <span>{Number(property.property_size)} {property.size_uom}</span>
                        </div>
                        {property.rooms > 0 && (
                          <>
                            <div className="w-[1px] h-3.5 bg-gray-200"></div>
                            <div className="flex items-center gap-1.5">
                              <HomeIcon size={15} className="text-gray-400" />
                              <span>{property.rooms} Beds</span>
                            </div>
                          </>
                        )}
                        {property.bathrooms > 0 && (
                          <>
                            <div className="w-[1px] h-3.5 bg-gray-200"></div>
                            <div className="flex items-center gap-1.5">
                              <HomeIcon size={15} className="text-gray-400" />
                              <span>{property.bathrooms} Baths</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Description snippet */}
                      {property.property_description && (
                        <p className="text-xs sm:text-[13px] text-gray-500 font-normal leading-relaxed line-clamp-2 mb-4">
                          {property.property_description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Row (Price & Button) */}
                    <div className="flex items-center justify-between gap-4 pt-3 mt-auto border-t border-gray-100 md:border-0 md:pt-0">
                      {/* Price on Desktop */}
                      <div className="hidden md:block">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl lg:text-2xl font-bold text-[#1a2b25] tracking-tight">
                            {property.currency_code} {Number(property.current_price).toLocaleString()}
                          </span>
                          {property.demand_type === 'Rent' && (
                            <span className="text-xs text-gray-500 font-medium">
                              /month
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="w-full md:w-auto ms-auto">
                        <div className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#063B29] text-xs sm:text-sm font-bold text-white group-hover:bg-[#052b1e] transition-all shadow-xs group-hover:shadow-sm">
                          <span>View Details</span>
                          <ChevronRight size={14} className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Properties;
