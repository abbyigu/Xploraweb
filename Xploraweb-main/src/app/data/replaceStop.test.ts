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
  it('updates distance and duration and leaves the generated route untouched', () => {
    const original = {
      ...base, estimatedDistanceKm: 1.1, estimatedDurationMin: 75,
      stops: [{ order: 1, note: '', spot: sp('a', 'Cafe', 46.81) }, { order: 2, note: '', spot: sp('b', 'Food', 46.82) }],
      alternates: [sp('c', 'Cafe', 46.815)],
    };
    const result = replaceStop(original, 'a')!;
    expect(result.estimatedDistanceKm).toBeCloseTo(0.56, 2);
    expect(result.estimatedDurationMin).toBe(68);
    expect(original.estimatedDistanceKm).toBe(1.1);
    expect(original.stops[0].spot.id).toBe('a');
  });
  it('does not retain old connector instructions after a replacement', () => {
    const original: GeneratedItinerary = { ...base, stops: [base.stops[0], { type: 'journeyStep', description: 'Old stairs', spot: sp('stairs', 'History', 0.5) }, base.stops[1]] };
    const result = replaceStop(original, 'a')!;
    expect(result.stops).toHaveLength(2);
    expect(result.stops.some(item => item.type === 'journeyStep')).toBe(false);
  });
  it('does not replace a route with unknown coordinates and misleading totals', () => {
    const missing = { ...base, stops: [{ order: 1, note: '', spot: { id: 'a', name: 'Unknown', category: 'Cafe' } }, base.stops[1]] };
    // The replacement itself has coordinates, so this case can be estimated.
    expect(replaceStop(missing, 'a')).not.toBeNull();
    expect(replaceStop({ ...missing, stops: [...missing.stops, { order: 3, note: '', spot: { id: 'unknown', name: 'No coordinates' } }] }, 'a')).toBeNull();
  });
});
