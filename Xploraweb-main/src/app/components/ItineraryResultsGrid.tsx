import { ItineraryResultCard } from './ItineraryResultCard';
import type { GeneratedItinerary } from '../data/itineraryFilters';

interface Props {
  itineraries: GeneratedItinerary[];
  onRegenerate?: () => void;
}

// Desktop: one row of 3. Tablet: 2 in the first row, 3rd spans below.
// Mobile: stacked single column.
export function ItineraryResultsGrid({ itineraries, onRegenerate }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {itineraries.map((itinerary, i) => (
        <div key={i} className={i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}>
          <ItineraryResultCard itinerary={itinerary} index={i} onRegenerate={onRegenerate} />
        </div>
      ))}
    </div>
  );
}
