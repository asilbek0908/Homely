import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { forgotPassword } from '../services/auth.service';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
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

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('passwordReset.checkEmail')}</h1>
            <p className="text-gray-500 mb-6">{t('passwordReset.checkEmailDesc')}</p>
            <Link to="/login" className="text-[#1A56DB] hover:underline text-sm">{t('passwordReset.backToLogin')}</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('passwordReset.forgotTitle')}</h1>
            <p className="text-gray-500 text-sm mb-6">{t('passwordReset.forgotDesc')}</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
                  placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? t('common.loading') : t('passwordReset.sendLink')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-[#1A56DB] hover:underline">{t('passwordReset.backToLogin')}</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
