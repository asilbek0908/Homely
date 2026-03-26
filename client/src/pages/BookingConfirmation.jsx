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

          <a href={`https://wa.me/?text=${encodeURIComponent(t('bookingConfirmation.shareText'))}`}
            target="_blank" rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t('bookingConfirmation.shareWhatsApp')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
