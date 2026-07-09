import { useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Footer } from './Footer';
import { NotifyMeForm } from './NotifyMeForm';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';

export function MembershipScreen() {
  const { t } = useTranslation();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  const perks = [
    { icon: '🎟️', text: t('membership.earlyAccess') },
    { icon: '💸', text: t('membership.memberPricing') },
    { icon: '👫', text: t('membership.guestPass') },
    { icon: '🍸', text: t('membership.fiveASept') },
    { icon: '🔓', text: t('membership.perks') },
    { icon: '🎁', text: t('membership.surprises') },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title={t('membership.seoTitle')}
        description={t('membership.seoDesc')}
        canonical="/membership"
      />
      <div className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground px-6 md:px-8 pt-8 pb-10 rounded-b-[3rem] md:rounded-none">
        <div className="max-w-2xl lg:max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
            {t('membership.previewBadge')}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2">{t('membership.title')}</h1>
          <p className="text-sm md:text-base opacity-90">{t('membership.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl lg:max-w-3xl mx-auto px-6 md:px-8 py-8 lg:py-12 space-y-6 lg:space-y-8">

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 bg-muted rounded-full p-1 w-fit mx-auto">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm transition-all ${billing === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t('membership.monthly')}
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t('membership.yearly')}
            <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{t('membership.save')}</span>
          </button>
        </div>

        {/* Price card */}
        <div className="bg-card border-2 border-primary rounded-3xl p-6 md:p-8 text-center shadow-sm">
          <div className="mb-1">
            {billing === 'monthly' ? (
              <>
                <span className="text-5xl font-serif">$10</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </>
            ) : (
              <>
                <span className="text-5xl font-serif">$100</span>
                <span className="text-muted-foreground text-lg">/year</span>
                <p className="text-sm text-secondary mt-1">{t('membership.yearlyDetail')}</p>
              </>
            )}
          </div>

          <div className="mt-6 w-full py-3.5 rounded-2xl text-base font-medium bg-muted text-muted-foreground">
            {t('membership.comingSoon')}
          </div>

          <div className="mt-4 text-left bg-muted/40 border border-border rounded-2xl p-4 space-y-2">
            <p className="text-sm text-muted-foreground">{t('membership.previewNotice')}</p>
            <NotifyMeForm />
          </div>
        </div>

        {/* Perks list */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-4">
          <h2 className="text-lg mb-2">{t('membership.whatsIncluded')}</h2>
          {perks.map((perk) => (
            <div key={perk.text} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{perk.icon}</span>
              <span className="text-sm md:text-base text-foreground">{perk.text}</span>
            </div>
          ))}
        </div>

        {/* Already a member? */}
        <p className="text-center text-sm text-muted-foreground">
          {t('membership.alreadyMember')}{' '}
          <button onClick={() => navigate('/login')} className="text-primary underline underline-offset-2">
            {t('membership.logIn')}
          </button>
        </p>

      </div>

      <Footer />
    </div>
  );
}
