import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getPublicProperties } from '../Services/property.service';
import { resolveMediaUrl } from '../Services/Api';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, Maximize, Home as HomeIcon, ChevronRight } from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const Properties = () => {
  const { t } = useTranslation(['public', 'properties']);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredProperties = properties.filter(prop => 
    (prop.property_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.society || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.formatted_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F3] font-sans">
      <Navbar />

      <main className="flex-grow pt-8 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-[#1a2b25] mb-2 tracking-tight">
              {t('public:propertySearchResults') || 'Properties'}
            </h1>
            <p className="text-gray-500 font-medium text-sm max-w-xl">
              Browse our complete catalog of available properties. Use the search and filters to find exactly what you are looking for.
            </p>
          </div>

          {/* Search and Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full flex-1">
              <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by property title, location, society, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full ps-11 pe-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-medium text-gray-800 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto shrink-0">
              <span className="text-sm font-semibold text-gray-500 hidden md:block">
                {!loading && `${filteredProperties.length} Properties found`}
              </span>
              <button className="flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 bg-white rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm w-full md:w-auto">
                <Filter size={16} /> Filters
              </button>
            </div>
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
                  className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 transition-all hover:shadow-md group cursor-pointer block"
                >
                  {/* Image Container */}
                  <div className="h-[240px] xl:w-[360px] shrink-0 relative rounded-[16px] overflow-hidden bg-[#FAF8F3] flex items-center justify-center">
                    <img
                      src={resolveMediaUrl(property.image_url) || '/placeholder-image.jpg'}
                      alt={property.formatted_id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 start-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm border border-white/50 bg-[#063B29] text-white uppercase tracking-wider">
                        {property.demand_type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
                      </span>
                    </div>
                  </div>

                  {/* Property Information Container */}
                  <div className="flex flex-col flex-1 py-1 xl:flex-row xl:justify-between">
                    {/* Middle Content */}
                    <div className="flex flex-col flex-1 pe-6">
                      <div className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                        <span>{property.property_type}</span>
                        <span className="w-1 h-1 rounded-full bg-[#B8860B]/50"></span>
                        <span>{property.demand_type}</span>
                      </div>

                      <h3 className="text-2xl font-serif font-bold text-[#1a2b25] mb-2">
                        {property.property_type} in {property.society}
                      </h3>

                      <div className="flex items-center gap-1.5 mb-4 text-sm font-medium text-gray-500">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{[property.society, property.city, property.province].filter(Boolean).join(', ')}</span>
                      </div>

                      {/* Horizontal Specs Row */}
                      <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-gray-600 mb-5 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Maximize size={16} className="text-gray-400" />
                          {Number(property.property_size)} {property.size_uom}
                        </div>
                        {property.rooms > 0 && (
                          <>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <div className="flex items-center gap-1.5">
                              <HomeIcon size={16} className="text-gray-400" />
                              {property.rooms} Beds
                            </div>
                          </>
                        )}
                        {property.bathrooms > 0 && (
                          <>
                            <div className="w-[1px] h-4 bg-gray-200"></div>
                            <div className="flex items-center gap-1.5">
                              <HomeIcon size={16} className="text-gray-400" />
                              {property.bathrooms} Baths
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-2xl">
                        {property.property_description || ''}
                      </p>
                    </div>

                    {/* Right Actions Area (Price) */}
                    <div className="flex flex-col justify-between items-end shrink-0 w-full xl:w-[200px] mt-6 xl:mt-0">
                      <div className="flex xl:flex-col gap-1 w-full text-end">
                        <span className="text-2xl font-bold text-[#1a2b25] whitespace-nowrap">
                          {property.currency_code} {Number(property.current_price).toLocaleString()}
                        </span>
                        {property.demand_type === 'Rent' && (
                          <span className="text-sm font-medium text-gray-500">
                            per month
                          </span>
                        )}
                      </div>
                      
                      <div className="w-full mt-auto pt-6">
                        <div className="w-full px-4 py-2.5 rounded-xl bg-[#1a2b25] text-[13px] font-bold text-white hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2">
                          View Details <ChevronRight size={14} />
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
