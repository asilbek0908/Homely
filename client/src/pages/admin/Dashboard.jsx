import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const formatUZS = (n) => new Intl.NumberFormat('uz-UZ').format(n) + ' UZS';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchData = async () => {
    try {
      const [statsRes, vRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/verifications'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data.stats);
      setVerifications(vRes.data.workers || []);
      setUsers(usersRes.data.users || []);
    } catch (err) { console.error('Admin fetch error:', err); } finally { setLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setConfirmDeleteId(null);
    } catch (err) { alert(err.response?.data?.message || 'Error deleting user'); }
    finally { setDeletingId(null); }
  };

  const handleRoleChange = async (id, role) => {
    try {
      const res = await api.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, role: res.data.user.role } : u));
    } catch (err) { alert(err.response?.data?.message || 'Error updating role'); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (id, action) => {
    try {
      await api.put(`/admin/workers/${id}/${action}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const statusColor = { pending: 'text-yellow-600 bg-yellow-50', confirmed: 'text-blue-600 bg-blue-50', completed: 'text-green-600 bg-green-50', cancelled: 'text-red-600 bg-red-50' };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <aside className="w-56 bg-white shadow-sm min-h-screen hidden lg:block">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
            <span className="font-bold text-[#1A56DB]">Homely Admin</span>
          </Link>
        </div>
        <nav className="p-3 space-y-1">
          {[
            { id: 'dashboard', label: t('common.dashboard'), icon: '📊' },
            { id: 'analytics', label: t('adminDash.analytics'), icon: '📈' },
            { id: 'verifications', label: t('adminDash.verifications'), icon: '✅' },
            { id: 'bookings', label: t('adminDash.bookings'), icon: '📋' },
            { id: 'users', label: 'User Management', icon: '👥' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg ${activeTab === item.id ? 'bg-blue-50 text-[#1A56DB] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              {item.icon} {item.label}
              {item.id === 'verifications' && verifications.length > 0 && (
                <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{verifications.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('adminDash.title')}</h1>
          <p className="text-gray-500 text-sm">{t('adminDash.subtitle')}</p>
        </div>

        {/* Stat cards - always visible */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('adminDash.totalUsers'), value: stats?.totalUsers || 0, icon: '👥', color: 'text-[#1A56DB]', bg: 'bg-blue-50' },
              { label: t('adminDash.totalWorkers'), value: stats?.totalWorkers || 0, icon: '👷', color: 'text-green-600', bg: 'bg-green-50' },
              { label: t('adminDash.totalBookings'), value: stats?.totalBookings || 0, icon: '📋', color: 'text-[#F97316]', bg: 'bg-orange-50' },
              { label: t('adminDash.totalRevenue'), value: formatUZS(stats?.totalRevenue || 0), icon: '💰', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-5`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-600 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (() => {
          const statusData = stats.bookingsByStatus || [];
          const monthlyData = stats.monthlyBookings || [];
          const totalBookingsForChart = statusData.reduce((sum, s) => sum + s.count, 0) || 1;
          const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);
          const statusColors = { pending: '#F59E0B', confirmed: '#3B82F6', inProgress: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444' };
          const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Booking Status Distribution */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('adminDash.statusDistribution')}</h3>
                <div className="space-y-3">
                  {statusData.map((s) => (
                    <div key={s._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t(`bookingCard.status.${s._id}`)}</span>
                        <span className="font-medium text-gray-900">{s.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="h-3 rounded-full transition-all" style={{ width: `${(s.count / totalBookingsForChart) * 100}%`, backgroundColor: statusColors[s._id] || '#9CA3AF' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {statusData.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t('adminDash.noData')}</p>}
              </div>

              {/* Monthly Bookings Trend */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('adminDash.monthlyTrend')}</h3>
                <div className="flex items-end gap-3 h-40">
                  {monthlyData.map((m) => (
                    <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-gray-700">{m.count}</span>
                      <div className="w-full rounded-t-lg bg-[#1A56DB] opacity-80 hover:opacity-100 transition-all"
                        style={{ height: `${(m.count / maxMonthly) * 100}%`, minHeight: '8px' }} />
                      <span className="text-xs text-gray-500">{monthNames[m._id.month]}</span>
                    </div>
                  ))}
                </div>
                {monthlyData.length === 0 && <p className="text-gray-400 text-sm text-center py-4">{t('adminDash.noData')}</p>}
              </div>
            </div>
          );
        })()}

        {/* Verifications Tab */}
        {(activeTab === 'dashboard' || activeTab === 'verifications') && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {t('adminDash.pendingVerifications')}
            {verifications.length > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{t('adminDash.pending', { count: verifications.length })}</span>
            )}
          </h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {verifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm">{t('adminDash.noPending')}</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.workerCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.servicesCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.locationCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.document')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.actionsCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((w) => (
                    <tr key={w._id} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold">
                            {w.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{w.user?.name}</p>
                            <p className="text-gray-400 text-xs">{w.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{w.services?.slice(0, 2).join(', ')}</td>
                      <td className="px-5 py-3 text-gray-600">{w.location?.district}</td>
                      <td className="px-5 py-3">
                        {w.idDocument ? (
                          <a href={`http://localhost:5000${w.idDocument}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#1A56DB] hover:underline flex items-center gap-1">
                            📄 {t('adminDash.viewDoc')}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">{t('adminDash.noDoc')}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleVerify(w._id, 'approve')}
                            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600">
                            {t('adminDash.approve')}
                          </button>
                          <button onClick={() => handleVerify(w._id, 'reject')}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200">
                            {t('adminDash.reject')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
        )}

        {/* Bookings Tab */}
        {(activeTab === 'dashboard' || activeTab === 'bookings') && stats?.recentBookings?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('adminDash.recentBookings')}</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.customerCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.serviceCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.statusCol')}</th>
                    <th className="text-left px-5 py-3 text-gray-600 font-medium">{t('adminDash.dateCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr key={b._id} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{b.customer?.name || 'N/A'}</td>
                      <td className="px-5 py-3 text-gray-600">{b.service}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[b.status] || 'text-gray-600 bg-gray-100'}`}>
                          {t(`bookingCard.status.${b.status}`)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* Users Tab */}
        {activeTab === 'users' && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">User Management
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{users.length} users</span>
            </h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {users.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-sm">No users found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">User</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Phone</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Role</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Joined</th>
                      <th className="text-left px-5 py-3 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.name}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{u.phone || '—'}</td>
                        <td className="px-5 py-3">
                          <select value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                            <option value="customer">Customer</option>
                            <option value="worker">Worker</option>
                          </select>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          {confirmDeleteId === u._id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDeleteUser(u._id)} disabled={deletingId === u._id}
                                className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50">
                                {deletingId === u._id ? '...' : 'Yes'}
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)}
                                className="text-xs border border-gray-300 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50">
                                No
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(u._id)}
                              className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">
                              🗑 Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
