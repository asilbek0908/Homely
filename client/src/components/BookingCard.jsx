import { useState } from 'react';
import { updateBookingStatus, rescheduleBooking } from '../services/booking.service';
import { createReview } from '../services/review.service';
import { useLanguage } from '../context/LanguageContext';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const BookingCard = ({ booking, role, onStatusUpdate }) => {
  const { t } = useLanguage();
  const [showReview, setShowReview] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finalPrice, setFinalPrice] = useState('');
  const [completing, setCompleting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

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

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setRescheduling(true);
    try {
      await rescheduleBooking(booking._id, newDate, newTime);
      setRescheduled(true);
      setShowReschedule(false);
      onStatusUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error rescheduling booking');
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await updateBookingStatus(booking._id, 'cancelled');
      setShowCancelConfirm(false);
      onStatusUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const price = finalPrice !== '' ? Number(finalPrice) : booking.price;
      await updateBookingStatus(booking._id, 'completed', price);
      setShowCompleteModal(false);
      onStatusUpdate?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing booking');
    } finally {
      setCompleting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!rating) return;
    setReviewLoading(true);
    try {
      await createReview({ bookingId: booking._id, rating, comment });
      setReviewDone(true);
      setShowReview(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
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
        <div>
          {booking.finalPrice != null && booking.finalPrice !== booking.price ? (
            <div>
              <span className="font-bold text-gray-900">{formatUZS(booking.finalPrice)}</span>
              <span className="text-xs text-gray-400 line-through ml-2">{formatUZS(booking.price)}</span>
              <span className="text-xs text-orange-500 ml-1">Final</span>
            </div>
          ) : (
            <span className="font-bold text-gray-900">{formatUZS(booking.price)}</span>
          )}
        </div>
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
            <button onClick={() => { setFinalPrice(String(booking.price)); setShowCompleteModal(true); }}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
              {t('bookingCard.complete')}
            </button>
          )}
          {role === 'customer' && ['pending', 'confirmed'].includes(booking.status) && (
            <>
              <button onClick={() => { setShowReschedule((v) => !v); setShowCancelConfirm(false); }}
                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                🗓 {t('bookingCard.reschedule')}
              </button>
              <button onClick={() => { setShowCancelConfirm(true); setShowReschedule(false); }}
                className="text-xs border border-red-400 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
                {t('bookingCard.cancel')}
              </button>
            </>
          )}
          {role === 'worker' && booking.status === 'confirmed' && (
            <button onClick={() => setShowCancelConfirm(true)}
              className="text-xs border border-red-400 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">
              {t('bookingCard.cancel')}
            </button>
          )}
          {role === 'customer' && booking.status === 'completed' && !reviewDone && (
            <button onClick={() => setShowReview((v) => !v)}
              className="text-xs bg-yellow-400 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-500">
              ⭐ {t('bookingCard.leaveReview')}
            </button>
          )}
          {reviewDone && (
            <span className="text-xs text-green-600 font-medium">{t('bookingCard.reviewSuccess')}</span>
          )}
        </div>
      </div>

      {showCompleteModal && (
        <div className="mt-4 pt-4 border-t border-green-100 bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-1">✅ Confirm Job Completion</p>
          <p className="text-xs text-green-700 mb-3">Set the final price charged to the customer.</p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              placeholder="Final price (UZS)"
              className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">UZS</span>
          </div>
          {finalPrice !== '' && Number(finalPrice) !== booking.price && (
            <p className="text-xs text-orange-600 mb-3">
              ⚠ Original estimate was {formatUZS(booking.price)}. Final price will be {formatUZS(Number(finalPrice))}.
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleComplete} disabled={completing || finalPrice === ''}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {completing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Confirm & Complete
            </button>
            <button onClick={() => setShowCompleteModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {showReschedule && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-3">{t('bookingCard.rescheduleTitle')}</p>
          <div className="flex gap-2 mb-3">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
          </div>
          <button onClick={handleReschedule} disabled={!newDate || !newTime || rescheduling}
            className="w-full bg-[#1A56DB] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {rescheduling && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {t('bookingCard.rescheduleSubmit')}
          </button>
        </div>
      )}

      {showCancelConfirm && (
        <div className="mt-4 pt-4 border-t border-red-100 bg-red-50 rounded-xl p-4">
          <p className="text-sm font-medium text-red-800 mb-3">
            {t('bookingCard.cancelConfirm')}
          </p>
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={cancelling}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {cancelling && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {t('bookingCard.confirmYes')}
            </button>
            <button onClick={() => setShowCancelConfirm(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
              {t('bookingCard.confirmNo')}
            </button>
          </div>
        </div>
      )}

      {showReview && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="text-2xl transition-transform hover:scale-110">
                {star <= (hoverRating || rating) ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('bookingCard.reviewPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none mb-3"
          />
          <button onClick={handleReviewSubmit} disabled={!rating || reviewLoading}
            className="w-full bg-[#1A56DB] text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {reviewLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {t('bookingCard.submitReview')}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
