import { describe, expect, it } from 'vitest';
import { requestedStopCount } from './requestedStopCount';
import { DURATION_BUCKETS } from './itineraryFilters';

const request = { categories: ['Cafe', 'History'], bucket: DURATION_BUCKETS[0], restaurantHopping: false };
describe('requested stop count', () => {
  it('makes Café + History exactly two stops, regardless of the duration choice', () => {
    for (const bucket of DURATION_BUCKETS) expect(requestedStopCount({ ...request, bucket })).toBe(2);
  });
  it('adds stops only when explicitly requested', () => {
    expect(requestedStopCount({ ...request, extraStops: 1 })).toBe(3);
    expect(requestedStopCount({ ...request, extraStops: 2 })).toBe(4);
  });
  it('supports one interest without inventing a second place', () => {
    expect(requestedStopCount({ ...request, categories: ['Cafe'] })).toBe(1);
  });
  it('uses duration only for an open-ended outing with no interests', () => {
    expect(requestedStopCount({ ...request, categories: [], bucket: DURATION_BUCKETS[1] })).toBe(5);
  });
  it('preserves explicitly pinned stops and keeps restaurant hopping separate', () => {
    expect(requestedStopCount({ ...request, pinnedCount: 3 })).toBe(3);
    expect(requestedStopCount({ ...request, restaurantHopping: true })).toBe(3);
  });
});
