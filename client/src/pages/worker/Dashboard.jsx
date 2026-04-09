import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getWorkerBookings } from '../../services/booking.service';
import { getWorkerStats, getMyWorkerProfile } from '../../services/worker.service';
import { uploadAvatar, uploadIdDocument, uploadPortfolio, deleteIdDocument, deletePortfolioPhoto } from '../../services/upload.service';
import BookingCard from '../../components/BookingCard';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const WorkerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');
  const [currentDoc, setCurrentDoc] = useState('');
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [docDeleting, setDocDeleting] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const avatarInputRef = useRef(null);
  const docInputRef = useRef(null);
  const portfolioInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const [bookData, statsData, profileData] = await Promise.all([
        getWorkerBookings(),
        getWorkerStats().catch(() => ({ stats: {} })),
        getMyWorkerProfile().catch(() => ({ worker: {} })),
      ]);
      setBookings(bookData.bookings || []);
      setStats(statsData.stats || {});
      setCurrentDoc(profileData.worker?.idDocument || '');
      setPortfolioImages(profileData.worker?.portfolio || []);
      setVerificationStatus(profileData.worker?.verificationStatus || 'pending');
    } catch (err) { console.error('Worker fetch error:', err); } finally { setLoading(false); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    setDocSuccess('');
    try {
      const data = await uploadIdDocument(file);
      setCurrentDoc(data.idDocument);
      setDocSuccess(t('upload.docUploaded'));
    } catch (err) {
      console.error('Document upload failed:', err);
    } finally {
      setDocUploading(false);
      e.target.value = '';
    }
  };

  const handleDocDelete = async () => {
    setDocDeleting(true);
    try {
      await deleteIdDocument();
      setCurrentDoc('');
      setDocSuccess('');
    } catch (err) {
      console.error('Document delete failed:', err);
    } finally {
      setDocDeleting(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPortfolioUploading(true);
    try {
      const data = await uploadPortfolio(files);
      setPortfolioImages(data.portfolio || []);
    } catch (err) {
      console.error('Portfolio upload failed:', err);
    } finally {
      setPortfolioUploading(false);
      e.target.value = '';
    }
  };

  const handlePhotoDelete = async (url) => {
    setDeletingPhoto(url);
    try {
      const data = await deletePortfolioPhoto(url);
      setPortfolioImages(data.portfolio || []);
    } catch (err) {
      console.error('Photo delete failed:', err);
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const data = await uploadAvatar(file);
      updateUser({ avatar: data.avatar });
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const todayBookings = bookings.filter((b) => {
    const d = new Date(b.scheduledDate);
    const today = new Date();
    return d.toDateString() === today.toDateString() && b.status !== 'cancelled';
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayBookings = bookings.filter((b) => {
      const bd = new Date(b.scheduledDate);
      return bd.toDateString() === d.toDateString() && b.status === 'completed';
    });
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: dayBookings.reduce((s, b) => s + (b.finalPrice ?? b.price ?? 0), 0) };
  });
  const maxEarning = Math.max(...last7.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <aside className="w-56 bg-white shadow-sm min-h-screen hidden lg:block">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span className="font-bold text-[#1A56DB]">Homely</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { id: 'dashboard', label: t('common.dashboard'), icon: '🏠' },
            { id: 'jobs', label: t('workerDash.myJobs'), icon: '🔧' },
            { id: 'earnings', label: t('workerDash.earningsTab'), icon: '💰' },
            { id: 'documents', label: t('upload.uploadIdDoc'), icon: '📄' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg ${activeTab === item.id ? 'bg-blue-50 text-[#1A56DB] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              {item.icon} {item.label}
            </button>
          ))}
          <Link to="/worker/setup" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
            👤 {t('workerDash.editProfile')}
          </Link>
          <Link to="/worker/subscription" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50">
            ⭐ {t('subscription.upgradePlan')}
          </Link>
        </nav>

        <div className="mx-3 mt-3">
          <Link to="/telegram-connect"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border ${user?.telegramChatId ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#1A56DB]'}`}>
            <span className="text-base">🔔</span>
            <div className="leading-tight">
              <p className="font-medium text-xs">{t('telegram.sidebarLabel')}</p>
              <p className="text-xs">{user?.telegramChatId ? `${t('telegram.sidebarOn')} ✅` : t('telegram.sidebarOff')}</p>
            </div>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-6 pb-24 lg:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button onClick={() => avatarInputRef.current?.click()} className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#1A56DB] transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#1A56DB] flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                {avatarUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">{t('upload.changeAvatar')}</span>
                </div>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('workerDash.welcome', { name: user?.name?.split(' ')[0] })} 👷</h1>
              <p className="text-gray-500 text-sm mt-1">{t('workerDash.subtitle')}</p>
            </div>
          </div>
          {verificationStatus === 'approved' && (
            <span className="text-xs font-medium bg-green-100 text-green-700 px-3 py-1.5 rounded-full">✓ {t('workerDash.statusApproved')}</span>
          )}
          {verificationStatus === 'pending' && (
            <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full">⏳ {t('workerDash.statusPending')}</span>
          )}
          {verificationStatus === 'rejected' && (
            <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1.5 rounded-full">✕ {t('workerDash.statusRejected')}</span>
          )}
        </div>

        {verificationStatus === 'pending' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-semibold text-yellow-800 text-sm">{t('workerDash.verificationStatus')}: {t('workerDash.statusPending')}</p>
              <p className="text-yellow-700 text-xs mt-0.5">{t('workerDash.pendingNote')}</p>
            </div>
          </div>
        )}
        {verificationStatus === 'rejected' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold text-red-800 text-sm">{t('workerDash.verificationStatus')}: {t('workerDash.statusRejected')}</p>
              <p className="text-red-700 text-xs mt-0.5">{t('workerDash.rejectedNote')}</p>
            </div>
          </div>
        )}

        {activeTab === 'documents' ? (
          <div className="space-y-6">
            {/* ID Document Upload */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('upload.uploadIdDoc')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('upload.idDocHint')}</p>

              {currentDoc ? (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <a href={currentDoc} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#1A56DB] text-sm hover:underline">
                    <span className="text-xl">📄</span>
                    <span>{t('adminDash.viewDoc')}</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <button onClick={() => docInputRef.current?.click()} disabled={docUploading}
                      className="text-xs text-gray-500 hover:text-[#1A56DB] px-3 py-1.5 border border-gray-300 rounded-lg hover:border-[#1A56DB] transition-colors">
                      {t('upload.changeAvatar')}
                    </button>
                    <button onClick={handleDocDelete} disabled={docDeleting}
                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50">
                      {docDeleting
                        ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        : '🗑️'}
                      {t('common.delete') || 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => docInputRef.current?.click()} disabled={docUploading}
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#1A56DB] rounded-xl p-8 text-center transition-colors">
                  {docUploading ? (
                    <div className="flex items-center justify-center gap-2 text-[#1A56DB]">
                      <div className="w-5 h-5 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin" />
                      {t('upload.uploading')}
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📎</div>
                      <p className="text-gray-500 text-sm">{t('upload.dragOrClick')}</p>
                    </div>
                  )}
                </button>
              )}
              <input ref={docInputRef} type="file" accept="image/*,.pdf" onChange={handleDocUpload} className="hidden" />
              {docSuccess && <p className="text-green-600 text-sm mt-3 flex items-center gap-1">✅ {docSuccess}</p>}
            </div>

            {/* Portfolio Upload */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{t('upload.uploadPortfolio')}</h2>
              <p className="text-gray-500 text-sm mb-4">{t('upload.portfolioHint')}</p>
              <button onClick={() => portfolioInputRef.current?.click()} disabled={portfolioUploading}
                className="w-full border-2 border-dashed border-gray-300 hover:border-[#1A56DB] rounded-xl p-8 text-center transition-colors">
                {portfolioUploading ? (
                  <div className="flex items-center justify-center gap-2 text-[#1A56DB]">
                    <div className="w-5 h-5 border-2 border-[#1A56DB] border-t-transparent rounded-full animate-spin" />
                    {t('upload.uploading')}
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-gray-500 text-sm">{t('upload.dragOrClick')}</p>
                  </div>
                )}
              </button>
              <input ref={portfolioInputRef} type="file" accept="image/*" multiple onChange={handlePortfolioUpload} className="hidden" />
              {portfolioImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">{t('upload.photosUploaded', { count: portfolioImages.length })}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {portfolioImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                        <button
                          onClick={() => handlePhotoDelete(url)}
                          disabled={deletingPhoto === url}
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                          {deletingPhoto === url
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <span className="text-white text-lg">🗑️</span>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
        <>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: t('workerDash.active'), value: bookings.filter((b) => ['confirmed','inProgress'].includes(b.status)).length, color: 'text-[#1A56DB]', bg: 'bg-blue-50', icon: '📋' },
            { label: t('workerDash.thisMonth'), value: formatUZS(stats?.totalEarnings || 0), color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
            { label: t('workerDash.totalReviews'), value: stats?.totalReviews || 0, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⭐' },
            { label: t('workerDash.jobsDone'), value: stats?.totalJobs || 0, color: 'text-purple-600', bg: 'bg-purple-50', icon: '✅' },
            {
              label: t('workerProfile.response'),
              value: stats?.avgResponseHours == null ? '—' : stats.avgResponseHours < 1 ? t('workerProfile.lessThan1hr') : `${stats.avgResponseHours}h`,
              color: 'text-orange-600', bg: 'bg-orange-50', icon: '⚡',
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subscription status card */}
        <div className="bg-gradient-to-r from-[#1A56DB] to-blue-700 rounded-xl p-5 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">⭐</div>
            <div>
              <p className="text-white font-semibold">{t('subscription.currentPlanLabel')}: <span className="text-yellow-300">{t('subscription.free')}</span></p>
              <p className="text-blue-100 text-xs mt-0.5">{t('subscription.jobsThisMonth')}: {stats?.completedBookings || 0} {t('subscription.of')} 3</p>
            </div>
          </div>
          <Link to="/worker/subscription"
            className="flex-shrink-0 bg-white text-[#1A56DB] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            {t('subscription.upgradePlan')} →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {t('workerDash.newRequests')}
              {pendingBookings.length > 0 && (
                <span className="ml-2 text-xs bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full">{t('workerDash.newCount', { count: pendingBookings.length })}</span>
              )}
            </h2>
            {loading ? (
              <div className="h-24 bg-white rounded-xl animate-pulse" />
            ) : pendingBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm">{t('workerDash.noPending')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map((b) => <BookingCard key={b._id} booking={b} role="worker" onStatusUpdate={fetchData} />)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('workerDash.earnings7')}</h2>
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-end gap-2 h-44">
                {last7.map((d) => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                    {d.value > 0 && (
                      <span className="text-xs font-medium text-[#1A56DB] whitespace-nowrap" style={{ fontSize: '10px' }}>
                        {new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(d.value)}
                      </span>
                    )}
                    <div className="w-full rounded-t-lg bg-[#1A56DB] opacity-80 hover:opacity-100 transition-all"
                      style={{ height: `${(d.value / maxEarning) * 100}%`, minHeight: '4px' }} title={formatUZS(d.value)} />
                    <span className="text-xs text-gray-500">{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Last 7 days</span>
                <span className="font-semibold text-gray-900">{formatUZS(last7.reduce((s, d) => s + d.value, 0))} total</span>
              </div>
            </div>
          </section>
        </div>

        {/* Active (confirmed + inProgress) bookings — always visible on overview */}
        {(() => {
          const activeBookings = bookings.filter((b) => ['confirmed', 'inProgress'].includes(b.status));
          if (activeBookings.length === 0) return null;
          return (
            <section className="mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🔧 Active Jobs
                <span className="text-xs bg-blue-100 text-[#1A56DB] px-2 py-0.5 rounded-full">{activeBookings.length}</span>
              </h2>
              <div className="space-y-3">
                {activeBookings.map((b) => <BookingCard key={b._id} booking={b} role="worker" onStatusUpdate={fetchData} />)}
              </div>
            </section>
          );
        })()}

        {todayBookings.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('workerDash.todaySchedule')}</h2>
            <div className="space-y-3">
              {todayBookings.map((b) => <BookingCard key={b._id} booking={b} role="worker" onStatusUpdate={fetchData} />)}
            </div>
          </section>
        )}
        </>
        )}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-2 py-2 shadow-lg">
        {[
          { id: 'dashboard', icon: '🏠', label: t('common.dashboard') },
          { id: 'jobs', icon: '🔧', label: t('workerDash.myJobs') },
          { id: 'earnings', icon: '💰', label: t('workerDash.earningsTab') },
          { id: 'documents', icon: '📄', label: 'Docs' },
        ].map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${activeTab === item.id ? 'text-[#1A56DB]' : 'text-gray-400'}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <Link to="/worker/setup" className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-gray-400">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-medium">{t('workerDash.editProfile')}</span>
        </Link>
      </nav>

      {/* Bottom padding on mobile so content isn't hidden behind nav */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default WorkerDashboard;
