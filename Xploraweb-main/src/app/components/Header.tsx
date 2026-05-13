import { Link, useLocation } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { XploraLogo } from './XploraLogo';
import { useState, useEffect } from 'react';
import { getProfile } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function Header() {
  const location = useLocation();
  const { count } = useCart();
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
    { path: '/',              labelKey: 'header.home' },
    { path: '/itinerary',    labelKey: 'header.experiences' },
    { path: '/perks',        labelKey: 'header.perks' },
    { path: '/how-it-works', labelKey: 'header.howItWorks' },
    { path: '/about',        labelKey: 'header.about' },
    { path: '/contact',      labelKey: 'header.contact' },
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-4">
            <XploraLogo variant="full" className="h-28 block" />
          </div>

          <nav className="flex items-center gap-0.5 lg:gap-1">
            {navItems.map(({ path, labelKey }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 lg:px-4 py-2 rounded-xl transition-all text-sm lg:text-base whitespace-nowrap ${
                  isActive(path)
                    ? 'bg-primary/15 border-2 border-primary text-foreground font-medium'
                    : 'text-foreground hover:bg-muted/40'
                }`}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors whitespace-nowrap">{t('header.forBusinesses')}</Link>

            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>

            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            <Link to="/account">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                {avatar.url
                  ? <img src={avatar.url} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-sm">{avatar.name ? getInitials(avatar.name) : '?'}</span>
                }
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
