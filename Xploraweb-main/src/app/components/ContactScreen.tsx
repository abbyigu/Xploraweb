import { Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';

export function ContactScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">

      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Xplora</p>
          <h1 className="text-2xl md:text-3xl mb-1">{t('contact.title')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('contact.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-14 space-y-6">

        <a
          href="mailto:hello@goxplora.ca"
          className="group flex gap-5 items-start bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium group-hover:text-primary transition-colors flex items-center gap-1.5">
              {t('contact.emailLabel')} <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </p>
            <p className="text-sm text-muted-foreground">{t('contact.emailDesc')}</p>
            <p className="text-sm font-medium text-primary mt-1">{t('contact.email')}</p>
          </div>
        </a>

        <Link
          to="/business"
          className="group flex gap-5 items-start bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <ExternalLink className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-0.5">
            <p className="font-medium group-hover:text-secondary transition-colors">
              {t('contact.partnerLabel')}
            </p>
            <p className="text-sm text-muted-foreground">{t('contact.partnerDesc')}</p>
          </div>
        </Link>

        <p className="text-sm text-muted-foreground text-center pt-2">{t('contact.responseTime')}</p>

      </div>

      <Footer />
    </div>
  );
}
