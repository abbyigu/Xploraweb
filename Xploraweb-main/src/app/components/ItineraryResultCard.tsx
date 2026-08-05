import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Clock, Heart, Loader2, MapPin, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { ItineraryFullView } from './ItineraryFullView';
import { AuthModal } from './AuthModal';
import { useItinerarySave } from '../hooks/useItinerarySave';
import { SPOT_CATEGORY_KEY } from '../data/products';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  itinerary: GeneratedItinerary;
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

export function ItineraryResultCard({ itinerary }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewOpen, setViewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    saveState, savedSlug, authModalOpen, setAuthModalOpen, handleSaveClick, handleAuthenticated,
  } = useItinerarySave(itinerary);

  const coverImage = itinerary.stops[0]?.spot.image || null;
  const categories = topCategories(itinerary);
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
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
          <h3 className="text-base md:text-lg font-medium leading-tight">{itinerary.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{itinerary.summary}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {t('itineraryBuilder.resultMeta', { duration: itinerary.estimatedDurationMin, distance: itinerary.estimatedDistanceKm })}
            </span>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {categories.map(c => (
                <span key={c} className="text-[11px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
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
            className="text-sm font-medium text-[#12343B] hover:underline"
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
        <DialogContent className="sm:max-w-5xl w-[calc(100%-1.5rem)] max-h-[90vh] overflow-y-auto p-0">
          <div className="py-6">
            <ItineraryFullView itinerary={itinerary} actions={saveButton} banner={saveBanner} />
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} onAuthenticated={handleAuthenticated} />
    </>
  );
}
