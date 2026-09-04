import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import {
  Lock, Wand2, Loader2, Award, ChevronDown, ChevronUp, GripVertical, SlidersHorizontal, Sparkles, MapPin, Heart, Clock, Footprints,
  Pencil, Gift, Pin, Utensils, Coffee, Wine, Landmark, Leaf, ShoppingBag, Baby, BookOpen, IceCream2, Wallet, Users, ShieldCheck, LocateFixed,
} from 'lucide-react';
import { Footer } from './Footer';
import { EventCard } from './EventCard';
import { NotifyMeForm } from './NotifyMeForm';
import { Switch } from './ui/switch';
import { ItineraryResultsGrid } from './ItineraryResultsGrid';
import { PremiumLimitModal } from './PremiumLimitModal';
import { useExperiences } from '../hooks/useExperiences';
import { useSiteContent } from '../hooks/useSiteContent';
import { useNeighbourhoods } from '../hooks/useNeighbourhoods';
import { useSaveUsage } from '../hooks/useSaveUsage';
import {
  PRICE_RANGES, ITINERARY_CATEGORIES, SPOT_CATEGORY_KEY, DURATION_BUCKETS, PACE_OPTIONS, stopCountForBucket, isJourneyStep,
} from '../data/itineraryFilters';
import type {
  PriceRange, ItineraryGenerateRequest, GeneratedItinerary, GeneratedItinerarySet, ItineraryErrorCode, Pace, DurationBucket,
} from '../data/itineraryFilters';
import type { SpotCategory, Product } from '../data/products';
import { useTranslation } from 'react-i18next';
import { PageSEO } from './PageSEO';
import { analytics } from '../lib/analytics';

type EventTimeBucket = 'today' | 'weekend' | 'month';
type GenState = 'idle' | 'loading' | 'success' | 'error';

const ERROR_KEY: Record<ItineraryErrorCode, string> = {
  INVALID_INPUT: 'itineraryBuilder.errorLlm',
  NOT_CONFIGURED: 'itineraryBuilder.errorNotConfigured',
  NO_CANDIDATES: 'itineraryBuilder.errorNoCandidates',
  LLM_ERROR: 'itineraryBuilder.errorLlm',
  METHOD_NOT_ALLOWED: 'itineraryBuilder.errorLlm',
};

const CATEGORY_ICON: Record<SpotCategory, React.ElementType> = {
  Food: Utensils, Cafe: Coffee, Bar: Wine, Culture: Landmark, Nature: Leaf,
  Shopping: ShoppingBag, Family: Baby, History: BookOpen, Stays: MapPin, Sweets: IceCream2,
};

// Decorative-only preferences shown in the "Your preferences" summary — they
// help travellers picture the route they're about to get, but (unlike
// categories/duration/pace/price/neighbourhoods) aren't sent to the AI
// generator, which has no matching input for mood or travel party yet.
const VIBE_MOOD_OPTIONS = ['relaxed', 'romantic', 'curious', 'social', 'adventurous', 'local', 'treatYourself'] as const;
type VibeMood = (typeof VIBE_MOOD_OPTIONS)[number];

const WHO_OPTIONS = ['solo', 'couple', 'friends', 'family', 'visitors'] as const;
type Who = (typeof WHO_OPTIONS)[number];

function scrollToStep(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Great-circle distance in km — used to pick the neighbourhood closest to
// the traveller's browser-reported position after "Locate me".
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getEventTimeBucket(dateStr?: string): EventTimeBucket | 'future' | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'today';
  const dow = event.getDay();
  if (diffDays <= 7 && (dow === 0 || dow === 6)) return 'weekend';
  if (event.getFullYear() === today.getFullYear() && event.getMonth() === today.getMonth()) return 'month';
  return 'future';
}

