import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';

export function AccessibilityScreen() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <PageSEO title={t('accessibilityPage.title')} description={t('accessibilityPage.intro')} canonical="/accessibility" />
      <section className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="font-serif text-3xl text-xplora-ink">{t('accessibilityPage.title')}</h1>
        <p className="text-muted-foreground">{t('accessibilityPage.intro')}</p>
        <div className="bg-card rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">{t('accessibilityPage.planningTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('accessibilityPage.planningBody')}</p>
        </div>
        <div className="bg-card rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold">{t('accessibilityPage.helpTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('accessibilityPage.helpBody')}</p>
          <Link to="/feedback" className="inline-flex min-h-11 items-center text-primary underline">{t('accessibilityPage.feedback')}</Link>
          <p><a href="mailto:hello@goxplora.ca" className="text-primary underline">hello@goxplora.ca</a></p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
