import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MapPin, 
  Maximize, 
  MoreHorizontal,
  Home,
  ChevronRight,
  Filter,
  CheckSquare,
  Image as ImageIcon,
  List,
  Edit2
} from 'lucide-react';
import { getCustomerProperties } from '../../../Services/customer.services';
import { resolveMediaUrl } from '../../../Services/Api';
import PropVilla from '../../../assets/prop_villa.png';

const StatusBadge = ({ status }) => {
  let color = 'bg-gray-100 text-gray-700';
  let dotColor = 'bg-gray-400';

  if (status === 'Active' || status === 'Completed') {
    color = 'bg-[#EAF3EE] text-[#1E5631]'; 
    dotColor = 'bg-[#1E5631]';
  } else if (status === 'Pending Verification' || status === 'Pending' || status === 'Under Review') {
    color = 'bg-[#FFF4E5] text-[#B8860B]'; 
    dotColor = 'bg-[#B8860B]';
  } else if (status === 'Rejected') {
    color = 'bg-[#faebe9] text-[#c46a62]';
    dotColor = 'bg-[#c46a62]';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border border-white/50 ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};

const CustomerPropertiesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await getCustomerProperties();
        if (res.success) {
          setProperties(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const getDisplayStatus = (prop) => {
    if (prop.approval_stage === 'Pending') return 'Pending';
    if (prop.approval_stage === 'Under Review') return 'Under Review';
    if (prop.approval_stage === 'Rejected') return 'Rejected';
    if (prop.approval_stage === 'Approved') return prop.current_status || 'Not Available';
    return prop.current_status || 'Not Available';
  };

  const filteredProperties = properties.filter(prop => 
    (prop.property_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.society || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prop.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1400px] mx-auto space-y-3">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-2 tracking-tight">
              My Properties
            </h1>
            <p className="text-gray-500 font-medium text-sm max-w-md">
              Manage your registered properties, update particulars, and view complete property profiles.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/customer/properties/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.2)] hover:bg-[#2c4232] transition-colors whitespace-nowrap"
          >
            <Plus size={18} />
            Add Property
          </button>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full flex-1 max-w-[800px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by property title, location, society, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-medium text-gray-800 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-6 w-full sm:w-auto shrink-0">
            <span className="text-sm font-semibold text-gray-500 hidden sm:block">
              {filteredProperties.length} Properties<br/>found
            </span>
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 bg-white rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Properties List (One Large Card Per Row) */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-gray-100 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2b25] mb-4"></div>
              <p className="text-sm font-medium text-gray-500">Loading your properties...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-gray-100 shadow-sm">
              <p className="text-sm font-medium text-red-500 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-200">Retry</button>
            </div>
          ) : (
            filteredProperties.map((property) => (
              <div 
                key={property.property_id} 
                className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 transition-all hover:shadow-md group cursor-pointer" 
                onClick={() => navigate(`/customer/properties/${property.property_id}`)}
              >
                {/* Image Container (Large on Desktop) */}
                <div className="h-[240px] xl:w-[360px] shrink-0 relative rounded-[16px] overflow-hidden bg-[#FAF8F3] flex items-center justify-center">
                  <img 
                    src={property.image_url ? resolveMediaUrl(property.image_url) : PropVilla} 
                    alt={property.property_type} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={getDisplayStatus(property)} />
                  </div>
                  {property.total_photos > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <ImageIcon size={12} /> {property.total_photos} Photos
                    </div>
                  )}
                </div>

                {/* Property Information Container */}
                <div className="flex flex-col flex-1 py-1 xl:flex-row xl:justify-between">
                  
                  {/* Middle Content */}
                  <div className="flex flex-col flex-1 pr-6">
                    <div className="text-[10px] font-bold text-[#B8860B] uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                      <span>{property.property_type}</span>
                      <span className="w-1 h-1 rounded-full bg-[#B8860B]/50"></span>
                      <span>{property.property_use}</span>
                    </div>
                    
                    <h3 className="text-2xl font-serif font-bold text-[#1a2b25] mb-2">
                      {property.property_type} in {property.society}
                    </h3>

                    <div className="flex items-center gap-1.5 mb-4 text-sm font-medium text-gray-500">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{[property.society, property.city, property.province].filter(Boolean).join(', ')}</span>
                    </div>

                    {/* Horizontal Specs Row */}
                    <div className="flex flex-wrap items-center gap-4 text-[13px] font-semibold text-gray-600 mb-5 border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Maximize size={16} className="text-gray-400" />
                        {property.property_size} {property.size_uom}
                      </div>
                      {property.rooms > 0 && (
                        <>
                          <div className="w-[1px] h-4 bg-gray-200"></div>
                          <div className="flex items-center gap-1.5">
                            <Home size={16} className="text-gray-400" />
                            {property.rooms} {property.property_type === 'Commercial' ? 'Rooms' : 'Bedrooms'}
                          </div>
                        </>
                      )}
                      {property.bathrooms > 0 && (
                        <>
                          <div className="w-[1px] h-4 bg-gray-200"></div>
                          <div className="flex items-center gap-1.5">
                            <Home size={16} className="text-gray-400" />
                            {property.bathrooms} Bathrooms
                          </div>
                        </>
                      )}
                      {property.floors > 0 && (
                        <>
                          <div className="w-[1px] h-4 bg-gray-200"></div>
                          <div className="flex items-center gap-1.5">
                            <List size={16} className="text-gray-400" />
                            {property.floors} Floors
                          </div>
                        </>
                      )}
                    </div>

                    <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-2xl">
                      {property.property_description || ''}
                    </p>
                  </div>
                  
                  {/* Right Actions Area */}
                  <div className="flex flex-col justify-between items-end shrink-0 w-full xl:w-[160px] mt-6 xl:mt-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1 text-gray-400 hover:text-gray-700 transition-colors hidden xl:block"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    
                    <div className="flex xl:flex-col gap-3 w-full mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/properties/${property.property_id}`);
                        }}
                        className="flex-1 xl:flex-none w-full px-4 py-2.5 rounded-xl bg-[#1a2b25] text-[13px] font-bold text-white hover:bg-[#2c4232] transition-colors flex items-center justify-center gap-2"
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/properties/${property.property_id}/edit`);
                        }}
                        className="flex-1 xl:flex-none w-full px-4 py-2.5 rounded-xl border border-[#B8860B] text-[13px] font-bold text-[#B8860B] hover:bg-[#faf7f2] transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} /> Edit Property
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
          
          {!loading && !error && filteredProperties.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-[24px] border border-dashed border-gray-200 shadow-sm">
              <Home size={64} className="text-gray-200 mb-6" />
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">No properties found</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md">
                We couldn't find any properties matching your current search criteria. Please adjust your filters or add a new property.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerPropertiesList;
