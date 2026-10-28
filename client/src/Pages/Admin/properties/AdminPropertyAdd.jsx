import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Search,
  Check,
  Building,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Plus
} from 'lucide-react';
import PropertyForm from '../../customer/properties/components/PropertyForm';
import {
  createAdminProperty,
  uploadAdminPropertyPictures,
  uploadAdminPropertyVideo,
  getAdminCustomers
} from '../../../Services/admin.services';

const AdminPropertyAdd = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'properties', 'common']);

  // Customer Selection State
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerError, setCustomerError] = useState(null);

  // Approval Decision Choice (Admin privilege)
  const [initialStage, setInitialStage] = useState('Pending');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdProperty, setCreatedProperty] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [pictureUploadWarning, setPictureUploadWarning] = useState(null);
  const [videoUploadWarning, setVideoUploadWarning] = useState(null);

  // Fetch customers for selector
  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        const res = await getAdminCustomers({
          search: customerSearch || undefined,
          limit: 30,
        });
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error('Error fetching customers for property assignment:', err);
      } finally {
        if (isMounted) setCustomersLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCustomers();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [customerSearch]);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;

    if (!selectedCustomer) {
      setCustomerError('Please select a customer (property owner) before registering.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setCustomerError(null);
    setPictureUploadWarning(null);
    setVideoUploadWarning(null);

    try {
      const payload = {
        customerId: selectedCustomer.customer_id,
        approval_stage: initialStage,

        propertyType: formData.propertyType || null,
        propertyUse: formData.propertyUse || null,

        country_id: formData.country || null,
        province_id: formData.province || null,
        division_id: formData.division || null,
        district_id: formData.district || null,
        tehsil_id: formData.tehsil || null,
        city_id: formData.city || null,
        society_id: formData.society || null,
        area_id: formData.area || null,

        propertyLocation: formData.propertyLocation || null,

        propertySize: formData.propertySize || null,
        sizeUom: formData.sizeUom || null,
        marlaSize: formData.marlaSize || null,

        areaMarla: formData.areaMarla || null,
        areaKanal: formData.areaKanal || null,
        areaAcre: formData.areaAcre || null,
        areaSqFt: formData.areaSqFt || null,
        areaSqYard: formData.areaSqYard || null,

        propertySizeFront: formData.propertySizeFront || null,
        propertySizeBack: formData.propertySizeBack || null,
        propertySizeLeft: formData.propertySizeLeft || null,
        propertySizeRight: formData.propertySizeRight || null,

        coveredAreaSqFt: formData.coveredAreaSqFt || null,
        openAreaSqFt: formData.openAreaSqFt || null,

        rooms: formData.rooms || 0,
        bathrooms: formData.bathrooms || 0,
        floors: formData.floors || 0,
        lounges: formData.lounges || 0,
        kitchens: formData.kitchens || 0,
        drawingRooms: formData.drawingRooms || 0,

        roadFrontFt: formData.roadFrontFt || null,
        roadBackFt: formData.roadBackFt || null,
        roadLeftFt: formData.roadLeftFt || null,
        roadRightFt: formData.roadRightFt || null,

        swimmingPool: formData.swimmingPool || false,
        mediaRoom: formData.mediaRoom || false,
        solarInstalled: formData.solarInstalled || false,
        solarCapacity: formData.solarCapacity || null,
        electricMeters: formData.electricMeters || 0,
        gasMeters: formData.gasMeters || 0,

        propertyDescription: formData.propertyDescription || '',
        amenities: formData.amenities || [],
      };

      // 1. Create property via Admin API
      const createResponse = await createAdminProperty(payload);

      if (!createResponse?.success) {
        throw new Error(createResponse?.message || 'Failed to register property');
      }

      const propertyData = createResponse.data;
      const propertyId = propertyData?.property_id;

      if (!propertyId) {
        throw new Error('Property was created but no property ID was returned.');
      }

      // 2. Upload pictures if selected
      const selectedPictures = formData.media?.pictures || [];
      const pictureFiles = selectedPictures
        .map((p) => (p.file instanceof File ? p.file : null))
        .filter(Boolean);

      if (pictureFiles.length > 0) {
        try {
          await uploadAdminPropertyPictures(propertyId, pictureFiles);
        } catch (pictureError) {
          console.error('Picture upload failed after property creation:', pictureError);
          setPictureUploadWarning(
            pictureError.message ||
              'Pictures could not be uploaded. You can add them later in property inspection.'
          );
        }
      }

      // 3. Upload video if selected
      const selectedVideos = formData.media?.videos || [];
      const videoFiles = selectedVideos
        .map((v) => (v.file instanceof File ? v.file : null))
        .filter(Boolean);

      if (videoFiles.length > 0) {
        try {
          await uploadAdminPropertyVideo(propertyId, videoFiles[0]);
        } catch (videoError) {
          console.error('Video upload failed after property creation:', videoError);
          setVideoUploadWarning(
            videoError.message || 'Video could not be uploaded. You can add it later.'
          );
        }
      }

      setCreatedProperty(propertyData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error adding property:', error);
      setSubmitError(error.message || 'An error occurred while registering the property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/properties');
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-20 font-sans">
      {/* Top Header / Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center text-xs font-semibold text-gray-500 gap-2 mb-2">
            <Link to="/admin/dashboard" className="hover:text-gray-900 transition-colors">
              Admin Dashboard
            </Link>
            <ChevronRight size={12} className="text-gray-400" />
            <Link to="/admin/properties" className="hover:text-gray-900 transition-colors">
              Property Management
            </Link>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-[#1a2b25] font-bold">Register Property</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/properties"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1a2b25] tracking-tight">
                  Register New Property
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Register and list a property on behalf of a registered PPC customer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-95">
              <Loader2 className="w-10 h-10 text-[#C59B27] animate-spin mb-3" />
              <p className="text-base font-bold text-[#1a2b25]">Registering Property in Database...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait while details and media are uploaded.</p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {submitError && !isSubmitting && !isSubmitted && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Registration Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {isSubmitted && createdProperty ? (
          /* ========================================================================= */
          /* SUCCESS SCREEN                                                            */
          /* ========================================================================= */
          <div className="max-w-2xl mx-auto bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 sm:p-12 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
              <CheckCircle2 size={44} />
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-200/60 inline-block mb-3">
              {createdProperty.formatted_id}
            </span>

            <h2 className="text-3xl font-bold text-[#1a2b25] mb-2">
              Property Registered Successfully!
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
              Property <span className="font-bold text-[#1a2b25]">{createdProperty.formatted_id}</span> has been added to customer{' '}
              <span className="font-bold text-[#1a2b25]">{selectedCustomer?.customer_name || `ID #${createdProperty.customer_id}`}</span>'s portfolio.
            </p>

            {/* Warnings if media upload had issues */}
            {pictureUploadWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-start flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">{pictureUploadWarning}</p>
              </div>
            )}
            {videoUploadWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 text-start flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium">{videoUploadWarning}</p>
              </div>
            )}

            <div className="bg-[#FAF8F3] rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-left">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Initial Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {createdProperty.approval_stage}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    {createdProperty.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setCreatedProperty(null);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#1a2b25] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={14} /> Register Another
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/properties')}
                  className="px-5 py-2 bg-[#1a2b25] hover:bg-[#253c34] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  View Inventory
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ========================================================================= */}
            {/* STEP 0: SELECT CUSTOMER & INITIAL STAGE                                   */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1a2b25]">
                      Step 1: Select Property Owner (Customer)
                    </h2>
                    <p className="text-xs text-gray-500">
                      Choose which registered customer owns this property listing.
                    </p>
                  </div>
                </div>

                {/* Initial Approval Stage Choice */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs font-semibold">
                  <span className="text-gray-500 pl-2">Initial Stage:</span>
                  <button
                    type="button"
                    onClick={() => setInitialStage('Pending')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      initialStage === 'Pending'
                        ? 'bg-amber-500 text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Pending Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStage('Approved')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      initialStage === 'Approved'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Directly Approved
                  </button>
                </div>
              </div>

              {/* Customer Error alert */}
              {customerError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs font-bold">
                  <AlertTriangle size={16} />
                  <span>{customerError}</span>
                </div>
              )}

              {/* Customer Search & Picker */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Search Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Type customer name, mobile, email or ID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27] outline-none text-xs font-semibold text-gray-800 bg-gray-50/50"
                    />
                    {customersLoading && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-4 w-4 text-[#C59B27] animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Customer Quick Dropdown List */}
                  {customers.length > 0 && !selectedCustomer && (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg divide-y divide-gray-50 mt-1">
                      {customers.map((c) => (
                        <div
                          key={c.customer_id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerError(null);
                          }}
                          className="p-3 hover:bg-amber-50/40 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="text-xs font-bold text-[#1a2b25] block">
                              {c.customer_name}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium">
                              ID: #{c.customer_id} | {c.mobile || c.email || 'No phone'}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-[#C59B27] hover:underline">
                            Select
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Customer Card Preview */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Selected Owner
                  </label>
                  {selectedCustomer ? (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a2b25] text-white flex items-center justify-center font-bold text-sm">
                          {selectedCustomer.customer_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1a2b25]">
                              {selectedCustomer.customer_name}
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block">
                            Customer ID #{selectedCustomer.customer_id} • {selectedCustomer.mobile || selectedCustomer.email}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-center text-xs text-gray-400 font-medium flex items-center justify-center h-[52px]">
                      No customer selected yet. Search and select above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STEP 2: 7-STEP PROPERTY FORM                                              */}
            {/* ========================================================================= */}
            <div className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
              <PropertyForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditMode={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPropertyAdd;
