import React from 'react';
import {
  Bell,
  Sliders,
  ChevronDown,
  Home,
  Wrench,
  Building2,
  Hammer,
} from 'lucide-react';

const AdminDashboard = () => {
  // ==========================================
  // Data: Statistics Cards
  // ==========================================
  const statsCardsData = [
    {
      title: 'Total Properties',
      value: '1,245',
      change: '+12%',
      timeframe: 'this month',
    },
    {
      title: 'Active Services',
      value: '832',
      change: '+10%',
      timeframe: 'this month',
    },
    {
      title: 'Total Users',
      value: '2,586',
      change: '+15%',
      timeframe: 'this month',
    },
    {
      title: 'Monthly Revenue',
      value: 'PKR 8.25M',
      change: '+22%',
      timeframe: 'this month',
    },
  ];

  // ==========================================
  // Data: Service Requests Donut Legend
  // ==========================================
  const serviceRequestsLegend = [
    { label: 'Pending', count: '306', percentage: '24%', color: 'bg-[#2563EB]' },
    { label: 'In Progress', count: '512', percentage: '41%', color: 'bg-[#0EA5E9]' },
    { label: 'Completed', count: '430', percentage: '35%', color: 'bg-[#059669]' },
  ];

  // ==========================================
  // Data: Recent Service Requests
  // ==========================================
  const recentRequests = [
    {
      id: 1,
      title: 'House Cleaning',
      location: 'DHA Phase 6, Lahore',
      status: 'In Progress',
      statusStyle: 'bg-[#E6F4EA] text-[#137333]',
      icon: Home,
    },
    {
      id: 2,
      title: 'Plumbing Repair',
      location: 'Bahria Town, Karachi',
      status: 'Pending',
      statusStyle: 'bg-[#FEF7E0] text-[#B06000]',
      icon: Wrench,
    },
  ];

  // ==========================================
  // Data: Top Performing Services
  // ==========================================
  const topServices = [
    {
      id: 1,
      title: 'Property Care',
      requests: '624 Requests',
      percentage: '75%',
      icon: Building2,
    },
    {
      id: 2,
      title: 'Renovation',
      requests: '312 Requests',
      percentage: '48%',
      icon: Hammer,
    },
  ];

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen space-y-6 max-w-[1400px] mx-auto text-gray-800">
      {/* =========================================
         SECTION 1 — Header
      ========================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] uppercase">
          ADMIN PANEL
        </h1>

        <div className="flex items-center gap-4">
          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80 shadow-xs transition-all hover:bg-gray-50 cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              type="button"
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 bg-white border border-gray-200/80 shadow-xs transition-all hover:bg-gray-50 cursor-pointer"
              title="Settings"
            >
              <Sliders className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80"
              alt="Admin User"
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-[#0F172A] leading-tight">
                Admin User
              </span>
              <span className="text-xs font-medium text-gray-400 leading-tight">
                Super Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================
         SECTION 2 — Dashboard Overview & Controls
      ========================================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <h2 className="text-xl font-bold text-[#0F172A]">
          Dashboard Overview
        </h2>

        <div className="flex items-center gap-3">
          {/* Date Selector Dropdown */}
          <button
            type="button"
            className="bg-white border border-gray-200/90 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span>May 1 - May 22, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Export Report Button */}
          <button
            type="button"
            className="bg-[#063B29] hover:bg-[#042A1D] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Export Report
          </button>
        </div>
      </section>

      {/* =========================================
         SECTION 3 — Statistics Cards Grid
      ========================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCardsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-3"
          >
            <span className="text-xs font-semibold text-gray-500 tracking-wide">
              {stat.title}
            </span>
            <div className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span>{stat.change}</span>
              <span className="text-gray-400 font-normal">{stat.timeframe}</span>
            </div>
          </div>
        ))}
      </section>

      {/* =========================================
         SECTION 4 — Charts Grid (Service Requests & Revenue)
      ========================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Service Requests Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-6">
          <h3 className="font-bold text-base text-[#0F172A]">
            Service Requests
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
            {/* SVG Donut Chart with Center Text */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke="#F1F5F9"
                  strokeWidth="20"
                  fill="transparent"
                />
                {/* Segment 1: Pending (24%) - Blue */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke="#2563EB"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray="389.5"
                  strokeDashoffset="296"
                />
                {/* Segment 2: In Progress (41%) - Cyan */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke="#0EA5E9"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray="389.5"
                  strokeDashoffset="230"
                  transform="rotate(86.4 80 80)"
                />
                {/* Segment 3: Completed (35%) - Green */}
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke="#059669"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray="389.5"
                  strokeDashoffset="253"
                  transform="rotate(234 80 80)"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                  1,248
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex flex-col space-y-3 min-w-[140px]">
              {serviceRequestsLegend.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {item.count} <span className="text-gray-400 font-normal">({item.percentage})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Revenue Overview Line Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">
            Revenue Overview
          </h3>

          <div className="relative w-full h-64 pt-2">
            {/* Tooltip Card Overlay */}
            <div className="absolute top-3 right-12 bg-white border border-gray-200/80 shadow-md rounded-xl px-3.5 py-1.5 z-10 pointer-events-none">
              <div className="text-[11px] font-medium text-gray-400">May 22</div>
              <div className="text-xs font-extrabold text-[#0F172A]">PKR 2.45M</div>
            </div>

            {/* Line Chart SVG */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Lines */}
              <line x1="40" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="60" x2="490" y2="60" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="100" x2="490" y2="100" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="140" x2="490" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="180" x2="490" y2="180" stroke="#F1F5F9" strokeWidth="1" />

              {/* Y-Axis Labels */}
              <text x="10" y="24" fill="#94A3B8" fontSize="10" fontWeight="500">4M</text>
              <text x="10" y="64" fill="#94A3B8" fontSize="10" fontWeight="500">3M</text>
              <text x="10" y="104" fill="#94A3B8" fontSize="10" fontWeight="500">2M</text>
              <text x="10" y="144" fill="#94A3B8" fontSize="10" fontWeight="500">1M</text>
              <text x="25" y="184" fill="#94A3B8" fontSize="10" fontWeight="500">0</text>

              {/* Gradient Area Fill */}
              <path
                d="M 50 140 L 90 98 L 130 115 L 170 140 L 210 118 L 250 82 L 290 102 L 330 120 L 370 65 L 410 88 L 450 118 L 485 70 L 485 180 L 50 180 Z"
                fill="url(#revenueGradient)"
              />

              {/* Revenue Line Path */}
              <path
                d="M 50 140 L 90 98 L 130 115 L 170 140 L 210 118 L 250 82 L 290 102 L 330 120 L 370 65 L 410 88 L 450 118 L 485 70"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Point Circles */}
              <circle cx="50" cy="140" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="90" cy="98" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="130" cy="115" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="170" cy="140" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="210" cy="118" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="250" cy="82" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="290" cy="102" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="330" cy="120" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="370" cy="65" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="410" cy="88" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="450" cy="118" r="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2" />
              <circle cx="485" cy="70" r="4.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="2.5" />
            </svg>
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center justify-between text-xs font-medium text-gray-400 px-6 pt-1">
            <span>1 May</span>
            <span>5 May</span>
            <span>10 May</span>
            <span>15 May</span>
            <span>20 May</span>
          </div>
        </div>
      </section>

      {/* =========================================
         SECTION 5 — Recent Service Requests & Top Performing Services
      ========================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Recent Service Requests */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-4">
          <h3 className="font-bold text-base text-[#0F172A]">
            Recent Service Requests
          </h3>

          <div className="divide-y divide-gray-100">
            {recentRequests.map((req) => {
              const IconComp = req.icon;
              return (
                <div key={req.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl">
                      <IconComp className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0F172A]">
                        {req.title}
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        {req.location}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-semibold px-3.5 py-1 rounded-full ${req.statusStyle}`}>
                    {req.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Top Performing Services */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col space-y-5">
          <h3 className="font-bold text-base text-[#0F172A]">
            Top Performing Services
          </h3>

          <div className="space-y-4">
            {topServices.map((svc) => {
              const IconComp = svc.icon;
              return (
                <div key={svc.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                        <IconComp className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-sm font-bold text-[#0F172A]">
                        {svc.title}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {svc.requests}
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#063B29] h-full rounded-full transition-all duration-300"
                      style={{ width: svc.percentage }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
