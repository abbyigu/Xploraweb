import { describe, expect, it } from 'vitest';
import { replaceStop } from './itineraryFilters';
import type { GeneratedItinerary } from './itineraryFilters';
import type { Spot } from './products';

const sp = (id: string, category: string, lat: number): Spot => ({ id, category, lat, lng: 0 } as unknown as Spot);
const base: GeneratedItinerary = {
  title: '', summary: '', estimatedDurationMin: 0, estimatedDistanceKm: 0,
  stops: [{ order: 1, note: 'x', spot: sp('a', 'Cafe', 0) }, { order: 2, note: '', spot: sp('b', 'Food', 1) }],
  alternates: [sp('c', 'Food', 0.1), sp('d', 'Cafe', 5), sp('e', 'Cafe', 2)],
};

describe('replaceStop', () => {
  it('picks nearest same-category alternate, keeps order, consumes it', () => {
    const r = replaceStop(base, 'a')!;
    expect(r.stops.map(s => s.spot.id)).toEqual(['e', 'b']);
    expect(r.stops[0]).toMatchObject({ order: 1, note: '' });
    expect(r.alternates!.map(s => s.id)).toEqual(['c', 'd']);
  });
  it('returns null when nothing is left', () => {
    expect(replaceStop({ ...base, alternates: [] }, 'a')).toBeNull();
  });
});
