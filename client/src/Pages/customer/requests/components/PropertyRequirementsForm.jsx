import React, { useState, useEffect } from 'react';
import { MapPin, Info, AlertTriangle } from 'lucide-react';
import { getPropertyFormReference, getCities, getSocieties, getAreas } from '../../../../Services/customer.services';

const PropertyRequirementsForm = ({ formData, setFormData, errors, purpose }) => {
  const [refData, setRefData] = useState({
    propertyTypes: [],
    uoms: []
  });
  
  // We mock the loading of cities/societies/areas, but cities is blocked
  // societies/areas require cityId, so they remain empty/disabled for now.
  const [societies, setSocieties] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const fetchRef = async () => {
      try {
        const res = await getPropertyFormReference();
        if (res?.success && res.data) {
          setRefData({
            propertyTypes: res.data.propertyTypes || [],
            uoms: res.data.uom || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch property form reference", err);
      }
    };
    fetchRef();
  }, []);

  // Whenever a field changes, we update the formData.requirements
  const handleChange = (field, value, labelField = null, labelValue = null) => {
    setFormData(prev => {
      const newReqs = { ...prev.requirements, [field]: value };
      if (labelField) {
        newReqs[labelField] = labelValue;
      }
      return { ...prev, requirements: newReqs };
    });
  };

  const reqs = formData.requirements || {};
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
          <label className="block text-sm font-bold text-gray-800">Preferred Property Type <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
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
            <MapPin size={16} className="text-gray-500" />
            Location Preferences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">Preferred City <span className="text-red-500">*</span></label>
              <select disabled className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed">
                <option value="">Select City</option>
              </select>
              <p className="text-xs text-orange-600 font-medium mt-1">City selection will be available once the global city lookup is connected.</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">Preferred Society <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <select 
                disabled 
                value={reqs.societyId || ""}
                onChange={(e) => {
                   const opt = e.target.options[e.target.selectedIndex];
                   handleChange('societyId', e.target.value, 'societyLabel', opt.text);
                   handleChange('areaId', '', 'areaLabel', ''); // clear area
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
              >
                <option value="">Select Society</option>
                {societies.map(s => (
                   <option key={s.society_id} value={s.society_id}>{s.society_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-800">Preferred Area <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
              <select 
                disabled
                value={reqs.areaId || ""}
                onChange={(e) => {
                   const opt = e.target.options[e.target.selectedIndex];
                   handleChange('areaId', e.target.value, 'areaLabel', opt.text);
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 cursor-not-allowed"
              >
                <option value="">Select Area</option>
                {areas.map(a => (
                   <option key={a.area_id} value={a.area_id}>{a.area_name}</option>
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
                onChange={(e) => handleChange('sizeUomId', e.target.value)}
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
