import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties } from '../../Services/property.service';
import {
  Search,
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ChevronDown,
  SlidersHorizontal,
  Grid3X3,
  List,
  Bookmark,
  Eye,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
// Replace MOCK_PROPERTIES with an API call when the backend is ready.
// Each field maps directly to the property schema. Do not invent new fields.

const MOCK_PROPERTIES = [
  {
    id: 1,
    image: '/src/assets/prop_villa.png',
    fallback: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Modern Family Villa',
    location: 'Bahria Town, Islamabad',
    price: 25000000,
    priceDisplay: 'Rs. 25,000,000',
    priceNote: null,
    beds: 5,
    baths: 6,
    area: '1 Kanal',
    type: 'House',
    city: 'Islamabad',
    isFavorite: false,
  },
  {
    id: 2,
    image: '/src/assets/prop_apartment.png',
    fallback: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Luxury Apartment in DHA',
    location: 'DHA Phase 2, Islamabad',
    price: 18500000,
    priceDisplay: 'Rs. 18,500,000',
    priceNote: null,
    beds: 3,
    baths: 3,
    area: '1200 sqft',
    type: 'Apartment',
    city: 'Islamabad',
    isFavorite: false,
  },
  {
    id: 3,
    image: '/src/assets/prop_house.png',
    fallback: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Rent',
    title: 'Fully Furnished House',
    location: 'G-13, Islamabad',
    price: 120000,
    priceDisplay: 'Rs. 120,000',
    priceNote: '/ month',
    beds: 4,
    baths: 4,
    area: '10 Marla',
    type: 'House',
    city: 'Islamabad',
    isFavorite: true,
  },
  {
    id: 4,
    image: '/src/assets/prop_living_room.png',
    fallback: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Contemporary Living Space',
    location: 'F-7, Islamabad',
    price: 32000000,
    priceDisplay: 'Rs. 32,000,000',
    priceNote: null,
    beds: 4,
    baths: 3,
    area: '2000 sqft',
    type: 'Apartment',
    city: 'Islamabad',
    isFavorite: false,
  },
  {
    id: 5,
    image: '/src/assets/prop_penthouse.png',
    fallback: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Rent',
    title: 'Premium Penthouse',
    location: 'DHA Phase 5, Lahore',
    price: 250000,
    priceDisplay: 'Rs. 250,000',
    priceNote: '/ month',
    beds: 5,
    baths: 5,
    area: '3500 sqft',
    type: 'Apartment',
    city: 'Lahore',
    isFavorite: false,
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
    fallback: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Executive Corner Plot',
    location: 'Bahria Town, Rawalpindi',
    price: 15000000,
    priceDisplay: 'Rs. 15,000,000',
    priceNote: null,
    beds: 6,
    baths: 6,
    area: '1 Kanal',
    type: 'House',
    city: 'Rawalpindi',
    isFavorite: false,
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80',
    fallback: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Smart Home Villa',
    location: 'E-11, Islamabad',
    price: 45000000,
    priceDisplay: 'Rs. 45,000,000',
    priceNote: null,
    beds: 7,
    baths: 7,
    area: '2 Kanal',
    type: 'House',
    city: 'Islamabad',
    isFavorite: true,
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
    fallback: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Rent',
    title: 'Studio Apartment',
    location: 'Blue Area, Islamabad',
    price: 55000,
    priceDisplay: 'Rs. 55,000',
    priceNote: '/ month',
    beds: 1,
    baths: 1,
    area: '600 sqft',
    type: 'Apartment',
    city: 'Islamabad',
    isFavorite: false,
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
    fallback: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=600&q=80',
    purpose: 'For Sale',
    title: 'Garden View Bungalow',
    location: 'Gulberg III, Lahore',
    price: 28000000,
    priceDisplay: 'Rs. 28,000,000',
    priceNote: null,
    beds: 5,
    baths: 4,
    area: '10 Marla',
    type: 'House',
    city: 'Lahore',
    isFavorite: false,
  },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const BEDROOM_OPTIONS = ['All', '1', '2', '3', '4', '5+'];
const BATHROOM_OPTIONS = ['All', '1', '2', '3', '4', '5+'];
const AREA_OPTIONS = ['All', '< 5 Marla', '5-10 Marla', '10 Marla', '1 Kanal', '2 Kanal+'];
const TYPE_OPTIONS = ['All', 'House', 'Apartment'];
const CITY_OPTIONS = ['All Cities', 'Islamabad', 'Lahore', 'Rawalpindi', 'Karachi'];
const PURPOSE_TAB_OPTIONS = ['All Properties', 'For Sale', 'For Rent'];

// ─── Property Card Component ───────────────────────────────────────────────────

const PropertyCard = ({ property, viewMode, onToggleFav, onViewDetails }) => {
  const [fav, setFav] = useState(property.isFavorite);
  const [imgError, setImgError] = useState(false);

  const handleFav = (e) => {
    e.preventDefault();
    setFav((p) => !p);
    if (onToggleFav) onToggleFav(property.id, !fav);
  };

  const isGrid = viewMode === 'grid';
  const badgeBg = property.purpose === 'For Sale' ? '#1D6A4A' : '#0EA5E9';

  if (!isGrid) {
    // ── List mode ──
    return (
      <div style={listCardStyle}>
        <div style={listImgWrap}>
          <img
            src={imgError ? property.fallback : property.image}
            alt={property.title}
            style={listImg}
            onError={() => setImgError(true)}
          />
          <span style={{ ...badgeStyle, background: badgeBg }}>{property.purpose}</span>
        </div>
        <div style={listBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={cardTitle}>{property.title}</div>
              <div style={locationRow}>
                <MapPin size={12} color="#9CA3AF" />
                <span>{property.location}</span>
              </div>
            </div>
            <button onClick={handleFav} style={favBtn} aria-label="Toggle favourite">
              <Heart size={16} color={fav ? '#E11D48' : '#9CA3AF'} fill={fav ? '#E11D48' : 'none'} strokeWidth={2} />
            </button>
          </div>
          <div style={priceRow}>
            <span style={priceText}>{property.priceDisplay}</span>
            {property.priceNote && <span style={priceNote}>{property.priceNote}</span>}
          </div>
          <div style={featuresRow}>
            <span style={featureChip}><BedDouble size={13} color="#6B7280" />{property.beds} Bed</span>
            <span style={featureChip}><Bath size={13} color="#6B7280" />{property.baths} Bath</span>
            <span style={featureChip}><Maximize size={13} color="#6B7280" />{property.area}</span>
          </div>
        </div>
        <button style={viewDetailsBtnList} onClick={() => onViewDetails && onViewDetails(property.id)}>View Details</button>
      </div>
    );
  }

  // ── Grid mode ──
  return (
    <div style={gridCardStyle}>
      <div style={gridImgWrap}>
        <img
          src={imgError ? property.fallback : property.image}
          alt={property.title}
          style={gridImg}
          onError={() => setImgError(true)}
        />
        <span style={{ ...badgeStyle, background: badgeBg }}>{property.purpose}</span>
        <button onClick={handleFav} style={gridFavBtn} aria-label="Toggle favourite">
          <Heart size={15} color={fav ? '#E11D48' : '#fff'} fill={fav ? '#E11D48' : 'none'} strokeWidth={2} />
        </button>
      </div>
      <div style={gridBody}>
        <div style={cardTitle}>{property.title}</div>
        <div style={locationRow}>
          <MapPin size={12} color="#9CA3AF" />
          <span>{property.location}</span>
        </div>
        <div style={priceRow}>
          <span style={priceText}>{property.priceDisplay}</span>
          {property.priceNote && <span style={priceNote}>{property.priceNote}</span>}
        </div>
        <div style={featuresRow}>
          <span style={featureChip}><BedDouble size={12} color="#6B7280" />{property.beds} Bed</span>
          <span style={featureChip}><Bath size={12} color="#6B7280" />{property.baths} Bath</span>
          <span style={featureChip}><Maximize size={12} color="#6B7280" />{property.area}</span>
        </div>
        <button
          style={viewDetailsBtnGrid}
          onClick={() => onViewDetails && onViewDetails(property.id)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Select Dropdown ───────────────────────────────────────────────────────────

const SelectDropdown = ({ label, options, value, onChange, id }) => (
  <div style={filterGroup}>
    <label style={filterLabel} htmlFor={id}>{label}</label>
    <div style={selectWrap}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectEl}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} color="#6B7280" style={selectIcon} />
    </div>
  </div>
);

// ─── Main Page Component ───────────────────────────────────────────────────────

const MyProperties = () => {
  const navigate = useNavigate();

  const handleViewDetails = (id) => {
    navigate(`/customer/properties/${id}`);
  };
  // Filter state
  const [searchText, setSearchText] = useState('');
  const [purpose, setPurpose] = useState('All');
  const [type, setType] = useState('All');
  const [city, setCity] = useState('All Cities');
  const [bedrooms, setBedrooms] = useState('All');
  const [bathrooms, setBathrooms] = useState('All');
  const [area, setArea] = useState('All');

  // UI state
  const [activeTab, setActiveTab] = useState('All Properties');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Derived: apply filters + sort
  const filteredProperties = useMemo(() => {
    let list = [...MOCK_PROPERTIES];

    // Tab filter (purpose)
    if (activeTab !== 'All Properties') {
      list = list.filter((p) => p.purpose === activeTab);
    }

    // Search text
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    // Purpose dropdown (secondary — tab takes priority if set)
    if (purpose !== 'All' && activeTab === 'All Properties') {
      list = list.filter((p) => p.purpose === purpose);
    }

    // Type
    if (type !== 'All') {
      list = list.filter((p) => p.type === type);
    }

    // City
    if (city !== 'All Cities') {
      list = list.filter((p) => p.city === city);
    }

    // Bedrooms (simple string match on count)
    if (bedrooms !== 'All') {
      const n = parseInt(bedrooms);
      if (bedrooms === '5+') {
        list = list.filter((p) => p.beds >= 5);
      } else {
        list = list.filter((p) => p.beds === n);
      }
    }

    // Bathrooms
    if (bathrooms !== 'All') {
      const n = parseInt(bathrooms);
      if (bathrooms === '5+') {
        list = list.filter((p) => p.baths >= 5);
      } else {
        list = list.filter((p) => p.baths === n);
      }
    }

    // Sort
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [searchText, purpose, type, city, bedrooms, bathrooms, area, activeTab, sortBy]);

  // API Properties state
  const [apiProperties, setApiProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiProperties = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchText.trim()) params.search = searchText.trim();
        
        let pFilter = purpose;
        if (activeTab === 'For Sale') pFilter = 'sale';
        else if (activeTab === 'For Rent') pFilter = 'rent';
        else if (purpose === 'For Sale') pFilter = 'sale';
        else if (purpose === 'For Rent') pFilter = 'rent';
        
        if (pFilter && pFilter !== 'All') params.purpose = pFilter;
        if (type !== 'All') params.property_type = type;
        if (city !== 'All Cities') params.city = city;
        if (bedrooms !== 'All') params.bedrooms = parseInt(bedrooms, 10);
        if (bathrooms !== 'All') params.bathrooms = parseInt(bathrooms, 10);
        if (sortBy) params.sort = sortBy;

        const res = await getProperties(params);
        if (res && res.success && Array.isArray(res.data)) {
          setApiProperties(res.data);
        } else {
          setApiProperties([]);
        }
      } catch (err) {
        console.error('Failed to fetch properties from API:', err);
        setApiProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApiProperties();
  }, [searchText, purpose, type, city, bedrooms, bathrooms, area, activeTab, sortBy]);

  const displayList = useMemo(() => {
    if (apiProperties.length > 0) {
      return apiProperties.map(p => ({
        id: p.property_id,
        image: p.primary_image || p.image || '/src/assets/prop_villa.png',
        fallback: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
        purpose: p.purpose || (p.sale_price ? 'For Sale' : 'For Rent'),
        title: p.title,
        location: [p.address, p.city].filter(Boolean).join(', '),
        price: p.sale_price || p.rent_price || 0,
        priceDisplay: p.sale_price ? `Rs. ${Number(p.sale_price).toLocaleString()}` : p.rent_price ? `Rs. ${Number(p.rent_price).toLocaleString()}` : 'Contact for Price',
        priceNote: p.rent_price && !p.sale_price ? '/ month' : null,
        beds: p.bedrooms || 0,
        baths: p.bathrooms || 0,
        area: `${p.area_value || ''} ${p.area_unit || ''}`.trim(),
        type: p.property_type,
        city: p.city,
        isFavorite: false,
      }));
    }
    return filteredProperties;
  }, [apiProperties, filteredProperties]);

  const handleReset = () => {
    setSearchText('');
    setPurpose('All');
    setType('All');
    setCity('All Cities');
    setBedrooms('All');
    setBathrooms('All');
    setArea('All');
    setActiveTab('All Properties');
    setSortBy('newest');
  };

  return (
    <div style={page}>

      {/* ══ Page Header ══ */}
      <div style={pageHeader}>
        <div>
          <h1 style={pageTitle}>Properties</h1>
          <p style={pageSubtitle}>
            Find the perfect property for you. Explore verified properties for sale or rent.
          </p>
        </div>
        <button style={saveSearchBtn}>
          <Bookmark size={15} color="#1D6A4A" strokeWidth={2} />
          Save Search
        </button>
      </div>

      {/* ══ Filter Panel ══ */}
      <div style={filterPanel}>
        {/* Row 1: Search + Purpose + Type + City + Price */}
        <div style={filterRow}>
          {/* Search */}
          <div style={{ ...filterGroup, flex: 2 }}>
            <label style={filterLabel} htmlFor="prop-search">Search</label>
            <div style={searchInputWrap}>
              <Search size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
              <input
                id="prop-search"
                type="text"
                placeholder="Search by title, location, or keyword..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={searchInput}
              />
            </div>
          </div>

          {/* Purpose */}
          <SelectDropdown
            id="purpose-select"
            label="Purpose"
            options={['All', 'For Sale', 'For Rent']}
            value={purpose}
            onChange={setPurpose}
          />

          {/* Type */}
          <SelectDropdown
            id="type-select"
            label="Type"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />

          {/* City */}
          <SelectDropdown
            id="city-select"
            label="City"
            options={CITY_OPTIONS}
            value={city}
            onChange={setCity}
          />

          {/* Price Range (static label only — no slider yet) */}
          <div style={filterGroup}>
            <label style={filterLabel}>Price Range</label>
            <div style={priceRangeBox}>
              <span style={priceRangeText}>Rs. 0 – Rs. 50,000,000+</span>
              <div style={priceTrack}>
                <div style={priceThumb} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Bedrooms + Bathrooms + Area + More Filters + Buttons */}
        <div style={{ ...filterRow, alignItems: 'flex-end' }}>
          <SelectDropdown
            id="bed-select"
            label="Bedrooms"
            options={BEDROOM_OPTIONS}
            value={bedrooms}
            onChange={setBedrooms}
          />
          <SelectDropdown
            id="bath-select"
            label="Bathrooms"
            options={BATHROOM_OPTIONS}
            value={bathrooms}
            onChange={setBathrooms}
          />
          <SelectDropdown
            id="area-select"
            label="Area (Marla/SQFT)"
            options={AREA_OPTIONS}
            value={area}
            onChange={setArea}
          />

          {/* More Filters (UI only) */}
          <button style={moreFiltersBtn}>
            More Filters <SlidersHorizontal size={14} color="#374151" strokeWidth={2} />
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          <button onClick={handleReset} style={resetBtn}>Reset</button>
          <button style={applyBtn}>Apply Filters</button>
        </div>
      </div>

      {/* ══ Tab Switcher + Sort + View Mode ══ */}
      <div style={tabBar}>
        {/* Tabs */}
        <div style={tabGroup}>
          {PURPOSE_TAB_OPTIONS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? activeTabBtn : inactiveTabBtn}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div style={tabRightControls}>
          <span style={sortLabel}>Sort by:</span>
          <div style={selectWrap}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...selectEl, paddingRight: '28px' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} color="#6B7280" style={selectIcon} />
          </div>

          {/* Grid / List toggle */}
          <div style={viewToggleGroup}>
            <button
              onClick={() => setViewMode('grid')}
              style={viewMode === 'grid' ? activeViewBtn : inactiveViewBtn}
              aria-label="Grid view"
            >
              <Grid3X3 size={16} strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={viewMode === 'list' ? activeViewBtn : inactiveViewBtn}
              aria-label="List view"
            >
              <List size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div style={resultsCount}>
        Showing {displayList.length > 0 ? `1–${displayList.length}` : '0'} of{' '}
        {displayList.length} properties
      </div>

      {/* ══ Property Grid / List ══ */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
          Loading properties...
        </div>
      ) : displayList.length === 0 ? (
        <div style={emptyState}>
          <Eye size={36} color="#D1D5DB" strokeWidth={1.5} />
          <p style={{ margin: '12px 0 0', color: '#6B7280', fontWeight: '600' }}>
            No properties match your filters.
          </p>
          <button onClick={handleReset} style={{ ...resetBtn, marginTop: '12px' }}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={gridContainer}>
          {displayList.map((prop) => (
            <PropertyCard key={prop.id} property={prop} viewMode="grid" onViewDetails={handleViewDetails} />
          ))}
        </div>
      ) : (
        <div style={listContainer}>
          {displayList.map((prop) => (
            <PropertyCard key={prop.id} property={prop} viewMode="list" onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const page = {
  background: '#FFFFFF',
  minHeight: '100vh',
  padding: '28px 28px 40px 28px',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  color: '#111827',
};

const pageHeader = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '24px',
};

const pageTitle = {
  fontSize: '26px',
  fontWeight: '800',
  color: '#111827',
  margin: 0,
  lineHeight: 1.2,
};

const pageSubtitle = {
  fontSize: '13px',
  color: '#6B7280',
  margin: '6px 0 0 0',
  fontWeight: '500',
};

const saveSearchBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  background: '#FFFFFF',
  border: '1.5px solid #1D6A4A',
  color: '#1D6A4A',
  borderRadius: '10px',
  padding: '9px 16px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  flexShrink: 0,
};

// ── Filter Panel ──
const filterPanel = {
  background: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  borderRadius: '16px',
  padding: '20px 20px 16px 20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  marginBottom: '20px',
};

const filterRow = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
};

const filterGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
  minWidth: '110px',
};

const filterLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#374151',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const searchInputWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '9px 14px',
  height: '40px',
};

const searchInput = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '13px',
  color: '#374151',
  width: '100%',
  fontFamily: 'inherit',
};

const selectWrap = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const selectEl = {
  appearance: 'none',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '9px 32px 9px 12px',
  fontSize: '13px',
  color: '#374151',
  fontFamily: 'inherit',
  fontWeight: '500',
  cursor: 'pointer',
  height: '40px',
  width: '100%',
  outline: 'none',
};

const selectIcon = {
  position: 'absolute',
  right: '10px',
  pointerEvents: 'none',
};

const priceRangeBox = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '7px 12px',
  height: '40px',
  justifyContent: 'center',
};

