import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Send, Mail } from 'lucide-react';
import { useMessages } from './useMessages';

const CustomerMessageCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addMessage } = useMessages();

  // Parse query params for reply functionality
  const replyToId = searchParams.get('replyTo');
  const initialSubject = searchParams.get('subject') || '';
  const originalMessageId = searchParams.get('originalId') || null;

  const [formData, setFormData] = useState({
    to: replyToId || '',
    subject: initialSubject,
    body: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Mock recipients
  const recipients = [
    { id: 'PPC-MGMT', name: 'PPC Management' },
    { id: 'PPC-SUPPORT', name: 'PPC Support' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.to) newErrors.to = 'Please select a recipient.';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required.';
    if (formData.subject.trim().length > 100) newErrors.subject = 'Subject is too long (max 100 characters).';
    if (!formData.body.trim()) newErrors.body = 'Message body cannot be empty.';
    if (formData.body.trim().length > 2000) newErrors.body = 'Message is too long (max 2000 characters).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const recipientName = recipients.find(r => r.id === formData.to)?.name || 'PPC';
      
      const newMessage = {
        id: `MSG-NEW-${Date.now()}`,
        direction: 'outbox',
        sender: { id: 'CUSTOMER', name: 'Customer' },
        recipient: { id: formData.to, name: recipientName },
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        createdAt: new Date().toISOString(),
        isRead: true, // Outbox messages are inherently read by sender
        replyToMessageId: originalMessageId
      };

      addMessage(newMessage);
      setToastMessage('Message sent successfully!');

      // Redirect after toast
      setTimeout(() => {
        navigate('/customer/inbox');
      }, 1500);

    }, 800);
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1E5631] text-white px-6 py-3 rounded-lg shadow-xl font-bold flex items-center gap-2 animate-bounce">
          <Send size={18} /> {toastMessage}
        </div>
      )}

      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[900px] mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/inbox" className="hover:text-gray-900 transition-colors">Messages</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25]">{replyToId ? 'Reply' : 'New Message'}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#1a2b25]">
            {replyToId ? 'Reply to Message' : 'Compose Message'}
          </h1>
          <Link 
            to="/customer/inbox"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#1a2b25] transition-colors"
          >
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 bg-[#fafcfb] border-b border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Message</h2>
              <p className="text-sm font-medium text-gray-500">Send a direct message to PPC.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* To Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">To <span className="text-red-500">*</span></label>
              <select
                name="to"
                value={formData.to}
                onChange={handleChange}
                disabled={!!replyToId} // Lock if replying
                className={`w-full p-3.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all ${
                  errors.to ? 'border-red-300 bg-red-50' : 'border-gray-200'
                } ${replyToId ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Recipient...</option>
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.to && <p className="text-red-500 text-xs font-bold mt-1.5">{errors.to}</p>}
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Enter a clear subject..."
                className={`w-full p-3.5 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.subject && <p className="text-red-500 text-xs font-bold mt-1.5">{errors.subject}</p>}
            </div>

            {/* Message Body Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Message <span className="text-red-500">*</span></label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows="8"
                placeholder="Write your message here..."
                className={`w-full p-4 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all resize-y ${
                  errors.body ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              ></textarea>
              {errors.body && <p className="text-red-500 text-xs font-bold mt-1.5">{errors.body}</p>}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
              <Link 
                to="/customer/inbox"
                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-[#1a2b25] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2c4232] transition-colors shadow-md text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending...
                  </span>
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CustomerMessageCreate;
