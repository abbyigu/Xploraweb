import { Lock, Languages, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { XploraLogo } from './XploraLogo';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

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

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Social links */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/goxplora.qc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('a11y.followInstagram')}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[32px] inline-flex items-center"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@goxplora.qc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('a11y.followTikTok')}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[32px] inline-flex items-center"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/Xplora"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('a11y.followFacebook')}
                className="text-muted-foreground hover:text-foreground transition-colors min-h-[32px] inline-flex items-center"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              aria-label={language === 'fr' ? t('a11y.switchToEn') : t('a11y.switchToFr')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] px-2 rounded-md hover:bg-muted/40"
            >
              <Languages className="w-3.5 h-3.5" aria-hidden="true" />
              {language === 'fr' ? 'English' : 'Français'}
            </button>
          </div>
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
