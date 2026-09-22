import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AISection = () => {
  const { t } = useTranslation(['public']);
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
      <div className="bg-[#053223] text-white rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 border border-[#084230]">
        
        {/* Left Side Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:max-w-[45%]">
          {/* Gold Shield House Icon */}
          <div className="shrink-0">
            <svg
              className="w-16 h-16 md:w-20 md:h-20 text-[#D8A238]"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Shield */}
              <path d="M50 8 L85 22 V50 C85 72 50 92 50 92 C50 92 15 72 15 50 V22 L50 8 Z" />
              {/* House Roof inside Shield */}
              <path d="M35 48 L50 34 L65 48" strokeWidth="4.5" />
              {/* House Body & Chimney/Door */}
              <path d="M40 48 V64 H60 V48" strokeWidth="4" />
              <path d="M47 56 H53 V64 H47 Z" fill="currentColor" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5 leading-snug">
              {t('public:aiPlatform')}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-200 mb-1.5">
              {t('public:aiPlatformDesc1')}
            </p>
            <p className="text-gray-300 text-[11px] md:text-xs leading-relaxed mb-0">
              {t('public:aiPlatformDesc2')}
            </p>
          </div>
        </div>

        {/* Right Side Login Panel */}
        <div className="w-full lg:max-w-[50%] mt-8 lg:mt-0 flex-1">
          <div className="bg-[#032318]/60 border border-[#0C4E37] rounded-xl p-6 md:p-8 flex flex-col h-full shadow-sm">
            <div className="mb-4 text-[#D8A238]">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">
              {t('public:aiLogin')}
            </h3>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-6 lg:mb-8">
              {t('public:aiLoginDesc')}
            </p>
            <div className="mt-auto flex justify-end">
              <Link to="/login" className="bg-gradient-to-r from-[#C69214] to-[#D8A238] text-white font-bold text-[11px] tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-md transition-transform hover:scale-105">
                {t('public:learnMore')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
