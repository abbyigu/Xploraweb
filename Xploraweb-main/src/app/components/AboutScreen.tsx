import { Heart, Compass, Sparkles } from 'lucide-react';
import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';

export function AboutScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">

      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Xplora</p>
          <h1 className="text-2xl md:text-3xl mb-1">{t('about.headline')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('about.subheadline')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-20">

        <section className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-icon-bg flex items-center justify-center">
            <Compass className="w-7 h-7 text-xplora-primary" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('about.mission')}</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl">{t('about.title')}</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Xplora exists to connect people with the best of Québec City — the spots worth finding, the events worth showing up for, and the experiences that don't make it onto generic travel lists. Whether you're here for a week or have lived here for years, we make it easier to explore with intention.
            </p>
          </div>
        </section>

        <div className="border-t border-border" />

        <section className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-accent-teal/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-xplora-accent-teal" />
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Vision</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl">A city most people never fully discover</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Every city has a version of itself that most people never find. Our vision is a Québec City where tourists go beyond the Old Port, where newcomers find their spots fast, and where long-time locals keep being surprised. Xplora is how that happens.
            </p>
          </div>
        </section>

        <div className="border-t border-border" />

        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-xplora-accent-green/10 flex items-center justify-center">
              <Heart className="w-7 h-7 text-xplora-accent-green" />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Values</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl">What we stand for</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: t('about.localFirst'),
                body: 'Every experience, partner, and perk is rooted in Québec City. We lift up the businesses and people that make this city worth exploring.',
              },
              {
                title: t('about.realOverPolished'),
                body: 'We skip the tourist-trap energy. Xplora is for people who want the honest, lived-in version of the city — whether they just arrived or have been here for years.',
              },
              {
                title: t('about.discovery'),
                body: "We're not a feed. Every experience and perk on Xplora is hand-picked — no sponsored results, no generic lists.",
              },
              {
                title: t('about.showUp'),
                body: 'Belonging is built by presence. We design everything — events, itineraries, perks — to give you a reason to actually get out the door.',
              },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-border rounded-2xl p-6 space-y-2">
                <h3 className="text-base font-medium text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <SimpleFooter />
    </div>
  );
}
