import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer style={{ backgroundColor: '#1A56DB' }} className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-xl font-bold">Homely</span>
            </div>
            <p className="text-blue-200 text-sm">{t('footer.tagline')}</p>
            <p className="text-blue-200 text-sm mt-2">{t('footer.connecting')}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li><Link to="/" className="hover:text-white">{t('footer.about')}</Link></li>
              <li><Link to="/workers" className="hover:text-white">{t('nav.services')}</Link></li>
              <li><a href="/#how-it-works" className="hover:text-white cursor-pointer" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>{t('nav.howItWorks')}</a></li>
              <li><Link to="/register" className="hover:text-white">{t('nav.becomeWorker')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-blue-200 text-sm">
              <li>{t('footer.location')}</li>
              <li>info@homely.uz</li>
              <li>+998 91 977 9202</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-400 mt-8 pt-6 text-center text-blue-200 text-sm">
          {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
