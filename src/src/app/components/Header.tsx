import { Link, useLocation } from 'react-router';
import { Home, Map, Sparkles, Users, ShoppingCart, ShoppingBag } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { useState, useEffect } from 'react';
import { getProfile } from '../lib/supabase';
import { useCart } from '../context/CartContext';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function Header() {
  const location = useLocation();
  const [avatar, setAvatar] = useState<{ url: string | null; name: string }>({ url: null, name: '' });
  const { count } = useCart();

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setAvatar({ url: data.avatar_url, name: data.name });
    });
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/itinerary', icon: Map, label: 'Experiences' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/meetups', icon: Users, label: 'Social' },
    { path: '/perks', icon: Sparkles, label: 'Perks' },
  ];

  return (
    <header className="hidden md:block bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center -ml-4">
            <XploraLogo variant="full" className="h-20 block" />
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${isActive(path) ? 'bg-[#52a93454] border-2 border-[#2E5B1F] text-foreground' : 'bg-white text-foreground hover:bg-muted/40'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/business" className="text-sm text-secondary hover:underline transition-colors">For Businesses</Link>
            <Link to="/cart" className="relative p-2 rounded-xl hover:bg-muted/40 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Exploring</p>
              <p className="font-medium">Quebec City, QC</p>
            </div>
            <Link to="/account">
              <div className="w-10 h-10 rounded-full bg-[#2E5B1F] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
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
