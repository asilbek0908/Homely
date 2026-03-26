import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllWorkers } from '../services/worker.service';
import WorkerCard from '../components/WorkerCard';
import { useLanguage } from '../context/LanguageContext';

const SERVICES = ['Plumbing', 'Electrical', 'AC Repair'];
const DISTRICTS = ['Chilonzor', 'Yunusabad', 'Mirzo Ulugbek', 'Shaykhontohur', 'Uchtepa', 'Bektemir', 'Sergeli', 'Yashnobod'];

const SearchResults = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    service: searchParams.get('service') || '',
    district: searchParams.get('district') || '',
    minRating: '',
    maxPrice: '',
    verifiedOnly: false,
  });
  const [sort, setSort] = useState('rating');

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.service) params.service = filters.service;
      if (filters.district) params.district = filters.district;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      const data = await getAllWorkers(params);
      let result = data.workers || [];
      if (filters.verifiedOnly) result = result.filter((w) => w.isVerified);
      if (sort === 'price') result = [...result].sort((a, b) => a.jobRate - b.jobRate);
      setWorkers(result);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchWorkers(); }, [filters, sort]);

  const Skeleton = () => (
    <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-14 h-14 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded mb-2" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">{t('searchResults.filters')}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchResults.service')}</label>
              {SERVICES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-gray-700 mb-1 cursor-pointer">
                  <input type="radio" name="service" value={s} checked={filters.service === s}
                    onChange={() => setFilters({ ...filters, service: s })} className="accent-[#1A56DB]" />
                  {t(`services.${s}`)}
                </label>
              ))}
              <button onClick={() => setFilters({ ...filters, service: '' })}
                className="text-xs text-[#1A56DB] mt-1 hover:underline">{t('searchResults.clear')}</button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.district')}</label>
              <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                <option value="">{t('common.allDistricts')}</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('searchResults.maxPrice')}: {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} UZS` : t('searchResults.any')}
              </label>
              <input type="range" min="0" max="500000" step="10000"
                value={filters.maxPrice || 500000}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value === '500000' ? '' : e.target.value })}
                className="w-full accent-[#1A56DB]" />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchResults.minRating')}</label>
              <div className="flex gap-1">
                {[3, 4, 4.5].map((r) => (
                  <button key={r} onClick={() => setFilters({ ...filters, minRating: filters.minRating == r ? '' : r })}
                    className={`text-xs px-3 py-1.5 rounded-lg border ${filters.minRating == r ? 'bg-[#1A56DB] text-white border-[#1A56DB]' : 'border-gray-300 text-gray-600'}`}>
                    {r}+★
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={filters.verifiedOnly}
                onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                className="accent-[#1A56DB]" />
              {t('searchResults.verifiedOnly')}
            </label>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm"><span className="font-bold text-gray-900">{workers.length}</span> {t('common.workers')}</p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
              <option value="rating">{t('searchResults.sortRating')}</option>
              <option value="price">{t('searchResults.sortPrice')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} />)}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">{t('searchResults.noWorkers')}</h3>
              <p className="text-gray-500">{t('searchResults.adjustFilters')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {workers.map((w) => <WorkerCard key={w._id} worker={w} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
