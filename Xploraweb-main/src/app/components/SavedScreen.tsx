import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Heart, ExternalLink, User, MapPin, Star, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchSavedItineraries, deleteSavedItinerary } from '../lib/savedItineraries';
import type { SavedItinerary } from '../lib/savedItineraries';
import { buildGoogleMapsUrl } from '../lib/maps';
import { getSavedSpots, removeSavedSpot, onSavedSpotsChange } from '../lib/savedSpots';
import { SPOT_CATEGORY_KEY } from '../data/products';
import { useSaveUsage } from '../hooks/useSaveUsage';
import { Footer } from './Footer';
import { XploraLogo } from './XploraLogo';
import { SpotReviewForm } from './SpotReviewForm';
import { PremiumLimitModal } from './PremiumLimitModal';

/** Standalone "Saved" collection page — itineraries and places, reachable
 * from the header/bottom-nav heart icon. Split out of the account
 * dashboard's old inline "Saved" tab so it reads as its own destination
 * rather than a settings sub-page. (Booked experiences left out for now.) */
export function SavedScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [savedItineraries, setSavedItineraries] = useState<SavedItinerary[]>([]);
  const [copiedItineraryId, setCopiedItineraryId] = useState<string | null>(null);
  const [savedSpots, setSavedSpots] = useState(() => getSavedSpots());
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const { usage: saveUsage, refresh: refreshSaveUsage } = useSaveUsage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setIsGuest(true);
        setLoading(false);
        return;
      }
      setLoading(false);
      fetchSavedItineraries().then(setSavedItineraries);
    });
  }, []);

  useEffect(() => onSavedSpotsChange(() => setSavedSpots(getSavedSpots())), []);

  const removeItinerary = async (id: string) => {
    setSavedItineraries((prev) => prev.filter((i) => i.id !== id));
    await deleteSavedItinerary(id);
    refreshSaveUsage();
  };

  const copyItineraryLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/i/${slug}`).then(() => {
      setCopiedItineraryId(id);
      setTimeout(() => setCopiedItineraryId((prev) => (prev === id ? null : prev)), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('account.loading')}</p>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-sm w-full text-center">
            <div className="flex justify-center mb-6">
              <XploraLogo variant="full" className="h-14" />
            </div>
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Heart className="w-9 h-9 text-muted-foreground" />
            </div>
            <h1 className="text-2xl mb-2">{t('saved.title')}</h1>
            <p className="text-muted-foreground mb-8">{t('saved.guestPrompt')}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity font-medium"
              >
                {t('account.logIn')}
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full border border-border py-3 rounded-xl hover:bg-muted transition-colors font-medium"
              >
                {t('account.createAccount')}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const savedCount = savedItineraries.length + savedSpots.length;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-2">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">{t('saved.eyebrow')}</p>
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <h1 className="font-serif text-3xl font-semibold text-xplora-ink">{t('saved.title')}</h1>
          {savedCount > 0 && (
            <p className="text-sm text-muted-foreground">{t('saved.countLabel', { count: savedCount })}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-8">

        {!saveUsage.premium && (
          <div className="bg-muted/40 border border-border rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 w-full">
              <p className="text-sm font-medium">{t('itineraryBuilder.freePlanTitle', { limit: saveUsage.limit })}</p>
              <p className="text-xs text-muted-foreground mb-1.5">{t('itineraryBuilder.freePlanUsed', { count: saveUsage.count, limit: saveUsage.limit })}</p>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (saveUsage.count / saveUsage.limit) * 100)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPremiumModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition flex-shrink-0"
            >
              {t('itineraryBuilder.seePlans')}
            </button>
          </div>
        )}

        {/* Saved Itineraries */}
        <div>
          <h3 className="text-xl mb-4">{t('account.savedItineraries')}</h3>
          {savedItineraries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">{t('account.noItineraries')}</p>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
              {savedItineraries.map((item) => {
                const mapsUrl = buildGoogleMapsUrl(item.stops);
                const thumb = item.stops.find((s) => s.spot.image)?.spot.image;
                const ratingValues = Object.values(item.stopRatings);
                const avgRating = ratingValues.length > 0
                  ? ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length
                  : null;
                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid mb-3 bg-card rounded-2xl overflow-hidden border border-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/i/${item.slug}`, { state: { owned: true, itineraryId: item.id } })}
                  >
                    <div className="relative">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-auto block" />
                      ) : (
                        <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-full bg-black/70 text-white uppercase tracking-wide pointer-events-none">
                        {t('saved.itineraryBadge')}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeItinerary(item.id); }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center transition-colors"
                        aria-label={t('common.remove')}
                      >
                        <Heart className="w-4 h-4 fill-secondary text-secondary" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold mb-1 truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t('itineraryBuilder.resultMeta', { duration: item.estimatedDurationMin, distance: item.estimatedDistanceKm })}
                        {' · '}{new Date(item.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-CA' : 'en-CA')}
                      </p>
                      {avgRating !== null && (
                        <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${item.reviewStatus === 'pending' ? 'text-amber-700' : 'text-amber-600'}`}>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          {avgRating.toFixed(1)} · {item.reviewStatus === 'pending' ? t('saved.reviewPending') : t('saved.reviewed')}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {t('account.openMaps')} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {item.slug && (
                          <button
                            onClick={(e) => { e.stopPropagation(); copyItineraryLink(item.slug!, item.id); }}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {copiedItineraryId === item.id ? t('itineraryBuilder.linkCopied') : t('account.copyLink')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Places */}
        <div>
          <h3 className="text-xl mb-4">{t('saved.places')}</h3>
          {savedSpots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">{t('saved.noPlaces')}</p>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
              {savedSpots.map((spot) => (
                <div key={spot.id} className="break-inside-avoid mb-3 bg-card rounded-2xl overflow-hidden border border-border">
                  <div className="relative">
                    {spot.image ? (
                      <img src={spot.image} alt={spot.name} className="w-full h-auto block" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    {spot.category && (
                      <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-1 rounded-full bg-black/70 text-white uppercase tracking-wide pointer-events-none">
                        {t(`categories.${SPOT_CATEGORY_KEY[spot.category]}`, spot.category)}
                      </span>
                    )}
                    <button
                      onClick={() => removeSavedSpot(spot.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center transition-colors"
                      aria-label={t('saved.removePlace')}
                    >
                      <Heart className="w-4 h-4 fill-secondary text-secondary" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold mb-1 truncate">{spot.name}</h4>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {typeof spot.googleRating === 'number' && (
                        <>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                          {spot.googleRating.toFixed(1)}
                          {typeof spot.googleReviewCount === 'number' && <>({spot.googleReviewCount})</>}
                          {spot.neighbourhood && <>·</>}
                        </>
                      )}
                      {spot.neighbourhood}
                    </span>
                    <SpotReviewForm spotId={spot.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <User className="w-3.5 h-3.5" aria-hidden="true" /> {t('saved.backToAccount')}
        </button>
      </div>

      <PremiumLimitModal open={premiumModalOpen} onOpenChange={setPremiumModalOpen} />

      <Footer />
    </div>
  );
}
