import { Lock, Languages } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { XploraLogo } from './XploraLogo';

type FooterLink =
  | { label: string; to: string; href?: never }
  | { label: string; href: string; to?: never };

export function FooterBottom() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const links: FooterLink[] = [
    { label: t('footer.about'),   to: '/about' },
    { label: t('footer.privacy'), to: '/privacy' },
    { label: t('footer.terms'),   to: '/terms' },
    { label: t('footer.refund'),  to: '/terms' },
    { label: t('footer.faq'),     to: '/faq' },
    { label: t('footer.contact'), href: 'mailto:hello@goxplora.ca' },
  ];

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 space-y-4">

        {/* Logo + trust cue + language toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <XploraLogo variant="icon" className="h-7 w-7 rounded-full flex-shrink-0" />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              {t('footer.trustCue')}
            </span>
          </div>

          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            aria-label={language === 'fr' ? t('a11y.switchToEn') : t('a11y.switchToFr')}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] px-2 -ml-2 rounded-md hover:bg-muted/40"
          >
            <Languages className="w-3.5 h-3.5" aria-hidden="true" />
            {language === 'fr' ? 'English' : 'Français'}
          </button>
        </div>

        {/* Policy links — wrap on mobile */}
        <nav aria-label={t('footer.linksLabel', 'Footer links')}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5 list-none p-0 m-0">
            {links.map((link) => (
              <li key={link.label}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] inline-flex items-center"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] inline-flex items-center"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">{t('footer.copyright')}</p>

      </div>
    </div>
  );
}
