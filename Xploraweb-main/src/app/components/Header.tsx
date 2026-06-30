import { Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { XploraLogo } from './XploraLogo';
import { useState, useEffect, useRef } from 'react';
import { getProfile } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const [avatar, setAvatar] = useState<{ url: string | null; name: string }>({ url: null, name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/itinerary?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    searchRef.current?.blur();
  }

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

          <nav aria-label={t('header.mainNav', 'Main navigation')} className="flex items-center gap-0.5 lg:gap-1">
            {navItems.map(({ path, labelKey }) => (
              <Link
                key={path}
                to={path}
                aria-current={isActive(path) ? 'page' : undefined}
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

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('header.search', 'Search experiences…')}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-muted/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary w-44 lg:w-56 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 lg:gap-4">
            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors whitespace-nowrap">{t('header.forBusinesses')}</Link>

            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              aria-label={language === 'fr' ? t('a11y.switchToEn') : t('a11y.switchToFr')}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
            >
              <span aria-hidden="true">{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>

            <Link to="/cart" aria-label={t('a11y.cart')} className="relative p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              {count > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            <Link to="/account" aria-label={t('a11y.account')}>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                {avatar.url
                  ? <img src={avatar.url} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                  : <span aria-hidden="true" className="text-sm">{avatar.name ? getInitials(avatar.name) : '?'}</span>
                }
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
