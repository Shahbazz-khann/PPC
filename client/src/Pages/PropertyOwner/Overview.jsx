import { Bell, ChevronDown, Building2 } from 'lucide-react';

// Static Dummy Data
const statsData = [
  {
    id: 'total-properties',
    title: 'Total Properties',
    subtitle: 'All Time',
    value: '12',
    hasDropdown: true,
  },
  {
    id: 'occupied',
    title: 'Occupied',
    value: '9',
  },
  {
    id: 'vacant',
    title: 'Vacant',
    value: '3',
  },
  {
    id: 'monthly-rent',
    title: 'Monthly Rent',
    value: 'PKR 50,000',
  },
];

const recentPaymentsData = [
  {
    id: 1,
    property: 'DHA Lahore',
    amount: 'PKR 245,500',
  },
  {
    id: 2,
    property: 'Bahria Town',
    amount: 'PKR 305,000',
  },
  {
    id: 3,
    property: 'Islamabad',
    amount: 'PKR 312,500',
  },
];

const rentCollectionData = {
  percentage: 85,
  collected: 'PKR 722,500',
  remaining: 'PKR 127,500',
};

const OwnerOverview = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Owner Overview
        </h1>

        <div className="flex items-center gap-5">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-700 stroke-[1.8]" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              alt="Owner User"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900">
                Owner User
              </span>
              <span className="text-xs text-gray-500 font-normal">
                Property Owner
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[150px]"
          >
            <div>
              <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
                {stat.title}
              </h2>
              {stat.hasDropdown && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-gray-400 mt-1 hover:text-gray-600 cursor-pointer"
                >
                  <span>{stat.subtitle}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mt-4">
              <span className="text-3xl lg:text-4xl font-bold text-[#056839] tracking-tight">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rent Collection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Rent Collection (This Month)
          </h2>

          <div className="flex items-center justify-around sm:justify-start sm:gap-12 py-4 px-2">
            {/* Donut Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring (Remaining 15%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#8fa89b"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Collected Progress Ring (85%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#056839"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 38 * 0.85} ${2 * Math.PI * 38}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {rentCollectionData.percentage}%
                </span>
              </div>
            </div>

            {/* Legend & Values */}
            <div className="flex flex-col justify-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#056839] inline-block" />
                  <span className="text-sm font-semibold text-gray-700">Collected</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900 ml-5">
                  {rentCollectionData.collected}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-[#8fa89b] inline-block" />
                  <span className="text-sm font-semibold text-gray-700">Remaining</span>
                </div>
                <p className="text-xl font-extrabold text-gray-900 ml-5">
                  {rentCollectionData.remaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent Payments
          </h2>

          <div className="divide-y divide-gray-100">
            {recentPaymentsData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-4 first:pt-2 last:pb-2"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 text-[#056839]">
                    <Building2 className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-base font-semibold text-gray-900">
                    {item.property}
                  </span>
                </div>

                <span className="text-base font-bold text-gray-900">
                  {item.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OwnerOverview;

