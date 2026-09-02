import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Clock, Heart, Loader2, MapPin, Copy, Check, Footprints, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { ItineraryFullView } from './ItineraryFullView';
import { AuthModal } from './AuthModal';
import { PremiumLimitModal } from './PremiumLimitModal';
import { useItinerarySave } from '../hooks/useItinerarySave';
import { SPOT_CATEGORY_KEY } from '../data/products';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  itinerary: GeneratedItinerary;
  index?: number;
  /** Re-run generation with the current filters, producing a fresh set of itineraries. */
  onRegenerate?: () => void;
  /** 'full' renders the itinerary directly on the page instead of a small
   * preview card behind a dialog — used when it's the only result. */
  layout?: 'card' | 'full';
  /** Called after a successful save, so a parent tracking free-save usage can refresh it. */
  onSaved?: () => void;
  /** Ids of stops the traveller has pinned — kept in place across a regeneration. */
  pinnedSpotIds?: Set<string>;
  onTogglePin?: (spotId: string) => void;
}

function topCategories(itinerary: GeneratedItinerary, max = 3): string[] {
  const seen: string[] = [];
  for (const stop of itinerary.stops) {
    const c = stop.spot.category;
    if (c && !seen.includes(c)) seen.push(c);
    if (seen.length >= max) break;
  }
  return seen;
}

function priceRangeSummary(itinerary: GeneratedItinerary): string | null {
  const prices = [...new Set(itinerary.stops.map(s => s.spot.priceRange).filter((p): p is string => !!p))]
    .sort((a, b) => a.length - b.length);
  if (prices.length === 0) return null;
  const min = prices[0];
  const max = prices[prices.length - 1];
  return min === max ? min : `${min}-${max}`;
}

export function ItineraryResultCard({ itinerary, index, onRegenerate, layout = 'card', onSaved, pinnedSpotIds, onTogglePin }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewOpen, setViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const {
    saveState, savedSlug, authModalOpen, setAuthModalOpen, handleSaveClick, handleAuthenticated,
  } = useItinerarySave(itinerary);

  useEffect(() => {
    if (saveState === 'limitReached') setPremiumModalOpen(true);
    if (saveState === 'saved') onSaved?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveState]);

  const coverImage = itinerary.stops[0]?.spot.image || null;
  const categories = topCategories(itinerary);
  const priceLabel = priceRangeSummary(itinerary);
  const shareUrl = savedSlug ? `${window.location.origin}/i/${savedSlug}` : null;

  function copyShareLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const saveButton = (
    <button
      type="button"
      onClick={handleSaveClick}
      disabled={saveState === 'saving' || saveState === 'saved'}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition disabled:opacity-70"
    >
      {saveState === 'saving' ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        <Heart className={`w-4 h-4 ${saveState === 'saved' ? 'fill-secondary text-secondary' : ''}`} aria-hidden="true" />
      )}
      {saveState === 'saved' ? t('itineraryBuilder.saved') : t('itineraryBuilder.saveThisItinerary')}
    </button>
  );

  const regenerateButton = onRegenerate ? (
    <button
      type="button"
      onClick={() => {
        setViewOpen(false);
        onRegenerate();
      }}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition"
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" />
      {t('itineraryBuilder.regenerate')}
    </button>
  ) : null;

  const saveBanner = saveState === 'saved' ? (
    <div className="w-full mt-4 px-6 md:px-8">
      <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 space-y-2">
        <p className="font-medium text-sm">{t('itineraryBuilder.savedTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('itineraryBuilder.savedBody')}</p>
        {shareUrl && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <code className="text-xs bg-card border border-border rounded-lg px-2.5 py-1.5 truncate max-w-[240px]">{shareUrl}</code>
            <button
              type="button"
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12343B] text-white text-xs font-medium hover:opacity-90 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
              {copied ? t('itineraryBuilder.linkCopied') : t('itineraryBuilder.copyLink')}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/i/${savedSlug}`)}
              className="text-xs text-primary hover:underline"
            >
              {t('itineraryBuilder.viewSavedItinerary')}
            </button>
          </div>
        )}
      </div>
    </div>
  ) : saveState === 'error' ? (
    <p className="w-full mt-3 px-6 md:px-8 text-xs text-red-600">{t('itineraryBuilder.saveError')}</p>
  ) : null;

  if (layout === 'full') {
    return (
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="py-6">
          <ItineraryFullView itinerary={itinerary} actions={<>{saveButton}{regenerateButton}</>} banner={saveBanner} pinnedSpotIds={pinnedSpotIds} onTogglePin={onTogglePin} />
        </div>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onAuthenticated={handleAuthenticated} />
        <PremiumLimitModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          {coverImage ? (
            <img src={coverImage} alt={itinerary.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <MapPin className="w-8 h-8" aria-hidden="true" />
            </div>
          )}
          {typeof index === 'number' && (
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-xplora-ink text-white text-sm font-medium flex items-center justify-center ring-2 ring-white/80">
              {index + 1}
            </div>
          )}
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
          <h3 className="text-base md:text-lg font-medium leading-tight">{itinerary.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{itinerary.summary}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.resultDurationLabel', { duration: itinerary.estimatedDurationMin })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.resultDistanceLabel', { distance: itinerary.estimatedDistanceKm })}
            </span>
            {priceLabel && <span className="inline-flex items-center gap-1">{priceLabel}</span>}
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {categories.map(c => (
                <span key={c} className="text-[11px] font-medium px-2 py-1 rounded-full bg-muted text-foreground/80 border border-border">
                  {t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-4 md:px-5 py-3 border-t border-border">
          <button
            type="button"
            onClick={() => setViewOpen(true)}
            className="text-sm font-medium text-xplora-ink hover:underline"
          >
            {t('itineraryBuilder.viewItinerary')}
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saveState === 'saving' || saveState === 'saved'}
            aria-label={t('itineraryBuilder.saveThisItinerary')}
            className="p-2 rounded-full hover:bg-muted/60 transition disabled:opacity-70"
          >
            {saveState === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className={`w-4 h-4 ${saveState === 'saved' ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-6xl lg:max-w-[92vw] xl:max-w-[1600px] w-[calc(100%-1rem)] h-[95vh] max-h-[95vh] overflow-y-auto p-0">
          <div className="py-6">
            <ItineraryFullView itinerary={itinerary} actions={<>{saveButton}{regenerateButton}</>} banner={saveBanner} pinnedSpotIds={pinnedSpotIds} onTogglePin={onTogglePin} />
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onAuthenticated={handleAuthenticated} />
      <PremiumLimitModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />
    </>
  );
}
