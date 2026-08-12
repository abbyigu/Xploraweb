import type { Spot } from '../data/products';

const KEY = 'xplora_saved_spots';
const EVENT = 'xplora:saved-spots-changed';

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

export function getSavedSpots(): Spot[] {
  return read();
}

export function isSpotSaved(id: string): boolean {
  return read().some((s) => s.id === id);
}

/** Adds or removes the spot from the saved list; returns the new saved state. */
export function toggleSavedSpot(spot: Spot): boolean {
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

export function removeSavedSpot(id: string): void {
  write(read().filter((s) => s.id !== id));
}

/** Notifies every mounted SaveSpotButton (same spot can appear in multiple lists at once). */
export function onSavedSpotsChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
