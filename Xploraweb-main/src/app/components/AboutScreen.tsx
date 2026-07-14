import { useState } from 'react';
import { ArrowRight, BadgeCheck, MapPin, Globe, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

const TEAM: { name: string; photo: string; initials: string }[] = [
  {
    name: 'Ariel',
    photo: '/team/founder.jpeg',
    initials: 'AB',
  },
];

function TeamCard({ member }: { member: (typeof TEAM)[0] }) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex items-start gap-5">
      <div className="flex-shrink-0">
        {!imgFailed ? (
          <img
            src={member.photo}
            alt={member.name}
            onError={() => setImgFailed(true)}
            className="w-16 h-16 rounded-2xl object-cover bg-xplora-icon-bg"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-xplora-icon-bg flex items-center justify-center text-xplora-primary font-medium text-lg">
            {member.initials}
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="font-medium text-foreground text-sm">{member.name}</p>
        <p className="text-xs text-xplora-primary uppercase tracking-wide">{t('about.founderRole')}</p>
        <p className="text-sm text-muted-foreground leading-relaxed pt-1">{t('about.founderBio')}</p>
      </div>
    </div>
  );
}

export function AboutScreen() {
  const { t } = useTranslation();

  const stats = [
    { icon: Calendar, value: t('about.stat1Value'), label: t('about.stat1Label') },
    { icon: Sparkles, value: t('about.stat2Value'), label: t('about.stat2Label') },
    { icon: Globe, value: t('about.stat3Value'), label: t('about.stat3Label') },
    { icon: MapPin, value: t('about.stat4Value'), label: t('about.stat4Label') },
  ];

  const trustPoints = [
    t('about.trust1'),
    t('about.trust2'),
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title={t('about.seoTitle')}
        description={t('about.seoDesc')}
        canonical="/about"
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-10 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-widest opacity-60">{t('about.heroEyebrow')}</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl">{t('about.headline')}</h1>
          <p className="text-sm md:text-base opacity-80 max-w-xl">{t('about.subheadline')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-12 space-y-14">

        {/* Origin story */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('about.storyLabel')}</p>
          <p className="text-lg md:text-xl leading-relaxed text-foreground">
            {t('about.storyDetail')}
          </p>
        </section>

        {/* Québec City is our backyard */}
        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl text-foreground">{t('about.backyardTitle')}</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t('about.backyardPara1')}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t('about.backyardPara2')}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
              <img src="/team/founder.jpeg" alt="Ariel B." className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Ariel B.</p>
              <p className="text-xs text-muted-foreground">{t('about.founderCaption')}</p>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-1">
              <s.icon className="w-4 h-4 text-xplora-primary mb-1" />
              <span className="text-xl font-medium text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Team */}
        <section className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t('about.teamLabel')}</p>
            <h2 className="text-xl md:text-2xl">{t('about.teamTitle')}</h2>
          </div>
          <div className="space-y-8">
            {TEAM.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Trust signals */}
        <section className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{t('about.trustLabel')}</p>
            <h2 className="text-xl md:text-2xl">{t('about.trustTitle')}</h2>
          </div>
          <ul className="space-y-3">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <BadgeCheck className="w-5 h-5 text-xplora-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-muted-foreground leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-border" />

        {/* CTA */}
        <section className="bg-card border border-border rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl md:text-2xl">{t('about.ctaTitle')}</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{t('about.ctaBody')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/itinerary"
              className="px-7 py-3.5 bg-[#12343B] text-white rounded-2xl text-sm font-medium hover:bg-[#12343B]/90 transition-opacity flex items-center justify-center gap-2"
            >
              {t('about.ctaExperiences')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-7 py-3.5 bg-white/60 backdrop-blur-sm text-foreground border border-border rounded-2xl text-sm hover:bg-white/80 transition-colors flex items-center justify-center"
            >
              {t('about.ctaContact')}
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
