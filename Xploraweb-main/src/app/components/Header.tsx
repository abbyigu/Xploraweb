import { Link, useLocation } from 'react-router';
import { Compass, Gift, Info, ShoppingCart } from 'lucide-react';
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
    { path: '/',        icon: Compass, labelKey: 'header.experiences' },
    { path: '/members', icon: Gift,    labelKey: 'header.perks' },
    { path: '/about',   icon: Info,    labelKey: 'header.about' },
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-4">
            <XploraLogo variant="full" className="h-28 block" />
          </div>

          <nav className="flex items-center gap-1 md:gap-2 lg:gap-3">
            {navItems.map(({ path, icon: Icon, labelKey }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 lg:px-6 py-2 md:py-3 rounded-xl transition-all ${
                  isActive(path)
                    ? 'bg-primary/15 border-2 border-primary text-foreground'
                    : 'bg-white text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs md:text-sm lg:text-base">{t(labelKey)}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 lg:gap-5">
            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors">{t('header.forBusinesses')}</Link>

            {/* Language toggle */}
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
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('header.exploring')}</p>
              <p className="font-medium">{t('header.city')}</p>
            </div>
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
