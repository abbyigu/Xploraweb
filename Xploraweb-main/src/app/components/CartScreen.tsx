import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { SimpleFooter } from './SimpleFooter';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { analytics } from '../lib/analytics';

export function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, total, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            name: i.name,
            description: i.description,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          successUrl: window.location.origin + '?checkout_success=1',
          cancelUrl: window.location.origin + '?checkout_cancelled=1',
          userId: user?.id || '',
          customerEmail: user?.email || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) {
        analytics.beginCheckout(items, total);
        analytics.stagePurchase(items, total);
        clearCart();
        window.location.href = data.url;
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 bg-background flex flex-col">
        <div className="bg-gradient-to-b from-primary/40 to-primary/30 px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl mb-1">{t('cart.title')}</h1>
            <p className="text-sm opacity-90">0 {t('cart.items')}</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl">{t('cart.empty')}</h2>
          <p className="text-muted-foreground text-sm max-w-xs">{t('cart.emptyDesc')}</p>
          <button onClick={() => navigate('/itinerary')} className="mt-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            {t('cart.browse')}
          </button>
        </div>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl mb-1">{t('cart.title')}</h1>
          <p className="text-sm opacity-90">{count} {t('cart.items')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-8 py-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden flex gap-4 p-4">
            {item.image && (
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.type}</span>
                  <h3 className="text-base leading-snug">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                </div>
                <button onClick={() => removeItem(item.id)} aria-label={t('a11y.removeItem', { name: item.name })} className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1">
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={t('a11y.decreaseQty', { name: item.name })} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Minus className="w-3 h-3" aria-hidden="true" />
                  </button>
                  <span className="text-sm w-4 text-center" aria-live="polite">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={t('a11y.increaseQty', { name: item.name })} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Plus className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
                <span className="font-medium">${((item.price * item.quantity) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <h3 className="text-lg">{t('cart.orderSummary')}</h3>
          <div className="space-y-2 text-sm">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-muted-foreground">
                <span className="truncate pr-4">{item.name} × {item.quantity}</span>
                <span>${((item.price * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-medium">
            <span>{t('cart.total')}</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 font-medium"
          >
            {loading ? 'Redirecting to Stripe…' : t('cart.checkout')}
          </button>
          <p className="text-xs text-center text-muted-foreground">{t('cart.secure')}</p>
        </div>
      </div>

      <SimpleFooter />
    </div>
  );
}
