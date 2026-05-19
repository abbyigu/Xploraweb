import { useState, useEffect } from 'react';
import { X, Cookie, ChevronDown, ChevronUp, Shield } from 'lucide-react';

type ConsentState = { analytics: boolean; functional: boolean } | null;

const STORAGE_KEY = 'xplora-consent';

function getStored(): ConsentState {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch { return null; }
}

function saveConsent(state: Omit<ConsentState, null> & object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event('xplora-consent-update'));
}

const copy = {
  en: {
    title: 'We value your privacy',
    body: 'Xplora uses cookies to keep you signed in and, with your permission, to measure site performance. Under Québec Law 25, we need your consent before activating optional services.',
    necessary: 'Necessary',
    necessaryDesc: 'Authentication and core app functionality (Supabase). Always active.',
    functional: 'Functional',
    functionalDesc: 'Google Fonts for site typography. Your IP is shared with Google.',
    analytics: 'Analytics',
    analyticsDesc: 'Anonymous performance data via Vercel Speed Insights. No personal data collected.',
    acceptAll: 'Accept all',
    declineOptional: 'Necessary only',
    saveChoices: 'Save my choices',
    customize: 'Customize',
    privacyPolicy: 'Privacy Policy',
    reopen: 'Privacy settings',
  },
  fr: {
    title: 'Nous respectons votre vie privée',
    body: 'Xplora utilise des témoins pour maintenir votre session et, avec votre permission, pour mesurer la performance du site. Conformément à la Loi 25 du Québec, votre consentement est requis avant d\'activer les services optionnels.',
    necessary: 'Nécessaires',
    necessaryDesc: 'Authentification et fonctionnalités principales (Supabase). Toujours actifs.',
    functional: 'Fonctionnels',
    functionalDesc: 'Google Fonts pour la typographie du site. Votre adresse IP est partagée avec Google.',
    analytics: 'Analytiques',
    analyticsDesc: 'Données de performance anonymes via Vercel Speed Insights. Aucune donnée personnelle collectée.',
    acceptAll: 'Tout accepter',
    declineOptional: 'Nécessaires seulement',
    saveChoices: 'Enregistrer mes choix',
    customize: 'Personnaliser',
    privacyPolicy: 'Politique de confidentialité',
    reopen: 'Paramètres de confidentialité',
  },
};

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(getStored);
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState(true);
  const [functionalChoice, setFunctionalChoice] = useState(true);
  const [lang, setLang] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    const stored = getStored();
    setConsent(stored);
    setShowBanner(stored === null);
    const l = (localStorage.getItem('xplora-lang') as 'en' | 'fr') || 'en';
    setLang(l);
  }, []);

  const t = copy[lang];

  if (consent !== null && !showBanner) {
    return (
      <button
        onClick={() => setShowBanner(true)}
        className="fixed bottom-20 md:bottom-4 left-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-white border border-border rounded-full text-xs text-muted-foreground shadow-sm hover:shadow-md hover:text-foreground transition-all"
        aria-label={t.reopen}
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.reopen}</span>
      </button>
    );
  }

  if (!showBanner) return null;

  function acceptAll() {
    const s = { analytics: true, functional: true };
    saveConsent(s);
    setConsent(s);
    setShowBanner(false);
  }

  function declineOptional() {
    const s = { analytics: false, functional: false };
    saveConsent(s);
    setConsent(s);
    setShowBanner(false);
  }

  function saveChoices() {
    const s = { analytics: analyticsChoice, functional: functionalChoice };
    saveConsent(s);
    setConsent(s);
    setShowBanner(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      className="fixed bottom-0 inset-x-0 z-50 md:bottom-4 md:left-auto md:right-4 md:inset-x-auto md:w-full md:max-w-sm"
    >
      <div className="bg-white border-t md:border border-border md:rounded-2xl shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0" />
            <h2 className="font-semibold text-base">{t.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setLang(l => l === 'en' ? 'fr' : 'en')}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-muted/40 transition-colors text-muted-foreground"
            >
              {lang === 'en' ? 'FR' : 'EN'}
            </button>
            {consent !== null && (
              <button onClick={() => setShowBanner(false)} aria-label={t.title} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>

        {/* Expandable details */}
        <div>
          <button
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {t.customize}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-3 border border-border rounded-xl p-3">
              {/* Necessary — always on */}
              <label className="flex items-start gap-3">
                <input type="checkbox" checked disabled className="mt-0.5 accent-primary" />
                <div>
                  <p className="text-sm font-medium">{t.necessary}</p>
                  <p className="text-xs text-muted-foreground">{t.necessaryDesc}</p>
                </div>
              </label>

              {/* Functional */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={functionalChoice}
                  onChange={e => setFunctionalChoice(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{t.functional}</p>
                  <p className="text-xs text-muted-foreground">{t.functionalDesc}</p>
                </div>
              </label>

              {/* Analytics */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analyticsChoice}
                  onChange={e => setAnalyticsChoice(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{t.analytics}</p>
                  <p className="text-xs text-muted-foreground">{t.analyticsDesc}</p>
                </div>
              </label>

              <button
                onClick={saveChoices}
                className="w-full py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t.saveChoices}
              </button>
            </div>
          )}
        </div>

        {/* CTA row */}
        <div className="flex gap-2">
          <button
            onClick={declineOptional}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted/40 transition-colors"
          >
            {t.declineOptional}
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t.acceptAll}
          </button>
        </div>

        <a href="/privacy" className="block text-center text-xs text-muted-foreground hover:underline">
          {t.privacyPolicy}
        </a>
      </div>
    </div>
  );
}
