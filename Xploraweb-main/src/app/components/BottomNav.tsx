import { Link, useLocation } from 'react-router';
import { Compass, Gift, Info, User, ShoppingCart, Languages } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

export function BottomNav() {
  const location = useLocation();
  const { count } = useCart();
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/',        icon: Compass,      labelKey: 'nav.experiences', badge: 0 },
    { path: '/members', icon: Gift,         labelKey: 'nav.perks',       badge: 0 },
    { path: '/about',   icon: Info,         labelKey: 'nav.about',       badge: 0 },
    { path: '/cart',    icon: ShoppingCart, labelKey: 'nav.cart',        badge: count },
    { path: '/account', icon: User,         labelKey: 'nav.account',     badge: 0 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map(({ path, icon: Icon, labelKey, badge }) => (
          <Link
            key={path}
            to={path}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${
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
            <span className="text-[10px]">{t(labelKey)}</span>
          </Link>
        ))}

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all text-muted-foreground hover:bg-muted/40"
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px] font-medium">{language === 'fr' ? 'EN' : 'FR'}</span>
        </button>
      </div>
    </nav>
  );
}
