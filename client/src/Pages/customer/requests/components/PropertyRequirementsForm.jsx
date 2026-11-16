import React, { useState, useEffect } from 'react';
import { MapPin, Info } from 'lucide-react';
import { getPropertyFormReference, getCities, getSocieties, getAreas } from '../../../../Services/customer.services';

const PropertyRequirementsForm = ({ formData, setFormData, errors, purpose }) => {
  const [refData, setRefData] = useState({
    propertyTypes: [],
    uoms: []
  });
  
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [isLoadingSocieties, setIsLoadingSocieties] = useState(false);
  const [areas, setAreas] = useState([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  // Fetch reference metadata and global cities on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      setIsLoadingCities(true);
      try {
        const [refRes, citiesRes] = await Promise.all([
          getPropertyFormReference(),
          getCities()
        ]);
        if (isMounted) {
          if (refRes?.success && refRes.data) {
            setRefData({
              propertyTypes: refRes.data.propertyTypes || [],
              uoms: refRes.data.uom || []
            });
          }
          if (citiesRes?.success && citiesRes.data) {
            setCities(citiesRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial property requirements reference data", err);
      } finally {
        if (isMounted) setIsLoadingCities(false);
      }
    };
    fetchInitialData();
    return () => { isMounted = false; };
  }, []);

  const reqs = formData.requirements || {};

  // Fetch societies whenever preferred city changes
  useEffect(() => {
    if (!reqs.cityId) {
      setSocieties([]);
      setAreas([]);
      return;
    }
    let isMounted = true;
    const fetchSocieties = async () => {
      setIsLoadingSocieties(true);
      try {
        const res = await getSocieties(reqs.cityId);
        if (isMounted && res?.success && res.data) {
          setSocieties(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch societies for selected city", err);
      } finally {
        if (isMounted) setIsLoadingSocieties(false);
      }
    };
    fetchSocieties();
    return () => { isMounted = false; };
  }, [reqs.cityId]);

  // Fetch areas whenever preferred society changes
  useEffect(() => {
    if (!reqs.societyId) {
      setAreas([]);
      return;
    }
    let isMounted = true;
    const fetchAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const res = await getAreas(reqs.societyId);
        if (isMounted && res?.success && res.data) {
          setAreas(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch areas for selected society", err);
      } finally {
        if (isMounted) setIsLoadingAreas(false);
      }
    };
    fetchAreas();
    return () => { isMounted = false; };
  }, [reqs.societyId]);

  // Whenever a field changes, update formData.requirements
  const handleChange = (field, value, labelField = null, labelValue = null) => {
    setFormData(prev => {
      const newReqs = { ...prev.requirements, [field]: value };
      if (labelField) {
        newReqs[labelField] = labelValue;
      }
      return { ...prev, requirements: newReqs };
    });
  };

  const isPurchase = purpose?.toLowerCase() === 'purchase';
  const helperText = isPurchase 
    ? "Help us find the right property to buy." 
    : "Help us find the right property to lease.";
  
  const budgetLabel = isPurchase ? "Purchase Budget (PKR)" : "Lease Budget (PKR)";

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <p className="text-sm font-medium text-blue-800">{helperText}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Property Type */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-bold text-gray-800">
            Preferred Property Type <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
          </label>
          <select
            value={reqs.propertyTypeId || ""}
            onChange={(e) => {
              const selected = refData.propertyTypes.find(pt => String(pt.property_type_id) === e.target.value);
              handleChange('propertyTypeId', e.target.value, 'propertyTypeLabel', selected ? selected.property_type_description : "");
            }}
            className="w-full p-4 rounded-xl border border-gray-200 outline-none bg-white text-sm focus:border-[#B8860B] focus:ring-[#B8860B]"
          >
            <option value="">Select Property Type</option>
            {refData.propertyTypes.map(pt => (
              <option key={pt.property_type_id} value={pt.property_type_id}>{pt.property_type_description}</option>
            ))}
          </select>
        </div>

        {/* Location Section */}
        <div className="space-y-4 md:col-span-2 border border-gray-100 p-6 rounded-2xl bg-gray-50/30">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <MapPin size={16} className="text-[#B8860B]" />
            Location Preferences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preferred City */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">
                Preferred City <span className="text-red-500">*</span>
              </label>
              <select 
                value={reqs.cityId || ""}
                onChange={(e) => {
                  const selected = cities.find(c => String(c.city_id) === e.target.value);
                  handleChange('cityId', e.target.value, 'cityLabel', selected ? (selected.city_english || selected.city_name) : "");
                  handleChange('societyId', '', 'societyLabel', '');
                  handleChange('areaId', '', 'areaLabel', '');
                }}
                className={`w-full p-3 rounded-xl border ${errors.city ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              >
                <option value="">{isLoadingCities ? "Loading cities..." : "Select City"}</option>
                {cities.map(c => (
                  <option key={c.city_id} value={c.city_id}>{c.city_english || c.city_name}</option>
                ))}
              </select>
              {errors.city && <p className="text-sm text-red-500 font-semibold mt-1">{errors.city}</p>}
            </div>
            
            {/* Preferred Society */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">
                Preferred Society <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
              </label>
              <select 
                disabled={!reqs.cityId}
                value={reqs.societyId || ""}
                onChange={(e) => {
                  const selected = societies.find(s => String(s.society_id) === e.target.value);
                  handleChange('societyId', e.target.value, 'societyLabel', selected ? (selected.society_english || selected.society_name) : "");
                  handleChange('areaId', '', 'areaLabel', '');
                }}
                className={`w-full p-3 rounded-xl border border-gray-200 outline-none text-sm transition-colors ${!reqs.cityId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white focus:border-[#B8860B]'}`}
              >
                <option value="">{isLoadingSocieties ? "Loading societies..." : (!reqs.cityId ? "Select City first" : "Select Society")}</option>
                {societies.map(s => (
                  <option key={s.society_id} value={s.society_id}>{s.society_english || s.society_name}</option>
                ))}
              </select>
            </div>

            {/* Preferred Area */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">
                Preferred Area <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
              </label>
              <select 
                disabled={!reqs.societyId}
                value={reqs.areaId || ""}
                onChange={(e) => {
                  const selected = areas.find(a => String(a.area_id) === e.target.value);
                  handleChange('areaId', e.target.value, 'areaLabel', selected ? (selected.area_english || selected.area_name) : "");
                }}
                className={`w-full p-3 rounded-xl border border-gray-200 outline-none text-sm transition-colors ${!reqs.societyId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white focus:border-[#B8860B]'}`}
              >
                <option value="">{isLoadingAreas ? "Loading areas..." : (!reqs.societyId ? "Select Society first" : "Select Area")}</option>
                {areas.map(a => (
                  <option key={a.area_id} value={a.area_id}>{a.area_english || a.area_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-4 md:col-span-2 border border-gray-100 p-6 rounded-2xl bg-gray-50/30">
          <h4 className="text-sm font-bold text-gray-800">
            {budgetLabel}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Minimum Budget <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                value={reqs.minBudget || ""}
                onChange={(e) => handleChange('minBudget', e.target.value)}
                placeholder="e.g. 5000000"
                className={`w-full p-3 rounded-xl border ${errors.budget ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Maximum Budget <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                value={reqs.maxBudget || ""}
                onChange={(e) => handleChange('maxBudget', e.target.value)}
                placeholder="e.g. 15000000"
                className={`w-full p-3 rounded-xl border ${errors.budget ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              />
            </div>
          </div>
          {errors.budget && <p className="text-sm text-red-500 font-semibold mt-1">{errors.budget}</p>}
        </div>

        {/* Size */}
        <div className="space-y-4 md:col-span-2 border border-gray-100 p-6 rounded-2xl bg-gray-50/30">
          <h4 className="text-sm font-bold text-gray-800">
            Size Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Minimum Size <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                value={reqs.minSize || ""}
                onChange={(e) => handleChange('minSize', e.target.value)}
                placeholder="e.g. 5"
                className={`w-full p-3 rounded-xl border ${errors.size ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Maximum Size <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                value={reqs.maxSize || ""}
                onChange={(e) => handleChange('maxSize', e.target.value)}
                placeholder="e.g. 10"
                className={`w-full p-3 rounded-xl border ${errors.size ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                Size Unit {(reqs.minSize || reqs.maxSize) ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>}
              </label>
              <select
                value={reqs.sizeUomId || ""}
                onChange={(e) => {
                  const selected = refData.uoms.find(u => String(u.uom_id) === e.target.value);
                  handleChange('sizeUomId', e.target.value, 'sizeUomLabel', selected ? selected.uom_english : "");
                }}
                className={`w-full p-3 rounded-xl border ${errors.sizeUomId ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#B8860B]'} outline-none bg-white text-sm`}
              >
                <option value="">Select Unit</option>
                {refData.uoms.map(u => (
                  <option key={u.uom_id} value={u.uom_id}>{u.uom_english}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.size && <p className="text-sm text-red-500 font-semibold mt-1">{errors.size}</p>}
          {errors.sizeUomId && <p className="text-sm text-red-500 font-semibold mt-1">{errors.sizeUomId}</p>}
        </div>

        {/* Rooms / Bathrooms */}
        <div className="space-y-4 md:col-span-2 border border-gray-100 p-6 rounded-2xl bg-gray-50/30">
          <h4 className="text-sm font-bold text-gray-800">
            Rooms & Bathrooms
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Minimum Rooms <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                step="1"
                value={reqs.minRooms || ""}
                onChange={(e) => handleChange('minRooms', e.target.value)}
                placeholder="e.g. 3"
                className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white text-sm focus:border-[#B8860B]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Minimum Bathrooms <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <input
                type="number"
                min="0"
                step="1"
                value={reqs.minBathrooms || ""}
                onChange={(e) => handleChange('minBathrooms', e.target.value)}
                placeholder="e.g. 2"
                className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white text-sm focus:border-[#B8860B]"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyRequirementsForm;
