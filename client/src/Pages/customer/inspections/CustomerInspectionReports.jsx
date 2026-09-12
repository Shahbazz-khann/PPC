import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, User, FileSearch, ShieldCheck, Clock, FileText } from 'lucide-react';
import { mockInspectionsList } from './mockInspectionsData';
import { mockPropertiesList } from '../properties/mockPropertyData';

const InspectionCard = ({ inspection }) => {
  const property = mockPropertiesList.find(p => p.id === inspection.propertyId);

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow min-h-[180px]">

      {/* LEFT: Property Image */}
      <div className="relative w-full md:w-[35%] xl:w-[28%] shrink-0 h-56 md:h-auto bg-gray-100">
        <img src={property?.image || '/placeholder-image.jpg'} alt="Property" className="w-full h-full object-cover" />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1.5 bg-[#1E5631]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 w-max">
            <ShieldCheck size={14} /> Inspected
          </span>
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {inspection.inspectionId}
          </span>
        </div>
      </div>

      {/* RIGHT WRAPPER (Info + Actions) */}
      <div className="flex-1 flex flex-col xl:flex-row min-w-0">

        {/* CENTER: Property & Inspection Info */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-gray-100 min-w-0">

          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2 leading-snug break-words">
              {property ? `${property.propertyType} in ${property.society}` : 'Unknown Property'}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {property ? `${property.society}, ${property.city}` : 'No location'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span>{property?.propertyType}</span>
              {property?.propertySize && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{property.propertySize} {property.sizeUom}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspection Date</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={14} className="text-[#B8860B]" /> {inspection.inspectionDate}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspection Time</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Clock size={14} className="text-[#B8860B]" /> {inspection.inspectionTime}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspected By</span>
              <span className="text-sm font-bold text-[#1a2b25] flex items-center gap-2">
                <User size={14} className="text-[#1E5631]" /> {inspection.inspectedBy?.name}
                <span className="text-xs text-gray-500 font-medium ml-1">({inspection.inspectedBy?.role})</span>
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT: Actions */}
        <div className="p-5 lg:p-6 w-full xl:w-[280px] shrink-0 flex flex-col justify-center bg-gray-50/30 gap-3">
          <Link
            to={`/customer/inspection-reports/${inspection.inspectionId}`}
            className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} /> View Inspection Report
          </Link>
          <Link
            to={`/customer/properties/${inspection.propertyId}`}
            className="w-full text-center py-3 rounded-xl border border-gray-200 text-[#1a2b25] bg-white text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
          >
            View Property
          </Link>
        </div>
      </div>

    </div>
  );
};

const CustomerInspectionReports = () => {
  const [activeSummaryFilter, setActiveSummaryFilter] = useState('all');

  // Derive counts from mock data
  const totalReports = mockInspectionsList.length;
  const uniqueProperties = new Set(mockInspectionsList.map(i => i.propertyId)).size;

  // Get latest inspection date
  const sortedDates = [...mockInspectionsList]
    .map(i => i.inspectionDate)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  const lastInspectionDate = sortedDates.length > 0 ? sortedDates[0] : 'N/A';

  // Compute displayed list based on filter
  const getDisplayedInspections = () => {
    if (activeSummaryFilter === 'properties') {
      // Latest inspection per unique property
      const latestPerProperty = {};
      mockInspectionsList.forEach(insp => {
        if (!latestPerProperty[insp.propertyId]) {
          latestPerProperty[insp.propertyId] = insp;
        } else {
          const currentLatest = new Date(latestPerProperty[insp.propertyId].inspectionDate);
          const thisDate = new Date(insp.inspectionDate);
          if (thisDate > currentLatest) {
            latestPerProperty[insp.propertyId] = insp;
          }
        }
      });
      return Object.values(latestPerProperty).sort((a, b) => new Date(b.inspectionDate) - new Date(a.inspectionDate));
    }

    if (activeSummaryFilter === 'latest') {
      // All inspections on the last inspection date
      return mockInspectionsList.filter(i => i.inspectionDate === lastInspectionDate);
    }

    // Default: 'all'
    return mockInspectionsList;
  };

  const displayedInspections = getDisplayedInspections();

  // Helper for filter label
  const getFilterLabel = () => {
    if (activeSummaryFilter === 'properties') return "Latest Report by Property";
    if (activeSummaryFilter === 'latest') return "Most Recent Inspection";
    return "All Inspection Reports";
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className=" px-4 sm:px-8 lg:px-12 xl:px-4 ">

        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-1">Inspection Reports</h1>
          <p className="text-gray-600 font-medium max-w-2xl">
            View property inspection reports prepared by PPC. Access detailed findings, remarks, and checklist results for your properties.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">

          <button
            onClick={() => setActiveSummaryFilter('all')}
            className={`text-left rounded-[20px] shadow-sm p-6 flex items-center gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:ring-offset-2 ${activeSummaryFilter === 'all'
                ? 'bg-white border-2 border-[#1E5631] shadow-md ring-1 ring-[#1E5631]/10'
                : 'bg-white border border-gray-100 hover:border-gray-300'
              }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeSummaryFilter === 'all' ? 'bg-[#1E5631] text-white' : 'bg-[#eaf1ec] text-[#1E5631]'
              }`}>
              <FileSearch size={24} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeSummaryFilter === 'all' ? 'text-[#1E5631]' : 'text-gray-400'}`}>
                Total Reports
              </p>
              <h3 className="text-2xl font-bold text-[#1a2b25]">{totalReports}</h3>
            </div>
          </button>

          <button
            onClick={() => setActiveSummaryFilter('properties')}
            className={`text-left rounded-[20px] shadow-sm p-6 flex items-center gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:ring-offset-2 ${activeSummaryFilter === 'properties'
                ? 'bg-white border-2 border-[#1E5631] shadow-md ring-1 ring-[#1E5631]/10'
                : 'bg-white border border-gray-100 hover:border-gray-300'
              }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeSummaryFilter === 'properties' ? 'bg-[#B8860B] text-white' : 'bg-[#f4ebd0] text-[#B8860B]'
              }`}>
              <MapPin size={24} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeSummaryFilter === 'properties' ? 'text-[#1E5631]' : 'text-gray-400'}`}>
                Properties Inspected
              </p>
              <h3 className="text-2xl font-bold text-[#1a2b25]">{uniqueProperties}</h3>
            </div>
          </button>

          <button
            onClick={() => setActiveSummaryFilter('latest')}
            className={`text-left rounded-[20px] shadow-sm p-6 flex items-center gap-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#B8860B] focus:ring-offset-2 ${activeSummaryFilter === 'latest'
                ? 'bg-white border-2 border-[#1E5631] shadow-md ring-1 ring-[#1E5631]/10'
                : 'bg-white border border-gray-100 hover:border-gray-300'
              }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeSummaryFilter === 'latest' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-500'
              }`}>
              <Calendar size={24} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeSummaryFilter === 'latest' ? 'text-[#1E5631]' : 'text-gray-400'}`}>
                Last Inspection
              </p>
              <h3 className="text-xl font-bold text-[#1a2b25]">{lastInspectionDate}</h3>
            </div>
          </button>

        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-500 tracking-wide">{getFilterLabel()}</h2>
        </div>

        {/* Inspections List */}
        {displayedInspections.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedInspections.map(inspection => (
              <InspectionCard key={inspection.inspectionId} inspection={inspection} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <FileSearch size={32} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">No inspection reports are available yet.</h3>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              Inspection reports prepared by PPC will appear here once an inspection is completed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerInspectionReports;