function sortByDate(a: Product, b: Product): number {
  if (!a.eventDate && !b.eventDate) return 0;
  if (!a.eventDate) return 1;
  if (!b.eventDate) return -1;
  return a.eventDate.localeCompare(b.eventDate);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'
      }`}
    >
      {children}
    </button>
  );
}

// The ordered "visit order" list — each pill's position on screen IS its
// order, so dragging a pill (from anywhere on it) or the up/down arrows both
// visibly move it, unlike a fixed-position grid chip. Shown once 2+
// categories are selected, when order is meaningful.
function OrderPill({
  children, order, index, onMoveEarlier, onMoveLater, canMoveEarlier, canMoveLater, moveEarlierLabel, moveLaterLabel,
  onPillPointerDown, isDragging, dragOffset, isDropTarget, dragHandleLabel,
}: {
  children: React.ReactNode;
  order: number;
  index: number;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  moveEarlierLabel: string;
  moveLaterLabel: string;
  onPillPointerDown: (e: React.PointerEvent, index: number) => void;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  isDropTarget: boolean;
  dragHandleLabel: string;
}) {
  // The pill itself is the drag surface — grabbing anywhere on it (except the
  // arrow buttons, which need their own clicks) starts the drag.
  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    onPillPointerDown(e, index);
  }

  return (
    <div
      data-order-index={index}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={-1}
      aria-label={dragHandleLabel}
      style={isDragging ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` } : undefined}
      className={`relative inline-flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full text-sm bg-primary text-primary-foreground select-none [-webkit-touch-callout:none] cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'z-10 shadow-lg' : 'transition-[opacity,box-shadow]'
      } ${isDropTarget && !isDragging ? 'ring-2 ring-primary-foreground/70' : ''}`}
    >
      <GripVertical className="w-3 h-3 flex-shrink-0 opacity-60" aria-hidden="true" />
      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-primary-foreground/25 flex items-center justify-center text-[11px] font-semibold">
        {order}
      </span>
      <span className="px-0.5">{children}</span>
      <span className="flex flex-col -my-0.5">
        <button
          type="button"
          onClick={onMoveEarlier}
          disabled={!canMoveEarlier}
          aria-label={moveEarlierLabel}
          className="disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-75"
        >
          <ChevronUp className="w-3 h-3" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMoveLater}
          disabled={!canMoveLater}
          aria-label={moveLaterLabel}
          className="disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-75"
        >
          <ChevronDown className="w-3 h-3" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

