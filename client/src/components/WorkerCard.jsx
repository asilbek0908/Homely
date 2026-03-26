import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const formatUZS = (amount) =>
  new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const WorkerCard = ({ worker }) => {
  const { t } = useLanguage();
  const user = worker.user || {};
  const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'W')}&background=1A56DB&color=fff`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:scale-[1.02] transition-transform duration-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <img src={avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{user.name || t('common.worker')}</h3>
            {worker.isVerified && (
              <svg className="w-4 h-4 text-[#1A56DB] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          {worker.services?.[0] && (
            <span className="text-xs font-medium bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full">
              {t(`services.${worker.services[0]}`)}
            </span>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <StarRating rating={worker.rating} />
        <span className="text-sm text-gray-600">{worker.rating?.toFixed(1)} ({worker.totalReviews} {t('common.reviews')})</span>
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {worker.location?.district || 'Tashkent'}
        </div>
        <span className="font-semibold text-gray-900">{formatUZS(worker.jobRate)}{t('common.perJob')}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-1">
        <Link to={`/workers/${worker._id}`}
          className="flex-1 text-center text-sm font-medium border border-[#1A56DB] text-[#1A56DB] px-3 py-2 rounded-lg hover:bg-blue-50">
          {t('common.viewProfile')}
        </Link>
        <Link to={`/workers/${worker._id}`}
          className="flex-1 text-center text-sm font-medium bg-[#F97316] text-white px-3 py-2 rounded-lg hover:bg-orange-600">
          {t('common.bookNow')}
        </Link>
      </div>
    </div>
  );
};

export default WorkerCard;
