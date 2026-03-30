import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { unreadCount, notifications, markAllRead, clearAll, dismissOne } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleHowItWorks = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-notif]')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'worker' ? '/worker/dashboard'
    : '/customer/dashboard';

  const langFlags = { en: '🇬🇧', ru: '🇷🇺', uz: '🇺🇿' };

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xl font-bold text-[#1A56DB]">Homely</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#how-it-works" onClick={handleHowItWorks} className="hover:text-[#1A56DB] cursor-pointer">{t('nav.howItWorks')}</a>
            <Link to="/workers" className="hover:text-[#1A56DB]">{t('nav.services')}</Link>
            <Link to="/register" className="hover:text-[#1A56DB]">{t('nav.becomeWorker')}</Link>
          </div>

          {/* Right side: lang switcher + auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1A56DB] px-2 py-1.5 rounded-lg hover:bg-gray-50">
                <span>{langFlags[lang]}</span>
                <span className="text-xs font-medium">{lang.toUpperCase()}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {['en', 'ru', 'uz'].map((l) => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${lang === l ? 'text-[#1A56DB] font-medium' : 'text-gray-700'}`}>
                      <span>{langFlags[l]}</span> {t(`languages.${l}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification bell */}
            {user && (
              <div className="relative" data-notif>
                <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }}
                  className="relative p-2 text-gray-500 hover:text-[#1A56DB] rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 flex flex-col max-h-96">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-900">🔔 Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500">Clear all</button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">No notifications</p>
                      ) : (
                        notifications.slice(0, 20).map((n) => (
                          <div key={n.id} className={`flex items-start gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${n.read ? '' : 'bg-blue-50/40'}`}>
                            <span className="text-lg mt-0.5 flex-shrink-0">
                              {n.type === 'new_booking' ? '📋' : n.type === 'booking_rescheduled' ? '🗓' : '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800">
                                {n.type === 'new_booking' && `New booking: ${n.booking?.service}`}
                                {n.type === 'booking_update' && `Booking ${n.status}: ${n.booking?.service}`}
                                {n.type === 'booking_rescheduled' && `Booking rescheduled: ${n.booking?.service}`}
                              </p>
                              {n.timestamp && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {' · '}
                                  {new Date(n.timestamp).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button onClick={() => dismissOne(n.id)} className="text-gray-300 hover:text-gray-500 text-xs flex-shrink-0">✕</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#1A56DB] px-4 py-2">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="text-sm font-medium bg-[#F97316] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  {t('common.signUp')}
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1A56DB]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link to={dashboardPath} onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {t('common.dashboard')}
                    </Link>
                    <button onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-2">
          {/* Mobile language switcher */}
          <div className="flex gap-1 py-2 border-b border-gray-100 mb-1">
            {['en', 'ru', 'uz'].map((l) => (
              <button key={l} onClick={() => { setLang(l); }}
                className={`flex-1 text-center text-xs py-1.5 rounded-lg ${lang === l ? 'bg-[#1A56DB] text-white' : 'bg-gray-100 text-gray-600'}`}>
                {langFlags[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/workers" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.services')}</Link>
          <Link to="/register" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('nav.becomeWorker')}</Link>
          {!user ? (
            <>
              <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('common.login')}</Link>
              <Link to="/register" className="block py-2 bg-[#F97316] text-white text-center rounded-lg" onClick={() => setMenuOpen(false)}>{t('common.signUp')}</Link>
            </>
          ) : (
            <>
              <Link to={dashboardPath} className="block py-2 text-gray-700" onClick={() => setMenuOpen(false)}>{t('common.dashboard')}</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">{t('common.logout')}</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
