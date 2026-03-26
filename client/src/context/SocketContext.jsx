import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    const s = io('http://localhost:5000', { withCredentials: true });

    s.on('connect', () => {
      s.emit('register', user._id);
      setSocket(s);
    });

    s.on('notification', (data) => {
      setNotifications((prev) => [{ ...data, id: Date.now(), read: false }, ...prev]);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?._id]);

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, clearNotification, markAllRead }}>
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
