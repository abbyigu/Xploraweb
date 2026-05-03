import { Link, useLocation } from 'react-router';
import { Home, Map, Sparkles, Users } from 'lucide-react';
import { XploraLogo } from './XploraLogo';
import { useEffect, useState } from 'react';
import { getProfile } from '../lib/supabase';

function getInitials(name: string): string {
  return name.trim().split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('') || '?';
}

export function Header() {
  const location = useLocation();
  const [profile, setProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    getProfile().then((data) => {
      if (data) setProfile({ name: data.name, avatar_url: data.avatar_url });
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/itinerary', icon: Map, label: 'Experiences' },
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
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Exploring</p>
              <p className="font-medium">Quebec City, QC</p>
            </div>
            <Link to="/account">
              <div className="w-10 h-10 rounded-full bg-[#2E5B1F] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm">{profile ? getInitials(profile.name) : '…'}</span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
