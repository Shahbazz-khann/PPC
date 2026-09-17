import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, ChevronRight, ChevronLeft, MapPin,
  Home, Maximize, List, Image as ImageIcon, Video,
  X, UploadCloud, FileText, CheckSquare, Plus
} from 'lucide-react';
import { getPropertyFormReference, getCities, getSocieties, getAreas } from '../../../../Services/customer.services';

const STEPS = [
  { id: 1, title: 'Classification', icon: Home },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Size & Area', icon: Maximize },
  { id: 4, title: 'Particulars', icon: List },
  { id: 5, title: 'Features and Amenities', icon: CheckSquare },
  { id: 6, title: 'Pictures and Videos', icon: ImageIcon },
  { id: 7, title: 'Review', icon: FileText }
];



// Move components outside to prevent React remounting them on every render, which loses focus.
const InputField = ({ label, name, value, onChange, error, type = "text", required, placeholder, isNumber, disabled }) => (
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
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold ${disabled ? 'text-gray-500 bg-gray-100 cursor-not-allowed opacity-70' : 'text-gray-800 bg-gray-50/50'}`}
    />
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required, error, disabled }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold ${disabled ? 'text-gray-500 bg-gray-100 cursor-not-allowed opacity-70' : 'text-gray-800 bg-gray-50/50'}`}
    >
      <option value="">Select {label}</option>
      {options.map(opt => (
        typeof opt === 'object' && opt !== null
          ? <option key={opt.value} value={opt.value}>{opt.label}</option>
          : <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const TagInput = ({ label, tags, suggestions, onAdd, onRemove, disabled }) => {
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
          <span key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${disabled ? 'bg-gray-100 text-gray-500 border border-gray-200 opacity-70' : 'bg-[#eaf1ec] border border-[#1E5631]/20 text-[#1E5631]'}`}>
            {tag}
            {!disabled && (
              <button type="button" onClick={() => onRemove(tag)} className="hover:text-red-600 transition-colors">
                <X size={14} />
              </button>
            )}
          </span>
        ))}
        {tags.length === 0 && disabled && <span className="text-sm text-gray-400 italic">None</span>}
      </div>
      {!disabled && (
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
      )}
    </div>
  );
};

const AutocompleteField = ({ label, name, value, displayValue, onChange, fetchOptions, error, required, disabled, placeholder }) => {
  const [inputValue, setInputValue] = useState(displayValue || '');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(displayValue || '');
  }, [displayValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        // Revert to selected display value if clicked outside without selecting
        setInputValue(displayValue || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [displayValue]);

  // Debounced fetch
  useEffect(() => {
    if (!fetchOptions || !showSuggestions || disabled) return;

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await fetchOptions(inputValue);
        setOptions(results);
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, fetchOptions, showSuggestions, disabled]);

  const handleSelect = (opt) => {
    setInputValue(opt.label);
    setShowSuggestions(false);
    onChange({ target: { name, value: opt.value, label: opt.label } });
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    // Clear selection when typing
    if (value) {
      onChange({ target: { name, value: '', label: '' } });
    }
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={`${name}_input`}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        disabled={disabled}
        placeholder={placeholder || `Search ${label}...`}
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none transition-all text-sm font-semibold ${disabled ? 'text-gray-500 bg-gray-100 cursor-not-allowed opacity-70' : 'text-gray-800 bg-gray-50/50'}`}
      />
      {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}

      {showSuggestions && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto top-[70px]">
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center font-semibold">Loading...</div>
          ) : options.length > 0 ? (
            options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </button>
            ))
          ) : inputValue ? (
            <div className="p-3 text-sm text-gray-500 text-center">No results found</div>
          ) : (
            <div className="p-3 text-sm text-gray-400 text-center">Start typing to search...</div>
          )}
        </div>
      )}
    </div>
  );
};

