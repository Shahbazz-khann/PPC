import { useNavigate } from "react-router-dom";
import { clearSession } from "../../Services/AuthSession";


import React from 'react';
import {
  Bell,
  Plus,
  ChevronDown,
  Home,
  Building2,
  User,
  Sparkles,
  Trees,
  ShieldCheck,
  Wrench,
  ClipboardCheck,
  Calendar,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import RentHouse1 from '../../assets/RentHouse1.jpg';
import Construction from '../../assets/Construction.jpg';
import homeImg from '../../assets/homeW.jpg';


const Dashboard = () => {
    const navigate = useNavigate();

  const handleLogout = () => {
    // Clear JWT and user session
    clearSession();

    // Clear login status
    localStorage.removeItem("isLoggedIn");

    // Redirect to login
    navigate("/login");
  };
  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen space-y-6 max-w-[1400px] mx-auto text-gray-800">
      
        <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Logout
      </button>
      {/* =========================================
         Dashboard Header
      ========================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            Welcome back,  Sara  <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Here's what's happening with your properties today.
          </p>
        </div>

        {/* Top Right Actions & User Profile */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Add Property Button */}
          <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs md:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
            Add Property <Plus className="w-4 h-4 text-gray-700" />
          </button>

          {/* Notification Bell */}
          <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all relative shadow-sm">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              alt="Imtiaz Ahmad"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border border-gray-200 shadow-sm"
            />
            <div className="hidden sm:block text-left">
              <h4 className="text-xs md:text-sm font-bold text-gray-900 leading-tight">
               Sara
              </h4>
              <span className="text-[11px] text-gray-400 font-medium block">
                Premium Member
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* =========================================
         Statistics Cards
      ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Properties */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight block">
              07
            </span>
            <span className="text-xs font-semibold text-gray-500 mt-1 block">
              My Properties
            </span>
          </div>
          <a href="#" className="text-xs font-bold text-[#063B29] text-right mt-4 hover:underline block">
            View all
          </a>
        </div>

        {/* Card 2: Active Services */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight block">
              05
            </span>
            <span className="text-xs font-semibold text-gray-500 mt-1 block">
              Active Services
            </span>
          </div>
          <a href="#" className="text-xs font-bold text-[#063B29] text-right mt-4 hover:underline block">
            View all
          </a>
        </div>

        {/* Card 3: Rent Collection (This Month) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight block">
              PKR 245,000
            </span>
            <span className="text-xs font-semibold text-gray-500 mt-1 block">
              Rent Collection (This Month)
            </span>
          </div>
          <a href="#" className="text-xs font-bold text-[#063B29] text-left mt-4 hover:underline block">
            View details
          </a>
        </div>

        {/* Card 4: Pending Requests */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight block">
              03
            </span>
            <span className="text-xs font-semibold text-gray-500 mt-1 block">
              Pending Requests
            </span>
          </div>
          <a href="#" className="text-xs font-bold text-[#063B29] text-right mt-4 hover:underline block">
            View all
          </a>
        </div>
      </div>

      {/* =========================================
         Middle 3-Column Section
      ========================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* =========================================
           Your Properties
        ========================================= */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Your Properties</h3>
            <a href="#" className="text-xs font-bold text-[#063B29] hover:underline">
              View All
            </a>
          </div>

          {/* Featured Large Property Card */}
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden h-40 w-full">
              <img
                src={RentHouse1}
                alt="DHA Phase 6, Lahore"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">DHA Phase 6, Lahore</h4>
                <p className="text-xs text-gray-400 font-medium">1 Kanal House</p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <Home className="w-3.5 h-3.5 text-emerald-700" /> Residential
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-700" /> Owner
              </span>
            </div>
          </div>

          {/* Secondary Horizontal Property Card */}
          <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
            <img
              src={Construction}
              alt="Bahria Town, Karachi"
              className="w-16 h-14 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  Bahria Town, Karachi
                </h4>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium truncate mb-1">
                Apartment 602, Tower A
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <Home className="w-3 h-3 text-emerald-700" /> Residential
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <User className="w-3 h-3 text-emerald-700" /> Owner
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
           Active Services
        ========================================= */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Active Services</h3>
            <a href="#" className="text-xs font-bold text-[#063B29] hover:underline">
              View All
            </a>
          </div>

          <div className="space-y-4">
            {/* Service 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">House Cleaning</h4>
                    <p className="text-[11px] text-gray-400 font-medium">DHA Phase 6, Lahore</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-amber-500 block">
                    In Progress
                  </span>
                  <span className="text-xs font-bold text-gray-700">60%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[60%] rounded-full"></div>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Garden Maintenance</h4>
                  <p className="text-[11px] text-gray-400 font-medium">DHA Phase 6, Lahore</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-blue-500 block">
                  Scheduled
                </span>
                <span className="text-[11px] text-gray-400 font-medium">25 May 2025</span>
              </div>
            </div>

            {/* Service 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 border border-teal-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Security Check</h4>
                    <p className="text-[11px] text-gray-400 font-medium">DHA Phase 6, Lahore</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-emerald-600 block">
                    Completed
                  </span>
                  <span className="text-xs font-bold text-gray-700">100%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full rounded-full"></div>
              </div>
            </div>

            {/* Service 4 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Plumbing Repair</h4>
                    <p className="text-[11px] text-gray-400 font-medium">Bahria Town, Karachi</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-amber-500 block">
                    In Progress
                  </span>
                  <span className="text-xs font-bold text-gray-700">40%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[40%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
           Upcoming Appointments
        ========================================= */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Upcoming Appointments</h3>
            <a href="#" className="text-xs font-bold text-[#063B29] hover:underline">
              View All
            </a>
          </div>

          <div className="space-y-4">
            {/* Appointment 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Property Inspection</h4>
                  <p className="text-[11px] text-gray-400 font-medium">DHA Phase 6, Lahore</p>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    22 May 2025 • 11:00 AM
                  </p>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="Inspector"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
            </div>

            {/* Appointment 2 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Electrician Visit</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Bahria Town, Karachi</p>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    23 May 2025 • 02:00 PM
                  </p>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                alt="Electrician"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
            </div>

            {/* Appointment 3 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Rent Collection</h4>
                  <p className="text-[11px] text-gray-400 font-medium">DHA Phase 6, Lahore</p>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                    25 May 2025 • 10:00 AM
                  </p>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
                alt="Agent"
                className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
         Property Health Score
      ========================================= */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 min-h-[125px] flex items-center justify-between p-5 bg-[#04281C]">
        {/* Background Property Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={homeImg}
            alt="Property Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04281C]/90 via-[#04281C]/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex flex-row items-center justify-between gap-4">
          {/* Left Side Info */}
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-bold text-white">
              Property Health Score
            </h3>
            <p className="text-xs text-white/80 font-medium">
              Your overall property health is
            </p>

            {/* Score & Status */}
            <div className="flex items-baseline gap-1 pt-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-white">86</span>
              <span className="text-xs font-bold text-white/80">/100</span>
              <span className="text-xs font-bold text-emerald-400 ml-3">
                Very Good
              </span>
            </div>

            {/* Health Scale Indicator Box */}
            <div className="w-48 sm:w-56 mt-2 rounded-lg bg-[#04281C]/80 border border-white/10 p-1.5 shadow-inner backdrop-blur-sm">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-1">
                <div className="bg-emerald-400 h-full w-[86%] rounded-full"></div>
              </div>
              <div className="flex justify-between text-[10px] text-white font-medium px-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Right Side Button */}
          <button className="bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg shadow border border-gray-200 flex items-center gap-1.5 transition-all flex-shrink-0">
            View Full Report <ArrowRight className="w-3.5 h-3.5 text-gray-700" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;