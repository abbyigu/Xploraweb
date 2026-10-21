import { describe, expect, it } from 'vitest';
import { compactShortlists, solveCompactRoute, solveReplacement, walkingLeg, visitMinutes, type RouteOptions } from './_compactRouting';
import { isCompleteCandidate } from './_itineraryLogic';
import type { CandidateSpot, WalkingMatrix } from './_itineraryLogic';

function spot(id: string, category = 'Culture', extra: Partial<CandidateSpot> = {}): CandidateSpot {
  return { id, name: id, category, lat: 46.81, lng: -71.21, role: category === 'Cafe' ? 'cafe' : 'destination',
    description: null, address: null, website: null, image: null, neighbourhood: 'Old Québec', vibes: [], visitTime: null, priceRange: null, xploraTips: [], michelinUrl: null, ...extra };
}
const places = [spot('lower-cafe', 'Cafe', { lat: 46.813, lng: -71.209 }), spot('upper-cafe', 'Cafe', { lat: 46.812, lng: -71.206 }), spot('art-lane', 'Culture', { lat: 46.811, lng: -71.206 }), spot('terrace', 'Culture', { lat: 46.810, lng: -71.205 })];
function matrix(spots: CandidateSpot[], seconds = 300): WalkingMatrix {
  return { ids: spots.map(s => s.id), distanceMeters: spots.map((_, i) => spots.map((_, j) => i === j ? 0 : seconds)), durationSeconds: spots.map((_, i) => spots.map((_, j) => i === j ? 0 : seconds)) };
}
const options: RouteOptions = { count: 3, categories: ['Cafe', 'Culture'], pinnedIds: [], maxLegMinutes: 10, restaurantHopping: false };

describe('walking-first routing', () => {
  it('chooses a nearby café instead of a café close in a straight line but far on foot', () => {
    const m = matrix(places, 120);
    for (let i = 1; i < places.length; i++) m.durationSeconds[0][i] = m.durationSeconds[i][0] = 1200;
    const route = solveCompactRoute(places, m, options)!;
    expect(route.map(s => s.id)).toEqual(['upper-cafe', 'art-lane', 'terrace']);
    expect(route.some(s => s.id === 'lower-cafe')).toBe(false);
  });
  it('does not substitute straight-line distances for an unreachable walking connection', () => {
    const pool = places.slice(1);
    const m = matrix(pool);
    m.durationSeconds = m.durationSeconds.map((row, i) => row.map((_, j) => i === j ? 0 : Infinity));
    expect(solveCompactRoute(pool, m, options)).toBeNull();
    expect(walkingLeg(m, pool[0].id, pool[1].id)).toBeNull();
  });
  it('respects the walking limit and only expands it when explicitly requested', () => {
    const pool = places.slice(1), m = matrix(pool, 720);
    expect(solveCompactRoute(pool, m, options)).toBeNull();
    expect(solveCompactRoute(pool, m, { ...options, maxLegMinutes: 15 })).toHaveLength(3);
  });
  it('does not force category order when that creates a longer walk', () => {
    const pool = places.slice(1), m = matrix(pool, 600);
    m.durationSeconds[1][0] = 60; m.durationSeconds[0][2] = 60;
    expect(solveCompactRoute(pool, m, options)?.map(s => s.id)).toEqual(['art-lane', 'upper-cafe', 'terrace']);
  });
  it('preserves all pinned stops and their relative order', () => {
    const m = matrix(places, 120);
    const route = solveCompactRoute(places, m, { ...options, pinnedIds: ['terrace', 'art-lane'] })!;
    expect(route.findIndex(s => s.id === 'terrace')).toBeLessThan(route.findIndex(s => s.id === 'art-lane'));
    expect(route.some(s => s.category === 'Cafe')).toBe(true);
  });
  it('does not silently omit a required interest to get a short route', () => {
    const pool = [places[0], places[2], places[3]], m = matrix([places[0], places[2], places[3]], 1000);
    expect(solveCompactRoute(pool, m, options)).toBeNull();
  });
  it('treats walking times as directed, including asymmetric paths', () => {
    const pool = places.slice(1), m = matrix(pool, 1200);
    m.durationSeconds[0][1] = 90; m.durationSeconds[1][2] = 90;
    expect(solveCompactRoute(pool, m, options)?.map(s => s.id)).toEqual(['upper-cafe', 'art-lane', 'terrace']);
  });
});

describe('replacement walking checks', () => {
  it('rejects an alternative whose second connection exceeds the limit', () => {
    const a = spot('a', 'Cafe', { lat: 46.813 }), b = spot('b', 'Culture', { lat: 46.812 }), c = spot('c', 'Shopping', { lat: 46.811 }), alternate = spot('alternative', 'Culture', { lat: 46.814 });
    const m = matrix([a, b, c, alternate], 120);
    m.durationSeconds[3][2] = 1200;
    expect(solveReplacement([a, b, c], 'b', [alternate], m, { ...options, categories: ['Cafe', 'Culture', 'Shopping'] })).toBeNull();
    m.durationSeconds[3][2] = 180;
    expect(solveReplacement([a, b, c], 'b', [alternate], m, options)?.map(s => s.id)).toEqual(['a', 'alternative', 'c']);
  });
});

describe('candidate shortlist and inputs', () => {
  it('keeps required categories and pins within the bounded routing shortlist', () => {
    const pool = Array.from({ length: 30 }, (_, i) => spot(`p${i}`, i === 29 ? 'Cafe' : 'Culture', { lat: 46.81 + i / 1000 }));
    const lists = compactShortlists(pool, [pool[0]], ['Cafe', 'Culture'], 3);
    expect(lists.length).toBeLessThanOrEqual(2);
    for (const list of lists) { expect(list.length).toBeLessThanOrEqual(12); expect(list.some(s => s.id === 'p0')).toBe(true); expect(list.some(s => s.category === 'Cafe')).toBe(true); }
  });
  it('rejects invalid coordinates before routing', () => {
    expect(isCompleteCandidate(spot('bad', 'Cafe', { lat: NaN }))).toBe(false);
    expect(isCompleteCandidate(spot('bad', 'Cafe', { lng: 200 }))).toBe(false);
    expect(isCompleteCandidate(spot('good'))).toBe(true);
  });
  it('estimates visits separately from walking and understands hours', () => {
    expect(visitMinutes(spot('museum', 'Culture', { visitTime: '1 h' }), 'moderate')).toBe(60);
    expect(visitMinutes(spot('cafe', 'Cafe', { visitTime: '20 min' }), 'moderate')).toBe(20);
  });
});
