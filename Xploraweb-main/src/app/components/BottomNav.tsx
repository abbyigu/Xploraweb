import { Link, useLocation } from 'react-router';
import { Home, Compass, Heart, MapPin, User, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const isActive = (path: string) => {
    const [targetPath, targetQuery] = path.split('?');
    if (location.pathname !== targetPath) return false;
    const targetTab = new URLSearchParams(targetQuery).get('tab');
    const currentTab = new URLSearchParams(location.search).get('tab');
    return targetTab === currentTab;
  };

  const navItems = [
    { path: '/',                    icon: Home,    label: t('bottomNav.home'),    badge: 0 },
    { path: '/itinerary',           icon: Compass, label: t('bottomNav.walks'),   badge: 0 },
    { path: '/saved',               icon: Heart,   label: t('bottomNav.saved'),   badge: 0 },
    { path: '/neighbourhoods',      icon: MapPin,  label: t('bottomNav.hoods'),   badge: 0 },
    { path: '/dashboard',           icon: User,    label: t('bottomNav.account'), badge: 0 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-0.5 px-1.5 py-2.5 min-h-[44px] rounded-lg transition-all ${
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
        <button
          type="button"
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          aria-label={language === 'fr' ? t('a11y.switchToEn') : t('a11y.switchToFr')}
          className="relative flex flex-col items-center gap-0.5 px-1.5 py-2.5 min-h-[44px] rounded-lg transition-all text-foreground hover:text-foreground hover:bg-muted/40"
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px]" aria-hidden="true">{language === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>
    </nav>
  );
}
