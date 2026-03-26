import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { resetPassword } from '../services/auth.service';

const ResetPassword = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError(t('register.validation.passwordMin')); return; }
    if (password !== confirmPassword) { setError(t('register.validation.passwordMismatch')); return; }

    setError('');
    setLoading(true);
    try {
      const token = searchParams.get('token');
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t('passwordReset.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-7 h-7 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-xl font-bold text-[#1A56DB]">Homely</span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('passwordReset.doneTitle')}</h1>
            <p className="text-gray-500 mb-6">{t('passwordReset.doneDesc')}</p>
            <Link to="/login" className="inline-block bg-[#1A56DB] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              {t('common.login')}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('passwordReset.resetTitle')}</h1>
            <p className="text-gray-500 text-sm mb-6">{t('passwordReset.resetDesc')}</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.password')}</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  placeholder="••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.confirmPassword')}</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  placeholder="••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? t('common.loading') : t('passwordReset.resetBtn')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
