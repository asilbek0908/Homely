import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getWorkerById } from "../services/worker.service";
import { createBooking } from "../services/booking.service";
import { getWorkerReviews, createReview } from "../services/review.service";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const formatUZS = (n) => new Intl.NumberFormat("uz-UZ").format(n) + " UZS";
const TIMES = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const WorkerProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const [booking, setBooking] = useState({ service: "", date: "", time: "", address: "", district: "", description: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewBookingId, setReviewBookingId] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = async (workerId) => {
    try {
      const data = await getWorkerReviews(workerId);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getWorkerById(id);
        setWorker(data.worker);
        if (data.worker.services?.[0]) setBooking((b) => ({ ...b, service: data.worker.services[0] }));
        fetchReviews(data.worker._id);
      } catch (err) {
        console.error('Failed to load worker:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleReviewSubmit = async () => {
    if (!reviewRating) { setReviewError(t('workerProfile.ratingRequired')); return; }
    setReviewError("");
    setReviewLoading(true);
    try {
      await createReview({ bookingId: reviewBookingId, rating: reviewRating, comment: reviewComment });
      setReviewSuccess(true);
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment("");
      fetchReviews(worker._id);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!booking.service || !booking.date || !booking.time || !booking.address) {
      setBookingError(t('workerProfile.fillAllFields'));
      return;
    }
    setBookingError("");
    setBookingLoading(true);
    try {
      await createBooking({
        worker: worker._id, service: booking.service, description: booking.description,
        scheduledDate: booking.date, scheduledTime: booking.time, address: booking.address,
        district: booking.district || worker.location?.district || "Tashkent", price: worker.jobRate,
      });
      setBookingSuccess(true);
      setTimeout(() => navigate("/booking/confirm"), 1500);
    } catch (err) {
      setBookingError(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1A56DB] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!worker) return <div className="text-center py-20 text-gray-500">{t('workerProfile.notFound')}</div>;

  const workerUser = worker.user || {};
  const avatar = workerUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerUser.name || "W")}&background=1A56DB&color=fff&size=200`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div style={{ background: "linear-gradient(135deg, #1A56DB 0%, #1e40af 100%)" }} className="rounded-2xl h-40 mb-0 relative" />

      <div className="flex flex-col lg:flex-row gap-8 -mt-10">
        {/* LEFT: Profile */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-end gap-4 mb-4">
              <img src={avatar} alt={workerUser.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg -mt-12" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{workerUser.name}</h1>
                  {worker.isVerified && (
                    <span className="text-xs font-medium bg-blue-100 text-[#1A56DB] px-2 py-0.5 rounded-full flex items-center gap-1">
                      ✓ {t('common.verified')}
                    </span>
                  )}
                </div>
                <p className="text-[#F97316] font-medium">{worker.services?.map((s) => t(`services.${s}`)).join(", ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={worker.rating} />
              <span className="text-gray-600 text-sm">{worker.rating?.toFixed(1)} ({worker.totalReviews} {t('common.reviews')})</span>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 mb-4">
              {[
                { label: t('workerProfile.jobsDone'), value: worker.totalJobs },
                { label: t('workerProfile.yearsExp'), value: `${worker.experience}+` },
                { label: t('workerProfile.response'), value: t('workerProfile.lessThan1hr') },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold text-[#1A56DB]">{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {worker.bio && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t('workerProfile.about')}</h3>
                <p className="text-gray-600 text-sm">{worker.bio}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('workerProfile.servicesPricing')}</h3>
              <div className="flex flex-wrap gap-2">
                {worker.services?.map((s) => (
                  <div key={s} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-800">{t(`services.${s}`)}</span>
                    <span className="text-sm font-semibold text-[#1A56DB] ml-4">{formatUZS(worker.jobRate)}{t('common.perJob')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t('workerProfile.reviewsTitle')}</h3>
              {user?.role === 'customer' && !showReviewForm && !reviewSuccess && (
                <button onClick={() => setShowReviewForm(true)}
                  className="text-sm text-[#1A56DB] hover:underline">{t('workerProfile.writeReview')}</button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('workerProfile.yourRating')}</p>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <svg className={`w-7 h-7 ${s <= reviewRating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition-colors`}
                        fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <input type="text" value={reviewBookingId} placeholder="Booking ID"
                  onChange={(e) => setReviewBookingId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                <textarea value={reviewComment} rows={3} placeholder={t('workerProfile.reviewPlaceholder')}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none" />
                {reviewError && <p className="text-red-500 text-xs mb-2">{reviewError}</p>}
                <div className="flex gap-2">
                  <button onClick={handleReviewSubmit} disabled={reviewLoading}
                    className="bg-[#1A56DB] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {reviewLoading ? t('workerProfile.submittingReview') : t('workerProfile.submitReview')}
                  </button>
                  <button onClick={() => { setShowReviewForm(false); setReviewError(""); }}
                    className="text-sm text-gray-500 hover:text-gray-700">{t('common.cancel')}</button>
                </div>
              </div>
            )}

            {reviewSuccess && (
              <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4">✅ {t('workerProfile.reviewSuccess')}</div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t('workerProfile.noReviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold">
                          {r.customer?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{r.customer?.name || 'Customer'}</span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1 ml-10">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-4 h-4 ${s <= r.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 ml-10">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Booking Widget */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">{t('workerProfile.requestBooking')}</h3>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold text-green-600">{t('workerProfile.bookingConfirmed')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('workerProfile.redirecting')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('workerProfile.serviceLabel')}</label>
                  <select value={booking.service} onChange={(e) => setBooking({ ...booking, service: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                    {worker.services?.map((s) => <option key={s} value={s}>{t(`services.${s}`)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('workerProfile.dateLabel')}</label>
                  <input type="date" value={booking.date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('workerProfile.timeLabel')}</label>
                  <div className="grid grid-cols-5 gap-1">
                    {TIMES.map((time) => (
                      <button key={time} onClick={() => setBooking({ ...booking, time })}
                        className={`text-xs py-1.5 rounded-lg border ${booking.time === time ? "bg-[#1A56DB] text-white border-[#1A56DB]" : "border-gray-300 text-gray-600 hover:border-[#1A56DB]"}`}>
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('workerProfile.addressLabel')}</label>
                  <input type="text" value={booking.address} placeholder={t('workerProfile.addressPlaceholder')}
                    onChange={(e) => setBooking({ ...booking, address: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{t('workerProfile.descriptionLabel')}</label>
                  <textarea value={booking.description} rows={3} placeholder={t('workerProfile.descriptionPlaceholder')}
                    onChange={(e) => setBooking({ ...booking, description: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none" />
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">{t('workerProfile.estimatedPrice')}</p>
                  <p className="font-bold text-[#1A56DB] text-lg">
                    {formatUZS(worker.jobRate)}
                    <span className="text-sm font-normal text-gray-500"> {t('workerProfile.perJob')}</span>
                  </p>
                </div>

                {bookingError && <p className="text-red-500 text-xs">{bookingError}</p>}

                <button onClick={handleBook} disabled={bookingLoading}
                  className="w-full bg-[#F97316] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
                  {bookingLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {bookingLoading ? t('workerProfile.booking') : t('workerProfile.requestBookingBtn')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
