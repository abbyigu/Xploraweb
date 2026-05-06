import { Link, useLocation } from 'react-router';
import { Home, Map, Sparkles, User, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export function BottomNav() {
  const location = useLocation();
  const { count } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/itinerary', icon: Map, label: 'Explore' },
    { path: '/shop', icon: ShoppingBag, label: 'Shop' },
    { path: '/members', icon: Sparkles, label: 'Members' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: count },
    { path: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-1">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all relative ${
              isActive(path)
                ? 'text-white bg-[#2E5B1F] shadow-sm'
                : 'text-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            {badge !== undefined && badge > 0 && (
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
