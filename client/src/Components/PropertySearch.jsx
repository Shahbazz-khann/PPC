
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, SlidersHorizontal, Check } from 'lucide-react';

const CITIES = ['Islamabad', 'Lahore', 'Rawalpindi', 'Karachi', 'Peshawar', 'Quetta', 'Multan'];
const PROPERTY_TYPES = ['All Types', 'House', 'Apartment', 'Commercial', 'Plot', 'Agricultural'];

const PropertySearch = () => {
  const [city, setCity] = useState('Islamabad');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [intent, setIntent] = useState('Buy');
  const [propertyType, setPropertyType] = useState('All Types');
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const cityDropdownRef = useRef(null);
  const propertyTypeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
      if (propertyTypeDropdownRef.current && !propertyTypeDropdownRef.current.contains(event.target)) {
        setIsPropertyTypeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCityOpen(false);
        setIsPropertyTypeOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            <button 
              onClick={() => setIntent('Buy')}
              className={`font-bold text-xs md:text-sm px-5 py-2 rounded-md transition-colors ${intent === 'Buy' ? 'bg-[#063B29] text-white' : 'bg-transparent text-slate-800 hover:bg-gray-100'}`}
            >
              Buy
            </button>
            <button 
              onClick={() => setIntent('Rent')}
              className={`font-bold text-xs md:text-sm px-5 py-2 rounded-md transition-colors ${intent === 'Rent' ? 'bg-[#063B29] text-white' : 'bg-transparent text-slate-800 hover:bg-gray-100'}`}
            >
              Rent
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
          {/* Location Custom Dropdown */}
          <div className="relative w-full" ref={cityDropdownRef}>
            <div 
              className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer"
              onClick={() => setIsCityOpen(!isCityOpen)}
            >
              <div>
                <label className="block text-[11px] font-medium text-gray-500 cursor-pointer">City</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-900">{city}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-900 transition-transform duration-200 ${isCityOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <MapPin className="w-4 h-4 text-[#063B29] ml-2 shrink-0" />
            </div>

            {/* Dropdown Panel */}
            {isCityOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto transform origin-top transition-all animate-in fade-in slide-in-from-top-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    className={`w-full text-left px-4 py-2.5 text-xs md:text-sm transition-colors flex items-center justify-between ${
                      city === c 
                        ? 'bg-[#063B29]/5 text-[#063B29] font-bold' 
                        : 'text-slate-700 hover:bg-gray-50 hover:text-slate-900 font-medium'
                    }`}
                    onClick={() => {
                      setCity(c);
                      setIsCityOpen(false);
                    }}
                  >
                    <span>{c}</span>
                    {city === c && <Check className="w-3.5 h-3.5 text-[#063B29]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="relative w-full" ref={propertyTypeDropdownRef}>
            <div 
              className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-gray-200 cursor-pointer"
              onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}
            >
              <div>
                <label className="block text-[11px] font-medium text-gray-500 cursor-pointer">Property Type</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-900">{propertyType}</span>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-200 ml-2 shrink-0 ${isPropertyTypeOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Panel */}
            {isPropertyTypeOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto transform origin-top transition-all animate-in fade-in slide-in-from-top-2">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type}
                    className={`w-full text-left px-4 py-2.5 text-xs md:text-sm transition-colors flex items-center justify-between ${
                      propertyType === type 
                        ? 'bg-[#063B29]/5 text-[#063B29] font-bold' 
                        : 'text-slate-700 hover:bg-gray-50 hover:text-slate-900 font-medium'
                    }`}
                    onClick={() => {
                      setPropertyType(type);
                      setIsPropertyTypeOpen(false);
                    }}
                  >
                    <span>{type}</span>
                    {propertyType === type && <Check className="w-3.5 h-3.5 text-[#063B29]" />}
                  </button>
                ))}
              </div>
            )}
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
