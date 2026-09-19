import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, User, FileSearch, ShieldCheck, Clock, FileText, Loader2 } from 'lucide-react';
import { getCustomerInspectionReports, resolveMediaUrl } from '../../../Services/customer.services';

const InspectionCard = ({ report }) => {
  const propertyTitle = [report.propertyType, report.societyName].filter(Boolean).join(' in ') || 'Unknown Property';
  const propertyLocation = [report.societyName, report.cityName].filter(Boolean).join(', ') || 'No location';
  const imageSrc = report.imageUrl ? resolveMediaUrl(report.imageUrl) : '/placeholder-image.jpg';

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow min-h-[180px]">

      {/* LEFT: Property Image */}
      <div className="relative w-full md:w-[35%] xl:w-[28%] shrink-0 h-56 md:h-auto bg-gray-100">
        <img 
          src={imageSrc} 
          alt="Property" 
          className="w-full h-full object-cover" 
          onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
        />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1.5 bg-[#1E5631]/95 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1.5 w-max">
            <ShieldCheck size={14} /> Inspected
          </span>
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#1a2b25] text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm inline-block w-max">
            {report.inspectionId}
          </span>
        </div>
      </div>

      {/* RIGHT WRAPPER (Info + Actions) */}
      <div className="flex-1 flex flex-col xl:flex-row min-w-0">

        {/* CENTER: Property & Inspection Info */}
        <div className="p-5 lg:p-6 flex-1 flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-gray-100 min-w-0">

          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-2 leading-snug break-words">
              {propertyTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
              <span className="flex items-center gap-1.5 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {propertyLocation}
              </span>
              {report.propertyType && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{report.propertyType}</span>
                </>
              )}
              {report.propertySize && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{report.propertySize} {report.propertySizeUom}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspection Date</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={14} className="text-[#B8860B]" /> {report.inspectionDate || 'N/A'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspection Time</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Clock size={14} className="text-[#B8860B]" /> {report.inspectionTime || 'N/A'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Inspected By</span>
              <span className="text-sm font-bold text-[#1a2b25] flex items-center gap-2">
                <User size={14} className="text-[#1E5631]" /> 
                {report.inspectedBy ? (
                  <>
                    {report.inspectedBy.name}
                    <span className="text-xs text-gray-500 font-medium ml-1">({report.inspectedBy.designation})</span>
                  </>
                ) : (
                  <span className="text-gray-500 font-normal">Inspector info unavailable</span>
                )}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT: Actions */}
        <div className="p-5 lg:p-6 w-full xl:w-[280px] shrink-0 flex flex-col justify-center bg-gray-50/30 gap-3">
          <Link
            to={`/customer/inspection-reports/${report.inspectionId}`}
            className="w-full text-center py-3 rounded-xl bg-[#1a2b25] text-white text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} /> View Inspection Report
          </Link>
          <Link
            to={`/customer/properties/${report.propertyId}`}
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
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSummaryFilter, setActiveSummaryFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomerInspectionReports();
      if (res?.success) {
        setReports(res.data || []);
      } else {
        setError(res?.message || 'Failed to fetch inspection reports');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Derive counts from real data
  const totalReports = reports.length;
  const uniqueProperties = new Set(reports.map(r => r.propertyId)).size;

  // Get latest inspection date safely
  const sortedDates = [...reports]
    .map(r => r.inspectionDate)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a));
  const lastInspectionDate = sortedDates.length > 0 ? sortedDates[0] : 'N/A';

  // Compute displayed list based on filter
  const getDisplayedInspections = () => {
    if (activeSummaryFilter === 'properties') {
      // Latest inspection per unique property
      const latestPerProperty = {};
      reports.forEach(r => {
        if (!latestPerProperty[r.propertyId]) {
          latestPerProperty[r.propertyId] = r;
        } else {
          const currentLatest = new Date(`${latestPerProperty[r.propertyId].inspectionDate}T${latestPerProperty[r.propertyId].inspectionTime || '00:00:00'}`);
          const thisDate = new Date(`${r.inspectionDate}T${r.inspectionTime || '00:00:00'}`);
          if (thisDate > currentLatest) {
            latestPerProperty[r.propertyId] = r;
          } else if (thisDate.getTime() === currentLatest.getTime() && parseInt(r.inspectionId) > parseInt(latestPerProperty[r.propertyId].inspectionId)) {
             latestPerProperty[r.propertyId] = r;
          }
        }
      });
      return Object.values(latestPerProperty).sort((a, b) => new Date(b.inspectionDate || 0) - new Date(a.inspectionDate || 0));
    }

    if (activeSummaryFilter === 'latest') {
      // All inspections on the last inspection date
      return reports.filter(r => r.inspectionDate === lastInspectionDate);
    }

    // Default: 'all'
    return reports;
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
              <h3 className="text-2xl font-bold text-[#1a2b25]">{loading ? '-' : totalReports}</h3>
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
              <h3 className="text-2xl font-bold text-[#1a2b25]">{loading ? '-' : uniqueProperties}</h3>
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
              <h3 className="text-xl font-bold text-[#1a2b25]">{loading ? '-' : lastInspectionDate}</h3>
            </div>
          </button>

        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-500 tracking-wide">{getFilterLabel()}</h2>
        </div>

        {/* API States */}
        {loading ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center">
             <Loader2 className="animate-spin text-[#1E5631] mb-4" size={32} />
             <p className="text-gray-500 font-medium">Loading your inspection reports...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">{error}</p>
            <button 
              onClick={fetchReports}
              className="px-6 py-2.5 bg-[#1E5631] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-[#2c4232] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : displayedInspections.length > 0 ? (
          <div className="flex flex-col gap-6">
            {displayedInspections.map(report => (
              <InspectionCard key={report.inspectionId} report={report} />
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
