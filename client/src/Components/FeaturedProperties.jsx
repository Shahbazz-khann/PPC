import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicProperties } from '../Services/property.service';
import { resolveMediaUrl } from '../Services/Api';
import { useTranslation } from 'react-i18next';

const FeaturedProperties = () => {
  const { t } = useTranslation(['public']);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getPublicProperties({ limit: 5 });
        if (res.success) {
          setProperties(res.data);
        }
      } catch (err) {
        console.error("Error fetching featured properties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
          {t('public:featuredPropertiesIslamabad')}
        </h2>
        <Link
          to="/properties"
          className="text-[#063B29] font-semibold text-xs md:text-sm flex items-center gap-1"
        >
          <span>{t('public:viewAllProperties')}</span>
          <span className="rtl:rotate-180">&rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 font-semibold">{t('public:loading')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {properties.map((property) => (
            <div
              key={property.property_id}
              className="bg-white border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Image Container with Badge */}
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <img
                    src={resolveMediaUrl(property.image_url) || '/placeholder-image.jpg'}
                    alt={property.formatted_id}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-[#063B29] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {property.demand_type === 'Sale' ? t('public:forSale') : t('public:forRent')}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-0.5 leading-snug">
                  {property.society}
                </h3>
                <p className="text-slate-800 font-semibold text-[11px] mb-2">
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
              <div className="text-[#063B29] font-bold text-xs md:text-sm mt-auto">
                <span>{property.currency_code} {Number(property.current_price).toLocaleString()}</span>
                {property.demand_type === 'Rent' && (
                  <span className="text-gray-500 font-normal text-[10px] md:text-[11px]">
                    {' '}
                    {t('public:perMonth')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProperties;
