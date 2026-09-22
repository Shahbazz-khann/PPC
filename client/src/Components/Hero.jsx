
import Navbar from './Navbar';
// import faisalMosqueImg from '../assets/FaisalMosque.png';
import faisalMosqueImg from '../assets/fsq.png';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation(['public']);
  return (
    <section className="relative w-full h-[560px] md:h-[600px] bg-cover bg-center overflow-hidden flex flex-col justify-between">
      {/* Background Image */}
      <img
        src={faisalMosqueImg}
        alt="Faisal Mosque Hero Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Navbar */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 w-full pt-6 pb-40 flex-1 flex flex-col justify-center items-start text-left">
        {/* Trust Badge */}
        <div className=" bg-[#063B29] backdrop-blur-[1px] px-4 py-1 rounded-md mb-2 inline-block">
          <span className="text-white text-xs md:text-sm font-semibold tracking-wider uppercase">
            {t('public:pakistansMostTrusted')}
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight break-words">
          {t('public:completePropertySolution')} <br className="hidden sm:block" />
          {t('public:under')} <span className="text-[#D8A238]">{t('public:oneRoof')}</span>
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-sm sm:text-base md:text-2xl font-normal mb-2 max-w-2xl leading-relaxed break-words">
          {t('public:buySellRent')} <br className="hidden sm:block" />
          {t('public:weCareForYourProperty')}
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => document.getElementById('our-core-services')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="bg-[#063B29] text-white text-xs md:text-sm font-bold tracking-wider uppercase px-6 py-3.5 rounded-md transition-transform hover:scale-105"
          >
            {t('public:ourServices')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
