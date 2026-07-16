import { Link } from 'react-router';
import { Compass, Sparkles, Users, Moon, Handshake, ArrowRight, ChevronDown } from 'lucide-react';
import { Footer } from './Footer';
import { NotifyMeForm } from './NotifyMeForm';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-base font-medium">{q}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </div>
  );
}

export function HowItWorksScreen() {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      title: t('howItWorks.step1title'),
      desc: t('howItWorks.step1desc'),
    },
    {
      number: '02',
      title: t('howItWorks.step2title'),
      desc: t('howItWorks.step2desc'),
    },
    {
      number: '03',
      title: t('howItWorks.step3title'),
      desc: t('howItWorks.step3desc'),
    },
  ];

  const types = [
    {
      icon: Compass,
      title: t('howItWorks.xploratorsTitle'),
      desc: t('howItWorks.xploratorsDesc'),
      accent: 'bg-primary/10 text-primary',
      link: '/itinerary',
      live: true,
    },
    {
      icon: Sparkles,
      title: t('howItWorks.xploratorsPlus'),
      desc: t('howItWorks.xploratorsPlus_desc'),
      accent: 'bg-secondary/10 text-secondary',
      link: null,
      live: false,
    },
    {
      icon: Users,
      title: t('howItWorks.xploratoursTitle'),
      desc: t('howItWorks.xploratoursDesc'),
      accent: 'bg-xplora-accent-teal/10 text-xplora-accent-teal',
      link: null,
      live: false,
    },
    {
      icon: Moon,
      title: t('howItWorks.xploranightsTitle'),
      desc: t('howItWorks.xploranightsDesc'),
      accent: 'bg-xplora-accent-green/10 text-xplora-accent-green',
      link: null,
      live: false,
    },
    {
      icon: Handshake,
      title: t('howItWorks.businessTitle'),
      desc: t('howItWorks.businessDesc'),
      accent: 'bg-muted text-foreground',
      link: '/business',
      live: true,
    },
  ];

  const faqs = [
    { q: t('howItWorks.faq1q'), a: t('howItWorks.faq1a') },
    { q: t('howItWorks.faq3q'), a: t('howItWorks.faq3a') },
    { q: t('howItWorks.faq4q'), a: t('howItWorks.faq4a') },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">

      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Xplora</p>
          <h1 className="text-2xl md:text-3xl mb-1">{t('howItWorks.title')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('howItWorks.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-14 space-y-20">

        {/* 3-step flow */}
        <section className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 md:gap-10 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">{step.number}</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <h2 className="text-xl md:text-2xl">{step.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="border-t border-border" />

        {/* Experience types */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl">{t('howItWorks.typesTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {types.map(({ icon: Icon, title, desc, accent, link, live }) => {
              const inner = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${live ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {live ? t('howItWorks.statusLive') : t('howItWorks.statusComingSoon')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-base mb-1 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </>
              );
              return link ? (
                <Link key={title} to={link} className="group bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  {inner}
                </Link>
              ) : (
                <div key={title} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3">
                  {inner}
                </div>
              );
            })}
          </div>
          <div className="bg-muted/40 border border-border rounded-2xl p-5">
            <p className="text-sm text-muted-foreground mb-3">{t('howItWorks.notifyCaption')}</p>
            <NotifyMeForm source="how_it_works" />
          </div>
        </section>

        <div className="border-t border-border" />

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl">{t('howItWorks.faqTitle')}</h2>
          <div className="bg-card border border-border rounded-2xl px-5 divide-y divide-border">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 text-center space-y-4">
            <h2 className="text-2xl md:text-3xl">{t('howItWorks.ctaTitle')}</h2>
            <Link
              to="/itinerary"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              {t('howItWorks.ctaButton')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
