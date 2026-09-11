import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, DollarSign } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import { addMockProperty } from './mockPropertyData';

const CustomerPropertyAdd = () => {
  const navigate = useNavigate();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState(null);

  const handleSubmit = (formData) => {
    // Frontend-only mock save for demo
    console.log('Mock saving new property:', formData);
    // Mock new ID
    const newId = `PRP-${Date.now()}`;
    
    const newProperty = {
      id: newId,
      ...formData,
      status: 'Pending Verification',
      image: formData.media?.pictures?.[0]?.url || null,
    };
    
    addMockProperty(newProperty);
    
    setCreatedPropertyId(newId);
    setIsSubmitted(true);
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

      <div className="px-4 sm:px-8 lg:px-12 xl:px-14">
        {isSubmitted ? (
          <div className="max-w-2xl mx-auto mt-10 bg-white rounded-[24px] shadow-sm border border-gray-100 p-10 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-[#eaf1ec] text-[#1E5631] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#1a2b25] mb-4">Property Created Successfully</h2>
            <p className="text-gray-600 mb-8 font-medium">Your property has been registered with PPC.</p>
            
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
          <PropertyForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditMode={false}
          />
        )}
      </div>

    </div>
  );
};

export default CustomerPropertyAdd;
