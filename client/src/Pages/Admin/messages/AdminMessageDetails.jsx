import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Send,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Reply,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { getAdminMessageById, sendAdminMessage } from '../../../Services/admin.services';

const AdminMessageDetails = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reply state
  const [replyDepartment, setReplyDepartment] = useState('PPC-MGMT');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminMessageById(messageId);
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success && payload?.data) {
        const msg = payload.data;
        setMessage(msg);
        setThread(payload.thread || []);
        setReplyDepartment(msg.department || 'PPC-MGMT');
        const rawSub = msg.subject || '';
        setReplySubject(rawSub.toLowerCase().startsWith('re:') ? rawSub : `Re: ${rawSub}`);
      }
    } catch (err) {
      console.error('Failed to load message details:', err);
      setError(err?.response?.data?.message || err?.message || 'Message not found');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDetail();
  }, [messageId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      setReplyError('Reply message cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setReplyError(null);

    try {
      await sendAdminMessage({
        customerId: message.customerId,
        department: replyDepartment,
        subject: replySubject.trim(),
        body: replyBody.trim(),
        replyToMessageId: message.id,
      });

      setReplySuccess(true);
      setReplyBody('');

      // Refresh thread
      await fetchDetail();

      setTimeout(() => {
        setReplySuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to send reply:', err);
      setReplyError(err?.response?.data?.message || 'Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
        <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-[1200px] mx-auto animate-pulse space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
          <div className="h-44 bg-white rounded-2xl border border-gray-100"></div>
          <div className="h-60 bg-white rounded-2xl border border-gray-100"></div>
        </div>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The communication record you are trying to view does not exist.</p>
        <Link
          to="/admin/messages"
          className="bg-[#1a2b25] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#2c4232] transition-colors"
        >
          Return to Admin Inbox
        </Link>
      </div>
    );
  }

  const isReceived = message.direction === 'outbox';

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-[1200px] mx-auto">
        
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin/messages"
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#1a2b25] transition-colors bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Messages
          </Link>

          <Link
            to={`/admin/customers/${message.customerId}`}
            className="flex items-center gap-2 text-sm font-bold text-[#1E5631] bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2.5 rounded-xl border border-emerald-200"
          >
            <User size={16} /> View Customer Profile <ExternalLink size={14} />
          </Link>
        </div>

        {/* Customer Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#1E5631] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
              {message.customerName ? message.customerName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-serif font-bold text-gray-900">{message.customerName}</h2>
                <span className="text-xs bg-gray-100 px-2.5 py-0.5 rounded-md font-bold text-gray-600">
                  Customer ID: #{message.customerId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mt-1.5">
                {message.customerEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-gray-400" /> {message.customerEmail}
                  </span>
                )}
                {message.customerMobile && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" /> {message.customerMobile}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border ${
              message.department === 'PPC-MGMT' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {message.department === 'PPC-MGMT' ? 'PPC Management' : 'PPC Support'}
            </span>
          </div>
        </div>

        {/* Active Message Container */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-8">
          
          {/* Message Meta Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-[#fafcfb]">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                isReceived 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {isReceived ? 'Received from Customer' : 'Sent by PPC'}
              </span>
              <span className="text-xs text-gray-400 font-semibold">
                Message Reference: {message.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-4">
              {message.subject}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" /> {formatDate(message.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" /> {formatTime(message.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-gray-400" /> From: <strong className="text-gray-700">{message.sender.name}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" /> To: <strong className="text-gray-700">{message.recipient.name}</strong>
              </span>
            </div>
          </div>

          {/* Message Body Content */}
          <div className="p-6 sm:p-8 lg:p-10 text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
            {message.body}
          </div>

        </div>

        {/* Conversation Thread History */}
        {thread.length > 1 && (
          <div className="mb-8">
            <h3 className="text-lg font-serif font-bold text-[#1a2b25] mb-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#1E5631]" />
              Conversation History with Customer ({thread.length} messages)
            </h3>

            <div className="space-y-4">
              {thread.map((tMsg) => {
                const isCurrent = tMsg.id === message.id;
                const isCust = tMsg.direction === 'outbox';

                return (
                  <div
                    key={tMsg.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[#f4f7f5] border-[#1E5631]/30 shadow-sm'
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCust ? 'bg-emerald-100 text-[#1E5631]' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCust ? 'C' : 'PPC'}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{tMsg.sender.name}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-xs font-semibold text-gray-600">{tMsg.recipient.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#1E5631] text-white px-2 py-0.5 rounded-full font-bold ml-2">
                            Viewing
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {formatDate(tMsg.createdAt)} at {formatTime(tMsg.createdAt)}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-gray-800 mb-1">{tMsg.subject}</h5>
                    <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap">{tMsg.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Official PPC Reply Box */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 bg-[#fafcfb] border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1E5631] flex items-center justify-center">
              <Reply size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Send Official PPC Response</h3>
              <p className="text-xs text-gray-500 font-medium">
                This response will be delivered directly to the customer's portal inbox and alert them.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendReply} className="p-6 sm:p-8 space-y-5">
            {replySuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" />
                Reply sent successfully to customer!
              </div>
            )}

            {replyError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle size={18} className="text-red-500" />
                {replyError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Sending Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={replyDepartment}
                  onChange={(e) => setReplyDepartment(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631]"
                >
                  <option value="PPC-MGMT">PPC Management (Approvals & Inquiries)</option>
                  <option value="PPC-SUPPORT">PPC Support (Help & Service)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Response Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="6"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Type your official reply to this customer..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] resize-y"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-[#1a2b25] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2c4232] transition-colors shadow-md text-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Send size={16} /> Send Reply
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

export default AdminMessageDetails;
