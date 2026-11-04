import { describe, expect, it } from 'vitest';
import { availableItineraryCategories } from './availableItineraryCategories';
import type { Spot } from './products';
const place = (overrides: Partial<Spot> = {}): Spot => ({ id: 'a', name: 'Cafe', status: 'active', category: 'Cafe', neighbourhood: 'Saint-Roch', lat: 46.81, lng: -71.22, ...overrides });
const spots = [place(), place({ id: 'b', category: 'Culture', neighbourhood: 'Montcalm' })];
describe('available neighbourhood interests', () => {
  it('shows only categories from the selected neighbourhood', () => {
    expect(availableItineraryCategories(spots, ['Saint-Roch'])).toEqual(['Cafe']);
  });
  it('combines multiple areas and deduplicates their categories', () => {
    expect(availableItineraryCategories([...spots, place({ id: 'c' })], ['Saint-Roch', 'Montcalm'])).toEqual(['Cafe', 'Culture']);
  });
  it('offers all available interests when no area is selected', () => {
    expect(availableItineraryCategories(spots, [])).toEqual(['Cafe', 'Culture']);
  });
  it('does not promise categories for an empty area', () => {
    expect(availableItineraryCategories(spots, ['Unknown'])).toEqual([]);
  });
  it('excludes inactive, unnamed, unroutable, accommodation and transit places', () => {
    const invalid = [place({ status: 'draft' as any }), place({ name: ' ' }), place({ lat: undefined }), place({ lng: 200 }), place({ lat: NaN }), place({ category: 'Stays' }), place({ role: 'connector' }), place({ role: 'transportation' })];
    expect(availableItineraryCategories(invalid, [])).toEqual([]);
  });
});
