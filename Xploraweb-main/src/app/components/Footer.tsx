import { Link } from 'react-router';
import NewsletterSignup from './NewsletterSignup';
import { FooterBottom } from './FooterBottom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <div>
      <div className="bg-muted/20 border-t border-border py-12 md:py-16 lg:py-20">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl mb-3">{t('footer.tagline')}</h2>
          <p className="text-muted-foreground mb-6">{t('footer.description')}</p>
          <NewsletterSignup />
          <Link
            to="/business"
            className="inline-block mt-6 text-sm font-medium text-secondary hover:underline"
          >
            {t('footer.forBusinesses')} →
          </Link>
        </div>
      </div>
      <FooterBottom />
    </div>
  );
}
