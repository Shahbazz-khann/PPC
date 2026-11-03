import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Reply, Mail, Calendar, Clock, Send, AlertCircle } from 'lucide-react';
import { useMessages } from './useMessages';
import { getCustomerMessageById, markCustomerMessageAsRead } from '../../../Services/customer.services';
import { useUnreadMessages } from '../../../Context/UnreadMessagesContext';

const CustomerMessageDetails = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const { messages, markAsRead } = useMessages();
  const { refreshUnread } = useUnreadMessages();

  const [message, setMessage] = useState(() => messages.find(m => m.id === messageId) || null);
  const [loading, setLoading] = useState(!message);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Check if message is already in memory
    const existing = messages.find(m => m.id === messageId);
    if (existing) {
      setMessage(existing);
      setLoading(false);
      // Mark as read if unread inbox message
      if (existing.direction === 'inbox' && !existing.isRead) {
        markAsRead(existing.id).then(() => refreshUnread());
      }
      return;
    }

    // Otherwise fetch fresh from API
    const loadDetail = async () => {
      try {
        setLoading(true);
        const res = await getCustomerMessageById(messageId);
        const payload = res?.data?.success !== undefined ? res.data : res;
        if (isMounted && payload?.success && payload?.data) {
          const detail = payload.data;
          setMessage(detail);
          setError(null);
          if (detail.direction === 'inbox' && !detail.isRead) {
            markAsRead(detail.id).then(() => refreshUnread());
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load message details:', err);
          setError(err?.response?.data?.message || err?.message || 'Message not found');
        }

      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [messageId, messages, markAsRead]);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
        <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1200px] mx-auto animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-32 bg-gray-50 rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The message you are looking for does not exist or may have been removed.</p>
        <Link 
          to="/customer/inbox" 
          className="bg-[#1a2b25] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2c4232] transition-colors"
        >
          Return to Inbox
        </Link>
      </div>
    );
  }

  const isInbox = message.direction === 'inbox';
  const contactName = isInbox ? (message.sender?.name || 'PPC') : (message.recipient?.name || 'PPC');
  const contactId = isInbox ? (message.sender?.id || 'PPC-SUPPORT') : (message.recipient?.id || 'PPC-SUPPORT');

  const handleReply = () => {
    const rawSubject = message.subject || '';
    const replySubject = rawSubject.toLowerCase().startsWith('re:') ? rawSubject : `Re: ${rawSubject}`;
    navigate(`/customer/inbox/new?replyTo=${contactId}&subject=${encodeURIComponent(replySubject)}&originalId=${message.id}`);
  };

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="pt-6 px-4 sm:px-8 lg:px-12 xl:px-4 max-w-[1200px] mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm font-semibold text-gray-500 gap-2 mb-8">
          <Link to="/customer/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/customer/inbox" className="hover:text-gray-900 transition-colors">Messages</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-[#1a2b25] truncate max-w-[200px]">{message.subject}</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/customer/inbox"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#1a2b25] transition-colors bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={16} /> Back to {isInbox ? 'Inbox' : 'Outbox'}
          </Link>
          
          {isInbox && (
            <button 
              onClick={handleReply}
              className="flex items-center gap-2 text-sm font-bold text-white bg-[#1E5631] hover:bg-[#2c4232] transition-colors px-6 py-2.5 rounded-xl shadow-sm"
            >
              <Reply size={16} /> Reply
            </button>
          )}
        </div>

        {/* Message Container */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-gray-100 bg-[#fafcfb]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                    isInbox 
                      ? 'bg-[#1E5631]/10 text-[#1E5631] border-[#1E5631]/20' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {isInbox ? 'Received' : 'Sent'}
                  </span>
                  {message.replyToMessageId && (
                    <span className="text-xs text-gray-400 font-semibold">
                      In reply to: {message.replyToMessageId}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] leading-tight">
                  {message.subject}
                </h1>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#eaf1ec] text-[#1E5631] flex items-center justify-center shrink-0">
                  {isInbox ? <Mail size={20} /> : <Send size={20} />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                    {isInbox ? 'From' : 'To'}
                  </span>
                  <span className="text-sm font-bold text-gray-900 block">{contactName}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Metadata Bar */}
          <div className="px-8 py-4 border-b border-gray-50 flex flex-wrap items-center gap-6 text-sm font-semibold text-gray-500 bg-white">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" /> {formatDate(message.createdAt)}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" /> {formatTime(message.createdAt)}
            </span>
          </div>

          {/* Message Body */}
          <div className="p-8 lg:p-12">
            <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
              {message.body}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerMessageDetails;
