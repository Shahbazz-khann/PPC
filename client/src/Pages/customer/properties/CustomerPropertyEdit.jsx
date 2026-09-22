import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import { getCustomerPropertyDetail, updateCustomerProperty } from '../../../Services/customer.services';

const CustomerPropertyEdit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(['properties', 'common', 'propertyDetails']);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await getCustomerPropertyDetail(propertyId);
        if (res.success && res.data) {
          const { property: p, location: l, amenities: a } = res.data;
          
          // Map backend snake_case to PropertyForm camelCase initialData
          const mappedData = {
            propertyType: p.property_type_id || '',
            propertyUse: p.property_use_id || '',
            
            country: l.country_id || '',
            province: l.province_id || '',
            division: l.division_id || '',
            district: l.district_id || '',
            tehsil: l.tehsil_id || '',
            city: l.city_id || '', cityLabel: l.city_english || '',
            society: l.society_id || '', societyLabel: l.society_english || '',
            area: l.area_id || '', areaLabel: l.area_english || '',
            propertyLocation: p.property_location_id || '',
            
            propertySize: p.property_size || '',
            sizeUom: p.property_size_uom || '',
            marlaSize: p.property_marla_size_id || '',
            areaMarla: p.property_area_marla || '',
            areaKanal: p.property_area_kanal || '',
            areaAcre: p.property_area_acre || '',
            areaSqFt: p.property_area_sqft || '',
            areaSqYard: p.property_area_sqyard || '',
            coveredAreaSqFt: p.property_covered_area_sqft || '',
            openAreaSqFt: p.property_open_area_sqft || '',
            
            propertySizeFront: p.property_size_front || '',
            propertySizeBack: p.property_size_back || '',
            propertySizeLeft: p.property_size_left || '',
            propertySizeRight: p.property_size_right || '',
            
            roadFrontFt: p.property_road_size_front_ft || '',
            roadLeftFt: p.property_road_size_left_ft || '',
            roadRightFt: p.property_road_size_right_ft || '',
            roadBackFt: p.property_road_size_back_ft || '',
            
            rooms: p.property_rooms || 0,
            bathrooms: p.property_bath_rooms || 0,
            floors: p.property_floors || 0,
            lounges: p.property_lounges || 0,
            kitchens: p.property_kitchens || 0,
            drawingRooms: p.property_drawing_rooms || 0,
            
            swimmingPool: p.property_swimming_pool || false,
            mediaRoom: p.property_media_room || false,
            solarInstalled: p.property_solar_is_installed || false,
            solarCapacity: p.property_solar_capacity || '',
            electricMeters: p.property_electric_meters || 0,
            gasMeters: p.property_gas_meters || 0,
            propertyDescription: p.property_description || '',
            
            amenities: a ? a.map(am => am.amenity_description) : [],
            formattedId: p.formatted_id
          };
          setProperty(mappedData);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);
      setError(null);
      
      // We map camelCase back to snake_case for the PUT request
      const payload = {
        propertyType: formData.propertyType || null,
        propertyUse: formData.propertyUse || null,
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
        rooms: formData.rooms || null,
        bathrooms: formData.bathrooms || null,
        floors: formData.floors || null,
        lounges: formData.lounges || null,
        kitchens: formData.kitchens || null,
        drawingRooms: formData.drawingRooms || null,
        roadFrontFt: formData.roadFrontFt || null,
        roadBackFt: formData.roadBackFt || null,
        roadLeftFt: formData.roadLeftFt || null,
        roadRightFt: formData.roadRightFt || null,
        swimmingPool: formData.swimmingPool || false,
        mediaRoom: formData.mediaRoom || false,
        solarInstalled: formData.solarInstalled || false,
        solarCapacity: formData.solarCapacity || null,
        electricMeters: formData.electricMeters || null,
        gasMeters: formData.gasMeters || null,
        propertyDescription: formData.propertyDescription || null,
        amenities: formData.amenities || [],
        
        // Include hierarchy IDs for validation just like Add Property does
        country_id: formData.country || null,
        province_id: formData.province || null,
        division_id: formData.division || null,
        district_id: formData.district || null,
        tehsil_id: formData.tehsil || null,
        city_id: formData.city || null,
        society_id: formData.society || null,
      };

      const res = await updateCustomerProperty(propertyId, payload);
      if (res.success) {
        navigate(`/customer/properties/${propertyId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update property');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/customer/properties/${propertyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1E5631]/20 border-t-[#1E5631] rounded-full animate-spin"></div>
        <h2 className="text-lg font-bold text-gray-800 mt-4">{t('properties:loadingProperty')}</h2>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('propertyDetails:notFound')}</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/customer/properties" className="text-[#B8860B] hover:underline font-bold">{t('propertyDetails:returnToProperties')}</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Header Breadcrumb Area */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">{t('common:dashboard')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <Link to="/customer/properties" className="hover:text-gray-900 transition-colors">{t('common:myProperties')}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <Link to={`/customer/properties/${propertyId}`} className="hover:text-gray-900 transition-colors">{property.formattedId || propertyId}</Link>
          <ChevronRight size={14} className="text-gray-400 rtl:rotate-180" />
          <span className="text-[#1a2b25]">{t('properties:edit')}</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14">
        {error && (
          <div className="mb-6 max-w-[900px] mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {isSaving && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-[#B8860B]/20 border-t-[#B8860B] rounded-full animate-spin"></div>
              <span className="font-bold text-gray-800">{t('properties:savingChanges')}</span>
            </div>
          </div>
        )}
        <PropertyForm 
          initialData={property}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditMode={true}
        />
      </div>

    </div>
  );
};

export default CustomerPropertyEdit;
