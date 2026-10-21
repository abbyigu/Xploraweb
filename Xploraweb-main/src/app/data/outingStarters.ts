import type { DurationBucket, Pace, PriceRange, Who } from './itineraryFilters';
import type { SpotCategory } from './products';

export interface OutingStarter {
  id: string;
  categories: SpotCategory[];
  durationKey: DurationBucket['key'];
  pace: Pace;
  priceRanges: PriceRange[];
  who: Who | null;
}

// These are editable preferences, never promises about opening hours,
// weather protection, accessibility, or the total cost of a route.
export const OUTING_STARTERS: OutingStarter[] = [
  { id: 'short', categories: ['Cafe', 'Culture'], durationKey: 'short', pace: 'relaxed', priceRanges: [], who: null },
  { id: 'culture', categories: ['Cafe', 'Culture', 'Shopping'], durationKey: 'half', pace: 'relaxed', priceRanges: [], who: null },
  { id: 'date', categories: ['Cafe', 'Culture', 'Food'], durationKey: 'half', pace: 'relaxed', priceRanges: [], who: 'couple' },
  { id: 'budget', categories: ['Cafe', 'Nature'], durationKey: 'short', pace: 'relaxed', priceRanges: ['$'], who: null },
];

export function getOutingStarter(id: string | null): OutingStarter | undefined {
  return OUTING_STARTERS.find(starter => starter.id === id);
}
