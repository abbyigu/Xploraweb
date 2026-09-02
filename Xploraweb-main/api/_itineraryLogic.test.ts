import { describe, it, expect } from 'vitest';
import {
  canBeGeneratedAsStop, canAppearAsJourneyStep, inferDefaultRole, resolveRole,
  isCompleteCandidate, dedupeStops, selectBalancedStops, mergePinnedAndFilled,
  orderByNearestNeighbor, orderByCategorySequence, applyBarTimeOfDayRule, assembleItineraryItems,
  findConnectorForGap, hasStrongCulturalPreference, isCafeFocused,
} from './_itineraryLogic';
import type { CandidateSpot, StopCandidate } from './_itineraryLogic';

// Roughly Old Québec / Petit-Champlain coordinates, close enough together
// that a straight-line "gap" between two stops is realistic.
function spot(overrides: Partial<CandidateSpot> & { id: string }): CandidateSpot {
  return {
    name: overrides.id,
    description: null,
    address: null,
    lat: 46.812,
    lng: -71.204,
    website: null,
    image: null,
    neighbourhood: 'Old Québec',
    vibes: [],
    category: 'Culture',
    role: 'destination',
    visitTime: null,
    priceRange: null,
    xploraTips: [],
    michelinUrl: null,
    ...overrides,
  };
}

function stopOf(s: CandidateSpot, note = ''): StopCandidate {
  return { spot: s, note };
}

describe('role classification', () => {
  it('excludes connectors and transportation from primary destinations', () => {
    const staircase = spot({ id: 'staircase', role: 'connector' });
    const funicular = spot({ id: 'funicular', role: 'transportation' });
    const museum = spot({ id: 'museum', role: 'museum' });

    expect(canBeGeneratedAsStop(staircase.role)).toBe(false);
    expect(canBeGeneratedAsStop(funicular.role)).toBe(false);
    expect(canBeGeneratedAsStop(museum.role)).toBe(true);

    expect(canAppearAsJourneyStep(staircase.role)).toBe(true);
    expect(canAppearAsJourneyStep(funicular.role)).toBe(true);
    expect(canAppearAsJourneyStep(museum.role)).toBe(false);
  });

  it('infers a sensible default role from category for legacy rows with no role set', () => {
    expect(inferDefaultRole('Food')).toBe('restaurant');
    expect(inferDefaultRole('Cafe')).toBe('cafe');
    expect(inferDefaultRole('Bar')).toBe('bar');
    expect(inferDefaultRole(undefined)).toBe('destination');
  });

  it('resolveRole falls back to the category default when the stored role is missing or invalid', () => {
    expect(resolveRole(null, 'Cafe')).toBe('cafe');
    expect(resolveRole('not-a-real-role', 'Bar')).toBe('bar');
    expect(resolveRole('connector', 'History')).toBe('connector'); // explicit admin override wins
  });
});

describe('isCompleteCandidate', () => {
  it('drops listings missing a name or coordinates', () => {
    expect(isCompleteCandidate(spot({ id: 'a', name: '' }))).toBe(false);
    expect(isCompleteCandidate(spot({ id: 'b', lat: null }))).toBe(false);
    expect(isCompleteCandidate(spot({ id: 'c', lng: null }))).toBe(false);
    expect(isCompleteCandidate(spot({ id: 'd', name: 'Real Place' }))).toBe(true);
  });
});

describe('dedupeStops', () => {
  it('drops a later stop with the same normalized name', () => {
    const a = stopOf(spot({ id: 'a', name: 'Café Largo' }));
    const b = stopOf(spot({ id: 'b', name: 'cafe largo' })); // same place, different casing/accents
    expect(dedupeStops([a, b])).toEqual([a]);
  });

  it('drops a later stop within ~40m of an earlier one', () => {
    const a = stopOf(spot({ id: 'a', lat: 46.8120, lng: -71.2040 }));
    const b = stopOf(spot({ id: 'b', name: 'Different Name', lat: 46.81203, lng: -71.20403 }));
    expect(dedupeStops([a, b])).toEqual([a]);
  });

  it('keeps two genuinely distinct stops', () => {
    const a = stopOf(spot({ id: 'a', lat: 46.812, lng: -71.204 }));
    const b = stopOf(spot({ id: 'b', name: 'Far Away', lat: 46.850, lng: -71.250 }));
    expect(dedupeStops([a, b])).toEqual([a, b]);
  });
});

