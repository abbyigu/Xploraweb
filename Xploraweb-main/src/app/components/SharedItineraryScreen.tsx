import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Share2, Trash2, ArrowLeft, Sparkles, Loader2, MapPin } from 'lucide-react';
import { ItineraryFullView } from './ItineraryFullView';
import { Footer } from './Footer';
import { PageSEO } from './PageSEO';
import { deleteSavedItinerary } from '../lib/savedItineraries';
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
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!slug) {
      setStatus('notFound');
      return;
    }
    fetch(`/api/get-shared-itinerary?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
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
      })
      .catch(() => setStatus('error'));
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
    navigate('/dashboard?tab=saved');
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
            onClick={() => navigate('/dashboard?tab=saved')}
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
      <Footer />
    </div>
  );
}
