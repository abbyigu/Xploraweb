import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  Map as MapIcon, List as ListIcon, Play, Pencil, Clock, Footprints, Gauge, MapPin,
  Heart, Sparkles, Gift, Signpost, Pin, RefreshCw,
} from 'lucide-react';
import { SaveSpotButton } from './SaveSpotButton';
import { NeighbourhoodSpotsMap } from './NeighbourhoodSpotsMap';
import { buildGoogleMapsUrl } from '../lib/maps';
import { isJourneyStep } from '../data/itineraryFilters';
import { SPOT_CATEGORY_KEY } from '../data/products';
import type { GeneratedItinerary, Pace } from '../data/itineraryFilters';
import type { Spot } from '../data/products';

interface Props {
  itinerary: GeneratedItinerary;
  /** Save / Copy-link / Share / Remove — whatever action set fits the
   * context this view is rendered in (ephemeral preview vs. /i/:slug page). */
  actions?: React.ReactNode;
  /** Full-width block under the hero — e.g. a "Your itinerary is saved!"
   * success confirmation with its share link. */
  banner?: React.ReactNode;
  /** Ids of stops the traveller has pinned — kept in place across a
   * regeneration. Omitted (with onTogglePin) where pinning doesn't apply,
   * e.g. the saved/public /i/:slug view. */
  pinnedSpotIds?: Set<string>;
  onTogglePin?: (spotId: string) => void;
  /** Re-run generation with the current filters — surfaced as the "Make it
   * yours" regenerate link. Omitted where regeneration doesn't apply. */
  onRegenerate?: () => void;
  /** Scrolls back to the filter panel so the traveller can adjust and
   * regenerate — surfaced as the hero "Modify" button. Omitted where there's
   * no filter panel to return to (e.g. the saved/public /i/:slug view). */
  onModify?: () => void;
  /** The pace this route was generated with — only known at generation time,
   * so omitted (and hidden) on the saved/shared view. */
  pace?: Pace;
}

const EARTH_RADIUS_M = 6371000;
const WALK_METERS_PER_MIN = 75; // ~4.5 km/h casual walking pace

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Rough walk time/distance between two spots, from their coordinates — a
 * straight-line estimate for display only, not a real route (see
 * api/_itineraryLogic.ts for the real Google-routed distance used server-side). */
