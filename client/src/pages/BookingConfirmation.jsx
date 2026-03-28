import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('bookingConfirmation.title')}</h1>
        <p className="text-gray-500 text-sm mb-6">{t('bookingConfirmation.subtitle')}</p>

        <div className="bg-gray-50 rounded-xl p-5 text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">{t('bookingConfirmation.whatNext')}</h3>
          <div className="space-y-2">
            {t('bookingConfirmation.steps').map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={() => navigate('/customer/dashboard')}
            className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
            {t('bookingConfirmation.trackBooking')}
          </button>

          <button onClick={() => navigate('/customer/dashboard')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50">
            {t('bookingConfirmation.backToDashboard')}
          </button>

        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
