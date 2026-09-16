import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import { addCustomerProperty, uploadCustomerPropertyPictures, uploadCustomerPropertyVideo } from '../../../Services/customer.services';

const CustomerPropertyAdd = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  // Tracks the case where property created OK but pictures failed
  const [pictureUploadWarning, setPictureUploadWarning] = useState(null);
  const [videoUploadWarning, setVideoUploadWarning] = useState(null);

  const handleSubmit = async (formData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setPictureUploadWarning(null);
    setVideoUploadWarning(null);

    try {
      // ----------------------------------------------------------------
      // STEP 1: Create the property (JSON POST)
      // ----------------------------------------------------------------
      const payload = {
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

        amenities: formData.amenities || []
      };

      const createResponse = await addCustomerProperty(payload);

      if (!createResponse?.success) {
        throw new Error(createResponse?.message || 'Failed to add property');
      }

      const propertyId = createResponse.data?.property_id;
      if (!propertyId) {
        throw new Error('Property was created but no property_id was returned.');
      }

      // ----------------------------------------------------------------
      // STEP 2: Upload pictures if selected
      // Property creation already succeeded — pictures are a separate step.
      // If pictures fail, we surface a warning but DO NOT delete the property.
      // ----------------------------------------------------------------
      const selectedPictures = formData.media?.pictures || [];
      // Extract raw File objects from the { file, url } objects stored by PropertyForm
      const pictureFiles = selectedPictures
        .map(p => (p.file instanceof File ? p.file : null))
        .filter(Boolean);

      if (pictureFiles.length > 0) {
        try {
          await uploadCustomerPropertyPictures(propertyId, pictureFiles);
        } catch (pictureError) {
          // Property was created — do NOT revert it.
          // Surface a non-blocking warning so the user knows to upload later.
          console.error('Picture upload failed after property creation:', pictureError);
          setPictureUploadWarning(
            pictureError.message ||
            'Pictures could not be uploaded. You can add them later from your property settings.'
          );
        }
      }

      // ----------------------------------------------------------------
      // STEP 3: Upload video if selected
      // Property creation already succeeded — video is a separate step.
      // If video fails, we surface a warning but DO NOT delete the property.
      // ----------------------------------------------------------------
      const selectedVideos = formData.media?.videos || [];
      const videoFiles = selectedVideos
        .map(v => (v.file instanceof File ? v.file : null))
        .filter(Boolean);

      if (videoFiles.length > 0) {
        try {
          await uploadCustomerPropertyVideo(propertyId, videoFiles[0]);
        } catch (videoError) {
          console.error('Video upload failed after property creation:', videoError);
          setVideoUploadWarning(
            videoError.message ||
            'Video could not be uploaded. You can add it later from your property settings.'
          );
        }
      }

      // ----------------------------------------------------------------
      // STEP 3: Show success (with or without picture warning)
      // ----------------------------------------------------------------
      setCreatedPropertyId(propertyId);
      setIsSubmitted(true);

    } catch (error) {
      // Property creation itself failed — show error, stay on form
      console.error('Error adding property:', error);
      setSubmitError(error.message || 'An error occurred while adding the property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/customer/properties');
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">

      {/* Header Breadcrumb Area */}
      <div className="pt-4 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/properties" className="hover:text-gray-900 transition-colors">My Properties</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Add Property</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14 relative">

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[24px]">
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl">
              <Loader2 className="w-10 h-10 text-[#B8860B] animate-spin mb-3" />
              <p className="text-sm font-bold text-[#1a2b25]">Submitting Property...</p>
            </div>
          </div>
        )}

        {/* Global submission error banner (property creation failed) */}
        {submitError && !isSubmitting && !isSubmitted && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-700">Submission Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {isSubmitted ? (
          <div className="max-w-2xl mx-auto mt-10 bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-20 h-20 bg-[#eaf1ec] text-[#1E5631] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1a2b25] mb-4">Property Created Successfully</h2>
            <p className="text-gray-600 mb-6 font-medium">Your property has been registered with PPC.</p>

            {pictureUploadWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700">Pictures Not Uploaded</p>
                  <p className="text-sm text-amber-600 mt-0.5">{pictureUploadWarning}</p>
                </div>
              </div>
            )}

            {/* Video upload partial failure warning */}
            {videoUploadWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700">Video Not Uploaded</p>
                  <p className="text-sm text-amber-600 mt-0.5">{videoUploadWarning}</p>
                </div>
              </div>
            )}

            <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#e4d7be] mb-8">
              <div className="flex items-center justify-center gap-3 mb-4 text-[#B8860B]">
                <DollarSign size={24} />
                <h3 className="text-lg font-bold">Pricing & Demand</h3>
              </div>
              <p className="text-sm text-gray-600 font-semibold mb-6">
                Would you like to set the Sale or Rent Demand for this property now?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate(`/customer/properties/${createdPropertyId}?tab=pricing`)}
                  className="w-full sm:w-auto px-8 py-3 bg-[#1a2b25] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors"
                >
                  Set Pricing & Demand
                </button>
                <button
                  onClick={() => navigate('/customer/properties')}
                  className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Do It Later
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={isSubmitting ? 'opacity-50 pointer-events-none' : ''}>
            <PropertyForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditMode={false}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerPropertyAdd;
