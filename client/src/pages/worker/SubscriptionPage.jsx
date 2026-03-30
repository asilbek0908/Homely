import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const SubscriptionPage = () => {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const plans = [
    {
      id: 'free',
      name: t('subscription.free'),
      price: t('subscription.free'),
      priceSub: t('subscription.forever'),
      color: 'border-gray-200',
      headerBg: 'bg-gray-50',
      badge: null,
      features: [
        'Up to 3 job requests per month',
        'Basic profile listing',
        'Telegram notifications',
        'Standard search placement',
      ],
      button: { label: t('subscription.currentPlan'), disabled: true, style: 'bg-gray-100 text-gray-400 cursor-not-allowed' },
    },
    {
      id: 'pro',
      name: t('subscription.pro'),
      price: '99,000 UZS',
      priceSub: t('subscription.perMonth'),
      color: 'border-[#1A56DB]',
      headerBg: 'bg-blue-50',
      badge: t('subscription.mostPopular'),
      badgeColor: 'bg-[#1A56DB] text-white',
      features: [
        'Unlimited job requests',
        'Featured in search results',
        'Priority in AI recommendations',
        'Portfolio up to 10 photos',
        'Highlighted profile card',
      ],
      button: { label: t('subscription.upgradePro'), disabled: false, style: 'bg-[#1A56DB] text-white hover:bg-blue-700' },
    },
    {
      id: 'premium',
      name: t('subscription.premium'),
      price: '199,000 UZS',
      priceSub: t('subscription.perMonth'),
      color: 'border-[#F97316]',
      headerBg: 'bg-orange-50',
      badge: null,
      features: [
        'Everything in Pro',
        'Top of search results always',
        'Dedicated support',
        'Advanced analytics dashboard',
      ],
      button: { label: t('subscription.upgradePremium'), disabled: false, style: 'bg-[#F97316] text-white hover:bg-orange-600' },
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/worker/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          ← {t('common.back')}
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('subscription.title')}</h1>
          <p className="text-gray-500">{t('subscription.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 ${plan.color} shadow-md overflow-hidden flex flex-col relative`}>
              {plan.badge && (
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}

              <div className={`${plan.headerBg} px-6 py-6`}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.priceSub}</span>
                </div>
              </div>

              <div className="px-6 py-5 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-6 pb-6">
                <button
                  disabled={plan.button.disabled}
                  onClick={() => !plan.button.disabled && setShowModal(true)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${plan.button.style}`}
                >
                  {plan.button.label}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('subscription.comingSoonTitle')}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{t('subscription.comingSoonMsg')}</p>
            <button onClick={() => setShowModal(false)}
              className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
              {t('subscription.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