function StepCard({
  id, index, icon: Icon, title, subtitle, children,
}: {
  id: string;
  index: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="bg-card border border-border rounded-3xl p-5 md:p-6 scroll-mt-24">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
            {title}
          </h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InterestTile({
  active, order, onClick, icon: Icon, label,
}: {
  active: boolean;
  order: number | null;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-2xl border text-xs font-medium text-center transition-colors ${
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/40 text-foreground'
      }`}
    >
      {order != null && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
          {order}
        </span>
      )}
      <Icon className="w-5 h-5" aria-hidden="true" />
      {label}
    </button>
  );
}

function PreferenceRow({
  icon: Icon, label, value, changeLabel, onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  changeLabel: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-sm font-medium truncate">{value}</p>
        </div>
      </div>
      <button type="button" onClick={onChange} className="text-xs text-primary font-medium flex-shrink-0 hover:underline">
        {changeLabel}
      </button>
    </div>
  );
}

export function ItineraryScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { experiences } = useExperiences();
  const { content: siteContent } = useSiteContent();
  const { neighbourhoods: neighbourhoodOptions } = useNeighbourhoods();
  const [searchParams] = useSearchParams();
  const isNightsView = searchParams.get('category') === 'xploranights';
  const similarTo = searchParams.get('similarTo');
  const [eventTimeFilter, setEventTimeFilter] = useState<EventTimeBucket | null>(null);

  const [durationKey, setDurationKey] = useState<DurationBucket['key']>('half');
  const [pace, setPace] = useState<Pace>('moderate');
  const [categories, setCategories] = useState<SpotCategory[]>([]);
  const [restaurantHopping, setRestaurantHopping] = useState(false);
  const [michelinOnly, setMichelinOnly] = useState(false);
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [neighbourhoods, setNeighbourhoods] = useState<string[]>([]);
  const [locateStatus, setLocateStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [selectedVibe, setSelectedVibe] = useState<VibeMood | null>(null);
  const [selectedWho, setSelectedWho] = useState<Who | null>(null);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [genState, setGenState] = useState<GenState>('idle');
  const [errorCode, setErrorCode] = useState<ItineraryErrorCode | null>(null);
  const [results, setResults] = useState<GeneratedItinerary[] | null>(null);
  const [genKey, setGenKey] = useState(0);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const { usage, refresh: refreshUsage } = useSaveUsage();

  // Spots the traveller has pinned — survive every regeneration. shownSpotIds
  // tracks every non-pinned spot already suggested this session, so the next
  // regeneration surfaces fresh picks instead of repeating them.
  const [pinnedSpotIds, setPinnedSpotIds] = useState<Set<string>>(new Set());
  const [shownSpotIds, setShownSpotIds] = useState<Set<string>>(new Set());

  function toggleSpotPin(spotId: string) {
    setPinnedSpotIds(prev => {
      const next = new Set(prev);
      if (next.has(spotId)) next.delete(spotId);
      else next.add(spotId);
      return next;
    });
  }

  // Pinned spot ids in the order the traveller last saw them in `results`,
  // not pin-click order — the API keeps pinned stops in this relative order
  // across a regeneration instead of letting the new fill reshuffle them.
  function orderedPinnedSpotIds(): string[] {
    if (!results) return Array.from(pinnedSpotIds);
    const ordered: string[] = [];
    for (const itinerary of results) {
      for (const item of itinerary.stops) {
        if (!isJourneyStep(item) && pinnedSpotIds.has(item.spot.id) && !ordered.includes(item.spot.id)) {
          ordered.push(item.spot.id);
        }
      }
    }
    return ordered;
  }

  // "Generate something similar" from the /i/:slug page — prefill neighbourhood(s)
  // and duration from the shared itinerary's stops, but don't auto-submit.
  useEffect(() => {
    if (!similarTo) return;
    fetch(`/api/get-shared-itinerary?slug=${encodeURIComponent(similarTo)}`)
      .then(res => (res.ok ? res.json() : null))
      .then((data: GeneratedItinerary | null) => {
        if (!data) return;
        const stopNeighbourhoods = Array.from(
          new Set(data.stops.map(s => s.spot?.neighbourhood).filter((n): n is string => !!n)),
        );
        if (stopNeighbourhoods.length > 0) setNeighbourhoods(stopNeighbourhoods);
        const count = data.stops.length;
        const closest = DURATION_BUCKETS.reduce((best, b) =>
          Math.abs(stopCountForBucket(b, false) - count) < Math.abs(stopCountForBucket(best, false) - count) ? b : best);
        setDurationKey(closest.key);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [similarTo]);

  function togglePriceRange(p: PriceRange) {
    setPriceRanges(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }
  function toggleCategory(c: SpotCategory) {
    setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }
  // Reorders the visit-order sequence in place — categories is already the
  // source of truth for both "which" and "in what order" (see toggleCategory).
  function moveCategory(index: number, direction: -1 | 1) {
    setCategories(prev => {
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  // Drag-to-reorder for the visit-order pills, driven by pointer events so it
  // works with both mouse and touch. dragFromIndex tracks the pill being
  // dragged (id ref, since the array can reorder mid-drag); dragOverIndex is
  // the current drop slot, used for the hover highlight; dragTranslate moves
  // the dragged pill with the pointer so the drag is visible, not just a
  // silent reorder on drop.
  const dragFromIndexRef = useRef<number | null>(null);
  const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragTranslate, setDragTranslate] = useState({ x: 0, y: 0 });

  function startCategoryDrag(e: React.PointerEvent, index: number) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault(); // stop the browser from starting a text selection instead of a drag
    dragFromIndexRef.current = index;
    dragStartPointRef.current = { x: e.clientX, y: e.clientY };
    setDragFromIndex(index);
    setDragOverIndex(index);
    setDragTranslate({ x: 0, y: 0 });
  }

  useEffect(() => {
    if (dragFromIndex == null) return;

    function handlePointerMove(e: PointerEvent) {
      const start = dragStartPointRef.current;
      if (start) setDragTranslate({ x: e.clientX - start.x, y: e.clientY - start.y });
      // Look past the dragged pill itself (it now sits under the pointer, translated) to find what's underneath.
      const el = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((node): node is HTMLElement => node instanceof HTMLElement && node.hasAttribute('data-order-index') && Number(node.dataset.orderIndex) !== dragFromIndexRef.current);
      if (!el) return;
      const idx = Number(el.dataset.orderIndex);
      if (!Number.isNaN(idx)) setDragOverIndex(idx);
    }
    function finishDrag() {
      const from = dragFromIndexRef.current;
      setDragOverIndex(over => {
        if (from != null && over != null && over !== from) {
          setCategories(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(over, 0, moved);
            return next;
          });
        }
        return null;
      });
      dragFromIndexRef.current = null;
      dragStartPointRef.current = null;
      setDragFromIndex(null);
      setDragTranslate({ x: 0, y: 0 });
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  }, [dragFromIndex]);

  function handleRestaurantHoppingChange(next: boolean) {
    setRestaurantHopping(next);
    if (next) setCategories([]);
    else setMichelinOnly(false);
  }
  function toggleNeighbourhood(n: string) {
    setNeighbourhoods(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);
  }

  // Finds the neighbourhood closest to the traveller's browser-reported
  // position and selects it — the geolocation coordinate itself isn't
  // precise enough to be useful to the AI generator, which filters by
  // named neighbourhood, not lat/lng.
  function handleLocateMe() {
    const located = neighbourhoodOptions.filter(
      (n): n is typeof n & { lat: number; lng: number } => n.lat != null && n.lng != null,
    );
    if (!navigator.geolocation || located.length === 0) {
      setLocateStatus('error');
      return;
    }
    setLocateStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = located.reduce((best, n) =>
          distanceKm(coords.latitude, coords.longitude, n.lat, n.lng) <
          distanceKm(coords.latitude, coords.longitude, best.lat, best.lng) ? n : best
        );
        setNeighbourhoods([nearest.name]);
        setLocateStatus('idle');
      },
      () => setLocateStatus('error'),
      { timeout: 8000 },
    );
  }

  async function handleGenerate() {
    setGenState('loading');
    setErrorCode(null);
    const bucket = DURATION_BUCKETS.find(b => b.key === durationKey) || DURATION_BUCKETS[1];
    const stopCount = stopCountForBucket(bucket, restaurantHopping);
    const body: ItineraryGenerateRequest = {
      stopCount,
      categories: restaurantHopping ? [] : categories,
      priceRanges,
      neighbourhoods,
      language: i18n.language === 'fr' ? 'fr' : 'en',
      restaurantHopping,
      michelinOnly: restaurantHopping && michelinOnly,
      pace,
      pinnedSpotIds: orderedPinnedSpotIds(),
      excludeSpotIds: Array.from(shownSpotIds).filter(id => !pinnedSpotIds.has(id)),
    };
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCode((data?.code as ItineraryErrorCode) || 'LLM_ERROR');
        setGenState('error');
        return;
      }
      const set = data as GeneratedItinerarySet;
      setResults(set.itineraries);
      setShownSpotIds(prev => {
        const next = new Set(prev);
        for (const it of set.itineraries) {
          for (const item of it.stops) {
            if (!isJourneyStep(item)) next.add(item.spot.id);
          }
        }
        return next;
      });
      setGenKey(k => k + 1);
      setGenState('success');
      setFiltersOpen(false);
      analytics.generateItinerary({ stopCount, categories, neighbourhoods });
    } catch {
      setErrorCode('LLM_ERROR');
      setGenState('error');
    }
  }

  function renderNightsSection() {
    const items = experiences.filter(e => e.category === 'xploranights');
    const sorted = [...items].sort(sortByDate);
    const filtered = eventTimeFilter
      ? sorted.filter(e => {
          const bucket = getEventTimeBucket(e.eventDate);
          if (eventTimeFilter === 'today') return bucket === 'today';
          if (eventTimeFilter === 'weekend') return bucket === 'weekend' || bucket === 'today';
          if (eventTimeFilter === 'month') return bucket !== null && bucket !== 'future';
          return true;
        })
      : sorted;

    const timeBuckets: { key: EventTimeBucket; label: string }[] = [
      { key: 'today',   label: t('events.today') },
      { key: 'weekend', label: t('events.thisWeekend') },
      { key: 'month',   label: t('events.thisMonth') },
    ];

    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          {timeBuckets.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setEventTimeFilter(prev => prev === key ? null : key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                eventTimeFilter === key
                  ? 'bg-[#12343B] text-white border-[#12343B]'
                  : 'bg-card border-border text-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center space-y-3 max-w-md mx-auto">
            <p className="font-medium">{t('events.comingSoonTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('events.comingSoonBody')}</p>
            <NotifyMeForm className="pt-1" source="itinerary" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(exp => <EventCard key={exp.id} exp={exp} />)}
          </div>
        )}
      </div>
    );
  }

  const showResults = !isNightsView && !siteContent.itineraryPaywalled && genState === 'success' && !!results;
  const interestsLabel = restaurantHopping
    ? t('itineraryBuilder.restaurantHopping')
    : categories.length > 0
      ? categories
          .map((c, i) => `${categories.length > 1 ? `${i + 1}. ` : ''}${t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}`)
          .join(', ')
      : t('itineraryBuilder.interestsAny');
  const locationLabel = neighbourhoods.length > 0 ? neighbourhoods.join(', ') : t('itineraryBuilder.locationFixed');

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-background">
      <PageSEO
        title={t('itinerary.seoTitle')}
        description={t('itinerary.seoDesc')}
        canonical="/itinerary"
      />
      {!isNightsView && !siteContent.itineraryPaywalled && !showResults ? (
        <div className="max-w-6xl mx-auto px-6 md:px-8 pt-6 md:pt-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-xplora-icon-bg px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl mb-2 inline-flex items-center gap-2">
                {t('itineraryBuilder.heroTitle')}
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" />
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto md:mx-0 mb-4">
                {t('itineraryBuilder.heroSubtitle')}
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card text-xs md:text-sm font-medium">
                <Heart className="w-3.5 h-3.5 text-primary flex-shrink-0" aria-hidden="true" />
                {t('itineraryBuilder.heroBadge')}
              </span>
            </div>
            <img
              src="/hero/quebec-city-line-art.svg"
              alt="Line illustration of Château Frontenac's skyline and a couple walking along the terrace boardwalk in Old Québec"
              className="w-64 md:w-[26rem] flex-shrink-0"
              loading="eager"
            />
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-primary/40 to-primary/30 text-foreground px-6 md:px-8 pt-8 pb-6 rounded-b-[3rem] md:rounded-none">
          <div className="max-w-3xl mx-auto">
            {showResults ? (
              <h1 className="text-2xl md:text-3xl mb-1 inline-flex items-center gap-2">
                {t('itinerary.resultsTitle')}
                <Sparkles className="w-5 h-5 text-xplora-ink" aria-hidden="true" />
              </h1>
            ) : (
              <h1 className="text-2xl md:text-3xl mb-1">{t('itinerary.title')}</h1>
            )}
            <p className="text-sm md:text-base opacity-90">
              {showResults ? t('itinerary.resultsSubtitle', { count: results!.length }) : t('itinerary.subtitle')}
            </p>
          </div>
        </div>
      )}

      {isNightsView ? (
        renderNightsSection()
      ) : siteContent.itineraryPaywalled ? (
        <div className="max-w-3xl mx-auto px-6 md:px-8 pt-8 pb-16">
          <div className="rounded-3xl border border-border bg-muted/40 flex flex-col items-center justify-center text-center px-6 py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="text-lg md:text-xl font-medium">{t('itinerary.paywallTitle')}</h2>
            <p className="text-sm text-muted-foreground max-w-sm">{t('itinerary.paywallSubtitle')}</p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-1 px-5 py-2.5 rounded-xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition"
            >
              {t('itinerary.paywallCta')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-6 md:px-8 pt-6 pb-10">
            {!filtersOpen ? (
              <div className="bg-muted/40 border border-border rounded-3xl p-4 md:p-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="inline-flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {locationLabel}
                </span>
                <span className="inline-flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {interestsLabel}
                </span>
                {selectedVibe && (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    {t(`itineraryBuilder.vibeOption.${selectedVibe}`)}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {t(`itineraryBuilder.duration.${durationKey}`)}
                </span>
                <span className="inline-flex items-center gap-2 text-sm">
                  <Footprints className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  {t(`itineraryBuilder.paceOption.${pace}`)}
                </span>
                {selectedWho && (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                    {t(`itineraryBuilder.whoOption.${selectedWho}`)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  {t('itineraryBuilder.modify')}
                </button>
              </div>
            ) : (
            <>
            <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start gap-6 lg:gap-8">
              {/* Steps */}
              <div className="space-y-5">
                <StepCard
                  id="step-location"
                  index={1}
                  icon={MapPin}
                  title={t('itineraryBuilder.stepLocationTitle')}
                  subtitle={t('itineraryBuilder.stepLocationSubtitle')}
                >
                  {neighbourhoodOptions.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {neighbourhoodOptions.map(n => (
                          <Chip
                            key={n.id}
                            active={neighbourhoods.includes(n.name)}
                            onClick={() => toggleNeighbourhood(n.name)}
                          >
                            {n.name}
                          </Chip>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleLocateMe}
                        disabled={locateStatus === 'locating'}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted/40 transition-colors disabled:opacity-60"
                      >
                        {locateStatus === 'locating' ? (
                          <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" aria-hidden="true" />
                        ) : (
                          <LocateFixed className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        )}
                        {locateStatus === 'locating' ? t('itineraryBuilder.locating') : t('itineraryBuilder.locateMe')}
                      </button>
                      {locateStatus === 'error' && (
                        <p className="text-xs text-red-600 mt-2">{t('itineraryBuilder.locateMeError')}</p>
                      )}
                    </>
                  )}
                </StepCard>

                <StepCard
                  id="step-mood"
                  index={2}
                  icon={Heart}
                  title={t('itineraryBuilder.stepMoodTitle')}
                  subtitle={t('itineraryBuilder.stepMoodSubtitle')}
                >
                  {/* Interests — also doubles as an activity-order picker: once
                      2+ are selected, a "visit order" list appears below with
                      arrows to arrange them into the sequence the traveller
                      wants (e.g. Food, then Culture, then Shopping). */}
                  {!restaurantHopping && (
                    <div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                        {ITINERARY_CATEGORIES.map(c => {
                          const order = categories.indexOf(c);
                          return (
                            <InterestTile
                              key={c}
                              icon={CATEGORY_ICON[c]}
                              label={t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}
                              active={order >= 0}
                              order={order >= 0 ? order + 1 : null}
                              onClick={() => toggleCategory(c)}
                            />
                          );
                        })}
                      </div>
                      {categories.length > 1 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-2">{t('itineraryBuilder.interestsSequenceHint')}</p>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((c, i) => (
                              <OrderPill
                                key={c}
                                order={i + 1}
                                index={i}
                                onMoveEarlier={() => moveCategory(i, -1)}
                                onMoveLater={() => moveCategory(i, 1)}
                                canMoveEarlier={i > 0}
                                canMoveLater={i < categories.length - 1}
                                moveEarlierLabel={t('itineraryBuilder.moveEarlier')}
                                moveLaterLabel={t('itineraryBuilder.moveLater')}
                                onPillPointerDown={startCategoryDrag}
                                isDragging={dragFromIndex === i}
                                dragOffset={dragTranslate}
                                isDropTarget={dragOverIndex === i}
                                dragHandleLabel={t('itineraryBuilder.dragToReorder')}
                              >
                                {t(`categories.${SPOT_CATEGORY_KEY[c]}`, c)}
                              </OrderPill>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={restaurantHopping ? '' : 'mt-4 pt-4 border-t border-border'}>
                    <p className="text-sm font-medium mb-2">{t('itineraryBuilder.vibeQuestion')}</p>
                    <div className="flex flex-wrap gap-2">
                      {VIBE_MOOD_OPTIONS.map(v => (
                        <Chip key={v} active={selectedVibe === v} onClick={() => setSelectedVibe(prev => (prev === v ? null : v))}>
                          {t(`itineraryBuilder.vibeOption.${v}`)}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* More filters */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setMoreFiltersOpen(v => !v)}
                      className="w-full flex items-center justify-between text-sm font-medium"
                    >
                      <span className="inline-flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                        {t('itineraryBuilder.moreFilters')}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${moreFiltersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {moreFiltersOpen && (
                      <div className="mt-4 space-y-5">
                        {/* Restaurant hopping */}
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{t('itineraryBuilder.restaurantHopping')}</p>
                              <p className="text-xs text-muted-foreground">{t('itineraryBuilder.restaurantHoppingDescription')}</p>
                            </div>
                            <Switch checked={restaurantHopping} onCheckedChange={handleRestaurantHoppingChange} />
                          </div>
                          {restaurantHopping && (
                            <>
                              <p className="text-xs text-muted-foreground mt-2 bg-primary/5 rounded-xl px-3 py-2">
                                {t('itineraryBuilder.restaurantHoppingExplainer')}
                              </p>
                              <div className="flex items-center justify-between gap-3 mt-3 pl-3 border-l-2 border-red-600/30">
                                <div>
                                  <p className="text-sm font-medium flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                                    {t('itineraryBuilder.michelinOnly')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{t('itineraryBuilder.michelinOnlyDescription')}</p>
                                </div>
                                <Switch checked={michelinOnly} onCheckedChange={setMichelinOnly} />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </StepCard>

                <StepCard id="step-time" index={3} icon={Clock} title={t('itineraryBuilder.stepTimeTitle')}>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_BUCKETS.map(b => (
                      <Chip key={b.key} active={durationKey === b.key} onClick={() => setDurationKey(b.key)}>
                        {t(`itineraryBuilder.duration.${b.key}`)}
                      </Chip>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2 inline-flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                      {t('itineraryBuilder.exploreStyleQuestion')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PACE_OPTIONS.map(p => (
                        <Chip key={p} active={pace === p} onClick={() => setPace(p)}>
                          {t(`itineraryBuilder.paceOption.${p}`)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </StepCard>

                <StepCard
                  id="step-budget"
                  index={4}
                  icon={Wallet}
                  title={t('itineraryBuilder.stepBudgetTitle')}
                  subtitle={t('itineraryBuilder.stepBudgetSubtitle')}
                >
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map(p => (
                      <Chip key={p} active={priceRanges.includes(p)} onClick={() => togglePriceRange(p)}>
                        {p}
                      </Chip>
                    ))}
                  </div>
                </StepCard>

                <StepCard
                  id="step-who"
                  index={5}
                  icon={Users}
                  title={t('itineraryBuilder.stepWhoTitle')}
                  subtitle={t('itineraryBuilder.stepWhoSubtitle')}
                >
                  <div className="flex flex-wrap gap-2">
                    {WHO_OPTIONS.map(w => (
                      <Chip key={w} active={selectedWho === w} onClick={() => setSelectedWho(prev => (prev === w ? null : w))}>
                        {t(`itineraryBuilder.whoOption.${w}`)}
                      </Chip>
                    ))}
                  </div>
                </StepCard>
              </div>

              {/* Preferences summary + perks */}
              <aside className="mt-6 lg:mt-0 space-y-5 lg:sticky lg:top-6">
                <div className="bg-card border border-border rounded-3xl p-5">
                  <h2 className="text-base font-medium inline-flex items-center gap-2">
                    {t('itineraryBuilder.yourPreferences')}
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('itineraryBuilder.yourPreferencesSubtitle')}</p>
                  <div className="mt-2">
                    <PreferenceRow
                      icon={MapPin}
                      label={t('itineraryBuilder.location')}
                      value={locationLabel}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-location')}
                    />
                    <PreferenceRow
                      icon={Heart}
                      label={t('itineraryBuilder.interests')}
                      value={interestsLabel}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-mood')}
                    />
                    <PreferenceRow
                      icon={Sparkles}
                      label={t('itineraryBuilder.vibeLabel')}
                      value={selectedVibe ? t(`itineraryBuilder.vibeOption.${selectedVibe}`) : t('itineraryBuilder.interestsAny')}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-mood')}
                    />
                    <PreferenceRow
                      icon={Clock}
                      label={t('itineraryBuilder.timeAvailable')}
                      value={`${t(`itineraryBuilder.duration.${durationKey}`)} · ${t(`itineraryBuilder.paceOption.${pace}`)}`}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-time')}
                    />
                    <PreferenceRow
                      icon={Wallet}
                      label={t('itinerary.price')}
                      value={priceRanges.length > 0 ? priceRanges.join(' ') : t('itineraryBuilder.interestsAny')}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-budget')}
                    />
                    <PreferenceRow
                      icon={Users}
                      label={t('itineraryBuilder.withWhoLabel')}
                      value={selectedWho ? t(`itineraryBuilder.whoOption.${selectedWho}`) : t('itineraryBuilder.interestsAny')}
                      changeLabel={t('itineraryBuilder.change')}
                      onChange={() => scrollToStep('step-who')}
                    />
                  </div>
                </div>

                <div className="bg-xplora-icon-bg rounded-3xl p-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1">{t('itineraryBuilder.perksTitle')}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{t('itineraryBuilder.perksBody')}</p>
                    <Link to="/membership" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                      {t('itineraryBuilder.perksCta')} →
                    </Link>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                </div>

                <div className="border border-border rounded-3xl p-5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">{t('itineraryBuilder.localTrustTitle')}</h3>
                    <p className="text-xs text-muted-foreground">{t('itineraryBuilder.localTrustBody')}</p>
                  </div>
                </div>
              </aside>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handleGenerate}
                disabled={genState === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#12343B] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {genState === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> {t('itineraryBuilder.generating')}</>
                ) : (
                  <><Wand2 className="w-4 h-4" aria-hidden="true" /> {genState === 'success' ? t('itineraryBuilder.regenerate') : t('itineraryBuilder.buildCta')}</>
                )}
              </button>
              {genState !== 'loading' && (
                <p className="text-xs text-center text-muted-foreground">{t('itineraryBuilder.buildHint')}</p>
              )}
              {genState === 'error' && errorCode && (
                <p className="text-sm text-red-600 text-center">{t(ERROR_KEY[errorCode])}</p>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('itineraryBuilder.featureLocalTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('itineraryBuilder.featureLocalBody')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('itineraryBuilder.featureRealLifeTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('itineraryBuilder.featureRealLifeBody')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t('itineraryBuilder.featureTweakTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('itineraryBuilder.featureTweakBody')}</p>
                </div>
              </div>
            </div>
            </>
            )}
          </div>

          {genState === 'success' && results && (
            <>
              {pinnedSpotIds.size > 0 && (
                <p className="max-w-7xl mx-auto px-6 md:px-8 mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {t('itineraryBuilder.pinnedHint', { count: pinnedSpotIds.size })}
                </p>
              )}
              <ItineraryResultsGrid
                key={genKey}
                itineraries={results}
                onRegenerate={handleGenerate}
                onSaved={refreshUsage}
                pinnedSpotIds={pinnedSpotIds}
                onTogglePin={toggleSpotPin}
                onModify={() => setFiltersOpen(true)}
                pace={pace}
              />
            </>
          )}

          {showResults && !usage.premium && (
            <div className="max-w-7xl mx-auto px-6 md:px-8 mt-6">
              <div className="bg-muted/40 border border-border rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-5 md:gap-8">
                <div className="flex items-center gap-3 flex-1 w-full">
                  <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('itineraryBuilder.freePlanTitle', { limit: usage.limit })}</p>
                    <p className="text-xs text-muted-foreground mb-1.5">{t('itineraryBuilder.freePlanUsed', { count: usage.count, limit: usage.limit })}</p>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (usage.count / usage.limit) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block w-px h-12 bg-border flex-shrink-0" />
                <div className="flex items-center gap-3 flex-1 w-full">
                  <div className="w-9 h-9 rounded-full bg-xplora-icon-bg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('itineraryBuilder.unlockUnlimitedTitle')}</p>
                    <p className="text-xs text-muted-foreground">{t('itineraryBuilder.unlockUnlimitedBody')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPremiumModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted/50 transition flex-shrink-0"
                  >
                    {t('itineraryBuilder.seePlans')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <PremiumLimitModal open={premiumModalOpen} onOpenChange={(open) => { setPremiumModalOpen(open); if (!open) refreshUsage(); }} />

      <Footer />
    </div>
  );
}
