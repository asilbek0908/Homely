import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const STORAGE_KEY = 'homely_notifications';

const loadStored = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState(loadStored);

  const persist = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  };

  useEffect(() => {
    if (!user?._id) return;

    const s = io(SOCKET_URL, { withCredentials: true });

    s.on('connect', () => {
      s.emit('register', user._id);
      setSocket(s);
    });

    s.on('notification', (data) => {
      setNotifications((prev) => {
        const updated = [{ ...data, id: Date.now(), read: false, timestamp: new Date().toISOString() }, ...prev];
        persist(updated);
        return updated;
      });
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persist(updated);
      return updated;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const dismissOne = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      persist(updated);
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllRead, clearAll, dismissOne }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export default SocketContext;
