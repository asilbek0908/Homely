import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { connectTelegram, disconnectTelegram } from '../services/telegram.service';

const TelegramConnect = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [chatId, setChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const isConnected = !!user?.telegramChatId;

  const handleConnect = async () => {
    if (!chatId.trim()) {
      setIsError(true);
      setMessage(t('telegram.enterChatId'));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      await connectTelegram(chatId.trim());
      window.location.reload();
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setMessage('');
    try {
      await disconnectTelegram();
      window.location.reload();
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to disconnect.');
    } finally {
      setLoading(false);
    }
  };

  const icons = ['🔔', '✅', '❌', '🎉'];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
        <div style={{ background: 'linear-gradient(135deg, #229ED9 0%, #1A56DB 100%)' }} className="px-8 py-7 text-white">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold">{t('telegram.title')}</h1>
              <p className="text-blue-100 text-sm">{t('telegram.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-6 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div>
              <p className={`text-sm font-semibold ${isConnected ? 'text-green-700' : 'text-gray-600'}`}>
                {isConnected ? `${t('telegram.connected')} ✅` : `${t('telegram.notConnected')} ❌`}
              </p>
              {isConnected && <p className="text-xs text-green-600 mt-0.5">Chat ID: {user.telegramChatId}</p>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">{t('telegram.howToConnect')}</h3>
            <ol className="space-y-3">
              {t('telegram.steps').map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          {message && (
            <div className={`text-sm rounded-lg px-4 py-3 mb-4 ${isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
              {message}
            </div>
          )}

          {!isConnected ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('telegram.chatIdLabel')}</label>
                <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  placeholder={t('telegram.chatIdPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent font-mono" />
              </div>
              <button onClick={handleConnect} disabled={loading}
                className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? t('telegram.connecting') : `🔗 ${t('telegram.connectBtn')}`}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
                <p className="font-semibold mb-1">✅ {t('telegram.notificationsActive')}</p>
                <p>{t('telegram.notificationsDesc')}</p>
              </div>
              <button onClick={handleDisconnect} disabled={loading}
                className="w-full bg-red-50 border border-red-300 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
                {loading ? t('telegram.disconnecting') : `🔕 ${t('telegram.disconnectBtn')}`}
              </button>
            </div>
          )}

          <div className="mt-6 border-t pt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('telegram.notifiedAbout')}</p>
            <div className="grid grid-cols-1 gap-2">
              {t('telegram.notifications').map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{icons[i]}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramConnect;
