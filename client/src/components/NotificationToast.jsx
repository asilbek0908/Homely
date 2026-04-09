import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const TYPE_CONFIG = {
  new_booking:          { icon: '📋', color: 'border-blue-400',   bg: 'bg-blue-50' },
  booking_update:       { icon: '🔔', color: 'border-gray-300',   bg: 'bg-white'   },
  booking_confirmed:    { icon: '✅', color: 'border-green-400',  bg: 'bg-green-50' },
  booking_inProgress:   { icon: '🔧', color: 'border-purple-400', bg: 'bg-purple-50' },
  booking_completed:    { icon: '🎉', color: 'border-green-400',  bg: 'bg-green-50' },
  booking_cancelled:    { icon: '❌', color: 'border-red-400',    bg: 'bg-red-50'   },
  booking_rescheduled:  { icon: '🗓', color: 'border-orange-400', bg: 'bg-orange-50' },
};

const getMessage = (n) => {
  const service = n.booking?.service || 'service';
  if (n.type === 'new_booking')        return `New booking request for "${service}"`;
  if (n.type === 'booking_rescheduled') return `Booking rescheduled: "${service}"`;
  if (n.type === 'booking_update') {
    if (n.status === 'confirmed')   return `Your booking for "${service}" was confirmed!`;
    if (n.status === 'inProgress')  return `Worker started the job: "${service}"`;
    if (n.status === 'completed')   return `Job completed: "${service}"`;
    if (n.status === 'cancelled')   return `Booking cancelled: "${service}"`;
    return `Booking updated: "${service}"`;
  }
  return 'You have a new notification';
};

const getConfig = (n) => {
  if (n.type === 'booking_update') {
    const key = `booking_${n.status}`;
    return TYPE_CONFIG[key] || TYPE_CONFIG.booking_update;
  }
  return TYPE_CONFIG[n.type] || TYPE_CONFIG.booking_update;
};

const Toast = ({ notif, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4.5s
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  const cfg = getConfig(notif);

  return (
    <div
      className={`flex items-start gap-3 w-80 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 ${cfg.bg} ${cfg.color} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Notification</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-snug">{getMessage(notif)}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="text-gray-300 hover:text-gray-500 text-sm flex-shrink-0 mt-0.5"
      >
        ✕
      </button>
    </div>
  );
};

const NotificationToast = () => {
  const { notifications } = useSocket();
  const [queue, setQueue] = useState([]);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    if (notifications.length > lastCount) {
      const newest = notifications[0];
      if (newest && !newest.read) {
        setQueue((q) => [...q, newest]);
      }
    }
    setLastCount(notifications.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const dismiss = (id) => setQueue((q) => q.filter((n) => n.id !== id));

  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {queue.slice(0, 3).map((n) => (
        <Toast key={n.id} notif={n} onDismiss={() => dismiss(n.id)} />
      ))}
    </div>
  );
};

export default NotificationToast;
