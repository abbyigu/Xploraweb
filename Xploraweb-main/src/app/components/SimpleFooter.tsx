import { Link } from 'react-router';
import { XploraLogo } from './XploraLogo';
import { useTranslation } from 'react-i18next';

export function SimpleFooter() {
  const { t } = useTranslation();
  return (
    <div className="border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <XploraLogo variant="icon" className="h-8 w-8 rounded-full" />
            <span className="text-sm text-muted-foreground">{t('footer.copyright')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">{t('footer.about')}</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">{t('footer.faq')}</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <a href="mailto:hello@goxplora.ca" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
