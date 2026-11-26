import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getAnalyticsConsent, setAnalyticsConsent } from '../lib/analytics';

/** Asks once whether Google Analytics may run. Accept and Decline are deliberately styled alike. */
export function CookieConsent() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => getAnalyticsConsent() === null);

  useEffect(() => {
    const sync = () => setOpen(getAnalyticsConsent() === null);
    window.addEventListener('xplora:consent', sync);
    return () => window.removeEventListener('xplora:consent', sync);
  }, []);

  if (!open) return null;

  const btn = 'flex-1 min-h-11 px-4 rounded-xl border border-foreground/25 bg-white text-foreground hover:bg-muted transition-colors';
  return (
    <section
      aria-label={t('cookieConsent.title')}
      className="fixed z-50 left-3 right-3 bottom-20 md:bottom-4 md:left-4 md:right-auto md:max-w-sm bg-white border border-border rounded-2xl shadow-lg p-4 text-sm"
    >
      <p className="font-medium mb-1">{t('cookieConsent.title')}</p>
      <p className="text-muted-foreground mb-3">
        {t('cookieConsent.body')}{' '}
        <Link to="/privacy#cookies" className="underline">{t('cookieConsent.learnMore')}</Link>
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} onClick={() => setAnalyticsConsent('denied')}>{t('cookieConsent.decline')}</button>
        <button type="button" className={btn} onClick={() => setAnalyticsConsent('granted')}>{t('cookieConsent.accept')}</button>
      </div>
    </section>
  );
}