const priceRangeText = {
  fontSize: '12px',
  color: '#374151',
  fontWeight: '600',
};

const priceTrack = {
  width: '100%',
  height: '3px',
  background: '#E2E8F0',
  borderRadius: '2px',
  position: 'relative',
};

const priceThumb = {
  width: '70%',
  height: '100%',
  background: '#1D6A4A',
  borderRadius: '2px',
};

const moreFiltersBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '9px 14px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  cursor: 'pointer',
  height: '40px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const resetBtn = {
  background: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  padding: '9px 20px',
  fontSize: '13px',
  fontWeight: '700',
  color: '#374151',
  cursor: 'pointer',
  height: '40px',
  flexShrink: 0,
};

const applyBtn = {
  background: '#1D6A4A',
  border: 'none',
  borderRadius: '10px',
  padding: '9px 22px',
  fontSize: '13px',
  fontWeight: '700',
  color: '#FFFFFF',
  cursor: 'pointer',
  height: '40px',
  flexShrink: 0,
};

// ── Tab Bar ──
const tabBar = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '14px',
  gap: '12px',
  flexWrap: 'wrap',
};

const tabGroup = {
  display: 'flex',
  gap: '4px',
  background: '#F1F5F9',
  borderRadius: '10px',
  padding: '4px',
};

