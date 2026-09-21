
import { MapPin, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

const PropertySearch = () => {
  return (
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 -mt-10 md:-mt-42 z-30 mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-4">
        {/* Title */}       
        <h2 className="text-[#063B29] font-bold text-xs md:text-sm tracking-wider uppercase mb-2">
          FIND YOUR PERFECT PROPERTY
        </h2>

        {/* Tabs & Advanced Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2 md:pb-0">
            <button className="bg-[#063B29] text-white font-bold text-xs md:text-sm px-5 py-2 rounded-md">
              Buy
            </button>
            <button className="text-slate-800 font-semibold text-xs md:text-sm px-4 py-2">
              Rent
            </button>
            <button className="text-slate-800 font-semibold text-xs md:text-sm px-4 py-2">
              Commercial
            </button>
            <button className="text-slate-800 font-semibold text-xs md:text-sm px-4 py-2">
              Plots
            </button>
            <button className="text-slate-800 font-semibold text-xs md:text-sm px-4 py-2">
              Agricultural
            </button>
          </div>

          {/* Advanced Search */}
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs md:text-sm cursor-pointer">
            <span>Advanced Search</span>
            <SlidersHorizontal className="w-4 h-4 text-[#063B29]" />
          </div>
        </div>

        {/* Inputs Container */}
        <div className="border border-gray-100 rounded-xl bg-[#FAFBFB] p-2 md:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Location */}
          <div className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-200">
            <div>
              <label className="block text-[11px] font-medium text-gray-500">Location</label>
              <span className="text-xs md:text-sm font-bold text-slate-900">Islamabad</span>
            </div>
            <MapPin className="w-4 h-4 text-[#063B29] ml-2 shrink-0" />
          </div>

          {/* Property Type */}
          <div className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-200">
            <div>
              <label className="block text-[11px] font-medium text-gray-500">Property Type</label>
              <span className="text-xs md:text-sm font-bold text-slate-900">All Types</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 ml-2 shrink-0" />
          </div>

          {/* Min Price */}
          <div className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-200">
            <div>
              <label className="block text-[11px] font-medium text-gray-500">Min Price</label>
              <span className="text-xs md:text-sm font-semibold text-gray-600">Min Price</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 ml-2 shrink-0" />
          </div>

          {/* Max Price */}
          <div className="px-3 py-1 flex items-center justify-between">
            <div>
              <label className="block text-[11px] font-medium text-gray-500">Max Price</label>
              <span className="text-xs md:text-sm font-semibold text-gray-600">Max Price</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 ml-2 shrink-0" />
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <button className="w-full bg-[#063B29] text-white font-bold text-xs md:text-sm tracking-wider uppercase px-6 py-3.5 rounded-lg flex items-center justify-center space-x-2">
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>SEARCH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
