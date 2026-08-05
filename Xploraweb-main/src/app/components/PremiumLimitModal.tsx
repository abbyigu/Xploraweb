import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { AuthModal } from './AuthModal';
import { useItineraryAuth } from '../hooks/useItineraryAuth';
import { supabase } from '../lib/supabase';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFIT_KEYS = [
  'unlimitedGeneration',
  'saveOrganize',
  'anyDevice',
  'moreCustomization',
  'earlyAccess',
] as const;

export function PremiumLimitModal({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isGuest, authModalOpen, setAuthModalOpen, requireAuth } = useItineraryAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(false);

  const priceId = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID as string | undefined;

  async function startCheckout() {
    if (!priceId) {
      setCheckoutError(true);
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(false);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch('/api/stripe-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?subscribed=1`,
          cancelUrl: window.location.href,
          userId: session?.user?.id,
          customerEmail: session?.user?.email,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutError(true);
    } catch {
      setCheckoutError(true);
    } finally {
      setCheckoutLoading(false);
    }
  }

  function handleUnlockClick() {
    requireAuth(startCheckout);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('premiumModal.title')}</DialogTitle>
            <DialogDescription>{t('premiumModal.body')}</DialogDescription>
          </DialogHeader>

          <ul className="space-y-2">
            {BENEFIT_KEYS.map(key => (
              <li key={key} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t(`premiumModal.benefit.${key}`)}</span>
              </li>
            ))}
          </ul>

          {checkoutError && (
            <p className="text-xs text-red-600">{t('premiumModal.checkoutError')}</p>
          )}

          <DialogFooter className="sm:flex-col sm:items-stretch gap-2">
            <button
              type="button"
              onClick={handleUnlockClick}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {checkoutLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {t('premiumModal.unlockButton')}
            </button>
            <button
              type="button"
              onClick={() => { onOpenChange(false); navigate('/dashboard'); }}
              className="w-full px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition"
            >
              {t('premiumModal.viewSavedButton')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onAuthenticated={() => {
          setAuthModalOpen(false);
          startCheckout();
        }}
      />
    </>
  );
}
