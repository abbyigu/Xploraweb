import { useState } from 'react';
import { ChevronDown, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { Footer } from './Footer';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

type FaqItemData = {
  q: string;
  a: string;
  link?: { label: string; to: string };
};

function FaqItem({ q, a, link }: FaqItemData) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-medium leading-snug">{q}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform mt-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-4 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
          {link && (
            <Link
              to={link.to}
              className="inline-flex items-center gap-1 text-sm text-xplora-primary hover:underline"
            >
              {link.label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function FaqCategory({ title, items }: { title: string; items: FaqItemData[] }) {
  return (
    <section className="space-y-1">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground pb-2">{title}</h2>
      <div className="bg-card border border-border rounded-2xl px-5 divide-y divide-border">
        {items.map((item, i) => (
          <FaqItem key={i} {...item} />
        ))}
      </div>
    </section>
  );
}

export function FaqScreen() {
  const { t } = useTranslation();

  const categories = [
    {
      title: t('faq.languageTitle'),
      items: [
        {
          q: t('faq.q_language_en'),
          a: t('faq.a_language_en'),
          link: { label: t('faq.link_experiences'), to: '/itinerary' },
        },
        {
          q: t('faq.q_language_fr'),
          a: t('faq.a_language_fr'),
          link: { label: t('faq.link_experiences'), to: '/itinerary' },
        },
        { q: t('faq.q_guide'), a: t('faq.a_guide') },
      ],
    },
    {
      title: t('faq.logisticsTitle'),
      items: [
        { q: t('faq.q_meetingpoint'), a: t('faq.a_meetingpoint') },
        { q: t('faq.q_late'),         a: t('faq.a_late') },
        { q: t('faq.q_phone'),        a: t('faq.a_phone') },
      ],
    },
    {
      title: t('faq.weatherTitle'),
      items: [
        { q: t('faq.q_rain'),                 a: t('faq.a_rain') },
        { q: t('faq.q_weather_cancel'),        a: t('faq.a_weather_cancel') },
        {
          q: t('faq.q_self_guided_weather'),
          a: t('faq.a_self_guided_weather'),
          link: { label: t('faq.link_selfguided'), to: '/itinerary?category=xplorators' },
        },
      ],
    },
    {
      title: t('faq.accessibilityTitle'),
      items: [
        {
          q: t('faq.q_wheelchair'),
          a: t('faq.a_wheelchair'),
          link: { label: t('faq.link_contact'), to: '/contact' },
        },
        {
          q: t('faq.q_kids'),
          a: t('faq.a_kids'),
          link: { label: t('faq.link_family'), to: '/itinerary?vibe=familyFriendly' },
        },
        { q: t('faq.q_age'), a: t('faq.a_age') },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title={t('faq.seoTitle')}
        description={t('faq.seoDesc')}
        canonical="/faq"
      />

      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-8 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-3xl mx-auto space-y-1">
          <p className="text-xs uppercase tracking-widest opacity-60">Xplora</p>
          <h1 className="text-2xl md:text-3xl">{t('faq.headline')}</h1>
          <p className="text-sm md:text-base opacity-80">{t('faq.subheadline')}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-8 py-10 space-y-8">

        {categories.map((cat) => (
          <FaqCategory key={cat.title} title={cat.title} items={cat.items} />
        ))}

        {/* CTA */}
        <div className="border-t border-border pt-8">
          <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
            <h2 className="text-xl md:text-2xl">{t('faq.ctaTitle')}</h2>
            <p className="text-sm text-muted-foreground">{t('faq.ctaBody')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="mailto:hello@goxplora.ca"
                className="px-7 py-3.5 bg-[#12343B] text-white rounded-2xl text-sm font-medium hover:bg-[#12343B]/90 transition-opacity flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {t('faq.ctaContact')}
              </a>
              <Link
                to="/itinerary"
                className="px-7 py-3.5 bg-white/60 backdrop-blur-sm text-foreground border border-border rounded-2xl text-sm hover:bg-white/80 transition-colors flex items-center justify-center gap-2"
              >
                {t('faq.ctaExperiences')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
