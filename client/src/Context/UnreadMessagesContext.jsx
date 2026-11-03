import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCustomerMessages } from '../Services/customer.services';
import { useAuth } from './AuthContext';

/**
 * @file UnreadMessagesContext.jsx
 * @description Global context that tracks unread inbox message count.
 * Polls every 30 seconds so the sidebar badge stays up-to-date.
 */

const UnreadMessagesContext = createContext({ unreadCount: 0, refreshUnread: () => {} });

export const UnreadMessagesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const isCustomer =
    user?.user_type?.toLowerCase() === 'customer' ||
    user?.user_type_english?.toLowerCase() === 'customer';

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    try {
      const res = await getCustomerMessages({ folder: 'inbox' });
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success && payload?.meta) {
        setUnreadCount(payload.meta.unreadCount ?? 0);
      }
    } catch {
      // Silently ignore — this is a background poll
    }
  }, [isAuthenticated, isCustomer]);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setUnreadCount(0);
      return;
    }

    fetchUnread();

    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isCustomer, fetchUnread]);

  return (
    <UnreadMessagesContext.Provider value={{ unreadCount, refreshUnread: fetchUnread }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => useContext(UnreadMessagesContext);

export default UnreadMessagesContext;
