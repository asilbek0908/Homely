import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-[#1A56DB] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h2>
        <p className="text-gray-500 mb-8 max-w-md">{t('notFound.description')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/"
            className="bg-[#1A56DB] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            {t('notFound.goHome')}
          </Link>
          <Link to="/workers"
            className="border-2 border-[#1A56DB] text-[#1A56DB] px-6 py-3 rounded-xl font-semibold hover:bg-[#1A56DB] hover:text-white transition-colors">
            {t('notFound.findWorker')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
