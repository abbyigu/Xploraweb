import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { OUTING_STARTERS } from '../data/outingStarters';

export function OutingStarters() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="outing-starters-title" className="max-w-7xl mx-auto px-6 md:px-8 py-8">
      <h2 id="outing-starters-title" className="font-serif text-2xl text-xplora-ink">{t('outingStarters.title')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('outingStarters.subtitle')}</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {OUTING_STARTERS.map(starter => (
          <Link key={starter.id} to={`/itinerary?starter=${starter.id}`} className="rounded-2xl bg-card border border-border p-4 hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2">
            <h3 className="text-sm font-semibold">{t(`outingStarters.${starter.id}.title`)}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t(`outingStarters.${starter.id}.body`)}</p>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{t('outingStarters.accountNote')} <Link to="/membership" className="text-primary underline underline-offset-4">{t('outingStarters.plans')}</Link></p>
    </section>
  );
}
