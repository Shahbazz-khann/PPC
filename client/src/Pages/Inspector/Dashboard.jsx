import {
  Bell,
  ChevronDown,
  ClipboardList,
  CheckCircle2,
  RotateCw,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';

// Static Dummy Data
const statsData = [
  {
    id: 'total-inspections',
    title: 'Total Inspections',
    subtitle: 'All Time',
    value: '24',
    icon: ClipboardList,
    hasDropdown: true,
  },
  {
    id: 'completed',
    title: 'Completed',
    value: '16',
    icon: CheckCircle2,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    value: '5',
    icon: RotateCw,
  },
  {
    id: 'pending',
    title: 'Pending',
    value: '3',
    icon: Clock,
  },
];

const scheduleData = [
  {
    id: 1,
    time: '10:00 AM',
    location: 'DHA Lahore',
    type: 'Routine Inspection',
    status: 'Inspection',
  },
  {
    id: 2,
    time: '01:00 PM',
    location: 'Bahria Town',
    type: 'Property Visit',
    status: 'Inspection',
  },
  {
    id: 3,
    time: '03:30 PM',
    location: 'Gulberg Islamabad',
    type: 'Maintenance Check',
    status: 'Inspection',
  },
];

const inspectionSummary = {
  total: 24,
  completed: 16,
  inProgress: 5,
  pending: 3,
};

const recentReportsData = [
  {
    id: 1,
    location: 'DHA Lahore',
    date: '20 May 2024',
  },
  {
    id: 2,
    location: 'Bahria Town',
    date: '19 May 2024',
  },
  {
    id: 3,
    location: 'Emaar Creek',
    date: '18 May 2024',
  },
];

const InspectorDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 pb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>

        <div className="flex items-center gap-5">
          <div className="relative">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 stroke-[1.8]" />
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#056839] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#f8fafc]">
              3
            </span>
          </div>

          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              alt="Inspector User"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900">
                Inspector User
              </span>
              <span className="text-xs text-gray-500 font-normal">
                Property Inspector
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex items-start justify-between">
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
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#056839] flex items-center justify-center">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl lg:text-4xl font-bold text-[#056839] tracking-tight">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Today's Schedule
            </h2>

            <div className="divide-y divide-gray-100">
              {scheduleData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-5 first:pt-2"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold text-gray-500 w-20 flex-shrink-0">
                      {item.time}
                    </span>
                    <div className="pl-4 border-l border-gray-200">
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {item.location}
                      </h3>
                      <p className="text-sm text-gray-400 font-normal mt-0.5">
                        {item.type}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-[#056839] px-3 py-1 rounded-full bg-emerald-50/60">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-2">
            <button
              type="button"
              className="w-full bg-[#f0f7f4] hover:bg-[#e4f1eb] text-[#056839] font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Inspection Summary & Recent Reports */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Inspection Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Inspection Summary
            </h2>

            <div className="flex items-center justify-between px-2 sm:px-6">
              {/* Donut Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Completed: 16/24 (approx 66.7%) -> stroke #1e3a8a */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    stroke="#1e3a8a"
                    strokeWidth="10"
                    strokeDasharray="146 226.19"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* In Progress: 5/24 (approx 20.8%) -> stroke #056839 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    stroke="#056839"
                    strokeWidth="10"
                    strokeDasharray="44 226.19"
                    strokeDashoffset="-150"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* Pending: 3/24 (approx 12.5%) -> stroke #eab308 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    stroke="#eab308"
                    strokeWidth="10"
                    strokeDasharray="24 226.19"
                    strokeDashoffset="-197"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {inspectionSummary.total}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 mt-1">
                    Total Inspections
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-4 min-w-[160px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#1e3a8a]" />
                    <span className="text-sm font-semibold text-gray-800">
                      Completed
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-4">
                    {inspectionSummary.completed}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#056839]" />
                    <span className="text-sm font-semibold text-gray-800">
                      In Progress
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-4">
                    {inspectionSummary.inProgress}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="text-sm font-semibold text-gray-800">
                      Pending
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 ml-4">
                    {inspectionSummary.pending}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Recent Reports
            </h2>

            <div className="divide-y divide-gray-100">
              {recentReportsData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 text-[#056839]">
                      <FileText className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className="text-base font-semibold text-gray-900">
                      {item.location}
                    </span>
                  </div>

                  <span className="text-sm font-semibold text-gray-500">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InspectorDashboard;

