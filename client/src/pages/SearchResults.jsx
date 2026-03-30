import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllWorkers } from '../services/worker.service';
import WorkerCard from '../components/WorkerCard';
import { useLanguage } from '../context/LanguageContext';

const SERVICES = ['Plumbing', 'Electrical', 'AC Repair'];
const DISTRICTS = ['Chilonzor', 'Yunusabad', 'Mirzo Ulugbek', 'Shaykhontohur', 'Uchtepa', 'Bektemir', 'Sergeli', 'Yashnobod'];

const INITIAL_FILTERS = { service: '', district: '', minRating: '', maxPrice: '', verifiedOnly: false };

const SearchResults = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState('');
  const [sort, setSort] = useState('rating');

  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
    service: searchParams.get('service') || '',
    district: searchParams.get('district') || '',
  });

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
      setWorkers(result);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchWorkers(); }, [filters]);

  const sorted = useMemo(() => {
    let result = nameQuery
      ? workers.filter((w) => w.user?.name?.toLowerCase().includes(nameQuery.toLowerCase()))
      : [...workers];

    if (sort === 'price') result = result.sort((a, b) => a.jobRate - b.jobRate);
    else if (sort === 'price_desc') result = result.sort((a, b) => b.jobRate - a.jobRate);
    else if (sort === 'experience') result = result.sort((a, b) => b.experience - a.experience);
    else if (sort === 'jobs') result = result.sort((a, b) => b.totalJobs - a.totalJobs);
    else result = result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [workers, sort, nameQuery]);

  const resetAll = () => {
    setFilters(INITIAL_FILTERS);
    setNameQuery('');
    setSort('rating');
  };

  // Active filter chips
  const activeChips = [];
  if (filters.service) activeChips.push({ label: filters.service, clear: () => setFilters({ ...filters, service: '' }) });
  if (filters.district) activeChips.push({ label: filters.district, clear: () => setFilters({ ...filters, district: '' }) });
  if (filters.minRating) activeChips.push({ label: `${filters.minRating}+★`, clear: () => setFilters({ ...filters, minRating: '' }) });
  if (filters.maxPrice) activeChips.push({ label: `≤ ${Number(filters.maxPrice).toLocaleString()} UZS`, clear: () => setFilters({ ...filters, maxPrice: '' }) });
  if (filters.verifiedOnly) activeChips.push({ label: 'Verified only', clear: () => setFilters({ ...filters, verifiedOnly: false }) });

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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{t('searchResults.filters')}</h3>
              {activeChips.length > 0 && (
                <button onClick={resetAll} className="text-xs text-red-500 hover:underline">
                  {t('searchResults.clearAll')}
                </button>
              )}
            </div>

            {/* Name search */}
            <div className="mb-4">
              <input
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder={t('searchResults.searchName')}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>

            {/* Service */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('searchResults.service')}</label>
              {SERVICES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-gray-700 mb-1 cursor-pointer">
                  <input type="radio" name="service" value={s} checked={filters.service === s}
                    onChange={() => setFilters({ ...filters, service: s })} className="accent-[#1A56DB]" />
                  {t(`services.${s}`)}
                </label>
              ))}
              {filters.service && (
                <button onClick={() => setFilters({ ...filters, service: '' })}
                  className="text-xs text-[#1A56DB] mt-1 hover:underline">{t('searchResults.clear')}</button>
              )}
            </div>

            {/* District */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('register.district')}</label>
              <select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                <option value="">{t('common.allDistricts')}</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Max Price */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('searchResults.maxPrice')}: {filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} UZS` : t('searchResults.any')}
              </label>
              <input type="range" min="0" max="500000" step="10000"
                value={filters.maxPrice || 500000}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value === '500000' ? '' : e.target.value })}
                className="w-full accent-[#1A56DB]" />
            </div>

            {/* Min Rating */}
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

            {/* Verified only */}
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
          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {activeChips.map((chip, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-blue-50 text-[#1A56DB] border border-blue-200 px-2.5 py-1 rounded-full">
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-red-500 font-bold ml-0.5">✕</button>
                </span>
              ))}
            </div>
          )}

          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm">
              <span className="font-bold text-gray-900">{sorted.length}</span> {t('common.workers')}
            </p>
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
              <option value="rating">{t('searchResults.sortRating')}</option>
              <option value="price">{t('searchResults.sortPrice')}</option>
              <option value="experience">{t('searchResults.sortExperience')}</option>
              <option value="jobs">{t('searchResults.sortJobs')}</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">{t('searchResults.noWorkers')}</h3>
              <p className="text-gray-500 mb-4">{t('searchResults.adjustFilters')}</p>
              {activeChips.length > 0 && (
                <button onClick={resetAll}
                  className="text-sm bg-[#1A56DB] text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                  {t('searchResults.clearAll')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map((w) => <WorkerCard key={w._id} worker={w} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