function estimateWalk(a: Spot, b: Spot): { minutes: number; meters: number } | null {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
  const meters = haversineMeters({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
  return { minutes: Math.max(1, Math.round(meters / WALK_METERS_PER_MIN)), meters };
}

function formatMeters(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function primaryNeighbourhood(itinerary: GeneratedItinerary): string | null {
  const counts = new Map<string, number>();
  for (const item of itinerary.stops) {
    const n = item.spot.neighbourhood;
    if (!n) continue;
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [n, c] of counts) {
    if (c > bestCount) { best = n; bestCount = c; }
  }
  return best;
}

function orderedCategories(itinerary: GeneratedItinerary, max = 4): string[] {
  const seen: string[] = [];
  for (const item of itinerary.stops) {
    const c = item.spot.category;
    if (c && !seen.includes(c)) seen.push(c);
    if (seen.length >= max) break;
  }
  return seen;
}

function durationBucketKey(minutes: number): 'short' | 'half' | 'full' {
  if (minutes <= 150) return 'short';
  if (minutes <= 330) return 'half';
  return 'full';
}

/** The full stop-by-stop view of one itinerary — hero, info bar, stops + map,
 * shared by the pre-save preview dialog, the full-width generator result, and
 * the permanent /i/:slug page. */
export function ItineraryFullView({ itinerary, actions, banner, pinnedSpotIds, onTogglePin, onRegenerate, onModify, pace }: Props) {
  const { t } = useTranslation();
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [michelinOnly, setMichelinOnly] = useState(false);

  const mapsUrl = buildGoogleMapsUrl(itinerary.stops);

  const stopsWithCoords = itinerary.stops.filter(s => s.spot.lat != null && s.spot.lng != null);
  const route: [number, number][] = stopsWithCoords.map(s => [s.spot.lat!, s.spot.lng!]);
  const firstStop = stopsWithCoords[0]?.spot;
  const center: [number, number] | null = firstStop ? [firstStop.lat!, firstStop.lng!] : null;

  const heroImage = itinerary.stops.find(s => s.spot.image)?.spot.image;
  const location = primaryNeighbourhood(itinerary) ?? t('itineraryBuilder.locationFixed');
  const categories = orderedCategories(itinerary);

  let totalWalkMinutes = 0;
  let totalWalkMeters = 0;
  for (let i = 0; i < itinerary.stops.length - 1; i++) {
    const walk = estimateWalk(itinerary.stops[i].spot, itinerary.stops[i + 1].spot);
    if (walk) { totalWalkMinutes += walk.minutes; totalWalkMeters += walk.meters; }
  }
  const stopsMinutes = Math.max(0, itinerary.estimatedDurationMin - totalWalkMinutes);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Hero */}
        <div className="relative h-[420px] md:h-[460px] rounded-3xl overflow-hidden bg-xplora-ink">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-xplora-ink to-xplora-primary">
              <MapPin className="w-10 h-10 text-white/40" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-xplora-ink/90 via-xplora-ink/55 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {location}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-tight mb-3">
              {itinerary.title}
            </h2>
            <p className="text-sm md:text-[15px] text-white/85 leading-relaxed mb-5 line-clamp-4">
              {itinerary.summary}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/90 mb-6">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.resultDurationLabel', { duration: itinerary.estimatedDurationMin })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Footprints className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.resultDistanceLabel', { distance: itinerary.estimatedDistanceKm })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" aria-hidden="true" /> {t(`itineraryBuilder.duration.${durationBucketKey(itinerary.estimatedDurationMin)}`)}
              </span>
              {pace && (
                <span className="inline-flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" aria-hidden="true" /> {t(`itineraryBuilder.paceOption.${pace}`)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
                >
                  <Play className="w-4 h-4 fill-white" aria-hidden="true" />
                  {t('itineraryFullView.startItinerary')}
                </a>
              )}
              {actions}
              {onModify && (
                <button
                  type="button"
                  onClick={onModify}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition"
                >
                  <Pencil className="w-4 h-4" aria-hidden="true" />
                  {t('itineraryBuilder.modify')}
                </button>
              )}
            </div>
          </div>
        </div>

        {banner}

        {/* Info bar */}
        <div className="mt-4 rounded-2xl border border-border bg-muted/40 px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.location')}
            </p>
            <p className="text-sm font-medium text-xplora-ink">{location}</p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              <Heart className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.interests')}
            </p>
            <p className="text-sm font-medium text-xplora-ink">
              {categories.map((c, i) => `${i + 1}. ${t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}`).join(', ')}
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryFullView.durationLabel')}
            </p>
            <p className="text-sm font-medium text-xplora-ink">
              {t(`itineraryBuilder.duration.${durationBucketKey(itinerary.estimatedDurationMin)}`)}, {t('itineraryBuilder.resultDurationLabel', { duration: itinerary.estimatedDurationMin })}
            </p>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              <Gauge className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.pace')}
            </p>
            <p className="text-sm font-medium text-xplora-ink">{pace ? t(`itineraryBuilder.paceOption.${pace}`) : '—'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8 md:grid md:grid-cols-[1fr_380px] md:gap-8 md:items-start">
        {/* Stops */}
        <div className={mobileView === 'map' ? 'hidden md:block' : 'block'}>
          {itinerary.stops.map((item, i) => {
            const isLast = i === itinerary.stops.length - 1;

            if (isJourneyStep(item)) {
              return (
                <div key={item.spot.id} className="flex gap-4">
                  <div className="flex flex-col items-center w-9 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                      <Footprints className="w-4 h-4" aria-hidden="true" />
                    </div>
                    {!isLast && <div className="flex-1 border-l-2 border-dashed border-border mt-2" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-6 pt-2">
                    <p className="text-sm text-muted-foreground italic">{item.description}</p>
                    {item.spot.name && <p className="text-xs text-muted-foreground/70 mt-0.5">{item.spot.name}</p>}
                  </div>
                </div>
              );
            }

            const next = itinerary.stops[i + 1];
            const walk = !isLast && next && !isJourneyStep(next) ? estimateWalk(item.spot, next.spot) : null;
            const pinned = pinnedSpotIds?.has(item.spot.id) ?? false;
            const categoryLabel = item.spot.category ? t(`categories.${SPOT_CATEGORY_KEY[item.spot.category]}`, item.spot.category) : null;

            return (
              <div key={item.spot.id} className="flex gap-4">
                <div className="flex flex-col items-center w-9 flex-shrink-0 text-center">
                  <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {item.order}
                  </div>
                  {categoryLabel && <p className="text-[10px] font-bold uppercase tracking-wide text-primary mt-2 leading-tight">{categoryLabel}</p>}
                  {item.spot.visitTime && <p className="text-[11px] text-muted-foreground leading-tight">{item.spot.visitTime}</p>}
                  {!isLast && <div className="flex-1 border-l-2 border-dashed border-border mt-2" />}
                </div>

                <div className="flex-1 min-w-0 pb-6">
                  <div className="rounded-2xl border border-border bg-card overflow-hidden flex">
                    <div className="w-28 sm:w-36 flex-shrink-0 bg-muted">
                      {item.spot.image ? (
                        <img src={item.spot.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MapPin className="w-6 h-6" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 p-4 relative">
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {onTogglePin && (
                          <button
                            type="button"
                            onClick={() => onTogglePin(item.spot.id)}
                            aria-pressed={pinned}
                            aria-label={t(pinned ? 'itineraryBuilder.unpinSpot' : 'itineraryBuilder.pinSpot')}
                            title={t(pinned ? 'itineraryBuilder.unpinSpot' : 'itineraryBuilder.pinSpot')}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              pinned ? 'bg-[#12343B] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
                          </button>
                        )}
                        <SaveSpotButton spot={item.spot} className="w-7 h-7 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground flex items-center justify-center transition-colors" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-xplora-ink leading-tight pr-16">{item.spot.name}</h3>
                      {item.spot.description && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.spot.description}</p>}
                      {item.spot.perk && (
                        <div className="mt-3 flex items-start gap-2 bg-xplora-icon-bg rounded-xl p-3">
                          <Gift className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                          <div>
                            <p className="text-xs font-semibold text-xplora-ink">{t('itineraryFullView.perkLabel')}</p>
                            <p className="text-xs text-muted-foreground">{item.spot.perk}</p>
                          </div>
                        </div>
                      )}
                      {item.note && <p className="text-xs text-muted-foreground italic mt-2">{item.note}</p>}
                    </div>
                  </div>
                  {walk && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 ml-1">
                      <Footprints className="w-3.5 h-3.5" aria-hidden="true" />
                      {t('itineraryFullView.walkMinutes', { count: walk.minutes })}, {formatMeters(walk.meters)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Single map instance, kept mounted across the mobile list/map toggle — swapping visibility via
            CSS instead of unmount/remount avoids re-running Leaflet's expensive init on every tap. */}
        <div className={`${mobileView === 'map' ? 'block' : 'hidden'} md:block space-y-4 md:sticky md:top-6`}>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-xplora-ink mb-3">{t('itineraryFullView.yourRoute')}</p>
            <NeighbourhoodSpotsMap
              spots={stopsWithCoords.map(s => s.spot)}
              center={center}
              boundary={null}
              route={route}
              websiteLabel={t('neighbourhoodDetail.website', 'Website')}
              michelinLabel={t('neighbourhoodDetail.michelinGuide', 'Michelin Guide')}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              michelinOnly={michelinOnly}
              onMichelinChange={setMichelinOnly}
              numbered
              showFilters={false}
              height={280}
              visible={mobileView === 'map'}
            />
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-xplora-ink">{t('itineraryFullView.total')}</span>
                <span className="text-muted-foreground">
                  {t('itineraryBuilder.resultDurationLabel', { duration: itinerary.estimatedDurationMin })} · {t('itineraryBuilder.resultDistanceLabel', { distance: itinerary.estimatedDistanceKm })}
                  {pace && ` · ${t(`itineraryBuilder.paceOption.${pace}`)}`}
                </span>
              </div>
              <div className="border-t border-dashed border-border pt-2.5 flex items-center justify-between">
                <span className="text-muted-foreground">{t('itineraryFullView.walking')}</span>
                <span className="text-muted-foreground">{t('itineraryFullView.walkMinutes', { count: totalWalkMinutes })} ({formatMeters(totalWalkMeters)})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t('itineraryFullView.stops')}</span>
                <span className="text-muted-foreground">{t('itineraryBuilder.resultDurationLabel', { duration: stopsMinutes })}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-xplora-ink">{t('itineraryFullView.perksCardTitle')}</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{t('itineraryFullView.perksCardBody')}</p>
              <Link to="/perks" className="text-xs font-medium text-primary hover:underline">
                {t('itineraryFullView.perksCardCta')} →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
              <Signpost className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-xplora-ink">{t('itineraryFullView.tipsCardTitle')}</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{t('itineraryFullView.tipsCardBody')}</p>
              <Link to="/faq" className="text-xs font-medium text-primary hover:underline">
                {t('itineraryFullView.tipsCardCta')} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {onRegenerate && (
        <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8">
          <div className="rounded-2xl border border-border bg-muted/40 p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="w-10 h-10 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-xplora-ink">{t('itineraryFullView.makeItYours')}</p>
              <p className="text-xs text-muted-foreground">{t('itineraryFullView.makeItYoursBody')}</p>
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              {t('itineraryBuilder.regenerate')}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setMobileView(v => (v === 'map' ? 'list' : 'map'))}
        className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#12343B] text-white text-sm font-medium shadow-lg"
      >
        {mobileView === 'map'
          ? <><ListIcon className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.listView')}</>
          : <><MapIcon className="w-4 h-4" aria-hidden="true" /> {t('itineraryBuilder.mapView')}</>}
      </button>
    </div>
  );
}
