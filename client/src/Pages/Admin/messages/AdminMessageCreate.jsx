import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Send,
  User,
  Building2,
  AlertCircle,
  CheckCircle2,
  Search,
  Check,
  Phone,
  Sparkles,
  Users
} from 'lucide-react';
import { sendAdminMessage, getAdminMessagingCustomers } from '../../../Services/admin.services';

const AdminMessageCreate = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [formData, setFormData] = useState({
    customerId: '',
    department: 'PPC-MGMT',
    subject: '',
    body: ''
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const res = await getAdminMessagingCustomers();
        const payload = res?.data?.success !== undefined ? res.data : res;
        if (payload?.success) {
          setCustomers(payload.data || []);
        }

      } catch (err) {
        console.error('Failed to load customers for messaging:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError(null);
  };

  const handleSelectCustomer = (customerId) => {
    setFormData(prev => ({ ...prev, customerId: String(customerId) }));
    if (errors.customerId) {
      setErrors(prev => ({ ...prev, customerId: null }));
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.mobile || '').includes(q) ||
      String(c.customerId || '').includes(q) ||
      String(c.userId || '').includes(q)
    );
  });

  const selectedCustomer = customers.find(c => 
    String(c.userId) === String(formData.customerId) || 
    String(c.customerId) === String(formData.customerId)
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.customerId) newErrors.customerId = 'Please select a recipient customer.';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (formData.subject.trim().length > 150) newErrors.subject = 'Subject is too long (max 150 characters).';
    if (!formData.body.trim()) newErrors.body = 'Message body cannot be empty.';
    if (formData.body.trim().length > 3000) newErrors.body = 'Message is too long (max 3000 characters).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      await sendAdminMessage({
        customerId: parseInt(formData.customerId, 10),
        department: formData.department,
        subject: formData.subject.trim(),
        body: formData.body.trim(),
      });

      setToastMessage('Message dispatched successfully to customer!');

      setTimeout(() => {
        navigate('/admin/messages');
      }, 1200);
    } catch (err) {
      console.error('Failed to send admin message:', err);
      setApiError(err?.response?.data?.message || 'Failed to dispatch message to customer');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-[1050px] mx-auto">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1E5631] text-white px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={18} /> {toastMessage}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E5631] uppercase tracking-wider mb-1">
              <span>Operations Center</span>
              <span>/</span>
              <span>Direct Customer Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25]">
              Compose Customer Message
            </h1>
          </div>
          <Link
            to="/admin/messages"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#1a2b25] transition-colors bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span className="font-medium">{apiError}</span>
          </div>
        )}

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-6 sm:p-8 bg-[#fafcfb] border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Direct Customer Dispatch</h2>
              <p className="text-xs text-gray-500 font-medium">
                Select a registered customer and send an official message directly into their customer portal.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
            
            {/* Visual Customer Selector */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="block text-sm font-bold text-gray-800">
                  Select Customer Recipient <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Users size={14} className="text-[#1E5631]" />
                  {customers.length} Registered Customers Available
                </span>
              </div>

              {/* Search filter input */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Filter customers by name, email, mobile, or ID..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631]"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                {customerSearch && (
                  <button
                    type="button"
                    onClick={() => setCustomerSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Customers Visual Grid / List */}
              <div className={`border rounded-2xl p-3 bg-gray-50/50 max-h-64 overflow-y-auto space-y-2 ${
                errors.customerId ? 'border-red-300 bg-red-50/20' : 'border-gray-200'
              }`}>
                {loadingCustomers ? (
                  <div className="p-6 text-center text-gray-400 text-xs font-medium">
                    Loading registered customer accounts...
                  </div>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c) => {
                    const isSelected = String(formData.customerId) === String(c.userId) || String(formData.customerId) === String(c.customerId);
                    return (
                      <div
                        key={c.customerId || c.userId}
                        onClick={() => handleSelectCustomer(c.userId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'bg-[#1E5631] text-white border-[#1E5631] shadow-sm'
                            : 'bg-white hover:bg-emerald-50/50 border-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#1E5631]'
                          }`}>
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm truncate ${isSelected ? 'font-bold text-white' : 'font-bold text-gray-900'}`}>
                                {c.name}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                isSelected ? 'bg-white/20 text-emerald-100' : 'bg-gray-100 text-gray-600'
                              }`}>
                                ID: #{c.customerId || c.userId}
                              </span>
                            </div>
                            <div className={`flex flex-wrap items-center gap-3 text-xs mt-0.5 ${
                              isSelected ? 'text-emerald-100' : 'text-gray-500'
                            }`}>
                              {c.email && <span className="truncate">{c.email}</span>}
                              {c.mobile && <span>• {c.mobile}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-6 h-6 rounded-full bg-white text-[#1E5631] flex items-center justify-center">
                              <Check size={14} className="stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm font-bold text-gray-700">No customers match your search</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing the search query to view all available customers.</p>
                  </div>
                )}
              </div>
              {errors.customerId && (
                <p className="text-red-500 text-xs font-bold mt-1.5">{errors.customerId}</p>
              )}

              {/* Selected Customer Card Preview */}
              {selectedCustomer && (
                <div className="mt-3 p-4 bg-[#eaf1ec] border border-[#1E5631]/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1E5631] text-white flex items-center justify-center font-bold text-sm">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1E5631] uppercase tracking-wider">Recipient Selected:</span>
                        <span className="text-sm font-bold text-gray-900">{selectedCustomer.name}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {selectedCustomer.email} {selectedCustomer.mobile ? `• ${selectedCustomer.mobile}` : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerId: '' }))}
                    className="text-xs font-bold text-red-600 hover:text-red-800 underline"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Sending Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631]"
              >
                <option value="PPC-MGMT">PPC Management (Approvals, Inspections & Verification)</option>
                <option value="PPC-SUPPORT">PPC Support (Help, Assistance & Inquiries)</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Property Inspection Scheduled for Verification"
                className={`w-full p-3.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.subject && (
                <p className="text-red-500 text-xs font-bold mt-1.5">{errors.subject}</p>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows="7"
                placeholder="Compose your official message to the customer..."
                className={`w-full p-4 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all resize-y ${
                  errors.body ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              ></textarea>
              {errors.body && (
                <p className="text-red-500 text-xs font-bold mt-1.5">{errors.body}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                to="/admin/messages"
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-[#1a2b25] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2c4232] transition-colors shadow-md text-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Dispatching...
                  </span>
                ) : (
                  <>
                    <Send size={16} /> Send to Customer
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminMessageCreate;