describe('selectBalancedStops', () => {
  it('caps museums/galleries at 2 unless the user chose a strong cultural preference', () => {
    const picked = [
      stopOf(spot({ id: 'm1', role: 'museum', lat: 46.810, lng: -71.200 })),
      stopOf(spot({ id: 'g1', role: 'gallery', lat: 46.811, lng: -71.201 })),
      stopOf(spot({ id: 'm2', role: 'museum', lat: 46.812, lng: -71.202 })),
      stopOf(spot({ id: 'park1', role: 'park', lat: 46.813, lng: -71.203 })),
    ];
    const result = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 4,
    });
    const museumOrGallery = result.filter(s => s.spot.role === 'museum' || s.spot.role === 'gallery');
    expect(museumOrGallery.length).toBe(2);
    expect(result.some(s => s.spot.id === 'park1')).toBe(true); // backfilled in place of the cut 3rd
  });

  it('allows more than 2 museums/galleries when the user has a strong cultural preference', () => {
    const picked = [
      stopOf(spot({ id: 'm1', role: 'museum', lat: 46.810, lng: -71.200 })),
      stopOf(spot({ id: 'g1', role: 'gallery', lat: 46.811, lng: -71.201 })),
      stopOf(spot({ id: 'm2', role: 'museum', lat: 46.812, lng: -71.202 })),
    ];
    const result = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: true, cafeFocused: false, targetCount: 3,
    });
    expect(result.length).toBe(3);
  });

  it('caps cafés at 2 unless the itinerary is café-focused', () => {
    const picked = [
      stopOf(spot({ id: 'c1', role: 'cafe', lat: 46.810, lng: -71.200 })),
      stopOf(spot({ id: 'c2', role: 'cafe', lat: 46.811, lng: -71.201 })),
      stopOf(spot({ id: 'c3', role: 'cafe', lat: 46.812, lng: -71.202 })),
    ];
    const capped = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 3,
    });
    expect(capped.filter(s => s.spot.role === 'cafe').length).toBe(2);

    const uncapped = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: true, targetCount: 3,
    });
    expect(uncapped.filter(s => s.spot.role === 'cafe').length).toBe(3);
  });

  it('caps viewpoints at 1, but lets a second back in when nothing else can fill the route', () => {
    const picked = [
      stopOf(spot({ id: 'v1', role: 'viewpoint', lat: 46.810, lng: -71.200 })),
      stopOf(spot({ id: 'v2', role: 'viewpoint', lat: 46.811, lng: -71.201 })),
    ];
    const noAlternatives = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 2,
    });
    expect(noAlternatives.filter(s => s.spot.role === 'viewpoint').length).toBe(2);

    const withAlternative = selectBalancedStops(picked, [stopOf(spot({ id: 'shop1', role: 'shop', lat: 46.850, lng: -71.250 }))], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 2,
    });
    expect(withAlternative.filter(s => s.spot.role === 'viewpoint').length).toBe(1);
    expect(withAlternative.some(s => s.spot.id === 'shop1')).toBe(true);
  });

  it('never returns more than targetCount stops', () => {
    const picked = [
      stopOf(spot({ id: 'a', role: 'destination' })),
      stopOf(spot({ id: 'b', role: 'destination' })),
      stopOf(spot({ id: 'c', role: 'destination' })),
    ];
    const result = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 1,
    });
    expect(result.length).toBe(1);
  });

  it('filters out any connector/transportation role that slipped into the picked list', () => {
    const picked = [
      stopOf(spot({ id: 'a', role: 'destination' })),
      stopOf(spot({ id: 'stairs', role: 'connector' })),
    ];
    const result = selectBalancedStops(picked, [], {
      foodCap: 1, strongCulturalPreference: false, cafeFocused: false, targetCount: 2,
    });
    expect(result.map(s => s.spot.id)).toEqual(['a']);
  });
});

describe('mergePinnedAndFilled (pinned stops survive regeneration)', () => {
  it('keeps pinned stops even when they would exceed a role cap', () => {
    const pinned = [
      stopOf(spot({ id: 'v1', role: 'viewpoint', lat: 46.810, lng: -71.200 })),
      stopOf(spot({ id: 'v2', role: 'viewpoint', lat: 46.811, lng: -71.201 })),
    ];
    const filled = [stopOf(spot({ id: 'shop1', role: 'shop', lat: 46.850, lng: -71.250 }))];
    const merged = mergePinnedAndFilled(pinned, filled);
    expect(merged.map(s => s.spot.id)).toEqual(['v1', 'v2', 'shop1']);
  });

  it('does not duplicate a filled stop that is a near-duplicate of a pinned one', () => {
    const pinned = [stopOf(spot({ id: 'p1', name: 'Château Frontenac' }))];
    const filled = [stopOf(spot({ id: 'f1', name: 'château frontenac' }))];
    expect(mergePinnedAndFilled(pinned, filled).map(s => s.spot.id)).toEqual(['p1']);
  });
});

