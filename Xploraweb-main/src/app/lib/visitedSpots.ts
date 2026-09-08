import type { Spot } from '../data/products';

const KEY = 'xplora_visited_spots';
const EVENT = 'xplora:visited-spots-changed';

function read(): Spot[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function write(spots: Spot[]) {
  localStorage.setItem(KEY, JSON.stringify(spots));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getVisitedSpots(): Spot[] {
  return read();
}

export function isSpotVisited(id: string): boolean {
  return read().some((s) => s.id === id);
}

/** Marks or unmarks the spot as visited ("I've been here"); returns the new visited state. */
export function toggleVisitedSpot(spot: Spot): boolean {
  const spots = read();
  const idx = spots.findIndex((s) => s.id === spot.id);
  if (idx >= 0) {
    spots.splice(idx, 1);
    write(spots);
    return false;
  }
  spots.unshift(spot);
  write(spots);
  return true;
}

/** Notifies every mounted VisitSpotButton and the neighbourhood explorer panel. */
export function onVisitedSpotsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
