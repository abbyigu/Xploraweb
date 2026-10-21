import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const points = [{ id: 'a', lat: 46.81, lng: -71.21 }, { id: 'b', lat: 46.82, lng: -71.20 }];
beforeEach(() => { vi.resetModules(); vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-key'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('walking-route provider', () => {
  it('requests walking mode and parses verified directed legs', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [{ originIndex: 0, destinationIndex: 1, condition: 'ROUTE_EXISTS', status: {}, distanceMeters: 840, duration: '660s' }] });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchWalkingMatrix } = await import('./googleRoutes');
    const result = await fetchWalkingMatrix(points);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).travelMode).toBe('WALK');
    expect(result?.distanceMeters[0][1]).toBe(840);
    expect(result?.durationSeconds[0][1]).toBe(660);
    expect(result?.durationSeconds[1][0]).toBe(Infinity);
  });
  it('does not invent a route for failed or malformed provider elements', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [
      { originIndex: 0, destinationIndex: 1, condition: 'ROUTE_EXISTS', status: { code: 5 }, distanceMeters: 200, duration: '120s' },
      { originIndex: 0.5, destinationIndex: 1, condition: 'ROUTE_EXISTS', distanceMeters: 200, duration: '120s' },
    ] }));
    const { fetchWalkingMatrix } = await import('./googleRoutes');
    expect((await fetchWalkingMatrix(points))?.distanceMeters[0][1]).toBe(Infinity);
  });
  it('returns unavailable without making a request when the key is absent', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', '');
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock); vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fetchWalkingMatrix } = await import('./googleRoutes');
    expect(await fetchWalkingMatrix(points)).toBeNull(); expect(fetchMock).not.toHaveBeenCalled();
  });
});
