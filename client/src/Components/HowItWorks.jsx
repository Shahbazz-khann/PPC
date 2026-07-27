import React from 'react';
import {
  HardHat,
  FileText,
  BadgeCheck,
  ClipboardCheck,
  FileCog,
  PackageCheck,
} from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Choose Service',
    icon: HardHat,
  },
  {
    number: 2,
    title: 'Submit Details',
    icon: FileText,
  },
  {
    number: 3,
    title: 'Assessment by Expert',
    icon: BadgeCheck,
  },
  {
    number: 4,
    title: 'Quotation & Approval',
    icon: ClipboardCheck,
  },
  {
    number: 5,
    title: 'Service Execution',
    icon: FileCog,
  },
  {
    number: 6,
    title: 'Completion & Report',
    icon: PackageCheck,
  },
];

const HowItWorks = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
      <div className="bg-[#FAFBF9] border border-gray-200/70 rounded-2xl py-5 md:py-6 px-4 md:px-6 shadow-xs">
        <h2 className="text-[#063B29] font-bold text-base md:text-lg tracking-tight uppercase mb-5 md:mb-6">
          HOW IT WORKS
        </h2>

        <div className="flex items-start justify-between w-full gap-1 md:gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center text-center flex-1 min-w-[90px] max-w-[130px]">
                <div className="w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-white border border-gray-200/80 flex items-center justify-center shadow-xs mb-2.5 md:mb-3 shrink-0">
                  <step.icon className="w-6 h-6 md:w-8 md:h-8 text-[#063B29] stroke-[1.5]" />
                </div>
                <span className="text-[#063B29] font-bold text-base md:text-lg mb-0.5">
                  {step.number}
                </span>
                <h3 className="text-slate-800 font-semibold text-xs md:text-sm leading-tight">
                  {step.title}
                </h3>
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center justify-center flex-1 mt-4 md:mt-6 lg:mt-7 shrink-0 min-w-[16px]">
                  <svg
                    className="w-6 md:w-10 lg:w-12 text-gray-400 shrink-0"
                    viewBox="0 0 40 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 8h32M28 3l6 5-6 5" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
