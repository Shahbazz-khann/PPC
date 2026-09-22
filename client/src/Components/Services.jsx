import { Link } from 'react-router-dom';
import homeImg from '../assets/home.webp';
import rentHouseImg from '../assets/RentHouse1.jpg';
import propertyCareImg from '../assets/PropertyCare.webp';
import constructionImg from '../assets/Construction.jpg';
import legalServicesImg from '../assets/LegalServices.webp';
import investmentAdvisoryImg from '../assets/InvestmentAdvisory.webp';
import { useTranslation } from 'react-i18next';

const getServicesData = (t) => [
  {
    id: 1,
    title: t('public:buySellProperties'),
    description: t('public:buySellPropertiesDesc'),
    image: homeImg,
  },
  {
    id: 2,
    title: t('public:rentalManagement'),
    description: t('public:rentalManagementDesc'),
    image: rentHouseImg,
  },
  {
    id: 3,
    title: t('public:propertyCare'),
    description: t('public:propertyCareDesc'),
    image: propertyCareImg,
  },
  {
    id: 4,
    title: t('public:renovationConstruction'),
    description: t('public:renovationConstructionDesc'),
    image: constructionImg,
  },
  {
    id: 5,
    title: t('public:legalDocumentation'),
    description: t('public:legalDocumentationDesc'),
    image: legalServicesImg,
  },
  {
    id: 6,
    title: t('public:investmentAdvisory'),
    description: t('public:investmentAdvisoryDesc'),
    image: investmentAdvisoryImg,
  },
];

const Services = () => {
  const { t } = useTranslation(['public']);
  const servicesData = getServicesData(t);
  
  return (
    <section id="our-core-services" className="max-w-7xl mx-auto px-6 md:px-12 mb-16 scroll-mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
          {t('public:ourCoreServices')}
        </h2>
        <Link
          to="/services"
          className="text-[#063B29] font-semibold text-xs md:text-sm flex items-center gap-1"
        >
          <span>{t('public:viewAllServices')}</span>
          <span className="rtl:rotate-180">&rarr;</span>
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
              <span>{t('public:explore')}</span>
              <span className="rtl:rotate-180">&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
