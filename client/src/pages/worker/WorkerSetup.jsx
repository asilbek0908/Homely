import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkerProfile } from '../../services/worker.service';
import { uploadPortfolio } from '../../services/upload.service';
import { useLanguage } from '../../context/LanguageContext';

const SERVICES = ['Plumbing', 'Electrical', 'AC Repair'];
const DISTRICTS = ['Chilonzor', 'Yunusabad', 'Mirzo Ulugbek', 'Shaykhontohur', 'Uchtepa', 'Bektemir', 'Sergeli', 'Yashnobod'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WorkerSetup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const TIME_SLOTS = [
    { label: t('workerSetup.morning'), slots: ['08:00', '09:00', '10:00', '11:00'] },
    { label: t('workerSetup.afternoon'), slots: ['12:00', '13:00', '14:00', '15:00', '16:00'] },
    { label: t('workerSetup.evening'), slots: ['17:00', '18:00', '19:00', '20:00'] },
  ];

  const [form, setForm] = useState({
    bio: '', experience: '', jobRate: '', district: '',
    services: [],
    availability: DAYS.map((day) => ({ day, slots: [] })),
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const TOTAL_STEPS = 4;

  const toggleService = (s) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  };

  const toggleSlot = (dayIndex, slot) => {
    setForm((f) => {
      const availability = [...f.availability];
      const day = { ...availability[dayIndex] };
      day.slots = day.slots.includes(slot) ? day.slots.filter((s) => s !== slot) : [...day.slots, slot];
      availability[dayIndex] = day;
      return { ...f, availability };
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePhoto = (index) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await createWorkerProfile({
        bio: form.bio,
        experience: Number(form.experience),
        jobRate: Number(form.jobRate),
        services: form.services,
        location: { district: form.district, city: 'Tashkent' },
        availability: form.availability.filter((d) => d.slots.length > 0),
      });
      if (photoFiles.length > 0) {
        await uploadPortfolio(photoFiles);
      }
      navigate('/worker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = t('workerSetup.steps');

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= step ? 'bg-[#1A56DB] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`ml-1 text-xs hidden sm:block ${i + 1 === step ? 'text-[#1A56DB] font-medium' : 'text-gray-400'}`}>{label}</span>
            {i < TOTAL_STEPS - 1 && <div className={`w-6 sm:w-12 h-1 mx-1 sm:mx-2 rounded ${i + 1 < step ? 'bg-[#1A56DB]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-7 h-7 text-[#1A56DB]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
          <span className="text-xl font-bold text-[#1A56DB]">{t('workerSetup.title')}</span>
        </div>

        <ProgressBar />

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('workerSetup.basicInfo')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerSetup.bio')}</label>
              <textarea rows={3} value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder={t('workerSetup.bioPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerSetup.experience')}</label>
                <input type="number" min="0" value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerSetup.pricePerJob')}</label>
                <input type="number" min="0" value={form.jobRate}
                  onChange={(e) => setForm({ ...form, jobRate: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('workerSetup.district')}</label>
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A56DB]">
                <option value="">{t('workerSetup.selectDistrict')}</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('workerSetup.selectServices')}</h2>
            <p className="text-gray-500 text-sm mb-5">{t('workerSetup.selectServicesHint')}</p>
            <div className="grid grid-cols-2 gap-3">
              {SERVICES.map((s) => (
                <button key={s} onClick={() => toggleService(s)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${form.services.includes(s) ? 'bg-[#1A56DB] text-white border-[#1A56DB]' : 'border-gray-200 text-gray-700 hover:border-[#1A56DB]'}`}>
                  {t(`services.${s}`)}
                </button>
              ))}
            </div>
            {form.services.length > 0 && (
              <p className="text-sm text-[#1A56DB] mt-3">{t('workerSetup.selected', { services: form.services.map((s) => t(`services.${s}`)).join(', ') })}</p>
            )}
          </div>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('workerSetup.setAvailability')}</h2>
            <p className="text-gray-500 text-sm mb-5">{t('workerSetup.availabilityHint')}</p>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {DAYS.map((day, di) => (
                <div key={day}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">{t(`days.${day}`)}</p>
                  {TIME_SLOTS.map((group) => (
                    <div key={group.label} className="mb-2">
                      <p className="text-xs text-gray-400 mb-1">{group.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.slots.map((slot) => (
                          <button key={slot} onClick={() => toggleSlot(di, slot)}
                            className={`text-xs px-3 py-1.5 rounded-lg border ${form.availability[di].slots.includes(slot) ? 'bg-[#1A56DB] text-white border-[#1A56DB]' : 'border-gray-300 text-gray-600 hover:border-[#1A56DB]'}`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Portfolio Photos */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('workerSetup.photos')}</h2>
            <p className="text-gray-500 text-sm mb-5">{t('workerSetup.photosHint')}</p>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={handlePhotoChange} />

            <button onClick={() => fileInputRef.current.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 text-center hover:border-[#1A56DB] transition-colors">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm text-gray-500">{t('workerSetup.uploadPhotos')}</p>
            </button>

            {photoPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <button onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoPreviews.length > 0 && (
              <p className="text-sm text-[#1A56DB] mt-3 text-center">
                {typeof t('workerSetup.photosSelected') === 'function'
                  ? t('workerSetup.photosSelected')(photoPreviews.length)
                  : `${photoPreviews.length} photo(s) selected`}
              </p>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50">
              {t('common.back')}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button onClick={() => {
              if (step === 1 && (!form.bio || !form.experience || !form.jobRate || !form.district)) {
                setError(t('workerSetup.fillBasicInfo') || 'Please fill in all basic info fields');
                return;
              }
              if (step === 2 && form.services.length === 0) {
                setError(t('workerSetup.selectMin'));
                return;
              }
              setError('');
              setStep(step + 1);
            }}
              className="flex-1 bg-[#1A56DB] text-white py-3 rounded-xl font-medium hover:bg-blue-700">
              {t('common.next')}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#F97316] text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? t('workerSetup.creating') : t('workerSetup.createProfile')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerSetup;
