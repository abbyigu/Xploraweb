import { Mail, Building2 } from 'lucide-react';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';

const CONTACT_EMAIL = 'hello@goxplora.ca';

export function BusinessLandingScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex">
        <img
          src="/hero/window-flower-box.jpg"
          alt="Window flower box overlooking a Québec City street"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
        <div className="relative w-full max-w-2xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-5">
            <p className="text-xs uppercase tracking-widest text-white/80 inline-flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> {t('business.comingSoonBadge')}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow">
              {t('business.comingSoonTitle')}
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-xl drop-shadow-sm">
              {t('business.comingSoonDesc')}
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 transition w-full sm:w-auto justify-center"
          >
            <Mail className="w-5 h-5" />
            {t('business.contactCta', { email: CONTACT_EMAIL })}
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
