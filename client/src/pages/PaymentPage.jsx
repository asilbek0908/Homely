import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/booking.service';
import { useLanguage } from '../context/LanguageContext';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const PaymentPage = () => {
  const { t } = useLanguage();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state?.bookingData || !state?.worker) {
    navigate('/workers');
    return null;
  }

  const { bookingData, worker } = state;
  const workerUser = worker.user || {};
  const avatar = workerUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerUser.name || 'W')}&background=1A56DB&color=fff&size=200`;

  const handleConfirm = async () => {
    setError('');
    setLoading(true);
    try {
      await createBooking({
        ...bookingData,
        paymentMethod: 'cash',
        paymentStatus: 'unpaid',
        commission: 0,
      });
      navigate('/booking/confirm');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      id: 'cash',
      name: t('payment.cash'),
      desc: t('payment.cashDesc'),
      tag: t('payment.mostPopular'),
      tagColor: 'bg-green-100 text-green-700',
      disabled: false,
      logo: '💵',
    },
    {
      id: 'click',
      name: 'Click.uz',
      desc: 'Instant online payment',
      tag: t('payment.comingSoon'),
      tagColor: 'bg-orange-100 text-[#F97316]',
      disabled: true,
      logo: '🔵',
    },
    {
      id: 'payme',
      name: 'Payme',
      desc: 'Pay via Payme wallet',
      tag: t('payment.comingSoon'),
      tagColor: 'bg-orange-100 text-[#F97316]',
      disabled: true,
      logo: '🟢',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          ← {t('common.back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('payment.title')}</h1>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Booking Summary */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t('payment.summary')}</h2>

              {/* Worker info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-4">
                <img src={avatar} alt={workerUser.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{workerUser.name}</p>
                    {worker.isVerified && (
                      <span className="text-xs bg-blue-100 text-[#1A56DB] px-2 py-0.5 rounded-full">✓ {t('common.verified')}</span>
                    )}
                  </div>
                  <p className="text-sm text-[#F97316]">{worker.services?.join(', ')}</p>
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-2.5 text-sm">
                {[
                  { label: 'Service', value: bookingData.service },
                  { label: 'Date', value: new Date(bookingData.scheduledDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Time', value: bookingData.scheduledTime },
                  { label: 'Address', value: bookingData.address },
                  { label: 'District', value: bookingData.district },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('payment.serviceFee')}</span>
                  <span className="font-medium text-gray-900">{formatUZS(bookingData.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('payment.platformFee')}</span>
                  <span className="font-medium text-green-600">{t('payment.freeLaunch')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">{t('payment.total')}</span>
                  <span className="font-bold text-[#1A56DB] text-lg">{formatUZS(bookingData.price)}</span>
                </div>
              </div>
            </div>

            {/* Security badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔒', label: t('payment.secureBooking') },
                { icon: '✅', label: t('payment.payAfter') },
                { icon: '💯', label: t('payment.moneyBack') },
              ].map((b) => (
                <div key={b.label} className="bg-white rounded-xl shadow-sm p-3 text-center">
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <p className="text-xs text-gray-600 font-medium leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Payment Methods */}
          <div className="lg:w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-900 mb-4">{t('payment.paymentMethod')}</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    disabled={method.disabled}
                    onClick={() => !method.disabled && setSelectedMethod(method.id)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                      method.disabled
                        ? 'opacity-60 cursor-not-allowed border-gray-100 bg-gray-50'
                        : selectedMethod === method.id
                        ? 'border-[#1A56DB] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          !method.disabled && selectedMethod === method.id ? 'border-[#1A56DB]' : 'border-gray-300'
                        }`}>
                          {!method.disabled && selectedMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#1A56DB]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{method.logo}</span>
                            <span className="font-semibold text-gray-900 text-sm">{method.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${method.tagColor}`}>
                        {method.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={handleConfirm}
              disabled={selectedMethod !== 'cash' || loading}
              className="w-full bg-[#F97316] text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? t('payment.confirming') : t('payment.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
