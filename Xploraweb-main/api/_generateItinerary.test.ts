import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ matrix: vi.fn(), from: vi.fn(), copy: vi.fn() }));
vi.mock('./_lib/googleRoutes.js', () => ({ fetchWalkingMatrix: mocks.matrix }));
vi.mock('./_lib/usage.js', () => ({ getServiceClient: () => ({ from: mocks.from }) }));
vi.mock('ai', () => ({ generateObject: mocks.copy }));
vi.mock('@ai-sdk/anthropic', () => ({ createAnthropic: () => () => ({}) }));

const rows = [
  { id: 'lower', name: 'Lower café', category: 'Cafe', lat: 46.813, lng: -71.209 },
  { id: 'upper', name: 'Upper café', category: 'Cafe', lat: 46.812, lng: -71.206 },
  { id: 'art', name: 'Art lane', category: 'Culture', lat: 46.811, lng: -71.206 },
  { id: 'terrace', name: 'Terrace', category: 'Culture', lat: 46.810, lng: -71.205 },
];
const body = { stopCount: 3, categories: ['Cafe', 'Culture'], neighbourhoods: [], priceRanges: [], language: 'en', maxWalkMinutes: 10 };

async function run(requestBody = body) {
  const { default: handler } = await import('./generate-itinerary');
  const res: any = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
  await handler({ method: 'POST', body: requestBody }, res);
  return { status: res.status.mock.calls.at(-1)[0], data: res.json.mock.calls.at(-1)[0] };
}

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  mocks.from.mockReturnValue({ select: () => ({ eq: async () => ({ data: rows, error: null }) }) });
  mocks.matrix.mockImplementation(async (points: { id: string }[]) => ({
    ids: points.map(point => point.id),
    distanceMeters: points.map((a, i) => points.map((b, j) => i === j ? 0 : a.id === 'lower' || b.id === 'lower' ? 1600 : 180)),
    durationSeconds: points.map((a, i) => points.map((b, j) => i === j ? 0 : a.id === 'lower' || b.id === 'lower' ? 1200 : 120)),
  }));
});

describe('walking-first generation endpoint', () => {
  it('selects a coherent route and returns real per-leg metrics and walking-plus-visit totals', async () => {
    const response = await run();
    expect(response.status).toBe(200);
    const route = response.data.itineraries[0];
    expect(route.stops.map((stop: any) => stop.spot.id)).not.toContain('lower');
    expect(route.stops[0].walkToNext).toMatchObject({ source: 'walking', distanceMeters: 180, durationSeconds: 120 });
    expect(route.estimatedDistanceKm).toBe(0.36);
    expect(route.estimatedDurationMin).toBe(79);
  });
  it('returns an honest unavailable error instead of invented times when routing fails', async () => {
    mocks.matrix.mockResolvedValue(null);
    const response = await run();
    expect(response.status).toBe(503);
    expect(response.data.code).toBe('ROUTING_UNAVAILABLE');
    expect(response.data.itineraries).toBeUndefined();
    expect(mocks.copy).not.toHaveBeenCalled();
  });
  it('does not return a route that exceeds the chosen walking limit', async () => {
    mocks.matrix.mockImplementation(async (points: { id: string }[]) => ({ ids: points.map(point => point.id), distanceMeters: points.map(() => points.map(() => 1800)), durationSeconds: points.map(() => points.map(() => 1800)) }));
    const response = await run();
    expect(response.status).toBe(422);
    expect(response.data.code).toBe('NO_COMPACT_ROUTE');
  });
});
