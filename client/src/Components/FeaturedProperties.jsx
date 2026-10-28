import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Home as HomeIcon } from 'lucide-react';
import { getPublicProperties } from '../Services/property.service';
import { resolveMediaUrl } from '../Services/Api';
import { useTranslation } from 'react-i18next';

const FeaturedProperties = ({ filters, onResetFilters }) => {
  const { t } = useTranslation(['public']);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  // Fetch properties whenever filters change
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const queryParams = filters ? { ...filters, limit: 20 } : { limit: 20 };
        const res = await getPublicProperties(queryParams);
        if (isMounted && res.success) {
          setProperties(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching featured properties", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProperties();
    return () => { isMounted = false; };
  }, [filters]);

  const scrollSlider = (direction) => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    const scrollStep = 330;
    const isRtl = document.documentElement.dir === 'rtl';

    let effDirection = direction;
    if (isRtl) {
      effDirection = direction === 'left' ? 'right' : 'left';
    }

    if (effDirection === 'left') {
      if (scrollLeft <= 15) {
        sliderRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      }
    } else {
      if (scrollLeft >= scrollWidth - clientWidth - 15) {
        sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }
  };

  const isFiltered = Boolean(filters && Object.keys(filters).length > 0);

  return (
    <section id="featured-properties-section" className="max-w-7xl mx-auto px-6 md:px-12 mb-16 scroll-mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
            {isFiltered
              ? (filters.city ? `Properties in ${filters.city}` : t('public:searchResults') || 'Search Results')
              : t('public:featuredPropertiesIslamabad')}
          </h2>
          {isFiltered && (
            <p className="text-gray-500 text-xs sm:text-sm font-medium mt-0.5">
              {loading
                ? t('public:searchingProperties') || 'Searching properties...'
                : `${properties.length} ${t('public:propertiesFound') || 'properties found'}`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-red-600 bg-white border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('public:resetFilters') || 'Reset Filter'}</span>
            </button>
          )}

          <Link
            to="/properties"
            className="text-[#063B29] font-semibold text-xs md:text-sm flex items-center gap-1 hover:underline"
          >
            <span>{t('public:viewAllProperties')}</span>
            <span className="rtl:rotate-180">&rarr;</span>
          </Link>
        </div>
      </div>

      {/* Content: Loading / Empty / Slider */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#063B29] mb-3"></div>
          <p className="text-gray-500 font-medium text-xs sm:text-sm">
            {t('public:loadingProperties') || 'Loading properties...'}
          </p>
        </div>
      ) : properties.length === 0 ? (
        <div className="py-14 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 text-gray-400">
            <HomeIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
            {t('public:noPropertiesFound') || 'No Properties Found'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-4 font-normal">
            {t('public:tryAdjustingSearchFilters') || 'Try adjusting your search criteria, price, or size range.'}
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="bg-[#063B29] hover:bg-[#052b1e] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {t('public:resetFilters') || 'Show All Properties'}
            </button>
          )}
        </div>
      ) : (
        /* Slider Track with Left & Right Floating Navigation Buttons */
        <div className="relative group/slider">
          {/* Left Side Floating Slider Button */}
          <button
            type="button"
            onClick={() => scrollSlider('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 text-[#063B29] shadow-xl flex items-center justify-center hover:bg-[#063B29] hover:text-white hover:border-[#063B29] transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Previous properties"
          >
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </button>

          {/* Right Side Floating Slider Button */}
          <button
            type="button"
            onClick={() => scrollSlider('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 text-[#063B29] shadow-xl flex items-center justify-center hover:bg-[#063B29] hover:text-white hover:border-[#063B29] transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Next properties"
          >
            <ChevronRight className="w-6 h-6 rtl:rotate-180" />
          </button>

          {/* Slider Cards Track */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-3 px-1 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {properties.map((property) => (
              <Link
                key={property.property_id}
                to={`/properties/${property.property_id}`}
                state={{ property }}
                className="w-[270px] sm:w-[290px] md:w-[310px] shrink-0 snap-start bg-white border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#063B29]/30 transition-all duration-200 cursor-pointer group/card"
              >
                <div>
                  {/* Image Container with Badge */}
                  <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100 h-36">
                    <img
                      src={resolveMediaUrl(property.image_url) || '/placeholder-image.jpg'}
                      alt={property.formatted_id}
                      className="w-full h-full object-cover rounded-lg group-hover/card:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-[#063B29] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                      {property.demand_type === 'Sale' ? t('public:forSale') : t('public:forRent')}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-0.5 leading-snug line-clamp-1">
                    {property.society}{property.city ? `, ${property.city}` : ''}
                  </h3>
                  <p className="text-slate-800 font-semibold text-[11px] mb-2 line-clamp-1">
                    {Number(property.property_size)} {property.size_uom} {property.property_type}
                  </p>

                  {/* Details */}
                  <p className="text-gray-500 text-[10px] md:text-[11px] mb-3">
                    {property.rooms ? property.rooms + ` ${t('public:bed')} • ` : ''}
                    {property.bathrooms ? property.bathrooms + ` ${t('public:bath')} • ` : ''}
                    {Number(property.property_size)} {property.size_uom}
                  </p>
                </div>

                {/* Price */}
                <div className="text-[#063B29] font-bold text-xs md:text-sm mt-auto pt-2 border-t border-gray-100 flex items-baseline justify-between">
                  <span>
                    {property.currency_code} {Number(property.current_price).toLocaleString()}
                    {property.demand_type === 'Rent' && (
                      <span className="text-gray-500 font-normal text-[10px] md:text-[11px]">
                        {' '}
                        {t('public:perMonth')}
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-[#B8860B] group-hover/card:underline">
                    View &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedProperties;
