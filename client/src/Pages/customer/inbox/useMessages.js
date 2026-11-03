import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerMessages,
  markCustomerMessageAsRead,
  createCustomerMessage,
} from '../../../Services/customer.services';

export const useMessages = (initialFolder = null) => {
  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ inboxCount: 0, unreadCount: 0, outboxCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (folder = initialFolder, search = '') => {
    try {
      const params = {};
      if (folder) params.folder = folder;
      if (search) params.search = search;

      const res = await getCustomerMessages(params);
      const payload = res?.data?.success !== undefined ? res.data : res;
      if (payload?.success) {
        setMessages(payload.data || []);
        if (payload.meta) {
          setMeta(payload.meta);
        }
      }
      setError(null);

    } catch (err) {
      console.error('Failed to fetch customer messages:', err);
      setError(err?.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [initialFolder]);

  useEffect(() => {
    fetchMessages();

    // Auto-polling every 30 seconds for newly received inbox updates
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const markAsRead = async (id) => {
    try {
      // Optimistic update in local state
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
      setMeta((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));

      await markCustomerMessageAsRead(id);
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const addMessage = async (messagePayload) => {
    const res = await createCustomerMessage(messagePayload);
    await fetchMessages();
    return res?.data;
  };

  return {
    messages,
    meta,
    loading,
    error,
    refreshMessages: fetchMessages,
    markAsRead,
    addMessage,
  };
};
