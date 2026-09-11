import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, X, Tag } from 'lucide-react';
import { mockPropertyDemands, appendMockDemand } from '../mockPropertyDemandData';

const PricingAndDemand = ({ propertyId }) => {
  const [demands, setDemands] = useState([]);
  
  // Selection state for initial setup
  const [selectedPurpose, setSelectedPurpose] = useState(null); // 'Sale' or 'Rent'
  
  // Modal state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    loadDemands();
  }, [propertyId]);

  const loadDemands = () => {
    const propertyDemands = mockPropertyDemands.filter(d => d.propertyId === propertyId);
    // Sort by date descending to get the latest
    propertyDemands.sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    setDemands(propertyDemands);
  };

  const latestDemand = demands.length > 0 ? demands[0] : null;
  
  let currentPurpose = null;
  let currentAmount = null;

  if (latestDemand) {
    if (latestDemand.saleAmount !== null && latestDemand.saleAmount !== undefined) {
      currentPurpose = 'Sale';
      currentAmount = latestDemand.saleAmount;
    } else if (latestDemand.rentAmount !== null && latestDemand.rentAmount !== undefined) {
      currentPurpose = 'Rent';
      currentAmount = latestDemand.rentAmount;
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenUpdate = (purposeToSet) => {
    setSelectedPurpose(purposeToSet);
    setNewAmount('');
    const today = new Date().toISOString().split('T')[0];
    setEffectiveDate(today);
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    if (!newAmount || isNaN(newAmount) || Number(newAmount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!effectiveDate) {
      alert('Please select an effective date.');
      return;
    }

    // Must be either Sale or Rent, not both
    const newDemand = {
      demandId: `DEM-${Date.now()}`,
      propertyId: propertyId,
      customerId: "CUST-001", // Mock customer ID
      effectiveDate: effectiveDate,
      currency: "PKR",
      saleAmount: selectedPurpose === 'Sale' ? Number(newAmount) : null,
      rentAmount: selectedPurpose === 'Rent' ? Number(newAmount) : null
    };

    appendMockDemand(newDemand);
    loadDemands();
    setIsUpdateModalOpen(false);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-[#e4d7be] overflow-hidden">
      
      {/* Header */}
      <div className="bg-[#FAF8F3] px-8 py-6 border-b border-[#e4d7be]">
        <h3 className="text-xl font-serif font-bold text-[#1a2b25] flex items-center gap-2">
          <DollarSign size={24} className="text-[#B8860B]" />
          Pricing & Demand
        </h3>
        {!latestDemand && (
          <p className="text-sm font-medium text-gray-500 mt-1">What would you like to offer this property for?</p>
        )}
      </div>

      <div className="p-8">
        
        {!latestDemand ? (
          // INITIAL SELECTION STATE
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto py-4">
            <button
              onClick={() => handleOpenUpdate('Sale')}
              className="p-8 border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#1a2b25] hover:bg-[#FAF8F3] transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1a2b25] group-hover:text-white transition-colors">
                <Tag size={28} />
              </div>
              <span className="text-lg font-bold text-[#1a2b25]">For Sale</span>
            </button>
            
            <button
              onClick={() => handleOpenUpdate('Rent')}
              className="p-8 border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-[#B8860B] hover:bg-[#FAF8F3] transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#B8860B] group-hover:text-white transition-colors">
                <Tag size={28} />
              </div>
              <span className="text-lg font-bold text-[#1a2b25]">For Rent</span>
            </button>
          </div>
        ) : (
          // CURRENT DEMAND STATE
          <div className="max-w-md mx-auto bg-[#FAF8F3] rounded-3xl p-8 border border-[#e4d7be]/60 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full -mr-12 -mt-12 ${currentPurpose === 'Sale' ? 'bg-[#1a2b25]/5' : 'bg-[#B8860B]/10'}`} />
            
            <div className="relative">
              <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-6">
                FOR {currentPurpose}
              </div>
              
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Current Demand</p>
                <p className="text-4xl font-bold text-[#1a2b25] mb-3">{formatCurrency(currentAmount)}</p>
                <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                  <Calendar size={14} /> 
                  Effective from {new Date(latestDemand.effectiveDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <button 
                onClick={() => handleOpenUpdate(currentPurpose)}
                className="w-full px-6 py-3.5 bg-[#1a2b25] text-white text-sm font-bold rounded-xl shadow-md hover:bg-[#2c4232] transition-colors"
              >
                Change Demand
              </button>
            </div>
          </div>
        )}

      </div>

      {/* UPDATE MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F3]">
              <h3 className="text-lg font-bold text-[#1a2b25]">
                {latestDemand ? `Change ${selectedPurpose} Demand` : `Set ${selectedPurpose} Demand`}
              </h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate} className="p-6">
              
              {latestDemand && (
                <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Amount</span>
                  <span className="text-xl font-bold text-gray-800">{formatCurrency(currentAmount)}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-[#1a2b25] mb-2">New Demand Amount (PKR) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-colors text-lg font-bold text-[#1a2b25]"
                    placeholder="e.g. 50000000"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1a2b25] mb-2">Effective Date <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#B8860B] focus:ring-[#B8860B] outline-none transition-colors font-medium text-gray-700"
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-[#1a2b25] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2c4232] transition-colors"
                >
                  Save New Demand
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PricingAndDemand;
