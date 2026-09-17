import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPublicProperties } from '../Services/property.service';
import { resolveMediaUrl } from '../Services/Api';

const Properties = () => {
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

        // We don't force limit=5 here, let backend use default limit (50)
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#063B29] font-bold text-2xl md:text-3xl tracking-tight uppercase mb-2">
            Property Search Results
          </h1>
          <p className="text-gray-500 font-medium">
            {!loading && !error && (
              <span>Found {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} matching your criteria</span>
            )}
            {loading && <span>Searching properties...</span>}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-semibold text-lg">Loading properties...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-semibold bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-slate-800 font-bold text-lg mb-2">No properties found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {properties.map((property) => (
              <div
                key={property.property_id}
                className="bg-white border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-sm transition-transform hover:shadow-md hover:-translate-y-1 duration-300"
              >
                <div>
                  {/* Image Container with Badge */}
                  <div className="relative overflow-hidden rounded-lg mb-3">
                    <img
                      src={resolveMediaUrl(property.image_url) || '/placeholder-image.jpg'}
                      alt={property.formatted_id}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <span className="absolute top-2 left-2 bg-[#063B29] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {property.demand_type === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-0.5 leading-snug">
                    {property.society}
                    {property.city && `, ${property.city}`}
                  </h3>
                  <p className="text-slate-800 font-semibold text-[11px] mb-2">
                    {Number(property.property_size)} {property.size_uom} {property.property_type}
                  </p>

                  {/* Details */}
                  <p className="text-gray-500 text-[10px] md:text-[11px] mb-3">
                    {property.rooms ? property.rooms + ' Bed • ' : ''}
                    {property.bathrooms ? property.bathrooms + ' Bath • ' : ''}
                    {Number(property.property_size)} {property.size_uom}
                  </p>
                </div>

                {/* Price */}
                <div className="text-[#063B29] font-bold text-sm md:text-base mt-auto">
                  <span>{property.currency_code} {Number(property.current_price).toLocaleString()}</span>
                  {property.demand_type === 'Rent' && (
                    <span className="text-gray-500 font-normal text-[10px] md:text-[11px]">
                      {' '}
                      / Month
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