const PropertyForm = ({ initialData, onSubmit, onCancel, isEditMode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    propertyUse: '',

    country: '',
    province: '',
    division: '',
    district: '',
    tehsil: '',
    city: '', cityLabel: '',
    society: '', societyLabel: '',
    area: '', areaLabel: '',
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

    propertySizeFront: '',
    propertySizeBack: '',
    propertySizeLeft: '',
    propertySizeRight: '',

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
    propertyDescription: '',

    amenities: [],
    media: { pictures: [], videos: [] }
  });

  const [errors, setErrors] = useState({});
  const [editingSection, setEditingSection] = useState(null);
  const [backupData, setBackupData] = useState(null);

  const [refData, setRefData] = useState({
    countries: [],
    provinces: [],
    divisions: [],
    districts: [],
    tehsils: [],
    propertyTypes: [],
    propertyUses: [],
    propertyLocations: [],
    uom: [],
    marlaSizes: [],
    amenities: [],
  });
  const [loadingRef, setLoadingRef] = useState(true);
  const [errorRef, setErrorRef] = useState(null);

  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const res = await getPropertyFormReference();
        if (res && res.success && res.data) {
          setRefData(res.data);

          // Auto-select Pakistan if present and country not set
          const pak = res.data.countries.find(c => c.country_english === 'Pakistan');
          if (pak && !formData.country) {
            setFormData(prev => ({ ...prev, country: pak.country_id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch reference data", err);
        setErrorRef('Failed to load reference data. Please check your connection and try again.');
      } finally {
        setLoadingRef(false);
      }
    };
    fetchRefData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [pictureErrors, setPictureErrors] = useState([]);
  const [videoErrors, setVideoErrors] = useState([]);

  // Backend-approved picture constraints
  const MAX_PICTURES = 6;
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_PICTURE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  // Backend-approved video constraints
  const MAX_VIDEOS = 1;
  const ALLOWED_VIDEO_MIME = 'video/mp4';
  const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

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
      ['propertySizeFront', 'propertySizeBack', 'propertySizeLeft', 'propertySizeRight'].forEach(field => {
        if (formData[field] !== '' && formData[field] !== undefined && formData[field] <= 0) {
          newErrors[field] = 'Must be greater than 0';
          isValid = false;
        }
      });
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

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    // step 1
    if (!formData.propertyType) { newErrors.propertyType = 'Required'; isValid = false; }
    if (!formData.propertyUse) { newErrors.propertyUse = 'Required'; isValid = false; }
    // step 2
    if (!formData.district) { newErrors.district = 'Required'; isValid = false; }
    // step 3
    if (!formData.propertySize || formData.propertySize <= 0) { newErrors.propertySize = 'Must be greater than 0'; isValid = false; }
    if (!formData.sizeUom) { newErrors.sizeUom = 'Required'; isValid = false; }
    if (formData.coveredAreaSqFt && formData.coveredAreaSqFt < 0) { newErrors.coveredAreaSqFt = 'Cannot be negative'; isValid = false; }
    if (formData.openAreaSqFt && formData.openAreaSqFt < 0) { newErrors.openAreaSqFt = 'Cannot be negative'; isValid = false; }
    ['propertySizeFront', 'propertySizeBack', 'propertySizeLeft', 'propertySizeRight'].forEach(field => {
      if (formData[field] !== '' && formData[field] !== undefined && formData[field] <= 0) {
        newErrors[field] = 'Must be greater than 0';
        isValid = false;
      }
    });
    // step 4
    ['rooms', 'bathrooms', 'floors', 'lounges', 'kitchens', 'drawingRooms', 'roadFrontFt', 'roadLeftFt', 'roadRightFt', 'roadBackFt'].forEach(field => {
      if (formData[field] && formData[field] < 0) {
        newErrors[field] = 'Cannot be negative';
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      setTimeout(() => {
        const errorEl = document.querySelector('.text-red-500');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    
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
    const { name, value, type, checked, label } = e.target;

    setFormData(prev => {
      const nextState = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (label !== undefined) {
        nextState[`${name}Label`] = label;
      }

      // Cascading clear for Location fields based on specific hierarchy
      if (name === 'country') {
        nextState.province = ''; nextState.division = ''; nextState.district = ''; nextState.tehsil = ''; nextState.city = ''; nextState.cityLabel = ''; nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'province') {
        nextState.division = ''; nextState.district = ''; nextState.tehsil = ''; nextState.city = ''; nextState.cityLabel = ''; nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'division') {
        nextState.district = ''; nextState.tehsil = ''; nextState.city = ''; nextState.cityLabel = ''; nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'district') {
        nextState.tehsil = ''; nextState.city = ''; nextState.cityLabel = ''; nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'tehsil') {
        nextState.city = ''; nextState.cityLabel = ''; nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'city') {
        nextState.society = ''; nextState.societyLabel = ''; nextState.area = ''; nextState.areaLabel = '';
      }
      if (name === 'society') {
        nextState.area = ''; nextState.areaLabel = '';
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
    const selectedFiles = Array.from(e.target.files);
    // Reset file input so same file can be re-selected after removal
    e.target.value = '';

    const currentCount = formData.media.pictures.length;
    const errors = [];
    const validFiles = [];

    for (const file of selectedFiles) {
      // Check total limit first
      if (currentCount + validFiles.length >= MAX_PICTURES) {
        errors.push(`Maximum ${MAX_PICTURES} pictures allowed per property. Skipped remaining files.`);
        break;
      }
      // MIME type check
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not supported. Use JPEG, PNG, or WebP only.`);
        continue;
      }
      // File size check
      if (file.size > MAX_PICTURE_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds 5 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setPictureErrors(errors);

    if (validFiles.length === 0) return;

    const newPics = validFiles.map(file => ({
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
    const validVideos = [];
    const errors = [];

    // Check count first
    if (formData.media.videos.length + files.length > MAX_VIDEOS) {
      errors.push(`Maximum ${MAX_VIDEOS} video is allowed.`);
    }

    files.forEach(file => {
      let isValid = true;
      if (file.type !== ALLOWED_VIDEO_MIME) {
        errors.push(`"${file.name}" is not supported. Only MP4 videos are allowed.`);
        isValid = false;
      } else if (file.size > MAX_VIDEO_SIZE_BYTES) {
        errors.push(`"${file.name}" exceeds the 50 MB size limit.`);
        isValid = false;
      }

      // Stop adding if we exceed the limit
      if (isValid && formData.media.videos.length + validVideos.length < MAX_VIDEOS) {
        validVideos.push(file);
      }
    });

    setVideoErrors(errors);

    if (validVideos.length > 0) {
      const newVids = validVideos.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      }));

      setFormData(prev => ({
        ...prev,
        media: { ...prev.media, videos: [...prev.media.videos, ...newVids] }
      }));
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
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

  const handleEditSection = (sectionId) => {
    setBackupData({ ...formData });
    setEditingSection(sectionId);
    setErrors({});
  };

  const handleCancelSection = () => {
    setFormData(backupData);
    setEditingSection(null);
    setBackupData(null);
    setErrors({});
  };

  const handleSaveSection = (sectionId) => {
    if (validateStep(sectionId)) {
      setEditingSection(null);
      setBackupData(null);
    }
  };

  const renderStep1 = (disabled) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${!disabled ? 'animate-fadeIn' : ''}`}>
      <SelectField label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={refData.propertyTypes.map(pt => ({ value: pt.property_type_id, label: pt.property_type_description }))} error={errors.propertyType} required disabled={disabled} />
      <SelectField label="Property Use" name="propertyUse" value={formData.propertyUse} onChange={handleChange} options={refData.propertyUses.map(u => ({ value: u.property_use_id, label: u.property_use_description }))} error={errors.propertyUse} required disabled={disabled} />
    </div>
  );

  const renderStep2 = (disabled) => (
    <div className={`space-y-6 ${!disabled ? 'animate-fadeIn' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <SelectField label="Country" name="country" value={formData.country} onChange={handleChange} options={refData.countries.map(c => ({ value: c.country_id, label: c.country_english }))} disabled={disabled} />
        <SelectField label="Province" name="province" value={formData.province} onChange={handleChange} options={refData.provinces.filter(p => p.country_id == formData.country).map(p => ({ value: p.province_id, label: p.province_english }))} disabled={disabled || !formData.country} />

        <SelectField label="Division" name="division" value={formData.division} onChange={handleChange} options={refData.divisions.filter(d => d.province_id == formData.province).map(d => ({ value: d.division_id, label: d.division_english }))} disabled={disabled || !formData.province} />
        <SelectField label="District" name="district" value={formData.district} onChange={handleChange} options={refData.districts.filter(d => d.division_id == formData.division).map(d => ({ value: d.district_id, label: d.district_english }))} error={errors.district} required disabled={disabled || !formData.division} />

        <SelectField label="Tehsil" name="tehsil" value={formData.tehsil} onChange={handleChange} options={refData.tehsils.filter(t => t.district_id == formData.district).map(t => ({ value: t.tehsil_id, label: t.tehsil_english }))} disabled={disabled || !formData.district} />
        <AutocompleteField
          label="City"
          name="city"
          value={formData.city}
          displayValue={formData.cityLabel}
          onChange={handleChange}
          fetchOptions={async (search) => {
            if (!formData.tehsil) return [];
            const res = await getCities(formData.tehsil, search);
            return (res?.data || []).map(c => ({ value: c.city_id, label: c.city_english }));
          }}
          disabled={disabled || !formData.tehsil}
          placeholder="Search City..."
        />

        <AutocompleteField
          label="Society"
          name="society"
          value={formData.society}
          displayValue={formData.societyLabel}
          onChange={handleChange}
          fetchOptions={async (search) => {
            if (!formData.city) return [];
            const res = await getSocieties(formData.city, search);
            return (res?.data || []).map(s => ({ value: s.society_id, label: s.society_english }));
          }}
          disabled={disabled || !formData.city}
          placeholder="Search Society..."
        />

        <AutocompleteField
          label="Area / Block"
          name="area"
          value={formData.area}
          displayValue={formData.areaLabel}
          onChange={handleChange}
          fetchOptions={async (search) => {
            if (!formData.society) return [];
            const res = await getAreas(formData.society, search);
            return (res?.data || []).map(a => ({ value: a.area_id, label: a.area_english }));
          }}
          disabled={disabled || !formData.society}
          placeholder="Search Area / Block..."
        />

        <SelectField label="Property Location Type" name="propertyLocation" value={formData.propertyLocation} onChange={handleChange} options={refData.propertyLocations.map(l => ({ value: l.property_location_id, label: l.property_location_description }))} disabled={disabled} />
      </div>
    </div>
  );

  const renderStep3 = (disabled) => (
    <div className={`space-y-6 ${!disabled ? 'animate-fadeIn' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InputField label="Primary Size" name="propertySize" value={formData.propertySize} onChange={handleChange} error={errors.propertySize} type="number" isNumber required placeholder="e.g. 10" disabled={disabled} />
        <SelectField label="Size UOM" name="sizeUom" value={formData.sizeUom} onChange={handleChange} error={errors.sizeUom} options={refData.uom.map(u => ({ value: u.uom_id, label: u.uom_english }))} required disabled={disabled} />
        <SelectField label="Marla Size" name="marlaSize" value={formData.marlaSize} onChange={handleChange} options={refData.marlaSizes.map(ms => ({ value: ms.marla_id, label: `${parseFloat(ms.marla_size_sqft)} Sq Ft` }))} disabled={disabled} />
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-bold text-gray-800 mb-4">Calculated Total Areas</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <InputField label="Area (Marla)" name="areaMarla" value={formData.areaMarla} onChange={handleChange} type="number" isNumber disabled={disabled} />
          <InputField label="Area (Kanal)" name="areaKanal" value={formData.areaKanal} onChange={handleChange} type="number" isNumber disabled={disabled} />
          <InputField label="Area (Acre)" name="areaAcre" value={formData.areaAcre} onChange={handleChange} type="number" isNumber disabled={disabled} />
          <InputField label="Area (Sq Ft)" name="areaSqFt" value={formData.areaSqFt} onChange={handleChange} type="number" isNumber disabled={disabled} />
          <InputField label="Area (Sq Yard)" name="areaSqYard" value={formData.areaSqYard} onChange={handleChange} type="number" isNumber disabled={disabled} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-bold text-gray-800 mb-4">Property Dimensions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField label="Property Size Front" name="propertySizeFront" value={formData.propertySizeFront} onChange={handleChange} error={errors.propertySizeFront} type="number" isNumber placeholder="e.g. 50" disabled={disabled} />
          <InputField label="Property Size Back" name="propertySizeBack" value={formData.propertySizeBack} onChange={handleChange} error={errors.propertySizeBack} type="number" isNumber placeholder="e.g. 50" disabled={disabled} />
          <InputField label="Property Size Left" name="propertySizeLeft" value={formData.propertySizeLeft} onChange={handleChange} error={errors.propertySizeLeft} type="number" isNumber placeholder="e.g. 90" disabled={disabled} />
          <InputField label="Property Size Right" name="propertySizeRight" value={formData.propertySizeRight} onChange={handleChange} error={errors.propertySizeRight} type="number" isNumber placeholder="e.g. 90" disabled={disabled} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h4 className="text-sm font-bold text-gray-800 mb-4">Construction Areas</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InputField label="Covered Area (Sq Ft)" name="coveredAreaSqFt" value={formData.coveredAreaSqFt} onChange={handleChange} error={errors.coveredAreaSqFt} type="number" isNumber disabled={disabled} />
          <InputField label="Open Area (Sq Ft)" name="openAreaSqFt" value={formData.openAreaSqFt} onChange={handleChange} error={errors.openAreaSqFt} type="number" isNumber disabled={disabled} />
        </div>
      </div>
    </div>
  );

  const renderStep4 = (disabled) => (
    <div className={`space-y-8 ${!disabled ? 'animate-fadeIn' : ''}`}>
      <div>
        <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rooms & Sections</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <InputField label="Rooms" name="rooms" value={formData.rooms} onChange={handleChange} error={errors.rooms} type="number" isNumber disabled={disabled} />
          <InputField label="Bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} error={errors.bathrooms} type="number" isNumber disabled={disabled} />
          <InputField label="Floors" name="floors" value={formData.floors} onChange={handleChange} error={errors.floors} type="number" isNumber disabled={disabled} />
          <InputField label="Lounges" name="lounges" value={formData.lounges} onChange={handleChange} error={errors.lounges} type="number" isNumber disabled={disabled} />
          <InputField label="Kitchens" name="kitchens" value={formData.kitchens} onChange={handleChange} error={errors.kitchens} type="number" isNumber disabled={disabled} />
          <InputField label="Drawing Rooms" name="drawingRooms" value={formData.drawingRooms} onChange={handleChange} error={errors.drawingRooms} type="number" isNumber disabled={disabled} />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Road / Access Dimensions (ft)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <InputField label="Front Road" name="roadFrontFt" value={formData.roadFrontFt} onChange={handleChange} error={errors.roadFrontFt} type="number" isNumber disabled={disabled} />
          <InputField label="Back Road" name="roadBackFt" value={formData.roadBackFt} onChange={handleChange} error={errors.roadBackFt} type="number" isNumber disabled={disabled} />
          <InputField label="Left Road" name="roadLeftFt" value={formData.roadLeftFt} onChange={handleChange} error={errors.roadLeftFt} type="number" isNumber disabled={disabled} />
          <InputField label="Right Road" name="roadRightFt" value={formData.roadRightFt} onChange={handleChange} error={errors.roadRightFt} type="number" isNumber disabled={disabled} />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#B8860B] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Additional Information</h4>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Property Description
          </label>
          <textarea
            name="propertyDescription"
            value={formData.propertyDescription}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter any additional details about the property..."
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-all text-sm font-semibold resize-none ${disabled ? 'text-gray-500 bg-gray-100 cursor-not-allowed opacity-70' : 'text-gray-800 bg-gray-50/50'}`}
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = (disabled) => (
    <div className={`space-y-8 ${!disabled ? 'animate-fadeIn' : ''}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={`flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50 ${disabled ? 'opacity-70' : ''}`}>
          <input type="checkbox" id="swimmingPool" name="swimmingPool" checked={formData.swimmingPool} onChange={handleChange} className={`w-5 h-5 accent-[#1a2b25] rounded ${disabled ? 'cursor-not-allowed' : ''}`} disabled={disabled} />
          <label htmlFor="swimmingPool" className={`text-sm font-semibold text-gray-800 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Swimming Pool</label>
        </div>
        <div className={`flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50 ${disabled ? 'opacity-70' : ''}`}>
          <input type="checkbox" id="mediaRoom" name="mediaRoom" checked={formData.mediaRoom} onChange={handleChange} className={`w-5 h-5 accent-[#1a2b25] rounded ${disabled ? 'cursor-not-allowed' : ''}`} disabled={disabled} />
          <label htmlFor="mediaRoom" className={`text-sm font-semibold text-gray-800 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Media Room</label>
        </div>
        <div className={`flex items-center gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50 ${disabled ? 'opacity-70' : ''}`}>
          <input type="checkbox" id="solarInstalled" name="solarInstalled" checked={formData.solarInstalled} onChange={handleChange} className={`w-5 h-5 accent-[#1a2b25] rounded ${disabled ? 'cursor-not-allowed' : ''}`} disabled={disabled} />
          <label htmlFor="solarInstalled" className={`text-sm font-semibold text-gray-800 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>Solar Installed</label>
        </div>
        {formData.solarInstalled && (
          <InputField label="Solar Capacity (e.g. 10kW)" name="solarCapacity" value={formData.solarCapacity} onChange={handleChange} disabled={disabled} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
        <InputField label="Electric Meters" name="electricMeters" value={formData.electricMeters} onChange={handleChange} type="number" isNumber disabled={disabled} />
        <InputField label="Gas Meters" name="gasMeters" value={formData.gasMeters} onChange={handleChange} type="number" isNumber disabled={disabled} />
      </div>

      <div className="pt-4 border-t border-gray-50">
        <TagInput
          label="Amenities"
          tags={formData.amenities}
          suggestions={refData.amenities.map(a => a.amenity_description)}
          onAdd={(tag) => handleAddTag('amenities', tag)}
          onRemove={(tag) => handleRemoveTag('amenities', tag)}
          disabled={disabled}
        />
      </div>
    </div>
  );

  const renderStep6 = (disabled) => (
    <div className={`space-y-8 ${!disabled ? 'animate-fadeIn' : ''}`}>
      {/* Pictures */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><ImageIcon size={16} className="text-[#B8860B]" /> Property Pictures</h4>
          {!disabled && (
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-gray-500 block">
                Max {MAX_PICTURES} pictures · 5 MB each · JPG, PNG, WebP
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                {formData.media.pictures.length}/{MAX_PICTURES} selected
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {formData.media.pictures.map((pic, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              <img src={pic.url || pic} alt="Property" className="w-full h-full object-cover" />
              {!disabled && (
                <button onClick={() => removeMedia('pictures', idx)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {!disabled && formData.media.pictures.length < MAX_PICTURES && (
            <>
              <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#B8860B] hover:text-[#B8860B] transition-colors bg-gray-50/50">
                <UploadCloud size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase">Add Photo</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
              />
            </>
          )}
          {disabled && formData.media.pictures.length === 0 && (
            <div className="text-sm font-semibold text-gray-400 col-span-2">No pictures provided</div>
          )}
        </div>

        {/* Inline validation errors from file selection */}
        {!disabled && pictureErrors.length > 0 && (
          <div className="space-y-1.5 mt-3">
            {pictureErrors.map((err, i) => (
              <p key={i} className="text-xs font-semibold text-red-500 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">⚠</span>{err}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      <div className="pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Video size={16} className="text-[#B8860B]" /> Property Videos</h4>
          {!disabled && <span className="text-xs font-semibold text-gray-400">Max 50MB per video</span>}
        </div>

        <div className="space-y-3">
          {formData.media.videos.map((vid, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-[#eef2f9] text-[#4d70a3] rounded-lg flex items-center justify-center shrink-0">
                  <Video size={18} />
                </div>
                <span className="text-sm font-semibold text-gray-700 truncate">{vid.name || `Video ${idx + 1}`}</span>
              </div>
              {!disabled && (
                <button onClick={() => removeMedia('videos', idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <>
              <button onClick={() => videoInputRef.current?.click()} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-[#B8860B] hover:text-[#B8860B] transition-colors bg-white">
                <UploadCloud size={18} /> Upload Video
              </button>
              <input type="file" ref={videoInputRef} className="hidden" accept="video/mp4" onChange={handleVideoUpload} />
            </>
          )}
          {disabled && formData.media.videos.length === 0 && (
            <div className="text-sm font-semibold text-gray-400">No videos provided</div>
          )}
        </div>

        {/* Inline validation errors from video selection */}
        {!disabled && videoErrors.length > 0 && (
          <div className="space-y-1.5 mt-3">
            {videoErrors.map((err, i) => (
              <p key={i} className="text-xs font-semibold text-red-500 flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">⚠</span>{err}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (loadingRef) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-semibold">Loading form data...</p>
      </div>
    );
  }

  if (errorRef) {
    return (
      <div className="w-full max-w-[1200px] mx-auto bg-white rounded-[24px] shadow-sm border border-red-100 p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
          <X size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Form</h3>
        <p className="text-gray-500 mb-6">{errorRef}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[#1a2b25] text-white rounded-full font-bold hover:bg-[#2c4232] transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/60 overflow-hidden flex flex-col mb-8">
        <div className="p-6 sm:p-10 border-b border-gray-100 bg-[#FAF8F3]">
          <h2 className="text-2xl font-serif font-bold text-[#1a2b25]">Edit Property</h2>
          <p className="text-gray-500 font-medium mt-2">Update your property information below. Media can be managed separately.</p>
        </div>

        <div className="p-6 sm:p-10 space-y-12">
          {/* Classification */}
          <section>
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <Home size={20} className="text-[#B8860B]" /> Property Classification
            </h3>
            {renderStep1(false)}
          </section>

          {/* Location */}
          <section>
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <MapPin size={20} className="text-[#B8860B]" /> Location
            </h3>
            {renderStep2(false)}
          </section>

          {/* Size & Area */}
          <section>
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <Maximize size={20} className="text-[#B8860B]" /> Size & Area
            </h3>
            {renderStep3(false)}
          </section>

          {/* Particulars */}
          <section>
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <List size={20} className="text-[#B8860B]" /> Property Particulars
            </h3>
            {renderStep4(false)}
          </section>

          {/* Features and Amenities */}
          <section>
            <h3 className="text-xl font-serif font-bold text-[#1a2b25] mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <CheckSquare size={20} className="text-[#B8860B]" /> Features and Amenities
            </h3>
            {renderStep5(false)}
          </section>
        </div>

        <div className="p-6 bg-[#fcfbfa] border-t border-gray-100 flex items-center justify-between rounded-br-[24px]">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (validateAll()) {
                onSubmit(formData);
              }
            }}
            className="px-8 py-2.5 bg-gradient-to-r from-[#1a2b25] to-[#2c4232] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(26,43,37,0.3)] hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Save Changes
          </button>
        </div>
      </div>
    );
  }

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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${isActive ? 'bg-[#1a2b25] border-[#1a2b25] text-white' :
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
            {React.createElement(STEPS[currentStep - 1].icon, { size: 24, className: "text-[#B8860B]" })}
            {STEPS[currentStep - 1].title}
          </h3>

          <div className="space-y-6">

            {/* STEP 1: CLASSIFICATION */}
            {currentStep === 1 && renderStep1(false)}

            {/* STEP 2: LOCATION */}
            {currentStep === 2 && renderStep2(false)}

            {/* STEP 3: SIZE & AREA */}
            {currentStep === 3 && renderStep3(false)}

            {/* STEP 4: PARTICULARS */}
            {currentStep === 4 && renderStep4(false)}

            {/* STEP 5: FEATURES */}
            {currentStep === 5 && renderStep5(false)}

            {/* STEP 6: MEDIA */}
            {currentStep === 6 && renderStep6(false)}

            {/* STEP 7: REVIEW */}
            {currentStep === 7 && (
              <div className="animate-fadeIn space-y-6">

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-[#1a2b25]">Review Property</h3>
                  <p className="text-gray-500 font-medium mt-2">Please review all property information before registration.</p>
                </div>

                {[
                  { id: 1, title: 'Classification', icon: Home, render: renderStep1 },
                  { id: 2, title: 'Location', icon: MapPin, render: renderStep2 },
                  { id: 3, title: 'Size & Area', icon: Maximize, render: renderStep3 },
                  { id: 4, title: 'Property Particulars', icon: List, render: renderStep4 },
                  { id: 5, title: 'Features & Amenities', icon: CheckSquare, render: renderStep5 },
                  { id: 6, title: 'Pictures & Videos', icon: ImageIcon, render: renderStep6 }
                ].map((section) => (
                  <div key={section.id} className={`bg-white p-6 rounded-2xl border ${editingSection === section.id ? 'border-[#B8860B] shadow-md' : 'border-gray-200 shadow-sm'} transition-all`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <h4 className="text-lg font-serif font-bold text-[#1a2b25] flex items-center gap-2">
                        {React.createElement(section.icon, { size: 20, className: "text-[#B8860B]" })}
                        {section.title}
                      </h4>
                      {editingSection === section.id ? (
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={handleCancelSection} className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors">Cancel</button>
                          <button type="button" onClick={() => handleSaveSection(section.id)} className="text-xs font-bold text-white bg-[#1a2b25] hover:bg-[#2c4232] px-4 py-1.5 rounded-full transition-colors">Save Changes</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleEditSection(section.id)} className={`text-sm font-bold text-[#B8860B] hover:underline px-4 py-1.5 bg-[#f4f2ea] rounded-full transition-colors ${editingSection !== null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>Edit</button>
                      )}
                    </div>
                    {section.render(editingSection !== section.id)}
                  </div>
                ))}

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
