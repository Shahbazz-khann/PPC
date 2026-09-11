import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import { mockPropertiesList } from './mockPropertyData';

const CustomerPropertyEdit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const property = mockPropertiesList.find(p => p.id === propertyId);

  const handleSubmit = (formData) => {
    // Frontend-only mock save for demo
    console.log('Mock saving edited property:', propertyId, formData);
    navigate(`/customer/properties/${propertyId}`);
  };

  const handleCancel = () => {
    navigate(`/customer/properties/${propertyId}`);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
        <Link to="/customer/properties" className="text-[#B8860B] hover:underline font-bold">Return to My Properties</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      
      {/* Header Breadcrumb Area */}
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-14">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/properties" className="hover:text-gray-900 transition-colors">My Properties</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to={`/customer/properties/${propertyId}`} className="hover:text-gray-900 transition-colors">{property.id}</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Edit</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14">
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
