import { ShoppingCart, Check } from 'lucide-react';
import { merch } from '../data/products';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';
import { Footer } from './Footer';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTranslation } from 'react-i18next';

function formatPrice(cents: number) {
  return '$' + (cents / 100).toFixed(0);
}

export function ShopScreen() {
  const { addItem, items, count } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const inCart = (id: string) => items.some(i => i.id === id);

  const handleAdd = (product: (typeof merch)[0]) => {
    if (!inCart(product.id)) addItem(product);
  };

  const products = merch;

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl mb-1">{t('shop.title')}</h1>
            <p className="text-sm opacity-90">{t('shop.subtitle')}</p>
          </div>
          <button onClick={() => navigate('/cart')} className="relative bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="relative h-44">
                <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-base mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">{formatPrice(product.price)}</span>
                  <button
                    onClick={() => handleAdd(product)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${inCart(product.id) ? 'bg-green-500 text-white cursor-default' : 'bg-primary text-primary-foreground hover:opacity-90'}`}
                  >
                    {inCart(product.id) ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    {inCart(product.id) ? t('shop.inCart') : t('shop.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
