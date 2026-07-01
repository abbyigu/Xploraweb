import { Link, useLocation } from 'react-router';
import { Home, Compass, Info, MapPin, User } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/',              icon: Home,    label: 'Home',       badge: 0 },
    { path: '/itinerary',     icon: Compass, label: 'Xperiences', badge: 0 },
    { path: '/about',         icon: Info,    label: 'About',      badge: 0 },
    { path: '/neighbourhoods', icon: MapPin, label: 'Hoods',      badge: 0 },
    { path: '/account',       icon: User,    label: 'Account',    badge: 0 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 min-h-[44px] rounded-lg transition-all ${
              isActive(path)
                ? 'text-white bg-primary shadow-sm'
                : 'text-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
            <span className="text-[10px]">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
