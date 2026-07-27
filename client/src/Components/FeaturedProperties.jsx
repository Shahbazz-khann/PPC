import homeImg from '../assets/home.webp';
import rentHouseImg from '../assets/RentHouse1.jpg';
import propertyCareImg from '../assets/PropertyCare.webp';
import investmentAdvisoryImg from '../assets/InvestmentAdvisory.webp';
import constructionImg from '../assets/Construction.jpg';

const propertiesData = [
  {
    id: 1,
    status: 'FOR SALE',
    image: homeImg,
    title: 'DHA Phase 2',
    subtitle: '1 Kanal House',
    details: '5 Bed • 6 Bath • 1 Kanal',
    price: 'PKR 8.75 Crore',
  },
  {
    id: 2,
    status: 'FOR RENT',
    image: rentHouseImg,
    title: 'F-11/2',
    subtitle: 'Brand New House',
    details: '4 Bed • 5 Bath • 10 Marla',
    price: 'PKR 450,000',
    period: '/ Month',
  },
  {
    id: 3,
    status: 'FOR SALE',
    image: propertyCareImg,
    title: 'Bahria Enclave',
    subtitle: '10 Marla House',
    details: '4 Bed • 5 Bath • 10 Marla',
    price: 'PKR 3.25 Crore',
  },
  {
    id: 4,
    status: 'FOR RENT',
    image: investmentAdvisoryImg,
    title: 'Blue Area',
    subtitle: 'Luxury Apartment',
    details: '3 Bed • 4 Bath • 2200 Sqft',
    price: 'PKR 280,000',
    period: '/ Month',
  },
  {
    id: 5,
    status: 'FOR SALE',
    image: constructionImg,
    title: 'Gulberg Greens',
    subtitle: 'Residential Plot',
    details: '1 Kanal',
    price: 'PKR 3.10 Crore',
  },
];

const FeaturedProperties = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
          FEATURED PROPERTIES IN ISLAMABAD
        </h2>
        <a
          href="/properties"
          className="text-[#063B29] font-semibold text-xs md:text-sm flex items-center gap-1"
        >
          <span>View All Properties</span>
          <span>&rarr;</span>
        </a>
      </div>

      {/* Grid of 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {propertiesData.map((property) => (
          <div
            key={property.id}
            className="bg-white border border-gray-200/80 rounded-xl p-3 flex flex-col justify-between shadow-sm"
          >
            <div>
              {/* Image Container with Badge */}
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <span className="absolute top-2 left-2 bg-[#063B29] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {property.status}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-0.5 leading-snug">
                {property.title}
              </h3>
              <p className="text-slate-800 font-semibold text-[11px] mb-2">
                {property.subtitle}
              </p>

              {/* Details */}
              <p className="text-gray-500 text-[10px] md:text-[11px] mb-3">
                {property.details}
              </p>
            </div>

            {/* Price */}
            <div className="text-[#063B29] font-bold text-xs md:text-sm mt-auto">
              <span>{property.price}</span>
              {property.period && (
                <span className="text-gray-500 font-normal text-[10px] md:text-[11px]">
                  {' '}
                  {property.period}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProperties;
