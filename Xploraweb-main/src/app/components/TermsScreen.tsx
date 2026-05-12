import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';

export function TermsScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-6 md:px-8 pt-12 pb-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Xplora</p>
          <h1 className="text-3xl md:text-4xl">{t('terms.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('terms.lastUpdated')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-10 text-sm leading-relaxed text-foreground">

        <section className="space-y-3">
          <p className="text-muted-foreground">
            {t('terms.intro', 'These Terms of Service govern your use of Xplora (goxplora.ca), operated by Club Horizon, Québec City, QC. By creating an account or using the platform, you agree to these terms.')}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s1title')}</h2>
          <p className="text-muted-foreground">{t('terms.s1desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s2title')}</h2>
          <p className="text-muted-foreground">{t('terms.s2intro')}</p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>{t('terms.s2i1')}</li>
            <li>{t('terms.s2i2')}</li>
            <li>{t('terms.s2i3')}</li>
            <li>{t('terms.s2i4')}</li>
            <li>{t('terms.s2i5')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s3title')}</h2>
          <p className="text-muted-foreground">{t('terms.s3desc')}</p>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>{t('terms.s3i1')}</li>
            <li>{t('terms.s3i2')}</li>
            <li>{t('terms.s3i3')}</li>
            <li>{t('terms.s3i4')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s4title')}</h2>
          <p className="text-muted-foreground">{t('terms.s4desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s5title')}</h2>
          <p className="text-muted-foreground">{t('terms.s5intro')}</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>{t('terms.s5i1')}</li>
            <li>{t('terms.s5i2')}</li>
            <li>{t('terms.s5i3')}</li>
            <li>{t('terms.s5i4')}</li>
            <li>{t('terms.s5i5')}</li>
          </ul>
          <p className="text-muted-foreground">{t('terms.s5footer')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s6title')}</h2>
          <p className="text-muted-foreground">{t('terms.s6desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s7title')}</h2>
          <p className="text-muted-foreground">{t('terms.s7desc')}</p>
          <p className="text-muted-foreground">{t('terms.s7limit')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s8title')}</h2>
          <p className="text-muted-foreground">{t('terms.s8desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s9title')}</h2>
          <p className="text-muted-foreground">{t('terms.s9desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('terms.s10title')}</h2>
          <p className="text-muted-foreground">
            {t('terms.s10desc')}{' — '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>
            <br />
            {t('terms.orgLine')}
          </p>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
