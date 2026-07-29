import { Link, useLocation } from 'react-router';
import { XploraLogo } from './XploraLogo';
import { useState, useEffect } from 'react';
import { getProfile } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { User } from 'lucide-react';
import { SiteSearch } from './SiteSearch';

function getInitials(name: string): string | null {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || null;
}

export function Header() {
  const location = useLocation();
  const [avatar, setAvatar] = useState<{ url: string | null; name: string }>({ url: null, name: '' });
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setAvatar({ url: data.avatar_url, name: data.name });
    });
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/',               labelKey: 'header.home' },
    { path: '/itinerary',      labelKey: 'header.experiences' },
    { path: '/neighbourhoods', labelKey: 'header.neighbourhoods' },
    { path: '/about',          labelKey: 'header.about' },
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-4">
            <Link to="/" aria-label={t('header.home', 'Home')} className="block">
              <XploraLogo variant="full" className="h-28 block" />
            </Link>
          </div>

          <nav aria-label={t('header.mainNav', 'Main navigation')} className="flex items-center gap-2 lg:gap-3">
            {navItems.map(({ path, labelKey }) => (
              <Link
                key={path}
                to={path}
                aria-current={isActive(path) ? 'page' : undefined}
                className={`px-3 lg:px-4 py-2 rounded-xl border-2 transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive(path)
                    ? 'bg-primary/15 border-primary text-foreground font-medium'
                    : 'border-transparent text-foreground hover:bg-muted/40'
                }`}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <SiteSearch variant="header" />

            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors whitespace-nowrap">{t('header.forBusinesses')}</Link>

            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              aria-label={language === 'fr' ? t('a11y.switchToEn') : t('a11y.switchToFr')}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              <span aria-hidden="true">{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <Link to="/dashboard" aria-label={t('a11y.account')}>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                {avatar.url
                  ? <img src={avatar.url} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                  : (getInitials(avatar.name)
                      ? <span aria-hidden="true" className="text-sm">{getInitials(avatar.name)}</span>
                      : <User aria-hidden="true" className="w-5 h-5" />)
                }
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
