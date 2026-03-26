import { updateBookingStatus } from '../services/booking.service';
import { useLanguage } from '../context/LanguageContext';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const BookingCard = ({ booking, role, onStatusUpdate }) => {
  const { t } = useLanguage();

  const statusConfig = {
    pending:    { label: t('bookingCard.status.pending'),    classes: 'bg-yellow-100 text-yellow-700' },
    confirmed:  { label: t('bookingCard.status.confirmed'),  classes: 'bg-blue-100 text-blue-700' },
    inProgress: { label: t('bookingCard.status.inProgress'), classes: 'bg-purple-100 text-purple-700' },
    completed:  { label: t('bookingCard.status.completed'),  classes: 'bg-green-100 text-green-700' },
    cancelled:  { label: t('bookingCard.status.cancelled'),  classes: 'bg-red-100 text-red-700' },
  };

  const workerUser = booking.worker?.user || {};
  const customer = booking.customer || {};
  const displayName = role === 'customer' ? (workerUser.name || t('common.worker')) : (customer.name || t('common.customer'));
  const avatarName = role === 'customer' ? workerUser.name : customer.name;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName || 'U')}&background=1A56DB&color=fff`;
  const status = statusConfig[booking.status] || statusConfig.pending;

  const handleStatus = async (newStatus) => {
    try {
      await updateBookingStatus(booking._id, newStatus);
      onStatusUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={avatar} alt={displayName} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold text-gray-900">{displayName}</p>
            <p className="text-sm text-[#1A56DB] font-medium">{t(`services.${booking.service}`)}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.classes}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(booking.scheduledDate).toLocaleDateString('en-GB')}
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {booking.scheduledTime}
        </div>
        <div className="flex items-center gap-1 col-span-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {booking.address}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900">{formatUZS(booking.price)}</span>
        <div className="flex gap-2">
          {role === 'worker' && booking.status === 'pending' && (
            <>
              <button onClick={() => handleStatus('confirmed')}
                className="text-xs bg-[#1A56DB] text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                {t('bookingCard.accept')}
              </button>
              <button onClick={() => handleStatus('cancelled')}
                className="text-xs border border-red-400 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                {t('bookingCard.decline')}
              </button>
            </>
          )}
          {role === 'worker' && booking.status === 'confirmed' && (
            <button onClick={() => handleStatus('inProgress')}
              className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg">
              {t('bookingCard.startJob')}
            </button>
          )}
          {role === 'worker' && booking.status === 'inProgress' && (
            <button onClick={() => handleStatus('completed')}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">
              {t('bookingCard.complete')}
            </button>
          )}
          {role === 'customer' && booking.status === 'pending' && (
            <button onClick={() => handleStatus('cancelled')}
              className="text-xs border border-red-400 text-red-600 px-3 py-1.5 rounded-lg">
              {t('bookingCard.cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
