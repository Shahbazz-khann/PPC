import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, Home, Wrench, FileText, MapPin, AudioLines, UploadCloud, X,
  Sparkles, Droplets, Zap, Paintbrush, Hammer, Wind, Bug, Leaf, PenTool, DollarSign, AlertTriangle
} from 'lucide-react';
import { getCustomerProperties, getPropertyPurposes, getPPCServices, createCustomerRequest } from '../../../Services/customer.services';
import { resolveMediaUrl } from '../../../Services/Api';

const REQUEST_CATEGORIES = {
  PROPERTY: 'PROPERTY',
  SERVICE: 'SERVICE'
};

const CustomerRequestCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [purposesList, setPurposesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);

  const [formData, setFormData] = useState({
    category: '',
    purposeId: '',
    serviceId: '',
    propertyId: '',
    description: '',
    audio: null,
    audioName: ''
  });

  const [errors, setErrors] = useState({});
  const [fetchError, setFetchError] = useState(null);

  const fetchData = async () => {
    try {
      setIsFetching(true);
      setFetchError(null);
      const [purposesRes, servicesRes, propertiesRes] = await Promise.all([
        getPropertyPurposes(),
        getPPCServices(),
        getCustomerProperties()
      ]);

      if (purposesRes?.success) setPurposesList(purposesRes.data || []);
      if (servicesRes?.success) setServicesList(servicesRes.data || []);
      if (propertiesRes?.success) setPropertiesList(propertiesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch reference data', error);
      setFetchError('Unable to load request purposes.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDynamicSteps = () => {
    const steps = [
      { id: 1, title: 'Category', icon: FileText }
    ];

    if (formData.category) {
      steps.push({ id: 2, title: formData.category === REQUEST_CATEGORIES.PROPERTY ? 'Purpose' : 'Service', icon: Wrench });
      steps.push({ id: 3, title: 'Property', icon: MapPin });
      steps.push({ id: 4, title: 'Details', icon: AudioLines });
      steps.push({ id: 5, title: 'Review', icon: CheckCircle2 });
    }
    return steps;
  };

  const steps = getDynamicSteps();

  const isPropertyRequired = () => {
    if (formData.category === REQUEST_CATEGORIES.PROPERTY) {
      const purposeObj = purposesList.find(p => p.purpose_id === formData.purposeId);
      if (purposeObj && (purposeObj.purpose_description === 'Sale' || purposeObj.purpose_description === 'Renovation' || purposeObj.purpose_description === 'Rent')) {
        return true;
      }
    }
    return false;
  };

  const isDeferredPurpose = () => {
    if (formData.category === REQUEST_CATEGORIES.PROPERTY) {
      const purposeObj = purposesList.find(p => p.purpose_id === formData.purposeId);
      if (purposeObj && (purposeObj.purpose_description === 'Purchase' || purposeObj.purpose_description === 'Lease')) {
        return true;
      }
    }
    return false;
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.category) { newErrors.category = 'Please select a category'; isValid = false; }
    }
    else if (step === 2) {
      if (formData.category === REQUEST_CATEGORIES.PROPERTY && !formData.purposeId) {
        newErrors.purposeId = 'Please select a purpose'; isValid = false;
      }
      if (formData.category === REQUEST_CATEGORIES.SERVICE && !formData.serviceId) {
        newErrors.serviceId = 'Please select a service'; isValid = false;
      }
      if (isDeferredPurpose()) {
        isValid = false; // Block moving forward for deferred features
      }
    }
    else if (step === 3) {
      if (isPropertyRequired() && !formData.propertyId) {
        newErrors.propertyId = 'Please select a property for this request'; isValid = false;
      }

      const purposeObj = purposesList.find(p => p.purpose_id === formData.purposeId);
      const selectedPurpose = purposeObj?.purpose_description;

      if (formData.propertyId && (selectedPurpose === 'Sale' || selectedPurpose === 'Rent')) {
        const selectedProp = propertiesList.find(p => String(p.property_id) === String(formData.propertyId));
        const currentDemandType = selectedProp?.demand_type || null;

        if (selectedPurpose === 'Sale') {
          if (!currentDemandType) {
            newErrors.demand = 'No Sale Demand has been set for this property.'; isValid = false;
          } else if (currentDemandType !== 'Sale') {
            newErrors.demand = `This property currently has a ${currentDemandType} Demand. A Sale Demand is required for a Sale Request.`; isValid = false;
          }
        } else if (selectedPurpose === 'Rent') {
          if (!currentDemandType) {
            newErrors.demand = 'No Rent Demand has been set for this property.'; isValid = false;
          } else if (currentDemandType !== 'Rent') {
            newErrors.demand = `This property currently has a ${currentDemandType} Demand. A Rent Demand is required for a Rent Request.`; isValid = false;
          }
        }
      }
    }
    else if (step === 4) {
      if (!formData.description || formData.description.trim() === '') {
        newErrors.description = 'Description is required'; isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleCategorySelect = (cat) => {
    setFormData({
      category: cat,
      purposeId: '',
      serviceId: '',
      propertyId: '',
      description: '',
      audio: null,
      audioName: ''
    });
    setErrors({});
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors(prev => ({ ...prev, submit: null }));

      const payload = {
        description: formData.description
      };

      if (formData.category === REQUEST_CATEGORIES.PROPERTY) {
        payload.requestPurposeId = formData.purposeId;
        payload.propertyId = formData.propertyId || null;
      } else {
        payload.serviceId = formData.serviceId;
        payload.propertyId = formData.propertyId || null;
      }

      const response = await createCustomerRequest(payload);

      if (response?.success) {
        navigate('/customer/requests');
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || 'Failed to create request. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceMetadata = (serviceName) => {
    if (!serviceName) return { icon: Wrench, desc: 'Professional PPC service' };
    if (serviceName.includes('Property Care')) return { icon: Home, desc: 'Regular maintenance and supervision' };
    if (serviceName.includes('Cleaning')) return { icon: Sparkles, desc: 'Deep cleaning and sanitization' };
    if (serviceName.includes('Plumbing')) return { icon: Droplets, desc: 'Pipes, leaks, and fixture repairs' };
    if (serviceName.includes('Electrical')) return { icon: Zap, desc: 'Wiring, panels, and lighting fixes' };
    if (serviceName.includes('Drain')) return { icon: Droplets, desc: 'Clear blockages and drainage issues' };
    if (serviceName.includes('Painting')) return { icon: Paintbrush, desc: 'Interior and exterior painting' };
    if (serviceName.includes('Carpentry')) return { icon: Hammer, desc: 'Woodwork, doors, and cabinets' };
    if (serviceName.includes('AC Repair')) return { icon: Wind, desc: 'HVAC servicing and repairs' };
    if (serviceName.includes('Water Tank')) return { icon: Droplets, desc: 'Tank scrubbing and sanitization' };
    if (serviceName.includes('Pest Control')) return { icon: Bug, desc: 'Extermination and prevention' };
    if (serviceName.includes('Gardening')) return { icon: Leaf, desc: 'Landscaping and plant care' };
    if (serviceName.includes('General Repair')) return { icon: PenTool, desc: 'Miscellaneous property repairs' };
    return { icon: Wrench, desc: 'Professional PPC service' };
  };

  const getSelectedPropertyName = () => {
    if (!formData.propertyId) return 'No linked property';
    const prop = propertiesList.find(p => String(p.property_id) === String(formData.propertyId));
    return prop ? `${prop.property_type} in ${prop.society}` : 'Unknown Property';
  };

  const currentStepConfig = steps[currentStep - 1];
  const isReviewStep = currentStepConfig?.title === 'Review';

  if (isFetching) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-[#B8860B] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-gray-500">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4">
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/requests" className="hover:text-gray-900 transition-colors">My Requests</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">Create Request</span>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1000px] mx-auto">
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">

          {/* Stepper Sidebar */}
          <div className="w-full md:w-64 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 p-6 sm:p-8 shrink-0">
            <h2 className="text-lg font-serif font-bold text-[#1a2b25] mb-8">New Request</h2>
            <div className="flex flex-row md:flex-col gap-4 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div key={step.id} className={`flex items-center gap-3 shrink-0 md:shrink transition-opacity ${isActive ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'}`}>
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

          {/* Form Content */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col min-h-[500px]">
            <h3 className="text-2xl font-serif font-bold text-[#1a2b25] mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
              {React.createElement(steps[currentStep - 1]?.icon || FileText, { size: 24, className: "text-[#B8860B]" })}
              {steps[currentStep - 1]?.title || ''}
            </h3>

            <div className="flex-1 space-y-6">

              {/* STEP 1: CATEGORY */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeIn">
                  <button
                    onClick={() => handleCategorySelect(REQUEST_CATEGORIES.PROPERTY)}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-4 ${formData.category === REQUEST_CATEGORIES.PROPERTY ? 'border-[#1a2b25] bg-[#fafcfb] shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${formData.category === REQUEST_CATEGORIES.PROPERTY ? 'bg-[#eaf1ec] text-[#1a2b25]' : 'bg-gray-100 text-gray-500'}`}>
                      <Home size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#1a2b25] mb-2">Property Request</h4>
                      <p className="text-sm font-medium text-gray-500">Create a request to buy, sell, rent, lease, or renovate a property.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCategorySelect(REQUEST_CATEGORIES.SERVICE)}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-4 ${formData.category === REQUEST_CATEGORIES.SERVICE ? 'border-[#B8860B] bg-[#faf7f2] shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${formData.category === REQUEST_CATEGORIES.SERVICE ? 'bg-[#f4ebd0] text-[#B8860B]' : 'bg-gray-100 text-gray-500'}`}>
                      <Wrench size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#1a2b25] mb-2">PPC Service Request</h4>
                      <p className="text-sm font-medium text-gray-500">Request property care, legal consultation, valuation, or architecture services.</p>
                    </div>
                  </button>
                </div>
              )}

              {/* STEP 2: PURPOSE OR SERVICE */}
              {currentStep === 2 && (
                <div className="animate-fadeIn">
                  {formData.category === REQUEST_CATEGORIES.PROPERTY ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-800 mb-2">What is the purpose of this request?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {fetchError ? (
                          <div className="col-span-full py-6 flex flex-col items-center justify-center bg-red-50 border border-red-100 rounded-xl">
                            <AlertTriangle size={24} className="text-red-500 mb-2" />
                            <p className="text-sm font-bold text-red-600 mb-3">{fetchError}</p>
                            <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Retry</button>
                          </div>
                        ) : purposesList.length === 0 ? (
                          <div className="col-span-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-sm font-bold text-gray-500">No purposes found</p>
                          </div>
                        ) : (
                          purposesList.map(purpose => (
                            <button
                              key={purpose.purpose_id}
                              onClick={() => { setFormData(prev => ({ ...prev, purposeId: purpose.purpose_id })); setErrors({}); }}
                              className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.purposeId === purpose.purpose_id ? 'border-[#1a2b25] bg-[#fafcfb] text-[#1a2b25]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                              {purpose.purpose_description}
                            </button>
                          ))
                        )}
                      </div>
                      {errors.purposeId && <p className="text-sm text-red-500 font-semibold">{errors.purposeId}</p>}

                      {isDeferredPurpose() && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-4 flex items-start gap-3">
                          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                          <p className="text-sm font-medium text-orange-800">
                            The requested workflow is currently under development. Please check back later.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Which service do you need?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fetchError ? (
                          <div className="col-span-full py-6 flex flex-col items-center justify-center bg-red-50 border border-red-100 rounded-xl">
                            <AlertTriangle size={24} className="text-red-500 mb-2" />
                            <p className="text-sm font-bold text-red-600 mb-3">{fetchError}</p>
                            <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Retry</button>
                          </div>
                        ) : servicesList.length === 0 ? (
                          <div className="col-span-full py-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-sm font-bold text-gray-500">No services found</p>
                          </div>
                        ) : (
                          servicesList.map(service => {
                            const { icon: ServiceIcon, desc } = getServiceMetadata(service.service_english);
                            const isSelected = formData.serviceId === service.service_id;
                            return (
                              <button
                                key={service.service_id}
                                onClick={() => { setFormData(prev => ({ ...prev, serviceId: service.service_id })); setErrors({}); }}
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-3 text-left group ${isSelected
                                  ? 'border-[#B8860B] bg-[#faf7f2] shadow-sm'
                                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white'
                                  }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[#f4ebd0] text-[#B8860B]' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'
                                  }`}>
                                  <ServiceIcon size={20} />
                                </div>
                                <div>
                                  <h4 className={`text-sm font-bold mb-1 transition-colors ${isSelected ? 'text-[#B8860B]' : 'text-[#1a2b25]'}`}>
                                    {service.service_english}
                                  </h4>
                                  <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                    {desc}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      {errors.serviceId && <p className="text-sm text-red-500 font-semibold mt-2">{errors.serviceId}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: PROPERTY SELECTION */}
              {currentStep === 3 && (
                <div className="animate-fadeIn space-y-6">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <MapPin className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm font-medium text-blue-800">
                      {isPropertyRequired()
                        ? `A related property is required for this request. Please select one of your registered properties.`
                        : 'You may optionally link this request to one of your registered properties.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-800">Select Property {isPropertyRequired() ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>}</label>
                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <button
                        onClick={() => { setFormData(prev => ({ ...prev, propertyId: '' })); setErrors({}); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.propertyId === '' ? 'border-[#1a2b25] bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <p className={`font-bold text-sm ${formData.propertyId === '' ? 'text-[#1a2b25]' : 'text-gray-600'}`}>No linked property</p>
                      </button>

                      {propertiesList.map(prop => (
                        <button
                          key={prop.property_id}
                          onClick={() => { setFormData(prev => ({ ...prev, propertyId: prop.property_id })); setErrors({}); }}
                          className={`p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${formData.propertyId === prop.property_id ? 'border-[#1a2b25] bg-[#fafcfb]' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center ${prop.image_url ? 'bg-transparent overflow-hidden' : 'bg-gray-100'}`}>
                            {prop.image_url ? (
                              <img
                                src={resolveMediaUrl(prop.image_url)}
                                alt="prop"
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                              />
                            ) : null}
                            <Home
                              size={20}
                              className="text-gray-400"
                              style={{ display: prop.image_url ? 'none' : 'block' }}
                            />
                          </div>
                          <div>
                            <p className={`font-bold text-sm mb-1 ${formData.propertyId === prop.property_id ? 'text-[#1a2b25]' : 'text-gray-800'}`}>
                              {prop.property_type} in {prop.society}
                            </p>
                            <p className="text-xs font-semibold text-gray-500">ID: {prop.formatted_id} • {prop.city}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.propertyId && <p className="text-sm text-red-500 font-semibold">{errors.propertyId}</p>}
                  </div>

                  {/* Demand Error Display */}
                  {errors.demand && (
                    <div className="bg-[#FAF8F3] border border-red-200 rounded-xl p-6 mt-6 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-4 text-red-600">
                        <AlertTriangle size={20} />
                        <h4 className="font-bold text-sm">Demand Requirement Missing</h4>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">{errors.demand}</p>
                        <Link to={`/customer/properties/${formData.propertyId}`} className="inline-block px-6 py-2.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2c4232] transition-colors">
                          Set Demand in Property Settings
                        </Link>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 4: DETAILS */}
              {currentStep === 4 && (
                <div className="animate-fadeIn space-y-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800">Request Description <span className="text-red-500">*</span></label>
                    <textarea
                      rows={5}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        if (errors.description) setErrors(prev => ({ ...prev, description: null }));
                      }}
                      placeholder="Please provide detailed information about your request..."
                      className={`w-full p-4 rounded-xl border ${errors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B]'} outline-none bg-gray-50/50 text-sm font-medium resize-none transition-all`}
                    />
                    {errors.description && <p className="text-sm text-red-500 font-semibold">{errors.description}</p>}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-800">Audio Note <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
                    <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 opacity-70 cursor-not-allowed">
                      <UploadCloud size={32} className="text-gray-400 mb-3" />
                      <span className="text-sm font-bold text-gray-500 mb-1">Audio Note (Coming Soon)</span>
                      <span className="text-xs font-semibold text-gray-400">This feature is temporarily disabled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="animate-fadeIn space-y-6">
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-bold p-4 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={18} />
                      {errors.submit}
                    </div>
                  )}
                  <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#e4d7be]">
                    <div className="flex items-start justify-between mb-6">
                      <h4 className="text-lg font-serif font-bold text-[#1a2b25]">Request Summary</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                      <div>
                        <span className="text-gray-400 block mb-1 text-xs font-bold uppercase tracking-wider">Category</span>
                        <span className="font-semibold text-gray-800">
                          {formData.category === REQUEST_CATEGORIES.PROPERTY ? 'Property Request' : 'PPC Service Request'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-1 text-xs font-bold uppercase tracking-wider">
                          {formData.category === REQUEST_CATEGORIES.PROPERTY ? 'Purpose' : 'Service'}
                        </span>
                        <span className="font-bold text-[#B8860B]">
                          {formData.category === REQUEST_CATEGORIES.PROPERTY
                            ? purposesList.find(p => p.purpose_id === formData.purposeId)?.purpose_description
                            : servicesList.find(s => s.service_id === formData.serviceId)?.service_english}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-400 block mb-1 text-xs font-bold uppercase tracking-wider">Linked Property</span>
                        <span className="font-semibold text-gray-800">{getSelectedPropertyName()}</span>
                      </div>
                      <div className="md:col-span-2 border-t border-gray-200/60 pt-6">
                        <span className="text-gray-400 block mb-2 text-xs font-bold uppercase tracking-wider">Description</span>
                        <p className="font-medium text-gray-700 bg-white p-4 rounded-xl border border-gray-100 leading-relaxed whitespace-pre-wrap">
                          {formData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={() => navigate('/customer/requests')}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              )}

              {!isReviewStep ? (
                <button
                  onClick={handleNext}
                  disabled={(currentStep === 1 && !formData.category) || (currentStep === 2 && isDeferredPurpose())}
                  className={`px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${((currentStep === 1 && !formData.category) || (currentStep === 2 && isDeferredPurpose()))
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1a2b25] text-white shadow-md hover:bg-[#2c4232]'
                    }`}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#d4af37] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(184,134,11,0.3)] hover:shadow-lg transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerRequestCreate;
