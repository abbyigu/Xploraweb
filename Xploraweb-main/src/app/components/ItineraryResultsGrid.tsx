import { ItineraryResultCard } from './ItineraryResultCard';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  itineraries: GeneratedItinerary[];
  onRegenerate?: () => void;
  /** Called after any card's itinerary is successfully saved, so a parent
   * tracking free-save usage can refresh it. */
  onSaved?: () => void;
  /** Ids of stops the traveller has pinned — kept in place across a regeneration. */
  pinnedSpotIds?: Set<string>;
  onTogglePin?: (spotId: string) => void;
}

// A single result (the common case) fills the page as a full itinerary view
// rather than a small card behind a "view itinerary" dialog. Multiple results
// (e.g. premium) still show as a picker grid: one row of 3 on desktop, 2 in
// the first row + a spanning 3rd on tablet, stacked on mobile.
export function ItineraryResultsGrid({ itineraries, onRegenerate, onSaved, pinnedSpotIds, onTogglePin }: Props) {
  if (itineraries.length === 1) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8">
        <ItineraryResultCard itinerary={itineraries[0]} onRegenerate={onRegenerate} onSaved={onSaved} layout="full" pinnedSpotIds={pinnedSpotIds} onTogglePin={onTogglePin} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {itineraries.map((itinerary, i) => (
        <div key={i} className={i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}>
          <ItineraryResultCard itinerary={itinerary} index={i} onRegenerate={onRegenerate} onSaved={onSaved} pinnedSpotIds={pinnedSpotIds} onTogglePin={onTogglePin} />
        </div>
      ))}
    </div>
  );
}