const activeTabBtn = {
  background: '#1D6A4A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '7px 18px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
};

const inactiveTabBtn = {
  background: 'transparent',
  color: '#6B7280',
  border: 'none',
  borderRadius: '8px',
  padding: '7px 18px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
};

const tabRightControls = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const sortLabel = {
  fontSize: '13px',
  color: '#6B7280',
  fontWeight: '600',
  whiteSpace: 'nowrap',
};

const viewToggleGroup = {
  display: 'flex',
  border: '1.5px solid #E2E8F0',
  borderRadius: '10px',
  overflow: 'hidden',
};

const activeViewBtn = {
  background: '#1D6A4A',
  color: '#FFFFFF',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

const inactiveViewBtn = {
  background: '#FFFFFF',
  color: '#6B7280',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

// ── Results count ──
const resultsCount = {
  fontSize: '13px',
  color: '#6B7280',
  fontWeight: '600',
  marginBottom: '16px',
};

// ── Grid layout ──
const gridContainer = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
};

const listContainer = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

// ── Empty state ──
const emptyState = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '60px 20px',
};

// ── Shared card atoms ──
const badgeStyle = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  color: '#fff',
  fontSize: '11px',
  fontWeight: '700',
  padding: '3px 10px',
  borderRadius: '20px',
};

const cardTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '4px',
};

const locationRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  color: '#6B7280',
  fontWeight: '500',
  marginBottom: '6px',
};

const priceRow = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '3px',
  marginBottom: '8px',
};

const priceText = {
  fontSize: '16px',
  fontWeight: '800',
  color: '#1D6A4A',
};

const priceNote = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#6B7280',
};

const featuresRow = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const featureChip = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  color: '#6B7280',
  fontWeight: '500',
};

// ── Grid card ──
const gridCardStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  transition: 'box-shadow 0.2s',
};

const gridImgWrap = {
  position: 'relative',
  height: '190px',
  overflow: 'hidden',
};

const gridImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const gridFavBtn = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(0,0,0,0.35)',
  border: 'none',
  borderRadius: '50%',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  backdropFilter: 'blur(4px)',
};

const gridBody = {
  padding: '14px 16px 16px',
};

// ── List card ──
const listCardStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  borderRadius: '16px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  display: 'flex',
  alignItems: 'stretch',
  overflow: 'hidden',
};

const listImgWrap = {
  position: 'relative',
  width: '200px',
  flexShrink: 0,
};

const listImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const listBody = {
  flex: 1,
  padding: '16px 16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const favBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  flexShrink: 0,
};

const viewDetailsBtnList = {
  background: '#1D6A4A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 0,
  padding: '0 24px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  flexShrink: 0,
  whiteSpace: 'nowrap',
};

const viewDetailsBtnGrid = {
  display: 'block',
  width: 'calc(100% - 32px)',
  margin: '0 16px 14px',
  background: '#1D6A4A',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 0',
  fontSize: '12.5px',
  fontWeight: '700',
  cursor: 'pointer',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  textAlign: 'center',
};

export default MyProperties;