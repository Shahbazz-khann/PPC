import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Search, SlidersHorizontal, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPublicPropertyFilters } from '../Services/property.service';
import { useTranslation } from 'react-i18next';

const PropertySearch = () => {
  const { t } = useTranslation(['public']);
  const location = useLocation();
  const getUrlParam = (key) => new URLSearchParams(location.search).get(key) || '';

  // Advanced panel toggle
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Dynamic filter lists
  const [cities, setCities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([t('public:allTypes')]);
  const [societies, setSocieties] = useState([]);
  const [areas, setAreas] = useState([]);
  const [propertyUses, setPropertyUses] = useState([t('public:allUses')]);
  const [sizeUoms, setSizeUoms] = useState([]);

  // Selected filter values (Basic)
  const [city, setCity] = useState(getUrlParam('city'));
  const [intent, setIntent] = useState(getUrlParam('intent') || 'Buy');
  const [propertyType, setPropertyType] = useState(getUrlParam('propertyType') || t('public:allTypes'));
  const [minPrice, setMinPrice] = useState(getUrlParam('minPrice'));
  const [maxPrice, setMaxPrice] = useState(getUrlParam('maxPrice'));

  // Selected filter values (Advanced V1)
  const [society, setSociety] = useState(getUrlParam('society'));
  const [area, setArea] = useState(getUrlParam('area'));
  const [propertyUse, setPropertyUse] = useState(getUrlParam('propertyUse') || t('public:allUses'));
  const [minSize, setMinSize] = useState(getUrlParam('minSize'));
  const [maxSize, setMaxSize] = useState(getUrlParam('maxSize'));
  const [sizeUom, setSizeUom] = useState(getUrlParam('sizeUom'));
  const [rooms, setRooms] = useState(getUrlParam('rooms'));
  const [bathrooms, setBathrooms] = useState(getUrlParam('bathrooms'));

  // If any advanced filter is present, open the panel
  useEffect(() => {
    if (getUrlParam('society') || getUrlParam('area') || (getUrlParam('propertyUse') && getUrlParam('propertyUse') !== t('public:allUses')) || getUrlParam('minSize') || getUrlParam('maxSize') || getUrlParam('sizeUom') || getUrlParam('rooms') || getUrlParam('bathrooms')) {
      setIsAdvancedOpen(true);
    }
  }, [location.search]);

  // Validation state
  const [searchError, setSearchError] = useState('');

  // Dropdown toggles
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isSocietyOpen, setIsSocietyOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isPropertyUseOpen, setIsPropertyUseOpen] = useState(false);
  const [isSizeUomOpen, setIsSizeUomOpen] = useState(false);

  // Refs for click outside
  const cityRef = useRef(null);
  const propertyTypeRef = useRef(null);
  const societyRef = useRef(null);
  const areaRef = useRef(null);
  const propertyUseRef = useRef(null);
  const sizeUomRef = useRef(null);

  const navigate = useNavigate();

  // Fetch initial filters and handle cascade
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getPublicPropertyFilters({ city, society });
        if (res.success && res.data) {
          // Global
          if (!city && !society) {
            setCities(res.data.cities || []);
            setPropertyTypes([t('public:allTypes'), ...(res.data.propertyTypes || [])]);
            setPropertyUses([t('public:allUses'), ...(res.data.propertyUses || [])]);
            setSizeUoms(res.data.sizeUoms || []);
            if (res.data.cities && res.data.cities.length > 0 && !city && !getUrlParam('city')) {
              setCity(res.data.cities[0]);
            }
          }
          // Contextual
          setSocieties(res.data.societies || []);
          setAreas(res.data.areas || []);
        }
      } catch (err) {
        console.error("Failed to load filters", err);
      }
    };
    fetchFilters();
  }, [city, society]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityRef.current && !cityRef.current.contains(event.target)) setIsCityOpen(false);
      if (propertyTypeRef.current && !propertyTypeRef.current.contains(event.target)) setIsPropertyTypeOpen(false);
      if (societyRef.current && !societyRef.current.contains(event.target)) setIsSocietyOpen(false);
      if (areaRef.current && !areaRef.current.contains(event.target)) setIsAreaOpen(false);
      if (propertyUseRef.current && !propertyUseRef.current.contains(event.target)) setIsPropertyUseOpen(false);
      if (sizeUomRef.current && !sizeUomRef.current.contains(event.target)) setIsSizeUomOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCityChange = (c) => {
    setCity(c);
    setSociety('');
    setArea('');
    setIsCityOpen(false);
  };

  const handleSocietyChange = (s) => {
    setSociety(s);
    setArea('');
    setIsSocietyOpen(false);
  };

  const handleResetAdvanced = () => {
    setSociety('');
    setArea('');
    setPropertyUse(t('public:allUses'));
    setMinSize('');
    setMaxSize('');
    setSizeUom('');
    setRooms('');
    setBathrooms('');
    setSearchError('');
  };

  const handleSearch = () => {
    setSearchError('');

    // Price Validation
    if (minPrice && Number(minPrice) < 0) return setSearchError(t('public:minPriceError'));
    if (maxPrice && Number(maxPrice) < 0) return setSearchError(t('public:maxPriceError'));
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      return setSearchError(t('public:priceRangeError'));
    }

    // Size Validation
    if (minSize && Number(minSize) < 0) return setSearchError(t('public:minSizeError'));
    if (maxSize && Number(maxSize) < 0) return setSearchError(t('public:maxSizeError'));
    if (minSize && maxSize && Number(minSize) > Number(maxSize)) {
      return setSearchError(t('public:sizeRangeError'));
    }
    if ((minSize || maxSize) && !sizeUom) {
      return setSearchError(t('public:sizeUnitError'));
    }

    // Rooms Validation
    if (rooms && (Number(rooms) < 0 || !Number.isInteger(Number(rooms)))) return setSearchError(t('public:roomsError'));
    if (bathrooms && (Number(bathrooms) < 0 || !Number.isInteger(Number(bathrooms)))) return setSearchError(t('public:bathroomsError'));

    const params = new URLSearchParams();
    
    // Basic
    if (intent) params.append('intent', intent);
    if (city) params.append('city', city);
    if (propertyType && propertyType !== t('public:allTypes')) params.append('propertyType', propertyType);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);

    // Advanced
    if (society) params.append('society', society);
    if (area) params.append('area', area);
    if (propertyUse && propertyUse !== t('public:allUses')) params.append('propertyUse', propertyUse);
    if (minSize) params.append('minSize', minSize);
    if (maxSize) params.append('maxSize', maxSize);
    if (sizeUom) params.append('sizeUom', sizeUom);
    if (rooms) params.append('rooms', rooms);
    if (bathrooms) params.append('bathrooms', bathrooms);

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 -mt-10 md:-mt-42 z-30 mb-8">
      {searchError && (
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-sm text-sm font-medium animate-in fade-in">
          {searchError}
        </div>
      )}

      <div className="relative bg-white rounded-2xl shadow-xl p-6 md:p-4 pt-12 md:pt-10 transition-all duration-300">
        {/* Top Search Properties Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-20 w-max">
          <button className="bg-[#063B29] text-white text-xs md:text-sm font-bold tracking-wider uppercase px-6 py-3.5 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] ">
            {t('public:searchProperties')}
          </button>
        </div>

        {/* Tabs & Advanced Search Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setIntent('Buy')}
              className={`font-bold text-xs md:text-sm px-5 py-2 rounded-md transition-colors ${intent === 'Buy' ? 'bg-[#063B29] text-white' : 'bg-transparent text-slate-800 hover:bg-gray-100'}`}
            >
              {t('public:buy')}
            </button>
            <button
              onClick={() => setIntent('Rent')}
              className={`font-bold text-xs md:text-sm px-5 py-2 rounded-md transition-colors ${intent === 'Rent' ? 'bg-[#063B29] text-white' : 'bg-transparent text-slate-800 hover:bg-gray-100'}`}
            >
              {t('public:rent')}
            </button>
          </div>

          <div
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center space-x-2 font-bold text-xs md:text-sm cursor-pointer transition-colors ${isAdvancedOpen ? 'text-[#063B29]' : 'text-slate-800 hover:text-[#063B29]'}`}
          >
            <span>{t('public:advancedSearch')}</span>
            <SlidersHorizontal className={`w-4 h-4 rtl:ml-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Basic Inputs Container */}
        <div className="border border-gray-100 rounded-xl bg-[#FAFBFB] p-2 md:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* City */}
          <div className="relative w-full" ref={cityRef}>
            <div className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-e border-gray-200 cursor-pointer" onClick={() => setIsCityOpen(!isCityOpen)}>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 cursor-pointer">{t('public:city')}</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-900">{city || t('public:selectCity')}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-900 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
              <MapPin className="w-4 h-4 text-[#063B29] ml-2 rtl:mr-2 rtl:ml-0 shrink-0" />
            </div>
            {isCityOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
                {cities.map((c) => (
                  <button key={c} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => handleCityChange(c)}>
                    {c} {city === c && <Check className="inline w-3.5 h-3.5 ml-2 rtl:mr-2 rtl:ml-0 text-[#063B29]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="relative w-full" ref={propertyTypeRef}>
            <div className="px-3 py-1 flex items-center justify-between border-b sm:border-b-0 sm:border-e border-gray-200 cursor-pointer" onClick={() => setIsPropertyTypeOpen(!isPropertyTypeOpen)}>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 cursor-pointer">{t('public:propertyType')}</label>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs md:text-sm font-bold text-slate-900">{propertyType}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-600 ml-2 rtl:mr-2 rtl:ml-0 shrink-0" />
            </div>
            {isPropertyTypeOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
                {propertyTypes.map((type) => (
                  <button key={type} className="w-full text-left px-4 py-2.5 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setPropertyType(type); setIsPropertyTypeOpen(false); }}>
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Min Price */}
          <div className="px-3 py-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-e border-gray-200 h-full">
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t('public:minPrice')}</label>
            <input type="number" min="0" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setSearchError(''); }} placeholder={t('public:eg1m')} className="w-full text-xs md:text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:font-normal placeholder:text-gray-400" />
          </div>

          {/* Max Price */}
          <div className="px-3 py-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-e lg:border-e-0 border-gray-200 h-full">
            <label className="block text-[11px] font-medium text-gray-500 mb-0.5">{t('public:maxPrice')}</label>
            <input type="number" min="0" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setSearchError(''); }} placeholder={t('public:eg50m')} className="w-full text-xs md:text-sm font-semibold text-slate-900 bg-transparent outline-none placeholder:font-normal placeholder:text-gray-400" />
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1 pt-2 sm:pt-0">
            <button onClick={handleSearch} className="w-full bg-[#063B29] hover:bg-[#052b1e] transition-colors text-white font-bold text-xs md:text-sm tracking-wider uppercase px-6 py-3.5 rounded-lg flex items-center justify-center space-x-2">
              <Search className="w-4 h-4 stroke-[2.5] rtl:ml-2 rtl:mr-0" />
              <span>{t('public:search')}</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Row 1: Society | Area | Property Use */}
              <div className="relative w-full" ref={societyRef}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:society')}</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setIsSocietyOpen(!isSocietyOpen)}>
                  <span className="text-xs md:text-sm font-semibold text-slate-800">{society || t('public:anySociety')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {isSocietyOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto">
                    <button className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => handleSocietyChange('')}>{t('public:anySociety')}</button>
                    {societies.map((s) => (
                      <button key={s} className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => handleSocietyChange(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-full" ref={areaRef}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:areaBlock')}</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setIsAreaOpen(!isAreaOpen)}>
                  <span className="text-xs md:text-sm font-semibold text-slate-800">{area || t('public:anyArea')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {isAreaOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto">
                    <button className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setArea(''); setIsAreaOpen(false); }}>{t('public:anyArea')}</button>
                    {areas.map((a) => (
                      <button key={a} className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setArea(a); setIsAreaOpen(false); }}>{a}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-full" ref={propertyUseRef}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:propertyUse')}</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setIsPropertyUseOpen(!isPropertyUseOpen)}>
                  <span className="text-xs md:text-sm font-semibold text-slate-800">{propertyUse}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {isPropertyUseOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto">
                    <button className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setPropertyUse(t('public:allUses')); setIsPropertyUseOpen(false); }}>{t('public:allUses')}</button>
                    {propertyUses.map((u) => (
                      <button key={u} className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setPropertyUse(u); setIsPropertyUseOpen(false); }}>{u}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 2: Min Size | Max Size | Size UOM */}
              <div className="w-full">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:minSize')}</label>
                <input type="number" min="0" value={minSize} onChange={(e) => { setMinSize(e.target.value); setSearchError(''); }} placeholder={t('public:eg5')} className="w-full px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-gray-50 border border-gray-200 rounded-lg outline-none placeholder:font-normal placeholder:text-gray-400" />
              </div>

              <div className="w-full">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:maxSize')}</label>
                <input type="number" min="0" value={maxSize} onChange={(e) => { setMaxSize(e.target.value); setSearchError(''); }} placeholder={t('public:eg20')} className="w-full px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-gray-50 border border-gray-200 rounded-lg outline-none placeholder:font-normal placeholder:text-gray-400" />
              </div>

              <div className="relative w-full" ref={sizeUomRef}>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:sizeUnit')}</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between cursor-pointer" onClick={() => setIsSizeUomOpen(!isSizeUomOpen)}>
                  <span className="text-xs md:text-sm font-semibold text-slate-800">{sizeUom || t('public:selectUnit')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {isSizeUomOpen && (
                  <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-48 overflow-y-auto">
                    <button className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setSizeUom(''); setIsSizeUomOpen(false); }}>{t('public:selectUnit')}</button>
                    {sizeUoms.map((u) => (
                      <button key={u} className="w-full text-left px-4 py-2 text-xs md:text-sm text-slate-700 hover:bg-gray-50" onClick={() => { setSizeUom(u); setIsSizeUomOpen(false); }}>{u}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Bedrooms | Bathrooms */}
              <div className="w-full">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:minBedrooms')}</label>
                <input type="number" min="0" value={rooms} onChange={(e) => { setRooms(e.target.value); setSearchError(''); }} placeholder={t('public:eg3')} className="w-full px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-gray-50 border border-gray-200 rounded-lg outline-none placeholder:font-normal placeholder:text-gray-400" />
              </div>

              <div className="w-full">
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t('public:minBathrooms')}</label>
                <input type="number" min="0" value={bathrooms} onChange={(e) => { setBathrooms(e.target.value); setSearchError(''); }} placeholder={t('public:eg2')} className="w-full px-3 py-2 text-xs md:text-sm font-semibold text-slate-800 bg-gray-50 border border-gray-200 rounded-lg outline-none placeholder:font-normal placeholder:text-gray-400" />
              </div>
            </div>
            
            {/* Advanced Footer */}
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button onClick={handleResetAdvanced} className="text-gray-500 hover:text-gray-700 text-xs md:text-sm font-semibold px-4 py-2 transition-colors">
                {t('public:resetFilters')}
              </button>
              <button onClick={handleSearch} className="bg-[#063B29] hover:bg-[#052b1e] text-white text-xs md:text-sm font-bold tracking-wider uppercase px-6 py-2.5 rounded-lg shadow transition-colors">
                {t('public:applySearch')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
