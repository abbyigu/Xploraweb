import { describe, expect, it } from 'vitest';
import { sampleOuting } from './sampleOuting';
import type { Spot } from './products';

const spot = (id: string, category: string, extra: Partial<Spot> = {}): Spot => ({
  id, name: id, category, neighbourhood: 'Saint-Roch', lat: 46.81, lng: -71.22, status: 'active', ...extra,
});

describe('sampleOuting', () => {
  const places = [spot('coffee', 'Cafe'), spot('culture', 'Culture'), spot('shop', 'Shopping')];
  it('returns actual places in café, culture, shop order without mutating the feed', () => {
    const feed = [places[2], places[0], places[1]];
    expect(sampleOuting(feed).map(item => item.id)).toEqual(['coffee', 'culture', 'shop']);
    expect(feed.map(item => item.id)).toEqual(['shop', 'coffee', 'culture']);
  });
  it('does not fabricate a sample from incomplete or unpublished places', () => {
    expect(sampleOuting(places.slice(0, 2))).toEqual([]);
    expect(sampleOuting([...places.slice(0, 2), spot('shop', 'Shopping', { status: 'draft' })])).toEqual([]);
    expect(sampleOuting([...places.slice(0, 2), spot('shop', 'Shopping', { lat: undefined })])).toEqual([]);
  });
  it('rejects remote stops and stops in another neighbourhood', () => {
    expect(sampleOuting([...places.slice(0, 2), spot('shop', 'Shopping', { lat: 47.8 })])).toEqual([]);
    expect(sampleOuting([...places.slice(0, 2), spot('shop', 'Shopping', { neighbourhood: 'Montcalm' })])).toEqual([]);
  });
  it('excludes transit connectors even if they carry a culture category', () => {
    expect(sampleOuting([places[0], spot('stairs', 'Culture', { role: 'connector' }), places[2]])).toEqual([]);
  });
});
