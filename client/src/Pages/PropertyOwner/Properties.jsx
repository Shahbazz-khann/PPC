import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Search,
  ChevronDown,
  RotateCcw,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Grid3X3,
  List,
  Eye,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Info,
} from 'lucide-react';
import { getOwnerPropertiesSummary, getOwnerProperties, getOwnerPropertyDetails, createOwnerProperty, uploadOwnerPropertyMedia } from '../../Services/owner.services';
import './PropertiesResponsive.css';

// ─── Owner-Scoped Initial Mock Data ───────────────────────────────────────────
const INITIAL_MOCK_PROPERTIES = []; // Removed for backend integration

const INITIAL_FORM_DATA = {
  title: '',
  property_type: 'House',
  property_status: 'For Sale',
  description: '',
  address: '',
  city: 'Islamabad',
  area_value: '',
  area_unit: 'Marla',
  bedrooms: '3',
  bathrooms: '3',
  sale_price: '',
  rent_price: '',
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1';
  const host = base.replace(/\/api\/v1\/?$/, '');
  return `${host}${url}`;
};

const PropertyImageCarousel = ({ property, imgErrors, handleImageError, styles, customStyles }) => {
  const parsedImages = Array.isArray(property.images) ? property.images.filter(Boolean) : [];
  const images = parsedImages.length > 0 ? parsedImages : 
                 (property.primary_image || property.image) ? [property.primary_image || property.image] : [];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0 || imgErrors[property.property_id]) {
    return (
      <div style={{ ...styles.cardImage, ...customStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', color: '#9CA3AF', fontSize: '14px' }}>
        No image available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <img
        src={getImageUrl(images[currentIndex])}
        alt={property.title}
        style={{ ...styles.cardImage, ...customStyles, objectFit: 'cover', width: '100%', height: '100%' }}
        onError={() => handleImageError(property.property_id)}
      />
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            &#10094;
          </button>
          <button 
            onClick={handleNext}
            style={{ position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          >
            &#10095;
          </button>
          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 10 }}>
            {images.map((_, idx) => (
              <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OwnerProperties = () => {
  const navigate = useNavigate();

  // Core properties state
  const [propertiesList, setPropertiesList] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState(null);

  // UI state
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewDetails = async (propertyId) => {
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    setDetailsError(null);
    setSelectedPropertyDetails(null);
    try {
      const res = await getOwnerPropertyDetails(propertyId);
      setSelectedPropertyDetails(res?.data?.data || res?.data);
    } catch (err) {
      console.error("Failed to load details:", err);
      setDetailsError("Unable to load property details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedImages, setSelectedImages] = useState([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [verifFilter, setVerifFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSummaryCard, setSelectedSummaryCard] = useState('Total');

  // Image error state per property
  const [imgErrors, setImgErrors] = useState({});

  const handleImageError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  // Handle Multiple File Upload (Max 6)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (selectedImages.length + files.length > 6) {
      setFormError('You can only upload up to 6 images.');
      return;
    }

    let hasError = false;
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidType) {
        setFormError('Invalid file type. Only JPEG, PNG, WEBP are allowed.');
        hasError = true;
      }
      if (!isValidSize) {
        setFormError('File size must be under 5MB.');
        hasError = true;
      }
      return isValidType && isValidSize;
    });

    if (hasError) return;

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => {
      const newImgs = [...prev];
      URL.revokeObjectURL(newImgs[indexToRemove].preview);
      newImgs.splice(indexToRemove, 1);
      return newImgs;
    });
  };

  // Submit Property Handler
  const handleSubmitProperty = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setFormError('Please enter a valid property title.');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Please enter the complete property address.');
      return;
    }
    if (!formData.area_value || Number(formData.area_value) <= 0) {
      setFormError('Please enter a valid property area size.');
      return;
    }

    if (formData.property_status === 'For Sale' && (!formData.sale_price || Number(formData.sale_price) <= 0)) {
      setFormError('Please enter a valid sale price for the property.');
      return;
    }

    if (formData.property_status === 'For Rent' && (!formData.rent_price || Number(formData.rent_price) <= 0)) {
      setFormError('Please enter a valid monthly rent price.');
      return;
    }

    if (selectedImages.length === 0) {
      setFormError('At least 1 property image is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const PROPERTY_TYPE_MAP = { 'House': 1, 'Apartment': 2, 'Villa': 3, 'Plot': 4, 'Commercial': 5, 'Office': 6 };
      const AREA_UNIT_MAP = { 'Square Feet': 1, 'sqft': 1, 'Square Yard': 2, 'sqyd': 2, 'Marla': 3, 'Kanal': 4, 'Acre': 5 };
      const isResidential = formData.property_type === 'House' || formData.property_type === 'Apartment' || formData.property_type === 'Villa';

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || 'No description provided.',
        property_type_id: PROPERTY_TYPE_MAP[formData.property_type] || 1,
        city: formData.city,
        address: formData.address.trim(),
        area_value: Number(formData.area_value),
        area_unit_id: AREA_UNIT_MAP[formData.area_unit] || 3,
        bedrooms: isResidential ? Number(formData.bedrooms || 0) : null,
        bathrooms: isResidential ? Number(formData.bathrooms || 0) : null,
        sale_price: formData.property_status === 'For Sale' ? Number(formData.sale_price) : null,
        rent_price: formData.property_status === 'For Rent' ? Number(formData.rent_price) : null,
      };

      const response = await createOwnerProperty(payload);
      const newPropertyId = response?.data?.data?.property_id || response?.data?.property_id;

      if (newPropertyId && selectedImages.length > 0) {
        // Upload images one by one
        await Promise.all(selectedImages.map((imgObj, index) => {
          const mediaForm = new FormData();
          mediaForm.append('media', imgObj.file);
          mediaForm.append('is_primary', index === 0 ? 'true' : 'false');
          return uploadOwnerPropertyMedia(newPropertyId, mediaForm);
        }));
      }

      // Show success notification
      setSuccessBanner({
        title: 'Property Submitted Successfully!',
        message: `"${payload.title}" has been created and submitted for PPC & Inspector verification. Status: Pending Verification.`,
      });

      // Reset Form & View Mode
      setFormData(INITIAL_FORM_DATA);
      setSelectedImages([]);
      setIsAddingProperty(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Failed to add property:", err);
      setFormError(err.message || "Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch properties from backend based on filters
  useEffect(() => {
    let isMounted = true;
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const params = { limit: 100 };
        if (searchText.trim()) params.search = searchText.trim();
        if (typeFilter !== 'All') params.property_type = typeFilter;
        if (purposeFilter !== 'All') params.property_status = purposeFilter;
        if (verifFilter !== 'All') params.verification_status = verifFilter;
        
        // Apply summary card filter overrides
        if (selectedSummaryCard === 'Verified') {
          params.verification_status = 'Verified';
        } else if (selectedSummaryCard === 'Pending') {
          params.verification_status = 'Pending';
        } else if (selectedSummaryCard === 'Active') {
          params.property_status = 'Active';
        }

        const res = await getOwnerProperties(params);
        if (isMounted) {
          setPropertiesList(res?.data?.data?.properties || res?.data?.data || res?.data || []);
          setPropertiesError(null);
        }
      } catch (err) {
        console.error("Failed to fetch properties:", err);
        if (isMounted) setPropertiesError("Unable to load properties.");
      } finally {
        if (isMounted) setLoadingProperties(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchProperties();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchText, typeFilter, purposeFilter, verifFilter, refreshTrigger, selectedSummaryCard]);

  const filteredProperties = propertiesList;

  const handleResetFilters = () => {
    setSearchText('');
    setTypeFilter('All');
    setPurposeFilter('All');
    setVerifFilter('All');
    setSelectedSummaryCard('Total');
  };

  // Summary Metrics
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoadingSummary(true);
        const res = await getOwnerPropertiesSummary();
        if (isMounted) {
          setSummaryData(res?.data?.data || res?.data || null);
          setSummaryError(null);
        }
      } catch (err) {
        console.error("Failed to load properties summary:", err);
        if (isMounted) setSummaryError("Unable to load summary.");
      } finally {
        if (isMounted) setLoadingSummary(false);
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, [refreshTrigger]);

  const totalCount = summaryData?.total_properties ?? 0;
  const verifiedCount = summaryData?.verified_properties ?? 0;
  const pendingCount = summaryData?.pending_verification ?? 0;
  const activeCount = summaryData?.active_properties ?? 0;

  const formatPrice = (val) => 'Rs. ' + Number(val).toLocaleString('en-PK');

  // Render Add Property Form View
  if (isAddingProperty) {
    const isResidential = formData.property_type === 'House' || formData.property_type === 'Apartment';

    return (
      <div className="responsive-page" style={styles.page}>
        {/* Top Navigation Row */}
        <div style={styles.formHeaderRow}>
          <button style={styles.backBtn} onClick={() => setIsAddingProperty(false)}>
            <ArrowLeft size={16} />
            <span>Back to My Properties</span>
          </button>
        </div>

        {/* Page Title Header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Add New Property</h1>
            <p style={styles.pageSubtitle}>
              Submit property information to Pakistan Property Care (PPC) for inspection and official verification.
            </p>
          </div>
        </div>

        {/* Error Alert if any */}
        {formError && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="#991B1B" />
            <span style={styles.errorText}>{formError}</span>
          </div>
        )}

        {/* Verification Process Info Callout */}
        <div style={styles.infoBanner}>
          <div style={styles.infoIconBox}>
            <ShieldCheck size={22} color="#1D6A4A" />
          </div>
          <div>
            <h4 style={styles.infoBannerTitle}>PPC Verification & Listing Workflow</h4>
            <p style={styles.infoBannerText}>
              After submission, your property will enter <strong>Pending Verification</strong> status. A PPC inspector will be assigned to review property details and schedule a physical inspection before it is marked as <strong>Verified</strong>.
            </p>
          </div>
        </div>

        {/* Main Submission Form */}
        <form onSubmit={handleSubmitProperty} className="responsive-form-container" style={styles.formContainer}>
          {/* Section 1: Basic Information */}
          <div style={styles.formCard}>
            <div style={styles.cardHeaderRow}>
              <Building2 size={18} color="#1D6A4A" />
              <h3 style={styles.cardSectionTitle}>1. Basic Property Information</h3>
            </div>

            <div className="responsive-form-grid2" style={styles.formGrid2}>
              <div style={styles.fieldGroupFull}>
                <label style={styles.label}>
                  Property Title <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Executive 5 Bedroom Luxury Villa in DHA"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  style={styles.textInput}
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Property Type <span style={styles.req}>*</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={formData.property_type}
                    onChange={(e) => handleInputChange('property_type', e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Plot">Plot / Land</option>
                  </select>
                  <ChevronDown size={15} color="#6B7280" style={styles.selectIcon} />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Listing Purpose / Status <span style={styles.req}>*</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={formData.property_status}
                    onChange={(e) => handleInputChange('property_status', e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                  <ChevronDown size={15} color="#6B7280" style={styles.selectIcon} />
                </div>
              </div>

              <div style={styles.fieldGroupFull}>
                <label style={styles.label}>Property Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe key features, condition, parking, amenities, or nearby landmarks..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={styles.textareaInput}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div style={styles.formCard}>
            <div style={styles.cardHeaderRow}>
              <MapPin size={18} color="#1D6A4A" />
              <h3 style={styles.cardSectionTitle}>2. Address & Location Details</h3>
            </div>

            <div className="responsive-form-grid2" style={styles.formGrid2}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  City <span style={styles.req}>*</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="Islamabad">Islamabad</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Multan">Multan</option>
                  </select>
                  <ChevronDown size={15} color="#6B7280" style={styles.selectIcon} />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Address / Street Location <span style={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 42, Street 12, Sector F-7/2"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={styles.textInput}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Area, Rooms & Financials */}
          <div style={styles.formCard}>
            <div style={styles.cardHeaderRow}>
              <Maximize size={18} color="#1D6A4A" />
              <h3 style={styles.cardSectionTitle}>3. Size, Rooms & Pricing Details</h3>
            </div>

            <div className="responsive-form-grid2" style={styles.formGrid2}>
              {/* Area Size & Unit */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Area Value <span style={styles.req}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10 or 1200"
                  value={formData.area_value}
                  onChange={(e) => handleInputChange('area_value', e.target.value)}
                  style={styles.textInput}
                  min="0.1"
                  step="any"
                  required
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>
                  Area Unit <span style={styles.req}>*</span>
                </label>
                <div style={styles.selectWrap}>
                  <select
                    value={formData.area_unit}
                    onChange={(e) => handleInputChange('area_unit', e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                    <option value="sqft">sqft</option>
                  </select>
                  <ChevronDown size={15} color="#6B7280" style={styles.selectIcon} />
                </div>
              </div>

              {/* Bedrooms & Bathrooms (If residential) */}
              {isResidential && (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bedrooms</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                      style={styles.textInput}
                      min="0"
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Bathrooms</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                      style={styles.textInput}
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Sale Price or Rent Price */}
              {formData.property_status === 'For Sale' ? (
                <div style={styles.fieldGroupFull}>
                  <label style={styles.label}>
                    Sale Price (PKR) <span style={styles.req}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000000"
                    value={formData.sale_price}
                    onChange={(e) => handleInputChange('sale_price', e.target.value)}
                    style={styles.textInput}
                    min="1"
                    required
                  />
                  {formData.sale_price && (
                    <span style={styles.priceFormattedHint}>
                      Formatted: {formatPrice(formData.sale_price)}
                    </span>
                  )}
                </div>
              ) : (
                <div style={styles.fieldGroupFull}>
                  <label style={styles.label}>
                    Monthly Rent Price (PKR) <span style={styles.req}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 120000"
                    value={formData.rent_price}
                    onChange={(e) => handleInputChange('rent_price', e.target.value)}
                    style={styles.textInput}
                    min="1"
                    required
                  />
                  {formData.rent_price && (
                    <span style={styles.priceFormattedHint}>
                      Formatted: {formatPrice(formData.rent_price)} / month
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Property Images / Media */}
          <div style={styles.formCard}>
            <div style={styles.cardHeaderRow}>
              <ImageIcon size={18} color="#1D6A4A" />
              <h3 style={styles.cardSectionTitle}>4. Property Images & Media</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* File Dropzone / Selector */}
              <div style={styles.dropZone}>
                <Upload size={32} color="#1D6A4A" />
                <div style={{ textAlign: 'center' }}>
                  <p style={styles.dropZoneTitle}>Upload Property Photos (Max 6)</p>
                  <p style={styles.dropZoneSub}>PNG, JPG, or WEBP images up to 5MB</p>
                </div>
                <label style={styles.uploadBtnLabel}>
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Selected Image Previews Grid */}
              {selectedImages.length > 0 && (
                <div>
                  <span style={styles.label}>Selected Images ({selectedImages.length}/6):</span>
                  <div className="responsive-image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '12px' }}>
                    {selectedImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                        <img src={img.preview} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {idx === 0 && (
                          <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(29, 106, 74, 0.9)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}
                        >
                          <X size={12} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div style={styles.formActionBar}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => setIsAddingProperty(false)}
            >
              Cancel
            </button>
            <button type="submit" style={{...styles.submitPropertyBtn, opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
              <Building2 size={16} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Property'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Main View (My Properties List/Grid) ──────────────────────────────────
  return (
    <div className="responsive-page" style={styles.page}>
      {/* Success Notification Banner */}
      {successBanner && (
        <div style={styles.successBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#059669" />
            <div>
              <strong style={styles.successTitle}>{successBanner.title}</strong>
              <p style={styles.successMessage}>{successBanner.message}</p>
            </div>
          </div>
          <button style={styles.closeBannerBtn} onClick={() => setSuccessBanner(null)}>
            <X size={16} color="#065F46" />
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="responsive-header" style={styles.pageHeader}>
        <div>
          <div style={styles.headerTitleRow}>
            <h1 style={styles.pageTitle}>My Properties</h1>
            <span style={styles.countBadge}>{totalCount} Properties</span>
          </div>
          <p style={styles.pageSubtitle}>
            View and monitor your properties listed with Pakistan Property Care (PPC).
          </p>
        </div>

        {/* Top Right "+ Add Property" Button */}
        <button style={styles.addPropertyBtn} onClick={() => setIsAddingProperty(true)}>
          <Plus size={18} />
          <span>Add Property</span>
        </button>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="responsive-metrics" style={styles.metricsGrid}>
        <div 
          style={{
            ...styles.metricCard, 
            cursor: 'pointer',
            border: selectedSummaryCard === 'Total' ? '2px solid #1D6A4A' : '1px solid #E2E8F0',
            boxShadow: selectedSummaryCard === 'Total' ? '0 4px 12px rgba(29, 106, 74, 0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => setSelectedSummaryCard('Total')}
        >
          <div style={styles.metricTop}>
            <div style={{ ...styles.metricIconBox, background: '#E8F4F1', color: '#1D6A4A' }}>
              <Building2 size={20} />
            </div>
            <span style={styles.metricVal}>{loadingSummary ? '...' : (summaryError ? '-' : totalCount)}</span>
          </div>
          <div style={styles.metricLabel}>Total Properties</div>
          <div style={styles.metricSub}>Registered on platform</div>
        </div>

        <div 
          style={{
            ...styles.metricCard, 
            cursor: 'pointer',
            border: selectedSummaryCard === 'Verified' ? '2px solid #059669' : '1px solid #E2E8F0',
            boxShadow: selectedSummaryCard === 'Verified' ? '0 4px 12px rgba(5, 150, 105, 0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => setSelectedSummaryCard('Verified')}
        >
          <div style={styles.metricTop}>
            <div style={{ ...styles.metricIconBox, background: '#ECFDF5', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </div>
            <span style={styles.metricVal}>{loadingSummary ? '...' : (summaryError ? '-' : verifiedCount)}</span>
          </div>
          <div style={styles.metricLabel}>Verified Properties</div>
          <div style={styles.metricSub}>PPC Verified</div>
        </div>

        <div 
          style={{
            ...styles.metricCard, 
            cursor: 'pointer',
            border: selectedSummaryCard === 'Pending' ? '2px solid #D97706' : '1px solid #E2E8F0',
            boxShadow: selectedSummaryCard === 'Pending' ? '0 4px 12px rgba(217, 119, 6, 0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => setSelectedSummaryCard('Pending')}
        >
          <div style={styles.metricTop}>
            <div style={{ ...styles.metricIconBox, background: '#FFF7ED', color: '#D97706' }}>
              <Clock size={20} />
            </div>
            <span style={styles.metricVal}>{loadingSummary ? '...' : (summaryError ? '-' : pendingCount)}</span>
          </div>
          <div style={styles.metricLabel}>Pending Verification</div>
          <div style={styles.metricSub}>Under review by PPC</div>
        </div>

        <div 
          style={{
            ...styles.metricCard, 
            cursor: 'pointer',
            border: selectedSummaryCard === 'Active' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
            boxShadow: selectedSummaryCard === 'Active' ? '0 4px 12px rgba(79, 70, 229, 0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => setSelectedSummaryCard('Active')}
        >
          <div style={styles.metricTop}>
            <div style={{ ...styles.metricIconBox, background: '#EEF2FF', color: '#4F46E5' }}>
              <ShieldCheck size={20} />
            </div>
            <span style={styles.metricVal}>{loadingSummary ? '...' : (summaryError ? '-' : activeCount)}</span>
          </div>
          <div style={styles.metricLabel}>Active Properties</div>
          <div style={styles.metricSub}>Listed for rent or sale</div>
        </div>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="responsive-filter-bar" style={styles.filterCard}>
        <div className="responsive-filter-left" style={styles.filterRow}>
          {/* Search */}
          <div className="responsive-search-box" style={styles.searchWrap}>
            <Search size={15} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search property by title, city, or address..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Type Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Type</label>
            <div style={styles.selectWrap}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={styles.selectEl}
              >
                <option value="All">All Types</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
                <option value="Plot">Plot</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
            </div>
          </div>

          {/* Status/Purpose Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <div style={styles.selectWrap}>
              <select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                style={styles.selectEl}
              >
                <option value="All">All Statuses</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
            </div>
          </div>

          {/* Verification Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Verification</label>
            <div style={styles.selectWrap}>
              <select
                value={verifFilter}
                onChange={(e) => setVerifFilter(e.target.value)}
                style={styles.selectEl}
              >
                <option value="All">All Verification</option>
                <option value="Verified">Verified</option>
                <option value="Under Review">Under Review</option>
              </select>
              <ChevronDown size={14} color="#6B7280" style={styles.selectIcon} />
            </div>
          </div>

          {/* Reset Action */}
          <button style={styles.resetBtn} onClick={handleResetFilters}>
            <RotateCcw size={13} color="#374151" />
            Reset
          </button>

          {/* View Toggle */}
          <div style={styles.viewToggleGroup}>
            <button
              style={viewMode === 'grid' ? styles.viewBtnActive : styles.viewBtnInactive}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              style={viewMode === 'list' ? styles.viewBtnActive : styles.viewBtnInactive}
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Count Bar ── */}
      <div style={styles.resultsBar}>
        Showing {filteredProperties.length} of {totalCount} properties
      </div>

      {/* ── Property Content Area ── */}
      {loadingProperties ? (
        <div style={styles.emptyStateCard}>
          <h3 style={styles.emptyStateTitle}>Loading properties...</h3>
        </div>
      ) : propertiesError ? (
        <div style={styles.emptyStateCard}>
          <AlertCircle size={40} color="#991B1B" strokeWidth={1.5} />
          <h3 style={styles.emptyStateTitle}>{propertiesError}</h3>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div style={styles.emptyStateCard}>
          <AlertCircle size={40} color="#9CA3AF" strokeWidth={1.5} />
          <h3 style={styles.emptyStateTitle}>No properties match your filters</h3>
          <p style={styles.emptyStateDesc}>Try clearing or adjusting your search filters above.</p>
          <button style={styles.resetBtn} onClick={handleResetFilters}>
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── Grid View ── */
        <div className="responsive-grid" style={styles.gridContainer}>
          {filteredProperties.map((prop) => {
            const isVerified = prop.verification_status === 'Verified';
            return (
              <div key={prop.property_id} className="responsive-grid-card" style={styles.gridCard}>
                {/* Media Image */}
                <div className="responsive-card-img-wrap" style={styles.cardImageWrap}>
                  <PropertyImageCarousel 
                    property={prop} 
                    imgErrors={imgErrors} 
                    handleImageError={handleImageError} 
                    styles={styles} 
                  />
                  <span style={styles.purposeBadge}>{prop.property_status}</span>
                  <span
                    style={{
                      ...styles.verifBadge,
                      background: isVerified ? '#DCFCE7' : '#FEF3C7',
                      color: isVerified ? '#166534' : '#92400E',
                    }}
                  >
                    {isVerified ? '✓ PPC Verified' : '⏳ Under Review'}
                  </span>
                </div>

                {/* Body */}
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{prop.title}</div>
                  <div style={styles.cardLocation}>
                    <MapPin size={12} color="#9CA3AF" />
                    <span>
                      {prop.address}, {prop.city}
                    </span>
                  </div>

                  {/* Price */}
                  <div style={styles.cardPrice}>
                    {prop.sale_price && formatPrice(prop.sale_price)}
                    {prop.rent_price && (
                      <>
                        {formatPrice(prop.rent_price)}
                        <span style={styles.priceSub}> / month</span>
                      </>
                    )}
                  </div>

                  {/* Specs */}
                  <div style={styles.specsRow}>
                    {prop.bedrooms !== null && (
                      <span style={styles.specChip}>
                        <BedDouble size={12} color="#6B7280" /> {prop.bedrooms} Bed
                      </span>
                    )}
                    {prop.bathrooms !== null && (
                      <span style={styles.specChip}>
                        <Bath size={12} color="#6B7280" /> {prop.bathrooms} Bath
                      </span>
                    )}
                    <span style={styles.specChip}>
                      <Maximize size={12} color="#6B7280" /> {prop.area_value} {prop.area_unit}
                    </span>
                  </div>

                  {/* PPC Workflow Stage Indicators */}
                  <div style={styles.workflowSection}>
                    <div style={styles.wfItem}>
                      <span style={styles.wfLabel}>Verification:</span>
                      <span
                        style={{
                          ...styles.wfValue,
                          color: isVerified ? '#059669' : '#D97706',
                        }}
                      >
                        {isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    <div style={styles.wfItem}>
                      <span style={styles.wfLabel}>Inspection:</span>
                      <span style={styles.wfValue}>{prop.inspection_status}</span>
                    </div>
                    <div style={styles.wfItem}>
                      <span style={styles.wfLabel}>Visits Scheduled:</span>
                      <span style={styles.wfValue}>{prop.scheduled_visits_count || prop.visits_count || 0} Visits</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    style={styles.detailsBtnGrid}
                    onClick={() => handleViewDetails(prop.property_id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── List View ── */
        <div style={styles.listContainer}>
          {filteredProperties.map((prop) => {
            const isVerified = prop.verification_status === 'Verified';
            return (
              <div key={prop.property_id} className="responsive-list-card" style={styles.listCard}>
                <div className="responsive-list-img" style={styles.listImgWrap}>
                  <PropertyImageCarousel 
                    property={prop} 
                    imgErrors={imgErrors} 
                    handleImageError={handleImageError} 
                    styles={styles}
                    customStyles={styles.listImage}
                  />
                  <span style={styles.purposeBadge}>{prop.property_status}</span>
                </div>

                <div style={styles.listBody}>
                  <div style={styles.listTopRow}>
                    <div>
                      <div style={styles.cardTitle}>{prop.title}</div>
                      <div style={styles.cardLocation}>
                        <MapPin size={12} color="#9CA3AF" />
                        <span>
                          {prop.address}, {prop.city}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        ...styles.verifBadgeStatic,
                        background: isVerified ? '#DCFCE7' : '#FEF3C7',
                        color: isVerified ? '#166534' : '#92400E',
                      }}
                    >
                      {isVerified ? '✓ PPC Verified' : '⏳ Under Review'}
                    </span>
                  </div>

                  <div style={styles.cardPrice}>
                    {prop.sale_price && formatPrice(prop.sale_price)}
                    {prop.rent_price && (
                      <>
                        {formatPrice(prop.rent_price)}
                        <span style={styles.priceSub}> / month</span>
                      </>
                    )}
                  </div>

                  <div style={styles.specsRow}>
                    {prop.bedrooms !== null && (
                      <span style={styles.specChip}>
                        <BedDouble size={12} color="#6B7280" /> {prop.bedrooms} Bed
                      </span>
                    )}
                    {prop.bathrooms !== null && (
                      <span style={styles.specChip}>
                        <Bath size={12} color="#6B7280" /> {prop.bathrooms} Bath
                      </span>
                    )}
                    <span style={styles.specChip}>
                      <Maximize size={12} color="#6B7280" /> {prop.area_value} {prop.area_unit}
                    </span>
                    <span style={styles.specChip}>
                      <Calendar size={12} color="#6B7280" /> {prop.scheduled_visits_count || prop.visits_count || 0} Visits
                    </span>
                  </div>
                </div>

                <div style={styles.listActionWrap}>
                  <button
                    style={styles.detailsBtnList}
                    onClick={() => handleViewDetails(prop.property_id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Property Details Modal ── */}
      {detailsModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setDetailsModalOpen(false)}>
          <div className="responsive-modal-container" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="#1D6A4A" />
                <h3 style={styles.modalTitle}>Property Overview</h3>
              </div>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setDetailsModalOpen(false)}
              >
                <X size={18} color="#374151" />
              </button>
            </div>

            <div style={styles.modalBody}>
              {detailsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                  Loading property details...
                </div>
              ) : detailsError ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#991B1B' }}>
                  <AlertCircle size={32} style={{ marginBottom: '12px' }} />
                  <div>{detailsError}</div>
                </div>
              ) : selectedPropertyDetails ? (
                <>
                  <div style={styles.modalImgWrap}>
                    <PropertyImageCarousel 
                      property={selectedPropertyDetails} 
                      imgErrors={imgErrors} 
                      handleImageError={handleImageError} 
                      styles={styles}
                      customStyles={styles.modalImg}
                    />
                    <span style={styles.purposeBadge}>{selectedPropertyDetails.property_status}</span>
                  </div>

                  <h2 style={styles.modalPropTitle}>{selectedPropertyDetails.title}</h2>
                  <p style={styles.modalPropLoc}>
                    <MapPin size={14} color="#1D6A4A" />
                    <span>
                      {selectedPropertyDetails.address}, {selectedPropertyDetails.city}
                    </span>
                  </p>

                  <div style={styles.modalPriceBox}>
                    <span style={styles.modalPriceVal}>
                      {selectedPropertyDetails.sale_price && formatPrice(selectedPropertyDetails.sale_price)}
                      {selectedPropertyDetails.rent_price && (
                        <>
                          {formatPrice(selectedPropertyDetails.rent_price)}
                          <span style={{ fontSize: '13px', color: '#6B7280' }}> / month</span>
                        </>
                      )}
                    </span>
                    <span
                      style={{
                        ...styles.verifBadgeStatic,
                        background:
                          selectedPropertyDetails.verification_status_name === 'Verified'
                            ? '#DCFCE7'
                            : '#FEF3C7',
                        color:
                          selectedPropertyDetails.verification_status_name === 'Verified'
                            ? '#166534'
                            : '#92400E',
                      }}
                    >
                      {selectedPropertyDetails.verification_status_name === 'Verified'
                        ? '✓ PPC Verified'
                        : '⏳ Under Review'}
                    </span>
                  </div>

                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionHeading}>Property Details</h4>
                    <div className="responsive-grid" style={styles.modalGrid2}>
                      <div>
                        <span style={styles.modalKey}>Property Type:</span>{' '}
                        <strong style={styles.modalVal}>{selectedPropertyDetails.property_type}</strong>
                      </div>
                      <div>
                        <span style={styles.modalKey}>Area Size:</span>{' '}
                        <strong style={styles.modalVal}>
                          {selectedPropertyDetails.area_value} {selectedPropertyDetails.area_unit}
                        </strong>
                      </div>
                      {selectedPropertyDetails.bedrooms !== null && (
                        <div>
                          <span style={styles.modalKey}>Bedrooms:</span>{' '}
                          <strong style={styles.modalVal}>{selectedPropertyDetails.bedrooms} Bed</strong>
                        </div>
                      )}
                      {selectedPropertyDetails.bathrooms !== null && (
                        <div>
                          <span style={styles.modalKey}>Bathrooms:</span>{' '}
                          <strong style={styles.modalVal}>{selectedPropertyDetails.bathrooms} Bath</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionHeading}>Description</h4>
                    <p style={styles.modalDescText}>{selectedPropertyDetails.description}</p>
                  </div>

                  {/* Workflow Status Timeline */}
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSectionHeading}>PPC Verification Status</h4>
                    <div style={styles.timelineBox}>
                      <div style={styles.timelineStep}>
                        <div style={{ ...styles.stepCircle, background: '#DCFCE7', color: '#166534' }}>
                          ✓
                        </div>
                        <div>
                          <strong style={styles.stepTitle}>1. Property Submitted</strong>
                          <p style={styles.stepDesc}>Property submitted by owner to PPC system.</p>
                        </div>
                      </div>

                      <div style={styles.timelineStep}>
                        <div
                          style={{
                            ...styles.stepCircle,
                            background:
                              selectedPropertyDetails.verification_status_name === 'Verified'
                                ? '#DCFCE7'
                                : '#FEF3C7',
                            color:
                              selectedPropertyDetails.verification_status_name === 'Verified'
                                ? '#166534'
                                : '#92400E',
                          }}
                        >
                          {selectedPropertyDetails.verification_status_name === 'Verified' ? '✓' : '⏳'}
                        </div>
                        <div>
                          <strong style={styles.stepTitle}>2. Inspector & PPC Verification</strong>
                          <p style={styles.stepDesc}>
                            {selectedPropertyDetails.verification_status_name === 'Verified'
                              ? `Verified Status`
                              : 'Pending inspector assignment and physical property verification.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.modalDoneBtn}
                onClick={() => setDetailsModalOpen(false)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    background: '#FFFFFF',
    minHeight: '100vh',
    padding: '28px 28px 40px 28px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: '#111827',
  },

  pageHeader: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1.3,
  },
  countBadge: {
    background: '#E8F4F1',
    color: '#1D6A4A',
    fontSize: '12px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '4px 0 0 0',
    fontWeight: '400',
  },

  addPropertyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(29, 106, 74, 0.2)',
    transition: 'all 0.2s ease',
  },

  successBanner: {
    background: '#ECFDF5',
    border: '1.5px solid #A7F3D0',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#065F46',
  },
  successMessage: {
    fontSize: '12.5px',
    color: '#047857',
    margin: '2px 0 0 0',
  },
  closeBannerBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '14px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#111827',
  },
  metricSub: {
    fontSize: '11px',
    color: '#6B7280',
    fontWeight: '500',
  },

  filterCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '14px',
    padding: '14px 18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    marginBottom: '16px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '14px',
    flexWrap: 'wrap',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    padding: '7px 12px',
    flex: 2,
    minWidth: '220px',
    background: '#F8FAFC',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '12.5px',
    color: '#111827',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: '120px',
  },
  filterLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectEl: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    padding: '6px 28px 6px 10px',
    fontSize: '12px',
    color: '#111827',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
  },
  selectIcon: {
    position: 'absolute',
    right: '8px',
    pointerEvents: 'none',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  viewToggleGroup: {
    display: 'flex',
    gap: '2px',
    background: '#F1F5F9',
    padding: '3px',
    borderRadius: '8px',
  },
  viewBtnActive: {
    background: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 8px',
    cursor: 'pointer',
    color: '#1D6A4A',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
  },
  viewBtnInactive: {
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    padding: '5px 8px',
    cursor: 'pointer',
    color: '#6B7280',
    display: 'flex',
  },

  resultsBar: {
    fontSize: '12px',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '16px',
  },

  emptyStateCard: {
    background: '#FFFFFF',
    border: '1.5px dashed #CBD5E1',
    borderRadius: '16px',
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyStateTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  emptyStateDesc: {
    fontSize: '13px',
    color: '#6B7280',
    margin: 0,
  },

  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  gridCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImageWrap: {
    position: 'relative',
    height: '170px',
    background: '#F1F5F9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  purposeBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#1D6A4A',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
  },
  verifBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
  },
  verifBadgeStatic: {
    fontSize: '10.5px',
    fontWeight: '700',
    padding: '3px 9px',
    borderRadius: '6px',
  },
  cardBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
  },
  cardLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6B7280',
  },
  cardPrice: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1D6A4A',
  },
  priceSub: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6B7280',
  },
  specsRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  specChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11.5px',
    color: '#4B5563',
  },

  workflowSection: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
  },
  wfItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  wfLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  wfValue: {
    color: '#111827',
    fontWeight: '600',
  },

  detailsBtnGrid: {
    width: '100%',
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 0',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    textAlign: 'center',
    marginTop: '8px',
  },

  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  listCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'stretch',
  },
  listImgWrap: {
    position: 'relative',
    width: '210px',
    flexShrink: 0,
  },
  listImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  listBody: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '8px',
  },
  listTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listActionWrap: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
  },
  detailsBtnList: {
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    whiteSpace: 'nowrap',
  },

  /* ── Form View Specific Styles ── */
  formHeaderRow: {
    marginBottom: '16px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#F1F5F9',
    color: '#334155',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  errorBanner: {
    background: '#FEF2F2',
    border: '1.5px solid #FCA5A5',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#991B1B',
  },
  infoBanner: {
    background: '#E8F4F1',
    border: '1.5px solid #A7F3D0',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  infoIconBox: {
    background: '#FFFFFF',
    padding: '8px',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  infoBannerTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1D6A4A',
    margin: '0 0 4px 0',
  },
  infoBannerText: {
    fontSize: '12.5px',
    color: '#166534',
    margin: 0,
    lineHeight: '1.5',
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formCard: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '12px',
  },
  cardSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '18px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldGroupFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#374151',
  },
  req: {
    color: '#EF4444',
  },
  textInput: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: '#FFFFFF',
  },
  textareaInput: {
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#111827',
    outline: 'none',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: '#FFFFFF',
    resize: 'vertical',
  },
  selectInput: {
    appearance: 'none',
    WebkitAppearance: 'none',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '10px 32px 10px 14px',
    fontSize: '13px',
    color: '#111827',
    background: '#FFFFFF',
    cursor: 'pointer',
    outline: 'none',
    width: '100%',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    fontWeight: '500',
  },
  priceFormattedHint: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1D6A4A',
    marginTop: '2px',
  },

  dropZone: {
    border: '2px dashed #CBD5E1',
    borderRadius: '12px',
    padding: '24px',
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  dropZoneTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  dropZoneSub: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '2px 0 0 0',
  },
  uploadBtnLabel: {
    background: '#1D6A4A',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12.5px',
    fontWeight: '700',
    cursor: 'pointer',
  },

  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  presetCard: {
    position: 'relative',
    border: '2px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#FFFFFF',
    transition: 'all 0.15s ease',
  },
  presetImg: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
  },
  presetLabel: {
    display: 'block',
    padding: '6px',
    fontSize: '11px',
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
  },
  checkBadge: {
    position: 'absolute',
    top: '6px',
    right: '6px',
    background: '#1D6A4A',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '6px',
  },
  previewImgWrap: {
    position: 'relative',
    width: '240px',
    height: '140px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #CBD5E1',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    background: 'rgba(0,0,0,0.65)',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
  },

  formActionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  cancelBtn: {
    background: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    color: '#374151',
    borderRadius: '10px',
    padding: '11px 24px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  submitPropertyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 28px',
    fontSize: '13.5px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    boxShadow: '0 4px 14px rgba(29, 106, 74, 0.25)',
  },

  /* ── Modal Styles ── */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: '#FFFFFF',
    borderRadius: '18px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '18px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  modalCloseBtn: {
    background: '#F1F5F9',
    border: 'none',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
  },
  modalBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalImgWrap: {
    position: 'relative',
    height: '180px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  modalImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modalPropTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
  },
  modalPropLoc: {
    fontSize: '13px',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: 0,
  },
  modalPriceBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#F8FAFC',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  modalPriceVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1D6A4A',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  modalSectionHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  modalGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '12.5px',
  },
  modalKey: {
    color: '#6B7280',
  },
  modalVal: {
    color: '#111827',
  },
  modalDescText: {
    fontSize: '13px',
    color: '#4B5563',
    lineHeight: '1.5',
    margin: 0,
  },
  timelineBox: {
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  timelineStep: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepTitle: {
    fontSize: '13px',
    color: '#111827',
  },
  stepDesc: {
    fontSize: '11.5px',
    color: '#6B7280',
    margin: '2px 0 0 0',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalDoneBtn: {
    background: '#1D6A4A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
};

export default OwnerProperties;
