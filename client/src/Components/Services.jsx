import { Link } from 'react-router-dom';
import homeImg from '../assets/home.webp';
import rentHouseImg from '../assets/RentHouse1.jpg';
import propertyCareImg from '../assets/PropertyCare.webp';
import constructionImg from '../assets/Construction.jpg';
import legalServicesImg from '../assets/LegalServices.webp';
import investmentAdvisoryImg from '../assets/InvestmentAdvisory.webp';

const servicesData = [
  {
    id: 1,
    title: 'Buy & Sell Properties',
    description: 'Residential, Commercial, Industrial, Plots & Agricultural Properties.',
    image: homeImg,
  },
  {
    id: 2,
    title: 'Rental Management',
    description: 'Tenant search, verification, agreements, rent collection & renewals.',
    image: rentHouseImg,
  },
  {
    id: 3,
    title: 'Property Care',
    description: 'Inspections, Cleaning, Gardening, Security, Utilities & more.',
    image: propertyCareImg,
  },
  {
    id: 4,
    title: 'Renovation & Construction',
    description: 'Interior, Exterior, Painting, Plumbing, Electrical & Civil Works.',
    image: constructionImg,
  },
  {
    id: 5,
    title: 'Legal Services',
    description: 'Documentation, Registry, Verification, Taxation & Legal Dispute Support.',
    image: legalServicesImg,
  },
  {
    id: 6,
    title: 'Investment Advisory',
    description: 'ROI Estimation, Yield Analysis, Portfolio Management & more.',
    image: investmentAdvisoryImg,
  },
];

const Services = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
          OUR CORE SERVICES
        </h2>
        <Link
          to="/services"
          className="text-[#063B29] font-semibold text-xs md:text-sm flex items-center gap-1"
        >
          <span>View All Services</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {servicesData.map((service) => (
          <div
            key={service.id}
            className="bg-white border border-gray-200/80 rounded-xl p-3.5 flex flex-col justify-between h-full shadow-sm"
          >
            <div>
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-28 object-cover rounded-lg mb-3"
              />
              <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-1.5 leading-snug">
                {service.title}
              </h3>
              <p className="text-gray-500 text-[11px] leading-relaxed mb-4">
                {service.description}
              </p>
            </div>
            <Link
              to="/services"
              className="text-[#063B29] font-bold text-[11px] tracking-wider uppercase flex items-center gap-1 mt-auto"
            >
              <span>EXPLORE</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
