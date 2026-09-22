import { ShieldCheck, UserCheck, Lock, Sparkles, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getFeaturesData = (t) => [
  {
    id: 1,
    title: t('public:verifiedProperties'),
    description: t('public:verifiedPropertiesDesc'),
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: t('public:expertSupport'),
    description: t('public:expertSupportDesc'),
    icon: UserCheck,
  },
  {
    id: 3,
    title: t('public:secureTransactions'),
    description: t('public:secureTransactionsDesc'),
    icon: Lock,
  },
  {
    id: 4,
    title: t('public:aiPropertyAssistant'),
    description: t('public:aiPropertyAssistantDesc'),
    icon: Sparkles,
  },
  {
    id: 5,
    title: t('public:careMaintenance'),
    description: t('public:careMaintenanceDesc'),
    icon: Clock,
  },
];

const Categories = () => {
  const { t } = useTranslation(['public']);
  const featuresData = getFeaturesData(t);
  
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase">
          {t('public:specialFeatures')}
        </h2>
      </div>

      <div className="bg-[#FAFBF9] border border-gray-200/70 rounded-2xl py-8 px-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-200/80">
          {featuresData.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center px-4 py-4 lg:py-1"
              >
                {/* Circular Icon Container */}
                <div className="w-14 h-14 rounded-full bg-[#E5EBE6] flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-[#063B29] stroke-[1.8]" />
                </div>

                {/* Feature Title */}
                <h3 className="text-slate-900 font-bold text-xs md:text-sm mb-1.5 leading-snug">
                  {feature.title}
                </h3>

                {/* Short Description */}
                <p className="text-gray-500 text-[11px] md:text-xs leading-relaxed max-w-[190px]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
