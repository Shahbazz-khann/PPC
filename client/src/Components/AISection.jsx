

const AISection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
      <div className="bg-[#053223] text-white rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 border border-[#084230]">
        
        {/* Left Side Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 lg:max-w-[45%]">
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

          {/* Text & CTA */}
          <div className="flex flex-col items-start">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5 leading-snug">
              AI-Powered Property Care Platform
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-200 mb-1.5">
              Smart Technology, Better Decisions, Maximum Value.
            </p>
            <p className="text-gray-300 text-[11px] md:text-xs leading-relaxed mb-4">
              Our AI engine analyzes market trends, property conditions & maintenance history to help you make the best decisions.
            </p>
            <button className="bg-gradient-to-r from-[#C69214] to-[#D8A238] text-white font-bold text-[11px] tracking-wider uppercase px-5 py-2.5 rounded-lg shadow-md">
              LEARN MORE
            </button>
          </div>
        </div>

        {/* Right Side Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full lg:w-auto flex-1">
          
          {/* Card 1: Property Health Score */}
          <div className="bg-[#032318]/60 border border-[#0C4E37] rounded-xl p-3 flex flex-col justify-between items-center text-center min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-200 mb-2">
              Property Health Score
            </span>
            <div className="flex items-center justify-center gap-2 my-auto">
              {/* Circular Gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[#0B4531]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Arc */}
                  <path
                    className="text-[#D8A238]"
                    strokeDasharray="85, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-white">
                  85<span className="text-[8px] text-gray-300">/100</span>
                </span>
              </div>
              {/* Status Text */}
              <div className="text-left leading-tight">
                <div className="text-[9px] text-gray-300 border-b border-gray-600/50 pb-0.5 mb-0.5">
                  Data Fresh
                </div>
                <div className="text-[10px] font-bold text-[#D8A238]">
                  Excellent
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Market Insights */}
          <div className="bg-[#032318]/60 border border-[#0C4E37] rounded-xl p-3 flex flex-col justify-between items-center text-center min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-200 mb-2">
              Market Insights
            </span>
            <div className="w-full h-16 my-auto flex items-center justify-center px-1">
              <svg className="w-full h-12" viewBox="0 0 100 40" fill="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#0D4B36" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#0D4B36" strokeWidth="0.5" strokeDasharray="2 2" />
                {/* Secondary Green Line */}
                <path
                  d="M 5 32 Q 25 22 45 28 T 85 20 T 95 24"
                  fill="none"
                  stroke="#1B7A56"
                  strokeWidth="1.5"
                />
                {/* Primary Gold Line with Points */}
                <path
                  d="M 5 28 L 25 15 L 45 25 L 65 10 L 85 22 L 95 12"
                  fill="none"
                  stroke="#D8A238"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="25" cy="15" r="2" fill="#D8A238" />
                <circle cx="45" cy="25" r="2" fill="#D8A238" />
                <circle cx="65" cy="10" r="2" fill="#D8A238" />
                <circle cx="85" cy="22" r="2" fill="#D8A238" />
                <circle cx="95" cy="12" r="2" fill="#D8A238" />
              </svg>
            </div>
          </div>

          {/* Card 3: Smart Valuation */}
          <div className="bg-[#032318]/60 border border-[#0C4E37] rounded-xl p-3 flex flex-col justify-between items-center text-center min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-200 mb-2">
              Smart Valuation
            </span>
            <div className="w-full h-16 my-auto flex items-end justify-center gap-1.5 px-2 pb-1 border-b border-[#0D4B36]">
              <div className="w-2.5 bg-[#D8A238]/60 rounded-t h-5"></div>
              <div className="w-2.5 bg-[#D8A238]/80 rounded-t h-8"></div>
              <div className="w-2.5 bg-[#D8A238] rounded-t h-12 relative flex items-center justify-center">
                {/* Trend Arrow */}
                <span className="absolute -top-3 text-[9px] text-[#D8A238]">▲</span>
              </div>
              <div className="w-2.5 bg-[#D8A238]/90 rounded-t h-9"></div>
              <div className="w-2.5 bg-[#D8A238]/70 rounded-t h-6"></div>
            </div>
          </div>

          {/* Card 4: Maintenance Alerts */}
          <div className="bg-[#032318]/60 border border-[#0C4E37] rounded-xl p-3 flex flex-col justify-between items-center text-center min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-200 mb-2">
              Maintenance Alerts
            </span>
            <div className="my-auto flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#D8A238]"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* House Roof Icon */}
                <path d="M 8 26 L 24 10 L 40 26" />
                {/* Check / Alert Box inside */}
                <rect x="18" y="24" width="12" height="14" rx="2" strokeWidth="2" />
                <path d="M 22 31 L 24 33 L 28 29" strokeWidth="2" />
                <line x1="12" y1="40" x2="36" y2="40" strokeWidth="2" />
              </svg>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AISection;
