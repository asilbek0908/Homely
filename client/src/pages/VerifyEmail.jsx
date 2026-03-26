import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { verifyEmail } from '../services/auth.service';

const VerifyEmail = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        return;
      }
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[#1A56DB] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">{t('common.loading')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('emailVerify.successTitle')}</h1>
            <p className="text-gray-500 mb-6">{t('emailVerify.successDesc')}</p>
            <Link to="/login" className="inline-block bg-[#1A56DB] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              {t('common.login')}
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('emailVerify.errorTitle')}</h1>
            <p className="text-gray-500 mb-6">{t('emailVerify.errorDesc')}</p>
            <Link to="/login" className="inline-block bg-[#1A56DB] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              {t('common.login')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
