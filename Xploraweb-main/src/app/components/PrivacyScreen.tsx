import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';

export function PrivacyScreen() {
  const { t } = useTranslation();

  const thirdParties = [
    { name: t('privacy.s3supabase'), use: t('privacy.s3supabaseDesc') },
    { name: t('privacy.s3stripe'), use: t('privacy.s3stripeDesc') },
    { name: t('privacy.s3resend'), use: t('privacy.s3resendDesc') },
    { name: t('privacy.s3vercel'), use: t('privacy.s3vercelDesc') },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <div className="bg-gradient-to-b from-primary/20 to-transparent px-6 md:px-8 pt-12 pb-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Xplora</p>
          <h1 className="text-3xl md:text-4xl">{t('privacy.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('privacy.lastUpdated')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-10 text-sm leading-relaxed text-foreground">

        <section className="space-y-3">
          <p className="text-muted-foreground">
            {t('privacy.intro', 'Xplora (operated by Club Horizon, Québec City, QC) is committed to protecting your personal information.')}
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s1title')}</h2>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li><strong className="text-foreground">{t('privacy.s1account')}</strong> — {t('privacy.s1accountDesc')}</li>
            <li><strong className="text-foreground">{t('privacy.s1profile')}</strong> — {t('privacy.s1profileDesc')}</li>
            <li><strong className="text-foreground">{t('privacy.s1payment')}</strong> — {t('privacy.s1paymentDesc')}</li>
            <li><strong className="text-foreground">{t('privacy.s1usage')}</strong> — {t('privacy.s1usageDesc')}</li>
            <li><strong className="text-foreground">{t('privacy.s1comms')}</strong> — {t('privacy.s1commsDesc')}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s2title')}</h2>
          <ul className="space-y-2 text-muted-foreground list-disc list-inside">
            <li>{t('privacy.s2i1')}</li>
            <li>{t('privacy.s2i2')}</li>
            <li>{t('privacy.s2i3')}</li>
            <li>{t('privacy.s2i4')}</li>
            <li>{t('privacy.s2i5')}</li>
            <li>{t('privacy.s2i6')}</li>
          </ul>
          <p className="text-muted-foreground">{t('privacy.s2noSell')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s3title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s3intro')}</p>
          <div className="space-y-2">
            {thirdParties.map((s) => (
              <div key={s.name} className="bg-muted/30 rounded-xl p-4">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{s.use}</p>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground">{t('privacy.s3footer')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s4title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s4desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s5title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s5desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s6title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s6intro')}</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>{t('privacy.s6i1')}</li>
            <li>{t('privacy.s6i2')}</li>
            <li>{t('privacy.s6i3')}</li>
            <li>{t('privacy.s6i4')}</li>
          </ul>
          <p className="text-muted-foreground">
            {t('privacy.s6contact')}{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s7title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s7desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s8title')}</h2>
          <p className="text-muted-foreground">{t('privacy.s8desc')}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t('privacy.s9title')}</h2>
          <p className="text-muted-foreground">
            {t('privacy.s9desc')}{' '}
            <a href="mailto:hello@goxplora.ca" className="text-primary underline underline-offset-2">hello@goxplora.ca</a>.
            <br />
            {t('privacy.orgLine')}
          </p>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