describe('orderByNearestNeighbor + applyBarTimeOfDayRule', () => {
  it('moves a bar out of the first slot when other stops exist', () => {
    const stops = [
      stopOf(spot({ id: 'bar1', role: 'bar', lat: 46.812, lng: -71.204 })),
      stopOf(spot({ id: 'museum1', role: 'museum', lat: 46.813, lng: -71.205 })),
    ];
    const result = applyBarTimeOfDayRule(orderByNearestNeighbor(stops));
    expect(result[0].spot.role).not.toBe('bar');
  });

  it('leaves an all-bar route alone (restaurant-hopping style)', () => {
    const stops = [
      stopOf(spot({ id: 'bar1', role: 'bar' })),
      stopOf(spot({ id: 'bar2', role: 'bar' })),
    ];
    const result = applyBarTimeOfDayRule(stops);
    expect(result.map(s => s.spot.id)).toEqual(['bar1', 'bar2']);
  });
});

describe('orderByCategorySequence', () => {
  it('leaves the order alone with fewer than 2 chosen categories', () => {
    const stops = [
      stopOf(spot({ id: 'a', category: 'Shopping' })),
      stopOf(spot({ id: 'b', category: 'Food' })),
    ];
    expect(orderByCategorySequence(stops, [])).toEqual(stops);
    expect(orderByCategorySequence(stops, ['Food'])).toEqual(stops);
  });

  it('re-groups stops to follow the chosen category order (Food, then Culture, then Shopping)', () => {
    const stops = [
      stopOf(spot({ id: 'shop1', category: 'Shopping' })),
      stopOf(spot({ id: 'culture1', category: 'Culture' })),
      stopOf(spot({ id: 'food1', category: 'Food' })),
      stopOf(spot({ id: 'shop2', category: 'Shopping' })),
    ];
    const result = orderByCategorySequence(stops, ['Food', 'Culture', 'Shopping']);
    expect(result.map(s => s.spot.id)).toEqual(['food1', 'culture1', 'shop1', 'shop2']);
  });

  it('keeps relative order within the same category (stable sort)', () => {
    const stops = [
      stopOf(spot({ id: 'shopA', category: 'Shopping' })),
      stopOf(spot({ id: 'shopB', category: 'Shopping' })),
      stopOf(spot({ id: 'foodA', category: 'Food' })),
    ];
    const result = orderByCategorySequence(stops, ['Food', 'Shopping']);
    expect(result.map(s => s.spot.id)).toEqual(['foodA', 'shopA', 'shopB']);
  });

  it('pushes unranked categories to the end, after everything the traveller ordered', () => {
    const stops = [
      stopOf(spot({ id: 'nature1', category: 'Nature' })),
      stopOf(spot({ id: 'food1', category: 'Food' })),
      stopOf(spot({ id: 'shop1', category: 'Shopping' })),
    ];
    const result = orderByCategorySequence(stops, ['Shopping', 'Food']);
    expect(result.map(s => s.spot.id)).toEqual(['shop1', 'food1', 'nature1']);
  });
});

