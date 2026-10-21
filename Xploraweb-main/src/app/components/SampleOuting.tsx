import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { sampleOuting } from '../data/sampleOuting';
import { buildGoogleMapsUrl } from '../lib/maps';
import { SPOT_CATEGORY_KEY, type Spot } from '../data/products';

const SampleMap = lazy(() => import('./NeighbourhoodSpotsMap').then(module => ({ default: module.NeighbourhoodSpotsMap })));

export function SampleOuting({ spots }: { spots: Spot[] }) {
  const { t } = useTranslation();
  const [mapOpen, setMapOpen] = useState(false);
  const sample = useMemo(() => sampleOuting(spots), [spots]);
  if (sample.length !== 3) return null;
  const mapsUrl = buildGoogleMapsUrl(sample.map((spot, i) => ({ order: i + 1, note: '', spot })))!;
  return (
    <section id="sample-outing" aria-labelledby="sample-outing-title" className="max-w-7xl mx-auto px-6 md:px-8 pb-10 scroll-mt-24">
      <div className="rounded-3xl bg-card p-5 md:p-8">
        <p className="text-xs text-primary uppercase tracking-widest">{sample[0].neighbourhood}</p>
        <h2 id="sample-outing-title" className="font-serif text-2xl text-xplora-ink mt-2">{t('outingStarters.sampleTitle')}</h2>
        <p className="text-sm text-muted-foreground mt-2">{t('outingStarters.realSampleBody')}</p>
        <ol className="grid sm:grid-cols-3 gap-4 mt-5">
          {sample.map((spot, i) => (
            <li key={spot.id} className="rounded-2xl overflow-hidden bg-muted/30">
              {spot.image && <img src={spot.image} alt={spot.name} loading="lazy" decoding="async" className="w-full h-40 object-cover" />}
              <div className="p-4">
                <p className="text-xs text-muted-foreground">{i + 1}. {t(`categories.${SPOT_CATEGORY_KEY[spot.category || '']}`, spot.category || '')}</p>
                <h3 className="font-semibold text-sm mt-1">{spot.name}</h3>
                {spot.address && <p className="text-xs text-muted-foreground mt-2">{spot.address}</p>}
                {spot.xploraTips?.[0] && <p className="text-sm text-muted-foreground mt-2">{spot.xploraTips[0]}</p>}
              </div>
            </li>
          ))}
        </ol>
        <details className="mt-4" onToggle={event => setMapOpen(event.currentTarget.open)}>
          <summary className="min-h-11 content-center cursor-pointer text-sm text-primary">{t('outingStarters.showSampleMap')}</summary>
          {mapOpen && <Suspense fallback={<p className="p-4 text-sm">{t('outingStarters.loadingMap')}</p>}>
            <SampleMap spots={sample} center={[sample[0].lat!, sample[0].lng!]} boundary={null} route={sample.map(spot => [spot.lat!, spot.lng!] as [number, number])} numbered showFilters={false} height={300} />
          </Suspense>}
          <p className="text-xs text-muted-foreground mt-2">{t('outingStarters.sampleMapNote')}</p>
        </details>
        <p className="text-xs text-muted-foreground mt-3">{t('outingStarters.realSampleNote')}</p>
        <div className="flex flex-wrap gap-x-5 mt-3 text-sm">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{t('outingStarters.openSampleRoute')}</a>
          <Link to={`/itinerary?starter=culture&neighbourhood=${encodeURIComponent(sample[0].neighbourhood!)}`} className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">{t('outingStarters.sampleCta')}</Link>
        </div>
      </div>
    </section>
  );
}
