import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  Home,
  FileText,
  Calendar,
  ShieldCheck,
  Clock,
  ExternalLink,
  Inbox,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../Services/notification.service';
import { useAuth } from '../../Context/AuthContext';

/**
 * Helper to format relative time (e.g. "Just now", "5m ago", "2h ago", "1d ago")
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Returns icon and color styling for a given notification type
 */
const getNotificationTypeConfig = (type) => {
  switch (String(type || '').toLowerCase()) {
    case 'property':
      return {
        icon: Home,
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        badgeColor: 'bg-emerald-500',
      };
    case 'request':
      return {
        icon: FileText,
        bgColor: 'bg-amber-50 text-amber-700 border-amber-100',
        badgeColor: 'bg-[#C59B27]',
      };
    case 'visit':
      return {
        icon: Calendar,
        bgColor: 'bg-blue-50 text-blue-700 border-blue-100',
        badgeColor: 'bg-blue-500',
      };
    case 'inspection':
      return {
        icon: ShieldCheck,
        bgColor: 'bg-purple-50 text-purple-700 border-purple-100',
        badgeColor: 'bg-purple-500',
      };
    default:
      return {
        icon: Bell,
        bgColor: 'bg-gray-50 text-gray-700 border-gray-100',
        badgeColor: 'bg-gray-500',
      };
  }
};

const NotificationDropdown = () => {
  const { t } = useTranslation(['common', 'admin']);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count (lightweight polling)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res && typeof res.count === 'number') {
        setUnreadCount(res.count);
      }
    } catch {
      // Silent fail on background polling
    }
  }, []);

  // Fetch full notification list
  const fetchList = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await getNotifications({ limit: 15, unreadOnly: filterUnreadOnly });
      if (res && res.data) {
        setNotifications(res.data);
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filterUnreadOnly]);

  // Initial count load & 30-second interval polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const onFocus = () => fetchUnreadCount();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchUnreadCount]);

  // When dropdown opens, fetch the notifications list
  useEffect(() => {
    if (isOpen) {
      fetchList(true);
    }
  }, [isOpen, fetchList]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle clicking a notification
  const handleNotificationClick = async (notif) => {
    // Optimistically mark as read in local state
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.notification_id === notif.notification_id
            ? { ...item, is_read: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Persist to server
      try {
        await markNotificationAsRead(notif.notification_id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    setIsOpen(false);

    // Navigate to linked page if link_url is provided
    if (notif.link_url) {
      navigate(notif.link_url);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      fetchList();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        title={t('common:notifications', 'Notifications')}
        aria-label="Notifications"
        className={`relative p-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${
          isOpen
            ? 'bg-[#002a1b] text-white border-[#002a1b]'
            : 'text-gray-600 hover:text-[#002a1b] bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 px-1.5 min-w-[19px] h-[19px] bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute end-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">
                {t('common:notifications', 'Notifications')}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-[#C59B27]/15 text-[#8f6d14] rounded-full">
                  {unreadCount} {t('common:new', 'new')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#002a1b] hover:text-[#C59B27] transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                  <span>{t('common:markAllRead', 'Mark read')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="px-3 py-1.5 bg-gray-50/70 border-b border-gray-100 flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilterUnreadOnly(false)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                !filterUnreadOnly
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('common:all', 'All')}
            </button>
            <button
              onClick={() => setFilterUnreadOnly(true)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                filterUnreadOnly
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {t('common:unread', 'Unread')} ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-200">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <RefreshCw size={24} className="animate-spin text-[#C59B27] mb-2" />
                <span className="text-xs font-medium">{t('common:loading', 'Loading notifications...')}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Inbox size={22} />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  {filterUnreadOnly
                    ? t('common:noUnreadNotifications', 'No unread notifications')
                    : t('common:noNotifications', 'No notifications yet')}
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
                  {filterUnreadOnly
                    ? t('common:caughtUp', "You're all caught up with recent alerts.")
                    : t('common:activityAlerts', 'Real-time updates regarding properties, visits, and requests will appear here.')}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const config = getNotificationTypeConfig(item.type);
                const IconComponent = config.icon;
                const isUnread = !item.is_read;

                return (
                  <button
                    key={item.notification_id}
                    onClick={() => handleNotificationClick(item)}
                    type="button"
                    className={`w-full text-start p-3.5 transition-all flex items-start gap-3 hover:bg-gray-50/80 cursor-pointer ${
                      isUnread ? 'bg-amber-50/20' : 'bg-white'
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.bgColor}`}
                    >
                      <IconComponent size={16} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs font-bold leading-tight truncate ${
                            isUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {item.title}
                        </span>
                        {isUnread && (
                          <span
                            className="w-2 h-2 rounded-full bg-[#C59B27] shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatRelativeTime(item.created_at)}
                        </span>
                        {item.actor_name && item.actor_name !== 'System' && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">
                              {item.actor_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-gray-50/60 border-t border-gray-100 text-center">
              <span className="text-[11px] text-gray-400">
                {t('common:notificationsAutoUpdated', 'Auto-updated in real-time')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