describe('journey steps between stops', () => {
  it('inserts a connector as a journey step between the two stops it lies between, not as a numbered stop', () => {
    // Two stops ~500m apart, with a connector almost exactly on the line between them.
    const stopA = stopOf(spot({ id: 'placeRoyale', role: 'landmark', lat: 46.8129, lng: -71.2043 }));
    const stopB = stopOf(spot({ id: 'lapinSaute', role: 'restaurant', lat: 46.8113, lng: -71.2027 }));
    const staircase = spot({ id: 'casseCou', name: 'Escalier Casse-Cou', role: 'connector', lat: 46.8121, lng: -71.2035, neighbourhood: 'Petit-Champlain' });

    const items = assembleItineraryItems(
      [{ ...stopA, order: 1 } as any, { ...stopB, order: 2 } as any].map(s => ({ spot: s.spot, note: s.note })),
      [staircase],
      'en',
    );

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ type: 'stop', order: 1 });
    expect(items[1]).toMatchObject({ type: 'journeyStep' });
    if (items[1].type === 'journeyStep') {
      expect(items[1].description).toContain('Escalier Casse-Cou');
      expect(items[1].description.toLowerCase()).toContain('walk down');
    }
    expect(items[2]).toMatchObject({ type: 'stop', order: 2 });
  });

  it('describes a transportation connector with "take the X between A and B"', () => {
    const stopA = stopOf(spot({ id: 'upperTown', role: 'landmark', lat: 46.8140, lng: -71.2080, neighbourhood: 'Upper Town' }));
    const stopB = stopOf(spot({ id: 'petitChamplain', role: 'shop', lat: 46.8110, lng: -71.2030, neighbourhood: 'Petit-Champlain' }));
    const funicular = spot({ id: 'funicular', name: 'Québec City Funicular', role: 'transportation', lat: 46.8125, lng: -71.2055, neighbourhood: 'Petit-Champlain' });

    const items = assembleItineraryItems([stopA, stopB], [funicular], 'en');
    const journeyStep = items.find(i => i.type === 'journeyStep');
    expect(journeyStep).toBeDefined();
    if (journeyStep?.type === 'journeyStep') {
      expect(journeyStep.description).toMatch(/^Take the Québec City Funicular between/);
    }
  });

  it('omits a journey step when no connector lies near the gap between two stops', () => {
    const stopA = stopOf(spot({ id: 'a', lat: 46.812, lng: -71.204 }));
    const stopB = stopOf(spot({ id: 'b', lat: 46.900, lng: -71.300 })); // far away, nothing in between
    const distantConnector = spot({ id: 'c', role: 'connector', lat: 47.5, lng: -72.0 });

    const items = assembleItineraryItems([stopA, stopB], [distantConnector], 'en');
    expect(items.filter(i => i.type === 'journeyStep')).toHaveLength(0);
    expect(items).toHaveLength(2);
  });

  it('never reuses the same connector for two different gaps', () => {
    const stops = [
      stopOf(spot({ id: 'a', lat: 46.812, lng: -71.204 })),
      stopOf(spot({ id: 'b', lat: 46.8125, lng: -71.2045 })),
      stopOf(spot({ id: 'c', lat: 46.813, lng: -71.205 })),
    ];
    const oneStaircase = spot({ id: 'stairs', role: 'connector', lat: 46.8125, lng: -71.2045 });
    const items = assembleItineraryItems(stops, [oneStaircase], 'en');
    expect(items.filter(i => i.type === 'journeyStep')).toHaveLength(1);
  });

  it('stop count excludes journey steps — numbering only counts destinations', () => {
    const stopA = spot({ id: 'a', lat: 46.812, lng: -71.204 });
    const stopB = spot({ id: 'b', lat: 46.8125, lng: -71.2045 });
    const stopC = spot({ id: 'c', lat: 46.813, lng: -71.205 });
    const staircase = spot({ id: 'stairs', role: 'connector', lat: 46.8125, lng: -71.2045 });

    const items = assembleItineraryItems(
      [stopOf(stopA), stopOf(stopB), stopOf(stopC)],
      [staircase],
      'en',
    );
    const stops = items.filter(i => i.type === 'stop');
    expect(stops.map(s => (s.type === 'stop' ? s.order : null))).toEqual([1, 2, 3]);
    expect(items.length).toBeGreaterThan(stops.length); // at least one journey step was inserted
  });
});

describe('findConnectorForGap', () => {
  it('finds a connector within the distance threshold', () => {
    const from = { lat: 46.812, lng: -71.204 } as CandidateSpot;
    const to = { lat: 46.813, lng: -71.205 } as CandidateSpot;
    const near = spot({ id: 'near', lat: 46.8125, lng: -71.2045 });
    expect(findConnectorForGap(from, to, [near], new Set())?.id).toBe('near');
  });

  it('ignores a connector far from the segment', () => {
    const from = { lat: 46.812, lng: -71.204 } as CandidateSpot;
    const to = { lat: 46.813, lng: -71.205 } as CandidateSpot;
    const far = spot({ id: 'far', lat: 47.0, lng: -72.0 });
    expect(findConnectorForGap(from, to, [far], new Set())).toBeNull();
  });

  it('skips a connector already marked as used', () => {
    const from = { lat: 46.812, lng: -71.204 } as CandidateSpot;
    const to = { lat: 46.813, lng: -71.205 } as CandidateSpot;
    const near = spot({ id: 'near', lat: 46.8125, lng: -71.2045 });
    expect(findConnectorForGap(from, to, [near], new Set(['near']))).toBeNull();
  });
});

describe('preference detectors', () => {
  it('hasStrongCulturalPreference is true only when every selected category is Culture', () => {
    expect(hasStrongCulturalPreference(['Culture'])).toBe(true);
    expect(hasStrongCulturalPreference(['Culture', 'Food'])).toBe(false);
    expect(hasStrongCulturalPreference([])).toBe(false);
  });

  it('isCafeFocused is true only when every selected category is Cafe', () => {
    expect(isCafeFocused(['Cafe'])).toBe(true);
    expect(isCafeFocused(['Cafe', 'Bar'])).toBe(false);
  });
});
