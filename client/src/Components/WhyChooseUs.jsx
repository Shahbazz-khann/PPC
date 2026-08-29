import React from 'react';
import {
  LayoutGrid,
  UserCheck,
  Cpu,
  Award,
} from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'One Platform – All Services',
    description: 'Everything you need for your property in one place.',
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: 'Professional & Verified Team',
    description: 'Experienced experts, verified for your peace of mind.',
    icon: UserCheck,
  },
  {
    id: 3,
    title: 'Technology Driven',
    description: 'AI tools, digital reports & real-time tracking.',
    icon: Cpu,
  },
  {
    id: 4,
    title: 'Customer First Approach',
    description: 'Your satisfaction is our top priority.',
    icon: Award,
  },
];

const WhyChooseUs = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* Left Column */}
        <div>
          <h2 className="text-[#063B29] font-bold text-lg md:text-xl tracking-tight uppercase mb-8">
            WHY CHOOSE PROPERTY CARE PAKISTAN?
          </h2>

          <div className="space-y-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#063B29] flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6 md:w-7 md:h-7 text-[#063B29] stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-sm md:text-base leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (CTA Card) */}
        <div className="bg-[#063B29] text-white rounded-2xl p-6 md:py-8 md:pl-26 md:pr-6 shadow-md relative overflow-hidden">
          <h3 className="text-[#C48C33] font-bold text-lg md:text-xl uppercase tracking-wide leading-snug mb-2">
            LET'S CARE FOR YOUR PROPERTY
            <br />
            GET STARTED TODAY!
          </h3>

          <p className="text-emerald-100/90 text-xs md:text-sm mb-6">
            Talk to our property experts and get the best solutions.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button className="bg-[#C48C33] text-white font-bold text-xs md:text-sm px-5 py-3 rounded-lg uppercase tracking-wider">
              REQUEST A CALL BACK
            </button>
            <button className="bg-[#256b45] border border-white text-white font-bold text-xs md:text-sm px-5 py-3 rounded-lg uppercase tracking-wider flex items-center gap-2">
              <svg
                className="w-4 h-4 fill-white shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.11 1.519 5.84L.07 23.518l5.857-1.417A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.578-.49-5.088-1.344l-.365-.213-3.473.84.856-3.393-.235-.377C2.753 15.969 2 14.07 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              <span>WHATSAPP US</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <span className="text-emerald-100/80 text-xs md:text-sm font-medium">
              Or Call Us Now:
            </span>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base md:text-lg tracking-wide">
                051-111-CARE-111
              </span>
              <span className="text-white font-bold text-sm md:text-lg tracking-wide">
                +92 336 6006 060
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
