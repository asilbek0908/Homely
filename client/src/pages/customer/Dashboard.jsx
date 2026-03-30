import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCustomerBookings } from '../../services/booking.service';
import { uploadAvatar } from '../../services/upload.service';
import { updateProfile, getSavedWorkers } from '../../services/auth.service';
import { getAIMatches } from '../../services/ai.service';
import BookingCard from '../../components/BookingCard';
import WorkerCard from '../../components/WorkerCard';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const CustomerDashboard = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', district: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [savedWorkers, setSavedWorkers] = useState([]);
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [bookData, savedData] = await Promise.all([
        getCustomerBookings(),
        getSavedWorkers().catch(() => ({ savedWorkers: [] })),
      ]);
      setBookings(bookData.bookings || []);
      setSavedWorkers(savedData.savedWorkers || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    if (!user) return;
    const service = 'Plumbing';
    const district = user.location?.district || '';
    setAiLoading(true);
    getAIMatches(service, district)
      .then((data) => setAiMatches(data.matches || []))
      .catch(() => setAiMatches([]))
      .finally(() => setAiLoading(false));
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        district: user.location?.district || '',
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const data = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        location: { district: profileForm.district, city: 'Tashkent' },
      });
      updateUser({ name: data.user.name, phone: data.user.phone, location: data.user.location });
      setProfileMsg('success');
    } catch {
      setProfileMsg('error');
    } finally {
      setProfileSaving(false);
    }
  };

  const stats = {
    active: bookings.filter((b) => ['pending', 'confirmed', 'inProgress'].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    spent: bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.price, 0),
  };

  const STAT_CARDS = [
    { label: t('customerDash.activeBookings'), value: stats.active, color: 'text-[#1A56DB]', bg: 'bg-blue-50', icon: '📋' },
    { label: t('customerDash.completedJobs'), value: stats.completed, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
    { label: t('customerDash.totalSpent'), value: formatUZS(stats.spent), color: 'text-[#F97316]', bg: 'bg-orange-50', icon: '💰' },
    { label: t('customerDash.savedWorkers'), value: savedWorkers.length, color: 'text-purple-600', bg: 'bg-purple-50', icon: '❤️' },
  ];

  const activeBookings = bookings.filter((b) => ['pending', 'confirmed', 'inProgress'].includes(b.status));

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
            { id: 'bookings', label: t('customerDash.myBookings'), icon: '📋' },
            { id: 'saved', label: t('customerDash.savedTab'), icon: '❤️' },
            { id: 'profile', label: t('customerDash.profile'), icon: '👤' },
            { id: 'workers', label: t('customerDash.findWorkers'), icon: '🔍', href: '/workers' },
          ].map((item) => (
            item.href
              ? <Link key={item.id} to={item.href} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-50">{item.icon} {item.label}</Link>
              : <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg ${activeTab === item.id ? 'bg-blue-50 text-[#1A56DB] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                {item.icon} {item.label}
              </button>
          ))}
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

      <main className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <button onClick={() => avatarInputRef.current?.click()} className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#1A56DB] transition-colors">
              {user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="" className="w-full h-full object-cover" />
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
            <h1 className="text-2xl font-bold text-gray-900">{t('customerDash.welcome', { name: user?.name?.split(' ')[0] })} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{t('customerDash.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {activeTab === 'saved' ? (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('customerDash.savedTab')}</h2>
            {savedWorkers.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🤍</div>
                <p>{t('customerDash.noSaved')} <Link to="/workers" className="text-[#1A56DB] hover:underline">{t('customerDash.findWorker')}</Link></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedWorkers.map((w) => (
                  <WorkerCard key={w._id} worker={w}
                    savedIds={savedWorkers.map((s) => s._id)}
                    onSaveToggle={fetchData} />
                ))}
              </div>
            )}
          </section>
        ) : activeTab === 'profile' ? (
          <section className="max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('customerDash.editProfile')}</h2>
            <form onSubmit={handleProfileSave} className="bg-white rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerDash.email')}</label>
                <input value={user?.email || ''} disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">{t('customerDash.emailNote')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerDash.name')}</label>
                <input value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerDash.phone')}</label>
                <input value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerDash.district')}</label>
                <select value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                  <option value="">{t('common.selectDistrict')}</option>
                  {['Chilonzor','Yunusabad','Mirzo Ulugbek','Shaykhontohur','Uchtepa','Bektemir','Sergeli','Yashnobod'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {profileMsg === 'success' && <p className="text-green-600 text-sm">{t('customerDash.profileSaved')}</p>}
              {profileMsg === 'error' && <p className="text-red-600 text-sm">{t('customerDash.profileError')}</p>}
              <button type="submit" disabled={profileSaving}
                className="w-full bg-[#1A56DB] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {profileSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {t('customerDash.saveChanges')}
              </button>
            </form>
          </section>
        ) : activeTab === 'bookings' ? (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('customerDash.allBookings')}</h2>
            {loading ? (
              <div className="h-24 bg-white rounded-xl animate-pulse" />
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>{t('customerDash.noBookings')} <Link to="/workers" className="text-[#1A56DB] hover:underline">{t('customerDash.findWorker')}</Link></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {bookings.map((b) => <BookingCard key={b._id} booking={b} role="customer" onStatusUpdate={fetchData} />)}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{t('customerDash.activeBookings')}</h2>
                <button onClick={() => setActiveTab('bookings')} className="text-sm text-[#1A56DB] hover:underline">{t('customerDash.viewAll')}</button>
              </div>
              {loading ? (
                <div className="h-24 bg-white rounded-xl animate-pulse" />
              ) : activeBookings.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p>{t('customerDash.noActive')} <Link to="/workers" className="text-[#1A56DB] hover:underline">{t('customerDash.findWorker')}</Link></p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {activeBookings.slice(0, 4).map((b) => <BookingCard key={b._id} booking={b} role="customer" onStatusUpdate={fetchData} />)}
                </div>
              )}
            </section>

            {/* AI Recommendations */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">🤖 AI Recommendations</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Top workers matched for you by Homely AI</p>
                </div>
                <Link to="/workers" className="text-sm text-[#1A56DB] hover:underline">Browse all</Link>
              </div>

              {aiLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : aiMatches.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">🤖</div>
                  <p className="text-sm">No matches yet. <Link to="/workers" className="text-[#1A56DB] hover:underline">Browse workers</Link></p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {aiMatches.map((w) => (
                    <div key={w._id} className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col gap-3">
                      {/* Match badge + header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={w.user?.avatar?.startsWith('http') ? w.user.avatar : `http://localhost:5000${w.user?.avatar || ''}`}
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(w.user?.name || 'W')}&background=1A56DB&color=fff`; }}
                            alt={w.user?.name} className="w-12 h-12 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{w.user?.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-yellow-400 text-xs">★</span>
                              <span className="text-xs text-gray-600">{w.rating?.toFixed(1)} ({w.totalReviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-[#F97316] text-white px-2 py-1 rounded-full flex-shrink-0">
                          {w.score}% match
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📍 {w.location?.district || 'Tashkent'}</span>
                        <span className="font-semibold text-gray-800">{formatUZS(w.jobRate)}/job</span>
                      </div>

                      {/* Why recommended */}
                      <div className="bg-blue-50 rounded-lg px-3 py-2">
                        <p className="text-xs font-semibold text-[#1A56DB] mb-1">Why recommended</p>
                        <ul className="space-y-0.5">
                          {w.matchReasons?.slice(0, 3).map((r, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-green-500 flex-shrink-0">✓</span> {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <Link to={`/workers/${w._id}`}
                          className="flex-1 text-center text-xs font-medium border border-[#1A56DB] text-[#1A56DB] px-3 py-2 rounded-lg hover:bg-blue-50">
                          View Profile
                        </Link>
                        <Link to={`/workers/${w._id}`}
                          className="flex-1 text-center text-xs font-medium bg-[#F97316] text-white px-3 py-2 rounded-lg hover:bg-orange-600">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 text-center mt-3">⚡ Powered by Homely AI</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
