import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkerCard from '../components/WorkerCard';
import { useLanguage } from '../context/LanguageContext';

const SERVICES_KEYS = ['Plumbing', 'Electrical', 'AC Repair'];
const SERVICE_ICONS = { Plumbing: '🔧', Electrical: '⚡', 'AC Repair': '❄️' };

const DISTRICTS = ['Chilonzor', 'Yunusabad', 'Mirzo Ulugbek', 'Shaykhontohur', 'Uchtepa', 'Bektemir', 'Sergeli', 'Yashnobod'];

const MOCK_WORKERS = [
  { _id: '1', user: { name: 'Kamol Nazarov' }, services: ['Plumbing'], rating: 4.8, totalReviews: 47, jobRate: 50000, location: { district: 'Chilonzor' }, isVerified: true },
  { _id: '2', user: { name: 'Sarvar Rakhimov' }, services: ['Electrical'], rating: 4.9, totalReviews: 63, jobRate: 60000, location: { district: 'Yunusabad' }, isVerified: true },
  { _id: '3', user: { name: 'Mansur Umarov' }, services: ['AC Repair'], rating: 4.7, totalReviews: 38, jobRate: 40000, location: { district: 'Mirzo Ulugbek' }, isVerified: true },
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [service, setService] = useState('');
  const [district, setDistrict] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (district) params.set('district', district);
    navigate(`/workers?${params.toString()}`);
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1A56DB 0%, #1e40af 100%)' }} className="text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight whitespace-pre-line">
            {t('landing.heroTitle')}
          </h1>
          <p className="text-blue-200 text-lg mb-8">
            {t('landing.heroSubtitle')}
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto shadow-xl">
            <select value={service} onChange={(e) => setService(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-700 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
              <option value="">{t('common.selectService')}</option>
              {SERVICES_KEYS.map((s) => <option key={s} value={s}>{SERVICE_ICONS[s]} {t(`services.${s}`)}</option>)}
            </select>
            <select value={district} onChange={(e) => setDistrict(e.target.value)}
              className="flex-1 px-4 py-3 text-gray-700 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
              <option value="">{t('common.selectDistrict')}</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <button onClick={handleSearch}
              className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 whitespace-nowrap">
              {t('common.search')}
            </button>
          </div>

          {/* Quick categories */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SERVICES_KEYS.map((s) => (
              <button key={s} onClick={() => navigate(`/workers?service=${s}`)}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm transition-all">
                {SERVICE_ICONS[s]} {t(`services.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE HOMELY */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t('landing.whyTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {t('landing.whyCards').map((item) => (
              <div key={item.title} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#1A56DB] mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('landing.howTitle')}</h2>
        <p className="text-gray-500 mb-10">{t('landing.howSubtitle')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t('landing.howSteps').map((item) => (
            <div key={item.step} className="bg-white rounded-xl shadow-md p-6">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-[#1A56DB] font-bold text-sm mb-2">Step {item.step}</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">{t('landing.servicesTitle')}</h2>
          <p className="text-gray-500 text-center mb-10">{t('landing.servicesSubtitle')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES_KEYS.map((s) => (
              <button key={s} onClick={() => navigate(`/workers?service=${s}`)}
                className="bg-white rounded-xl p-5 text-center hover:border-2 hover:border-[#1A56DB] shadow-sm hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{SERVICE_ICONS[s]}</div>
                <p className="font-semibold text-gray-900 text-sm">{t(`services.${s}`)}</p>
                <p className="text-gray-400 text-xs mt-1">{t('landing.workersPlus')}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED WORKERS */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">{t('landing.featuredTitle')}</h2>
        <p className="text-gray-500 text-center mb-10">{t('landing.featuredSubtitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MOCK_WORKERS.map((w) => <WorkerCard key={w._id} worker={w} />)}
        </div>
        <div className="text-center mt-8">
          <button onClick={() => navigate('/workers')}
            className="border-2 border-[#1A56DB] text-[#1A56DB] px-8 py-3 rounded-xl font-semibold hover:bg-[#1A56DB] hover:text-white transition-all">
            {t('landing.viewAll')}
          </button>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#1A56DB' }} className="py-16 px-4 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">{t('landing.ctaTitle')}</h2>
        <p className="text-blue-200 mb-8">{t('landing.ctaSubtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/workers')}
            className="bg-white text-[#1A56DB] font-semibold px-8 py-3 rounded-xl hover:bg-gray-100">
            {t('landing.findWorker')}
          </button>
          <button onClick={() => navigate('/register')}
            className="bg-[#F97316] text-white font-semibold px-8 py-3 rounded-xl hover:bg-orange-600">
            {t('landing.becomeWorker')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
