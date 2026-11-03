import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Send,
  Mail,
  MailOpen,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building2,
  LifeBuoy,
  MessageSquare
} from 'lucide-react';
import { getAdminMessages, markAdminMessageAsRead } from '../../../Services/admin.services';

const AdminMessagesList = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({
    totalInboxCount: 0,
    unreadInboxCount: 0,
    totalOutboxCount: 0,
    mgmtCount: 0,
    supportCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [folder, setFolder] = useState('inbox'); // 'inbox', 'outbox', 'all'
  const [department, setDepartment] = useState('all'); // 'all', 'PPC-MGMT', 'PPC-SUPPORT'
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const params = {
        folder,
        department,
        unreadOnly,
        search: searchQuery
      };
      const res = await getAdminMessages(params);
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success) {
        setMessages(payload.data || []);
        if (payload.meta) {
          setMeta(payload.meta);
        }
      }
    } catch (err) {
      console.error('Failed to load admin messages:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to retrieve messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [folder, department, unreadOnly, searchQuery]);


  useEffect(() => {
    setLoading(true);
    fetchMessages();

    // Auto refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
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

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="px-4 sm:px-8 lg:px-12 py-6 max-w-[1400px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E5631] uppercase tracking-wider mb-1">
              <span>Operations Center</span>
              <span>/</span>
              <span>Customer Communications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] flex items-center gap-3">
              Super Admin Inbox
              {meta.unreadInboxCount > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
                  {meta.unreadInboxCount} Needs Response
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Review customer inquiries, send official PPC replies, and manage customer communications across departments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              title="Refresh communications"
              className="p-3 bg-white text-gray-700 hover:text-[#1a2b25] rounded-xl font-bold border border-gray-200 shadow-sm hover:border-gray-300 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin text-[#1E5631]' : ''} />
            </button>
            <Link
              to="/admin/messages/new"
              className="flex items-center gap-2 bg-[#1a2b25] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2c4232] transition-colors shadow-sm"
            >
              <Plus size={18} /> Compose to Customer
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div 
            onClick={() => { setFolder('inbox'); setUnreadOnly(false); }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              folder === 'inbox' && !unreadOnly 
                ? 'bg-[#1a2b25] text-white border-[#1a2b25] shadow-md' 
                : 'bg-white text-gray-800 border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${folder === 'inbox' && !unreadOnly ? 'text-emerald-200' : 'text-gray-400'}`}>
                Customer Inquiries
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${folder === 'inbox' && !unreadOnly ? 'bg-white/10 text-white' : 'bg-emerald-50 text-[#1E5631]'}`}>
                <Inbox size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif">{meta.totalInboxCount}</div>
            <p className={`text-xs mt-1 ${folder === 'inbox' && !unreadOnly ? 'text-gray-300' : 'text-gray-500'}`}>
              Incoming customer messages
            </p>
          </div>

          <div 
            onClick={() => { setFolder('inbox'); setUnreadOnly(true); }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              unreadOnly 
                ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
                : 'bg-white text-gray-800 border-gray-100 hover:border-amber-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${unreadOnly ? 'text-amber-100' : 'text-amber-600'}`}>
                Unread Inquiries
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${unreadOnly ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'}`}>
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif">{meta.unreadInboxCount}</div>
            <p className={`text-xs mt-1 ${unreadOnly ? 'text-amber-100' : 'text-gray-500'}`}>
              Awaiting staff review
            </p>
          </div>

          <div 
            onClick={() => { setFolder('outbox'); setUnreadOnly(false); }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              folder === 'outbox' 
                ? 'bg-[#1a2b25] text-white border-[#1a2b25] shadow-md' 
                : 'bg-white text-gray-800 border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${folder === 'outbox' ? 'text-emerald-200' : 'text-gray-400'}`}>
                Sent Replies
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${folder === 'outbox' ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <Send size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold font-serif">{meta.totalOutboxCount}</div>
            <p className={`text-xs mt-1 ${folder === 'outbox' ? 'text-gray-300' : 'text-gray-500'}`}>
              Sent by PPC to customers
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Departments
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-gray-500 font-semibold block">MGMT</span>
                <span className="text-xl font-bold text-gray-800">{meta.mgmtCount}</span>
              </div>
              <div className="h-8 w-px bg-gray-100"></div>
              <div>
                <span className="text-xs text-gray-500 font-semibold block">SUPPORT</span>
                <span className="text-xl font-bold text-gray-800">{meta.supportCount}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span className="flex-1 font-medium">{error}</span>
            <button onClick={handleRefresh} className="text-xs font-bold underline hover:text-red-900">
              Retry
            </button>
          </div>
        )}

        {/* Main Communications Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Controls Bar: Folder Tabs, Department Dropdown & Search */}
          <div className="p-4 lg:p-6 border-b border-gray-100 bg-[#fafcfb] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Folder Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => { setFolder('inbox'); setUnreadOnly(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  folder === 'inbox' && !unreadOnly ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Inbox size={16} /> Customer Inquiries
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {meta.totalInboxCount}
                </span>
              </button>
              <button
                onClick={() => { setFolder('outbox'); setUnreadOnly(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  folder === 'outbox' ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Send size={16} /> Sent by PPC
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1 font-semibold">
                  {meta.totalOutboxCount}
                </span>
              </button>
              <button
                onClick={() => { setFolder('all'); setUnreadOnly(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  folder === 'all' && !unreadOnly ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <MessageSquare size={16} /> All
              </button>
            </div>

            {/* Department & Search */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] text-gray-700"
              >
                <option value="all">All Departments</option>
                <option value="PPC-MGMT">PPC Management</option>
                <option value="PPC-SUPPORT">PPC Support</option>
              </select>

              <div className="relative flex-1 sm:w-72">
                <input
                  type="text"
                  placeholder="Search customer, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631]"
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

          </div>

          {/* Messages List Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse flex items-center gap-4 p-5 border border-gray-100 rounded-2xl">
                    <div className="w-11 h-11 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    </div>
                    <div className="w-24 h-4 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {messages.map((msg) => {
                  const isUnread = !msg.isAdminRead;
                  const isReceived = msg.direction === 'outbox'; // Sent by customer to admin

                  return (
                    <div
                      key={msg.id}
                      onClick={() => navigate(`/admin/messages/${msg.id}`)}
                      className={`p-5 lg:p-6 hover:bg-[#fafcfb] transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-4 ${
                        isUnread ? 'bg-[#f4f7f5]/40' : ''
                      }`}
                    >
                      {/* Customer Avatar & Department */}
                      <div className="flex items-center gap-4 w-full md:w-[260px] shrink-0">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                          isUnread
                            ? 'bg-[#1E5631] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-[#1E5631]/10 group-hover:text-[#1E5631]'
                        }`}>
                          {msg.customerName ? msg.customerName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm truncate ${isUnread ? 'font-extrabold text-[#1a2b25]' : 'font-bold text-gray-800'}`}>
                              {msg.customerName}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 truncate">
                            {msg.customerEmail && <span className="truncate">{msg.customerEmail}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Department Tag & Subject Preview */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                            msg.department === 'PPC-MGMT' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {msg.department === 'PPC-MGMT' ? 'PPC Management' : 'PPC Support'}
                          </span>

                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                            isReceived
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {isReceived ? 'Received from Customer' : 'Sent by PPC'}
                          </span>

                          {isUnread && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800">
                              New
                            </span>
                          )}
                        </div>

                        <h4 className={`text-[15px] truncate mb-1 ${isUnread ? 'font-extrabold text-[#1a2b25]' : 'font-bold text-gray-800'}`}>
                          {msg.subject}
                        </h4>
                        <p className="text-xs text-gray-500 truncate font-medium">
                          {msg.body}
                        </p>
                      </div>

                      {/* Date, Time & Action */}
                      <div className="w-full md:w-[160px] shrink-0 md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 text-xs">
                        <span className={`flex items-center gap-1.5 ${isUnread ? 'font-bold text-[#1E5631]' : 'font-semibold text-gray-600'}`}>
                          <Calendar size={13} className={isUnread ? 'text-[#1E5631]' : 'text-gray-400'} /> {formatDate(msg.createdAt)}
                        </span>
                        <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                          <Clock size={13} /> {formatTime(msg.createdAt)}
                        </span>
                        <span className="hidden md:flex items-center gap-1 text-xs font-bold text-[#1E5631] group-hover:translate-x-1 transition-transform mt-1">
                          View & Reply <ArrowRight size={12} />
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[420px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  {searchQuery ? <Search size={28} /> : <Inbox size={28} />}
                </div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">
                  {searchQuery ? 'No matching communications found' : 'No messages in this folder'}
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-md">
                  {searchQuery 
                    ? 'Try adjusting your search criteria or changing the department filter.'
                    : 'Customer messages and department communications will appear here.'}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminMessagesList;
