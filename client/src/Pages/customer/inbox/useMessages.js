import { useState, useEffect } from 'react';
import { mockMessagesList } from './mockMessagesData';

export const useMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('ppc_mock_messages');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      localStorage.setItem('ppc_mock_messages', JSON.stringify(mockMessagesList));
      setMessages(mockMessagesList);
    }
  }, []);

  const markAsRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, isRead: true } : m);
    setMessages(updated);
    localStorage.setItem('ppc_mock_messages', JSON.stringify(updated));
  };

  const addMessage = (message) => {
    const updated = [message, ...messages];
    setMessages(updated);
    localStorage.setItem('ppc_mock_messages', JSON.stringify(updated));
  };

  return { messages, markAsRead, addMessage };
};
