import { Link, useLocation, useNavigate } from 'react-router';
import { Compass, Info, ShoppingCart, Search, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { XploraLogo } from './XploraLogo';
import { useState, useEffect, useRef } from 'react';
import { getProfile } from '../lib/supabase';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

function getLang(): 'en' | 'fr' {
  return (localStorage.getItem('xplora-lang') as 'en' | 'fr') || 'en';
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCart();
  const [avatar, setAvatar] = useState<{ url: string | null; name: string }>({ url: null, name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [lang, setLang] = useState<'en' | 'fr'>(getLang);

  function toggleLang() {
    const next = lang === 'en' ? 'fr' : 'en';
    setLang(next);
    localStorage.setItem('xplora-lang', next);
    document.documentElement.lang = next;
  }

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
    { path: '/',               icon: Compass, label: 'Xperiences' },
    { path: '/neighbourhoods', icon: MapPin,  label: 'Neighbourhoods' },
    { path: '/about',          icon: Info,    label: 'About' },
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-4">
            <XploraLogo variant="full" className="h-28 block" />
          </div>

          <nav className="flex items-center gap-1 md:gap-2 lg:gap-3">
            {navItems.map(({ path, icon: Icon, label }) => (
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
                <span className="text-xs md:text-sm lg:text-base">{label}</span>
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
                placeholder="Search experiences…"
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-muted/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary w-44 lg:w-56 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 lg:gap-3">
            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors whitespace-nowrap">For Businesses</Link>

            {/* Location chip */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-sm font-medium whitespace-nowrap">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>Québec City</span>
            </div>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full border border-border bg-muted/40 text-sm font-medium hover:bg-muted/70 transition-colors"
              aria-label={lang === 'en' ? 'Switch to French' : 'Passer en anglais'}
            >
              {lang === 'en' ? 'FR' : 'EN'}
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
