import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, Home, Wrench, FileText, MapPin, AudioLines, UploadCloud, X,
  Sparkles, Droplets, Zap, Paintbrush, Hammer, Wind, Bug, Leaf, PenTool, DollarSign
} from 'lucide-react';
import { REQUEST_CATEGORIES, PROPERTY_PURPOSES, MOCK_PPC_SERVICES } from './mockRequestsData';
import { mockPropertiesList } from '../properties/mockPropertyData';
import { mockPropertyDemands, appendMockDemand } from '../properties/mockPropertyDemandData';

const CustomerRequestCreate = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    category: '',
    purpose: '',
    service: '',
    propertyId: '',
    description: '',
    audio: null,
    audioName: ''
  });

  const [errors, setErrors] = useState({});
  const audioInputRef = useRef(null);

  // Inline Demand state
  const [inlineDemandAmount, setInlineDemandAmount] = useState('');
  const [showInlineDemandInput, setShowInlineDemandInput] = useState(false);

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
      if (formData.purpose === 'Sale' || formData.purpose === 'Renovation') return true;
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
      if (formData.category === REQUEST_CATEGORIES.PROPERTY && !formData.purpose) {
        newErrors.purpose = 'Please select a purpose'; isValid = false;
      }
      if (formData.category === REQUEST_CATEGORIES.SERVICE && !formData.service) {
        newErrors.service = 'Please select a service'; isValid = false;
      }
    }
    else if (step === 3) {
      if (isPropertyRequired() && !formData.propertyId) {
        newErrors.propertyId = 'Please select a property for this request'; isValid = false;
      }

      if (formData.propertyId && (formData.purpose === 'Sale' || formData.purpose === 'Rent')) {
        const propertyDemands = mockPropertyDemands.filter(d => d.propertyId === formData.propertyId);
        propertyDemands.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));

        const latestDemand = propertyDemands.length > 0 ? propertyDemands[0] : null;
        let currentPurpose = null;
        if (latestDemand) {
          if (latestDemand.saleAmount !== null && latestDemand.saleAmount !== undefined) currentPurpose = 'Sale';
          else if (latestDemand.rentAmount !== null && latestDemand.rentAmount !== undefined) currentPurpose = 'Rent';
        }

        if (formData.purpose === 'Sale') {
          if (!currentPurpose) {
            newErrors.demand = 'No Sale Demand has been set for this property.'; isValid = false;
          } else if (currentPurpose === 'Rent') {
            newErrors.demand = 'This property currently has a Rent Demand. A Sale Demand is required for a Sale Request.'; isValid = false;
          }
        } else if (formData.purpose === 'Rent') {
          if (!currentPurpose) {
            newErrors.demand = 'No Rent Demand has been set for this property.'; isValid = false;
          } else if (currentPurpose === 'Sale') {
            newErrors.demand = 'This property currently has a Sale Demand. A Rent Demand is required for a Rent Request.'; isValid = false;
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
      purpose: '',
      service: '',
      propertyId: '',
      description: '',
      audio: null,
      audioName: ''
    });
    setErrors({});
    setShowInlineDemandInput(false);
    setInlineDemandAmount('');
    setCurrentStep(2);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setErrors({ audio: 'Please upload a valid audio file' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrors({ audio: 'Audio file must be less than 10MB' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        audio: URL.createObjectURL(file),
        audioName: file.name
      }));
      setErrors(prev => ({ ...prev, audio: null }));
    }
  };

  const removeAudio = () => {
    if (formData.audio && formData.audio.startsWith('blob:')) {
      URL.revokeObjectURL(formData.audio);
    }
    setFormData(prev => ({ ...prev, audio: null, audioName: '' }));
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleSubmit = () => {
    // Mock submission
    setTimeout(() => {
      // Show mock success message
      alert('Request submitted successfully! (Mock)');
      navigate('/customer/requests');
    }, 500);
  };

  const getServiceMetadata = (serviceName) => {
    switch (serviceName) {
      case 'Property Care': return { icon: Home, desc: 'Regular maintenance and supervision' };
      case 'Cleaning Services': return { icon: Sparkles, desc: 'Deep cleaning and sanitization' };
      case 'Plumbing Services': return { icon: Droplets, desc: 'Pipes, leaks, and fixture repairs' };
      case 'Electrical Services': return { icon: Zap, desc: 'Wiring, panels, and lighting fixes' };
      case 'Drain & Gutter Cleaning': return { icon: Droplets, desc: 'Clear blockages and drainage issues' };
      case 'Painting Services': return { icon: Paintbrush, desc: 'Interior and exterior painting' };
      case 'Carpentry Services': return { icon: Hammer, desc: 'Woodwork, doors, and cabinets' };
      case 'AC Repair & Maintenance': return { icon: Wind, desc: 'HVAC servicing and repairs' };
      case 'Water Tank Cleaning': return { icon: Droplets, desc: 'Tank scrubbing and sanitization' };
      case 'Pest Control': return { icon: Bug, desc: 'Extermination and prevention' };
      case 'Gardening / Lawn Maintenance': return { icon: Leaf, desc: 'Landscaping and plant care' };
      case 'General Repair & Maintenance': return { icon: PenTool, desc: 'Miscellaneous property repairs' };
      default: return { icon: Wrench, desc: 'Professional PPC service' };
    }
  };

  const getSelectedPropertyName = () => {
    if (!formData.propertyId) return 'None selected';
    const prop = mockPropertiesList.find(p => p.id === formData.propertyId);
    return prop ? `${prop.propertyType} in ${prop.society}` : 'Unknown Property';
  };

  // Demand helpers
  const getLatestDemandInfo = () => {
    if (!formData.propertyId) return null;
    const propertyDemands = mockPropertyDemands.filter(d => d.propertyId === formData.propertyId);
    propertyDemands.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    const latest = propertyDemands.length > 0 ? propertyDemands[0] : null;

    if (!latest) return null;
    if (latest.saleAmount !== null && latest.saleAmount !== undefined) return { purpose: 'Sale', amount: latest.saleAmount };
    if (latest.rentAmount !== null && latest.rentAmount !== undefined) return { purpose: 'Rent', amount: latest.rentAmount };
    return null;
  };

  const handleSetInlineDemand = () => {
    if (!inlineDemandAmount || isNaN(inlineDemandAmount) || Number(inlineDemandAmount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    const newDemand = {
      demandId: `DEM-${Date.now()}`,
      propertyId: formData.propertyId,
      customerId: "CUST-001",
      effectiveDate: new Date().toISOString().split('T')[0],
      currency: "PKR",
      saleAmount: formData.purpose === 'Sale' ? Number(inlineDemandAmount) : null,
      rentAmount: formData.purpose === 'Rent' ? Number(inlineDemandAmount) : null
    };
    appendMockDemand(newDemand);
    setShowInlineDemandInput(false);
    setInlineDemandAmount('');
    setErrors(prev => ({ ...prev, demand: null }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
  };

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
                        {PROPERTY_PURPOSES.map(purpose => (
                          <button
                            key={purpose}
                            onClick={() => { setFormData(prev => ({ ...prev, purpose })); setErrors({}); }}
                            className={`p-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.purpose === purpose ? 'border-[#1a2b25] bg-[#fafcfb] text-[#1a2b25]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                          >
                            {purpose}
                          </button>
                        ))}
                      </div>
                      {errors.purpose && <p className="text-sm text-red-500 font-semibold">{errors.purpose}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Which service do you need?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOCK_PPC_SERVICES.map(service => {
                          const { icon: ServiceIcon, desc } = getServiceMetadata(service);
                          const isSelected = formData.service === service;
                          return (
                            <button
                              key={service}
                              onClick={() => { setFormData(prev => ({ ...prev, service })); setErrors({}); }}
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
                                  {service}
                                </h4>
                                <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                  {desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.service && <p className="text-sm text-red-500 font-semibold mt-2">{errors.service}</p>}
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
                        ? `A related property is required for a ${formData.purpose} request. Please select one of your registered properties.`
                        : 'You may optionally link this request to one of your registered properties.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-800">Select Property {isPropertyRequired() ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>}</label>
                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <button
                        onClick={() => { setFormData(prev => ({ ...prev, propertyId: '' })); setErrors({}); setShowInlineDemandInput(false); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.propertyId === '' ? 'border-[#1a2b25] bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <p className={`font-bold text-sm ${formData.propertyId === '' ? 'text-[#1a2b25]' : 'text-gray-600'}`}>No linked property</p>
                      </button>

                      {mockPropertiesList.map(prop => (
                        <button
                          key={prop.id}
                          onClick={() => { setFormData(prev => ({ ...prev, propertyId: prop.id })); setErrors({}); setShowInlineDemandInput(false); }}
                          className={`p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${formData.propertyId === prop.id ? 'border-[#1a2b25] bg-[#fafcfb]' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center ${prop.image ? 'bg-transparent' : 'bg-gray-100'}`}>
                            {prop.image ? <img src={prop.image} alt="prop" className="w-full h-full object-cover rounded-lg" /> : <Home size={20} className="text-gray-400" />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm mb-1 ${formData.propertyId === prop.id ? 'text-[#1a2b25]' : 'text-gray-800'}`}>
                              {prop.propertyType} in {prop.society}
                            </p>
                            <p className="text-xs font-semibold text-gray-500">ID: {prop.id} • {prop.city}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.propertyId && <p className="text-sm text-red-500 font-semibold">{errors.propertyId}</p>}
                  </div>

                  {/* Demand Integration for Sale/Rent */}
                  {formData.propertyId && (formData.purpose === 'Sale' || formData.purpose === 'Rent') && (
                    <div className="bg-[#FAF8F3] border border-[#e4d7be] rounded-xl p-6 mt-6 animate-fadeIn">
                      <div className="flex items-center gap-2 mb-4 text-[#B8860B]">
                        <DollarSign size={20} />
                        <h4 className="font-bold text-sm">Pricing & Demand</h4>
                      </div>

                      {(() => {
                        const info = getLatestDemandInfo();
                        if (info && info.purpose === formData.purpose) {
                          return (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current {formData.purpose} Demand</p>
                              <p className="text-2xl font-bold text-[#1a2b25]">{formatCurrency(info.amount)}</p>
                              <p className="text-sm text-emerald-600 font-semibold mt-2 flex items-center gap-1.5"><CheckCircle2 size={16} /> Ready to proceed</p>
                            </div>
                          );
                        } else {
                          const hasWrongDemand = info && info.purpose !== formData.purpose;
                          return (
                            <div>
                              <p className="text-sm font-semibold text-red-600 mb-4">{errors.demand || `No ${formData.purpose} Demand has been set for this property.`}</p>

                              {!hasWrongDemand && (
                                showInlineDemandInput ? (
                                  <div className="space-y-4">
                                    <input
                                      type="number"
                                      value={inlineDemandAmount}
                                      onChange={(e) => setInlineDemandAmount(e.target.value)}
                                      placeholder={`Enter ${formData.purpose} Amount (PKR)`}
                                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-colors text-sm font-bold"
                                    />
                                    <div className="flex gap-3">
                                      <button onClick={handleSetInlineDemand} className="px-5 py-2 bg-[#1a2b25] text-white text-sm font-bold rounded-xl hover:bg-[#2c4232]">
                                        Save Demand
                                      </button>
                                      <button onClick={() => setShowInlineDemandInput(false)} className="px-5 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50">
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowInlineDemandInput(true)}
                                    className="px-6 py-2.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-[#2c4232] transition-colors"
                                  >
                                    Set {formData.purpose} Demand
                                  </button>
                                )
                              )}
                            </div>
                          );
                        }
                      })()}
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
                    {formData.audio ? (
                      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#eef2f9] text-[#4d70a3] rounded-lg flex items-center justify-center">
                            <AudioLines size={20} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{formData.audioName}</span>
                        </div>
                        <button onClick={removeAudio} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#B8860B] hover:bg-gray-50 transition-all group"
                      >
                        <UploadCloud size={32} className="text-gray-400 mb-3 group-hover:text-[#B8860B] transition-colors" />
                        <span className="text-sm font-bold text-gray-600 mb-1">Click to upload audio note</span>
                        <span className="text-xs font-semibold text-gray-400">MP3, WAV up to 10MB</span>
                      </div>
                    )}
                    <input type="file" accept="audio/*" ref={audioInputRef} onChange={handleAudioUpload} className="hidden" />
                    {errors.audio && <p className="text-sm text-red-500 font-semibold">{errors.audio}</p>}
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {currentStep === 5 && (
                <div className="animate-fadeIn space-y-6">
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
                          {formData.category === REQUEST_CATEGORIES.PROPERTY ? formData.purpose : formData.service}
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
                      {formData.audio && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400 block mb-2 text-xs font-bold uppercase tracking-wider">Audio Note</span>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white p-3 rounded-lg border border-gray-100 max-w-sm">
                            <AudioLines size={16} className="text-[#4d70a3]" /> {formData.audioName}
                          </div>
                        </div>
                      )}
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

              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !formData.category}
                  className={`px-8 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${(currentStep === 1 && !formData.category)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1a2b25] text-white shadow-md hover:bg-[#2c4232]'
                    }`}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#d4af37] text-white rounded-full font-bold text-sm shadow-[0_4px_12px_rgba(184,134,11,0.3)] hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Submit Request
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
