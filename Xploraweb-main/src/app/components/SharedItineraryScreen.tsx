import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Share2, Trash2, ArrowLeft, Sparkles, Loader2, MapPin, Star, MessageCircle } from 'lucide-react';
import { ItineraryFullView } from './ItineraryFullView';
import { ItineraryScrapbook } from './ItineraryScrapbook';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { deleteSavedItinerary, fetchSavedItineraryById } from '../lib/savedItineraries';
import type { SavedItinerary } from '../lib/savedItineraries';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface LocationState {
  owned?: boolean;
  itineraryId?: string;
}

type Status = 'loading' | 'ready' | 'notFound' | 'error';

export function SharedItineraryScreen() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const state = (location.state || {}) as LocationState;

  const [status, setStatus] = useState<Status>('loading');
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [scrapbook, setScrapbook] = useState<SavedItinerary | null>(null);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      setStatus('notFound');
      return;
    }

    async function load() {
      // Owner viewing their own saved itinerary: fetch the full row (RLS-scoped)
      // so photos/notes/extra spots/ratings are available for the scrapbook card.
      if (state.owned && state.itineraryId) {
        const own = await fetchSavedItineraryById(state.itineraryId);
        if (own) {
          setItinerary(own);
          setScrapbook(own);
          setStatus('ready');
          return;
        }
      }
      try {
        const res = await fetch(`/api/get-shared-itinerary?slug=${encodeURIComponent(slug!)}`);
        if (res.status === 404) {
          setStatus('notFound');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        setItinerary(await res.json());
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: itinerary?.title, url: shareUrl });
        return;
      } catch {
        // User cancelled the native share sheet, or it's unsupported for this
        // payload — fall back to copying the link instead of failing silently.
      }
    }
    copyLink();
  }

  async function handleRemove() {
    if (!state.itineraryId) return;
    setRemoving(true);
    await deleteSavedItinerary(state.itineraryId);
    navigate('/saved');
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'notFound' || status === 'error' || !itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-3">
        <h1 className="text-xl font-medium">{t('sharedItinerary.notFoundTitle')}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">{t('sharedItinerary.notFoundBody')}</p>
        <button
          onClick={() => navigate('/itinerary')}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
        >
          {t('sharedItinerary.backToGenerator')}
        </button>
      </div>
    );
  }

  const heroImage = itinerary.stops.find(s => s.spot.image)?.spot.image;

  // Show the scrapbook form itself only once the visitor asks for it (the
  // "Leave a review" button) — but once it has real content, keep showing it
  // as-is on future visits instead of collapsing back behind the button.
  const hasScrapbookContent = !!scrapbook && (
    scrapbook.photos.length > 0 ||
    scrapbook.notes.trim().length > 0 ||
    scrapbook.extraSpots.length > 0 ||
    Object.keys(scrapbook.stopRatings).length > 0
  );
  const showScrapbook = hasScrapbookContent || reviewOpen;

  const actions = (
    <>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition"
      >
        {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
        {copied ? t('itineraryBuilder.linkCopied') : t('sharedItinerary.copyLink')}
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition"
      >
        <Share2 className="w-4 h-4" aria-hidden="true" />
        {t('sharedItinerary.share')}
      </button>
      {state.owned && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-60"
        >
          {removing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
          {t('sharedItinerary.remove')}
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO title={itinerary.title} description={itinerary.summary} canonical={`/i/${slug}`} />
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/saved')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> {t('sharedItinerary.returnToSaved')}
          </button>
          <button
            onClick={() => navigate(`/itinerary?similarTo=${slug}`)}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" /> {t('sharedItinerary.generateSimilar')}
          </button>
        </div>

        <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden bg-xplora-ink">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-xplora-ink to-xplora-primary">
              <MapPin className="w-10 h-10 text-white/40" aria-hidden="true" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-xplora-ink/85 via-xplora-ink/10 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 md:bottom-7 md:left-8 md:right-8">
            <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
              {t('sharedItinerary.savedItineraryLabel')}
            </p>
            <h1 className="font-serif text-2xl md:text-[30px] font-semibold text-white leading-tight">
              {itinerary.title}
            </h1>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <ItineraryFullView itinerary={itinerary} actions={actions} hideTitle />
      </div>
      {scrapbook ? (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-4">
          {showScrapbook ? (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <ItineraryScrapbook itinerary={scrapbook} onChange={setScrapbook} standalone />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-border rounded-2xl py-4 text-sm font-medium text-xplora-ink hover:bg-muted/50 transition"
            >
              <Star className="w-4 h-4 text-secondary" aria-hidden="true" />
              {t('sharedItinerary.reviewButton')}
            </button>
          )}
        </div>
      ) : itinerary.review && (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pt-10 pb-4">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <h4 className="text-lg font-medium text-xplora-ink">{t('sharedItinerary.reviewTitle')}</h4>
              {itinerary.review.avgRating !== null && (
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-4 h-4 ${n <= Math.round(itinerary.review!.avgRating!) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} aria-hidden="true" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">{itinerary.review.avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {itinerary.review.notes && <p className="text-sm text-foreground leading-relaxed">"{itinerary.review.notes}"</p>}
            {itinerary.review.photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {itinerary.review.photos.map((url) => (
                  <img key={url} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                ))}
              </div>
            )}
            {itinerary.review.adminResponse && (
              <div className="flex items-start gap-2 bg-muted/40 border border-border rounded-xl p-3 text-sm">
                <MessageCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('sharedItinerary.adminResponseLabel')}</p>
                  <p>{itinerary.review.adminResponse}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
