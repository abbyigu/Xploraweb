import { useState } from 'react';
import { ArrowRight, BadgeCheck, MapPin, Globe, Calendar, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { SimpleFooter } from './SimpleFooter';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

// TODO: Replace with real team data — add photos to /public/team/
const TEAM: { name: string; role: string; bio: string; photo: string; initials: string }[] = [
  {
    name: 'TODO: Name',
    role: 'TODO: Role',
    bio: 'TODO: One sentence about this person and their connection to Québec City.',
    photo: '/team/founder-1.jpg',
    initials: 'AB',
  },
  // Uncomment and fill in for a second person:
  // {
  //   name: 'TODO: Name',
  //   role: 'TODO: Role',
  //   bio: 'TODO: One sentence about this person and their connection to Québec City.',
  //   photo: '/team/founder-2.jpg',
  //   initials: 'XY',
  // },
];

function TeamCard({ member }: { member: (typeof TEAM)[0] }) {
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
        <p className="text-xs text-xplora-primary uppercase tracking-wide">{member.role}</p>
        <p className="text-sm text-muted-foreground leading-relaxed pt-1">{member.bio}</p>
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
    t('about.trust3'),
    t('about.trust4'),
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title="About Xplora — Québec City's Local Experience Guide"
        description="Xplora is built by locals who know Québec City deeply. Learn who we are, what drives us, and why we only recommend what we'd show a friend."
        canonical="/about"
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-10 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="text-xs uppercase tracking-widest opacity-60">Xplora — Québec City</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl">{t('about.headline')}</h1>
          <p className="text-sm md:text-base opacity-80 max-w-xl">{t('about.subheadline')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-12 space-y-14">

        {/* Origin story */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t('about.storyLabel')}</p>
          <p className="text-lg md:text-xl leading-relaxed text-foreground">
            {t('about.story')}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {t('about.storyDetail')}
          </p>
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

      <SimpleFooter />
    </div>
  );
}
