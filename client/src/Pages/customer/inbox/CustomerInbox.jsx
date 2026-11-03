import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Search, Mail, MailOpen, Send, Calendar, Clock, Inbox as InboxIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useMessages } from './useMessages';

const CustomerInbox = () => {
  const { messages, meta, loading, error, refreshMessages } = useMessages();
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshMessages();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter messages based on tab and search
  const displayedMessages = messages
    .filter(m => m.direction === activeTab)
    .filter(m => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const contactName = activeTab === 'inbox' ? (m.sender?.name || '').toLowerCase() : (m.recipient?.name || '').toLowerCase();
      return contactName.includes(q) || (m.subject || '').toLowerCase().includes(q) || (m.body || '').toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Counts
  const inboxCount = meta?.inboxCount ?? messages.filter(m => m.direction === 'inbox').length;
  const unreadCount = meta?.unreadCount ?? messages.filter(m => m.direction === 'inbox' && !m.isRead).length;
  const outboxCount = meta?.outboxCount ?? messages.filter(m => m.direction === 'outbox').length;

  return (
    <div className="w-full bg-[#FAF8F3] min-h-screen pb-16 font-sans">
      <div className="px-4 sm:px-8 lg:px-12 xl:px-4">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a2b25] mb-2 flex items-center gap-3">
              Messages
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-[#1E5631] text-white text-xs font-bold rounded-full align-middle animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="text-gray-600 font-medium max-w-2xl">
              Communicate with PPC and view your received and sent messages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={loading || isRefreshing}
              title="Refresh messages"
              className="p-3 bg-white text-gray-700 hover:text-[#1a2b25] rounded-xl font-bold border border-gray-200 hover:border-gray-300 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-[#1E5631]' : ''} />
            </button>
            <Link 
              to="/customer/inbox/new"
              className="flex items-center gap-2 bg-[#1a2b25] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2c4232] transition-colors shadow-sm w-fit"
            >
              <Plus size={18} /> Create Message
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <span className="flex-1 font-medium">{error}</span>
            <button
              onClick={handleManualRefresh}
              className="text-xs font-bold underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Messaging Interface */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
          
          {/* Top Bar: Tabs & Search */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:p-6 border-b border-gray-100 gap-4 bg-[#fafcfb]">
            
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-full lg:w-auto">
              <button 
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'inbox' ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <InboxIcon size={16} /> Inbox 
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1 font-semibold">{inboxCount}</span>
              </button>
              <button 
                onClick={() => setActiveTab('outbox')}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'outbox' ? 'bg-white text-[#1a2b25] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Send size={16} /> Outbox
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1 font-semibold">{outboxCount}</span>
              </button>
            </div>

            <div className="relative w-full lg:w-80">
              <input 
                type="text" 
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E5631]/20 focus:border-[#1E5631] transition-all"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto bg-white">
            {loading && messages.length === 0 ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    </div>
                    <div className="w-20 h-4 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : displayedMessages.length > 0 ? (
              <div className="flex flex-col">
                {displayedMessages.map((msg) => {
                  const isUnread = activeTab === 'inbox' && !msg.isRead;
                  const contactName = activeTab === 'inbox' ? (msg.sender?.name || 'PPC') : (msg.recipient?.name || 'PPC');

                  return (
                    <Link 
                      key={msg.id}
                      to={`/customer/inbox/${msg.id}`}
                      className={`block p-4 lg:p-6 border-b border-gray-50 hover:bg-gray-50/80 transition-colors group ${isUnread ? 'bg-[#f4f7f5]/40' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        
                        {/* Icon & Contact */}
                        <div className="flex items-center gap-4 w-full md:w-[220px] shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-[#1E5631] text-white shadow-sm' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                            {isUnread ? <Mail size={16} /> : activeTab === 'outbox' ? <Send size={16} /> : <MailOpen size={16} />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                              {activeTab === 'inbox' ? 'From' : 'To'}
                            </span>
                            <span className={`text-sm ${isUnread ? 'font-extrabold text-[#1a2b25]' : 'font-bold text-gray-700'}`}>
                              {contactName}
                            </span>
                          </div>
                        </div>

                        {/* Subject & Preview */}
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className={`text-[15px] truncate mb-1 ${isUnread ? 'font-extrabold text-[#1a2b25]' : 'font-bold text-gray-800'}`}>
                            {msg.subject}
                          </h4>
                          <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-600' : 'text-gray-500'}`}>
                            {msg.body}
                          </p>
                        </div>

                        {/* Date & Time */}
                        <div className="w-full md:w-[130px] shrink-0 md:text-right flex md:flex-col items-center md:items-end gap-2 md:gap-1 text-xs">
                          <span className={`flex items-center gap-1.5 ${isUnread ? 'font-bold text-[#1E5631]' : 'font-semibold text-gray-500'}`}>
                            <Calendar size={12} className={isUnread ? 'text-[#1E5631]/70' : 'text-gray-400'} /> {formatDate(msg.createdAt)}
                          </span>
                          <span className="font-semibold text-gray-400 flex items-center gap-1.5">
                            <Clock size={12} /> {formatTime(msg.createdAt)}
                          </span>
                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                  {searchQuery ? <Search size={28} /> : <InboxIcon size={28} />}
                </div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  {searchQuery ? 'No messages found.' : activeTab === 'inbox' ? 'No messages received yet.' : 'No sent messages yet.'}
                </h3>
                <p className="text-sm font-medium text-gray-500 max-w-md">
                  {searchQuery ? 'Try adjusting your search terms.' : activeTab === 'inbox' ? 'When PPC contacts you regarding properties, visits, or verification, messages will appear here.' : 'Messages you send to PPC Support or Management will be saved here.'}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default CustomerInbox;
