import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DISTRICTS = ['Chilonzor', 'Yunusabad', 'Mirzo Ulugbek', 'Shaykhontohur', 'Uchtepa', 'Bektemir', 'Sergeli', 'Yashnobod'];

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', district: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = t('register.validation.nameRequired');
    if (!form.email) e.email = t('register.validation.emailRequired');
    if (!form.phone) e.phone = t('register.validation.phoneRequired');
    if (form.password.length < 6) e.password = t('register.validation.passwordMin');
    if (form.password !== form.confirm) e.confirm = t('register.validation.passwordMismatch');
    if (!form.district) e.district = t('register.validation.districtRequired');
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setErrors({});
    setLoading(true);
    try {
      const userRole = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        location: { district: form.district, city: 'Tashkent' },
      });
      if (userRole === 'worker') navigate('/worker/setup');
      else navigate('/customer/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[name]} placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] ${errors[name] ? 'border-red-400' : 'border-gray-300'}`} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-5">
          <svg className="w-8 h-8 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-2xl font-bold text-[#1A56DB]">Homely</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-4">{t('register.createAccount')}</h2>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          {[['customer', t('register.iNeedServices')], ['worker', t('register.iOfferServices')]].map(([r, label]) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === r ? 'bg-white text-[#1A56DB] shadow' : 'text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{apiError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', t('register.fullName'), 'text', 'Jasur Toshmatov')}
          {field('email', t('register.email'), 'email', 'jasur@gmail.com')}
          {field('phone', t('register.phone'), 'tel', '+998 90 123 4567')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.district')}</label>
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] ${errors.district ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">{t('register.selectDistrict')}</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
          </div>

          {field('password', t('register.password'), 'password', '••••••••')}
          {field('confirm', t('register.confirmPassword'), 'password', '••••••••')}

          <button type="submit" disabled={loading}
            className="w-full bg-[#F97316] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? t('register.creating') : t('register.create')}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          {t('register.haveAccount')}{' '}
          <Link to="/login" className="text-[#1A56DB] font-medium hover:underline">{t('common.login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
