import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';
import { Footer } from './Footer';

export function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO title={t('notFound.seoTitle')} description={t('notFound.seoDesc')} noIndex />

      <div className="max-w-2xl mx-auto px-6 md:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Compass className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl">{t('notFound.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">{t('notFound.body')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t('notFound.homeLink')}
        </Link>
      </div>

      <Footer />
    </div>
  );
}
