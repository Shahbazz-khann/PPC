import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, ChevronRight, ChevronLeft, MapPin, 
  Home, Maximize, List, Image as ImageIcon, Video, 
  X, UploadCloud, FileText, CheckSquare, Plus
} from 'lucide-react';
import { 
  PROPERTY_TYPES, PROPERTY_USES, PROPERTY_LOCATIONS,
  COUNTRIES, PROVINCES, CITIES, DISTRICTS, TEHSILS, SOCIETIES, 
  SIZE_UOM, MARLA_SIZES, AMENITIES
} from '../mockPropertyData';

const STEPS = [
  { id: 1, title: 'Classification', icon: Home },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Size & Area', icon: Maximize },
  { id: 4, title: 'Particulars', icon: List },
  { id: 5, title: 'Features', icon: CheckSquare },
  { id: 6, title: 'Media', icon: ImageIcon },
  { id: 7, title: 'Review', icon: FileText }
];

const BACKUP_TYPES = ['None', 'UPS', 'Generator', 'Solar', 'UPS + Generator', 'Other'];

// Move components outside to prevent React remounting them on every render, which loses focus.
const InputField = ({ label, name, value, onChange, error, type = "text", required, placeholder, isNumber }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={isNumber ? "0" : undefined}
      className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50`}
    />
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required, error }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50`}
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const TagInput = ({ label, tags, suggestions, onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = (value = inputValue) => {
    const trimmed = value.trim();
    if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onAdd(trimmed);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eaf1ec] border border-[#1E5631]/20 rounded-lg text-sm font-semibold text-[#1E5631]">
            {tag}
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-red-600 transition-colors">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Type and press Enter to add..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold text-gray-800 bg-gray-50/50 pr-12"
          />
          <button 
            type="button" 
            onClick={() => addTag()} 
            className="absolute right-2 p-1.5 bg-gray-100 text-gray-600 hover:bg-[#B8860B] hover:text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PropertyForm = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    propertyUse: '',
    
    country: 'Pakistan',
    province: '',
    district: '',
    tehsil: '',
    city: '',
    society: '',
    area: '',
    propertyLocation: '',
    
    propertySize: '',
    sizeUom: '',
    marlaSize: '',
    areaMarla: '',
    areaKanal: '',
    areaAcre: '',
    areaSqFt: '',
    areaSqYard: '',
    coveredAreaSqFt: '',
    openAreaSqFt: '',
    
    roadFrontFt: '',
    roadLeftFt: '',
    roadRightFt: '',
    roadBackFt: '',
    
    rooms: 0,
    bathrooms: 0,
    floors: 0,
    lounges: 0,
    kitchens: 0,
    drawingRooms: 0,
    
    swimmingPool: false,
    mediaRoom: false,
    solarInstalled: false,
    solarCapacity: '',
    electricMeters: 0,
    gasMeters: 0,
    electricityBackup: 'None',
    otherBackup: '',
    
    amenities: [],
    additionalFeatures: [],
    media: { pictures: [], videos: [] }
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.propertyType) { newErrors.propertyType = 'Required'; isValid = false; }
      if (!formData.propertyUse) { newErrors.propertyUse = 'Required'; isValid = false; }
    }
    if (step === 2) {
      if (!formData.district) { newErrors.district = 'Required'; isValid = false; }
    }
    if (step === 3) {
      if (!formData.propertySize || formData.propertySize <= 0) { newErrors.propertySize = 'Must be greater than 0'; isValid = false; }
      if (!formData.sizeUom) { newErrors.sizeUom = 'Required'; isValid = false; }
      if (formData.coveredAreaSqFt && formData.coveredAreaSqFt < 0) { newErrors.coveredAreaSqFt = 'Cannot be negative'; isValid = false; }
      if (formData.openAreaSqFt && formData.openAreaSqFt < 0) { newErrors.openAreaSqFt = 'Cannot be negative'; isValid = false; }
    }
    if (step === 4) {
      ['rooms', 'bathrooms', 'floors', 'lounges', 'kitchens', 'drawingRooms', 'roadFrontFt', 'roadLeftFt', 'roadRightFt', 'roadBackFt'].forEach(field => {
        if (formData[field] && formData[field] < 0) {
          newErrors[field] = 'Cannot be negative';
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const nextState = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      // Cascading clear for Location fields based on specific hierarchy
      if (name === 'country') {
        nextState.province = ''; nextState.district = ''; nextState.tehsil = ''; nextState.city = ''; nextState.society = ''; nextState.area = '';
      }
      if (name === 'province') {
        nextState.district = ''; nextState.tehsil = ''; nextState.city = ''; nextState.society = ''; nextState.area = '';
      }
      if (name === 'district') {
        nextState.tehsil = ''; nextState.city = ''; nextState.society = ''; nextState.area = '';
      }
      if (name === 'tehsil') {
        nextState.city = ''; nextState.society = ''; nextState.area = '';
      }
      if (name === 'city') {
        nextState.society = ''; nextState.area = '';
      }
      if (name === 'society') {
        nextState.area = '';
      }

      return nextState;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddTag = (listName, tag) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], tag]
    }));
  };

  const handleRemoveTag = (listName, tag) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    
    const newPics = validImages.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      media: { ...prev.media, pictures: [...prev.media.pictures, ...newPics] }
    }));
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validVideos = files.filter(f => f.type.startsWith('video/') && f.size <= 50 * 1024 * 1024);
    
    const newVids = validVideos.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      media: { ...prev.media, videos: [...prev.media.videos, ...newVids] }
    }));
  };

  const removeMedia = (type, index) => {
    setFormData(prev => {
      const newMedia = { 
        ...prev.media,
        [type]: [...prev.media[type]]
      };
      
      const item = newMedia[type][index];
      if (item && typeof item === 'object' && item.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      
      newMedia[type].splice(index, 1);
      return { ...prev, media: newMedia };
    });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar Stepper */}
      <div className="w-full md:w-64 bg-[#FAF8F3] border-b md:border-b-0 md:border-r border-gray-100 p-6 sm:p-8 shrink-0">
        <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-8">
          {isEditMode ? 'Edit Property' : 'Add Property'}
        </h2>
        <div className="flex flex-row md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 shrink-0 md:shrink transition-opacity ${isActive ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  isActive ? 'bg-[#1a2b25] border-[#1a2b25] text-white' :
                  isCompleted ? 'bg-[#eaf1ec] border-[#eaf1ec] text-[#1E5631]' : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : step.id}
                </div>
                <span className={`text-sm font-bold hidden sm:block ${isActive ? 'text-[#1a2b25]' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 flex flex-col min-h-[500px]">
        <div className="p-6 sm:p-10 flex-1">
          <h3 className="text-2xl font-serif font-bold text-[#1a2b25] mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
            {React.createElement(STEPS[currentStep-1].icon, { size: 24, className: "text-[#B8860B]" })}
            {STEPS[currentStep-1].title}
          </h3>

          <div className="space-y-6">
            
            {/* STEP 1: CLASSIFICATION */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
                <SelectField label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={PROPERTY_TYPES} error={errors.propertyType} required />
                <SelectField label="Property Use" name="propertyUse" value={formData.propertyUse} onChange={handleChange} options={PROPERTY_USES} error={errors.propertyUse} required />
              </div>
            )}

            {/* STEP 2: LOCATION */}
            {currentStep === 2 && (
              <div className="animate-fadeIn space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={COUNTRIES} />
                  <SelectField label="Province" name="province" value={formData.province} onChange={handleChange} options={PROVINCES} />
                  
                  <SelectField label="District" name="district" value={formData.district} onChange={handleChange} options={formData.province ? ['Lahore District', 'Karachi South', 'Islamabad District'] : []} error={errors.district} required />
                  <SelectField label="Tehsil" name="tehsil" value={formData.tehsil} onChange={handleChange} options={formData.district ? TEHSILS[formData.district] || [] : []} />
                  
                  <SelectField label="City" name="city" value={formData.city} onChange={handleChange} options={formData.province ? CITIES[formData.province] || [] : []} />
                  <SelectField label="Society" name="society" value={formData.society} onChange={handleChange} options={formData.tehsil ? SOCIETIES[formData.tehsil] || [] : []} />
                  
                  <InputField label="Area / Block" name="area" value={formData.area} onChange={handleChange} placeholder="e.g. Sector W" />
                  <SelectField label="Property Location Type" name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} options={PROPERTY_LOCATIONS} />
                </div>
              </div>
            )}

            {/* STEP 3: SIZE & AREA */}
            {currentStep === 3 && (
              <div className="animate-fadeIn space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <InputField label="Primary Size" name="propertySize" value={formData.propertySize} onChange={handleChange} error={errors.propertySize} type="number" isNumber required placeholder="e.g. 10" />
                  <SelectField label="Size UOM" name="sizeUom" value={formData.sizeUom} onChange={handleChange} error={errors.sizeUom} options={SIZE_UOM} required />
                  <SelectField label="Marla Size" name="marlaSize" value={formData.marlaSize} onChange={handleChange} options={MARLA_SIZES} />
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">Calculated Total Areas</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <InputField label="Area (Marla)" name="areaMarla" value={formData.areaMarla} onChange={handleChange} type="number" isNumber />
                    <InputField label="Area (Kanal)" name="areaKanal" value={formData.areaKanal} onChange={handleChange} type="number" isNumber />
                    <InputField label="Area (Acre)" name="areaAcre" value={formData.areaAcre} onChange={handleChange} type="number" isNumber />
                    <InputField label="Area (Sq Ft)" name="areaSqFt" value={formData.areaSqFt} onChange={handleChange} type="number" isNumber />
                    <InputField label="Area (Sq Yard)" name="areaSqYard" value={formData.areaSqYard} onChange={handleChange} type="number" isNumber />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">Construction Areas</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InputField label="Covered Area (Sq Ft)" name="coveredAreaSqFt" value={formData.coveredAreaSqFt} onChange={handleChange} error={errors.coveredAreaSqFt} type="number" isNumber />
                    <InputField label="Open Area (Sq Ft)" name="openAreaSqFt" value={formData.openAreaSqFt} onChange={handleChange} error={errors.openAreaSqFt} type="number" isNumber />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PARTICULARS */}
            {currentStep === 4 && (
              <div className="animate-fadeIn space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rooms & Sections</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    <InputField label="Rooms" name="rooms" value={formData.rooms} onChange={handleChange} error={errors.rooms} type="number" isNumber />
                    <InputField label="Bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} error={errors.bathrooms} type="number" isNumber />
                    <InputField label="Floors" name="floors" value={formData.floors} onChange={handleChange} error={errors.floors} type="number" isNumber />
                    <InputField label="Lounges" name="lounges" value={formData.lounges} onChange={handleChange} error={errors.lounges} type="number" isNumber />
                    <InputField label="Kitchens" name="kitchens" value={formData.kitchens} onChange={handleChange} error={errors.kitchens} type="number" isNumber />
                    <InputField label="Drawing Rooms" name="drawingRooms" value={formData.drawingRooms} onChange={handleChange} error={errors.drawingRooms} type="number" isNumber />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Road / Access Dimensions (ft)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <InputField label="Front Road" name="roadFrontFt" value={formData.roadFrontFt} onChange={handleChange} error={errors.roadFrontFt} type="number" isNumber />
                    <InputField label="Back Road" name="roadBackFt" value={formData.roadBackFt} onChange={handleChange} error={errors.roadBackFt} type="number" isNumber />
                    <InputField label="Left Road" name="roadLeftFt" value={formData.roadLeftFt} onChange={handleChange} error={errors.roadLeftFt} type="number" isNumber />
                    <InputField label="Right Road" name="roadRightFt" value={formData.roadRightFt} onChange={handleChange} error={errors.roadRightFt} type="number" isNumber />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: FEATURES */}
            {currentStep === 5 && (
              <div className="animate-fadeIn space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <input type="checkbox" id="swimmingPool" name="swimmingPool" checked={formData.swimmingPool} onChange={handleChange} className="w-5 h-5 accent-[#1a2b25] rounded" />
                    <label htmlFor="swimmingPool" className="text-sm font-semibold text-gray-800 cursor-pointer">Swimming Pool</label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <input type="checkbox" id="mediaRoom" name="mediaRoom" checked={formData.mediaRoom} onChange={handleChange} className="w-5 h-5 accent-[#1a2b25] rounded" />
                    <label htmlFor="mediaRoom" className="text-sm font-semibold text-gray-800 cursor-pointer">Media Room</label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <input type="checkbox" id="solarInstalled" name="solarInstalled" checked={formData.solarInstalled} onChange={handleChange} className="w-5 h-5 accent-[#1a2b25] rounded" />
                    <label htmlFor="solarInstalled" className="text-sm font-semibold text-gray-800 cursor-pointer">Solar Installed</label>
                  </div>
                  {formData.solarInstalled && (
                    <InputField label="Solar Capacity (e.g. 10kW)" name="solarCapacity" value={formData.solarCapacity} onChange={handleChange} />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                  <InputField label="Electric Meters" name="electricMeters" value={formData.electricMeters} onChange={handleChange} type="number" isNumber />
                  <InputField label="Gas Meters" name="gasMeters" value={formData.gasMeters} onChange={handleChange} type="number" isNumber />
                  <SelectField label="Electricity Backup" name="electricityBackup" value={formData.electricityBackup} onChange={handleChange} options={BACKUP_TYPES} />
                  {formData.electricityBackup === 'Other' && (
                    <InputField label="Specify Other Backup" name="otherBackup" value={formData.otherBackup} onChange={handleChange} />
                  )}
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <TagInput 
                    label="Amenities" 
                    tags={formData.amenities} 
                    suggestions={AMENITIES}
                    onAdd={(tag) => handleAddTag('amenities', tag)} 
                    onRemove={(tag) => handleRemoveTag('amenities', tag)} 
                  />
                </div>

                <div className="pt-4 border-t border-gray-50">
                  <TagInput 
                    label="Additional Features" 
                    tags={formData.additionalFeatures} 
                    suggestions={['Double Glazed Windows', 'Central Heating', 'Parking Space', 'Smart Home System']}
                    onAdd={(tag) => handleAddTag('additionalFeatures', tag)} 
                    onRemove={(tag) => handleRemoveTag('additionalFeatures', tag)} 
                  />
                </div>
              </div>
            )}

            {/* STEP 6: MEDIA */}
            {currentStep === 6 && (
              <div className="animate-fadeIn space-y-8">
                {/* Pictures */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><ImageIcon size={16} className="text-[#B8860B]"/> Property Pictures</h4>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-semibold text-gray-500 block">Max 5MB per image. JPG, PNG only.</span>
                      <span className="text-[11px] font-medium text-gray-400">Upload good quality pictures with proper lighting.</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.media.pictures.map((pic, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={pic.url || pic} alt="Property" className="w-full h-full object-cover" />
                        <button onClick={() => removeMedia('pictures', idx)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#B8860B] hover:text-[#B8860B] transition-colors bg-gray-50/50">
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-xs font-bold uppercase">Add Photo</span>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  </div>
                </div>

                {/* Videos */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Video size={16} className="text-[#B8860B]"/> Property Videos</h4>
                    <span className="text-xs font-semibold text-gray-400">Max 50MB per video</span>
                  </div>

                  <div className="space-y-3">
                    {formData.media.videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-[#eef2f9] text-[#4d70a3] rounded-lg flex items-center justify-center shrink-0">
                            <Video size={18} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 truncate">{vid.name || `Video ${idx+1}`}</span>
                        </div>
                        <button onClick={() => removeMedia('videos', idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => videoInputRef.current?.click()} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-[#B8860B] hover:text-[#B8860B] transition-colors bg-white">
                      <UploadCloud size={18} /> Upload Video
                    </button>
                    <input type="file" ref={videoInputRef} className="hidden" accept="video/*" multiple onChange={handleVideoUpload} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW */}
            {currentStep === 7 && (
              <div className="animate-fadeIn space-y-6">
                
                <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#e4d7be]">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-serif font-bold text-[#1a2b25]">Basic Information</h4>
                    <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-[#B8860B] hover:underline uppercase tracking-wider">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 text-sm">
                    <div><span className="text-gray-400 block mb-1">Type</span><span className="font-semibold text-gray-800">{formData.propertyType}</span></div>
                    <div><span className="text-gray-400 block mb-1">Use</span><span className="font-semibold text-gray-800">{formData.propertyUse}</span></div>
                    <div><span className="text-gray-400 block mb-1">Location</span><span className="font-semibold text-gray-800">{formData.society || formData.district || 'N/A'}</span></div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-serif font-bold text-[#1a2b25]">Detailed Breakdown</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-sm">
                    <div><span className="text-gray-400 block mb-1">Size</span><span className="font-semibold text-gray-800">{formData.propertySize} {formData.sizeUom}</span></div>
                    <div><span className="text-gray-400 block mb-1">Rooms</span><span className="font-semibold text-gray-800">{formData.rooms || 0}</span></div>
                    <div><span className="text-gray-400 block mb-1">Baths</span><span className="font-semibold text-gray-800">{formData.bathrooms || 0}</span></div>
                    <div><span className="text-gray-400 block mb-1">Floors</span><span className="font-semibold text-gray-800">{formData.floors || 0}</span></div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                    {formData.swimmingPool && <span className="px-3 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600">Swimming Pool</span>}
                    {formData.solarInstalled && <span className="px-3 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600">Solar ({formData.solarCapacity})</span>}
                    {formData.amenities.map(a => <span key={a} className="px-3 py-1 bg-[#eaf1ec] rounded-md text-xs font-semibold text-[#1E5631]">{a}</span>)}
                    {formData.additionalFeatures.map(a => <span key={a} className="px-3 py-1 bg-[#f4f2ea] rounded-md text-xs font-semibold text-[#B8860B]">{a}</span>)}
                  </div>
                </div>
                
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#fcfbfa] border-t border-gray-100 flex items-center justify-between rounded-br-[24px]">
          <button 
            onClick={currentStep === 1 ? onCancel : handlePrev}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {currentStep < STEPS.length ? (
            <button 
              onClick={handleNext}
              className="px-8 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#2c4232] transition-colors flex items-center gap-2"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button 
              onClick={() => onSubmit(formData)}
              className="px-8 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#d4af37] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(184,134,11,0.3)] hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> {isEditMode ? 'Save Changes' : 'Register Property'}
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default PropertyForm;
