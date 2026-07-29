// Shared neighbourhood artwork so the listing/detail pages reuse the same
// pictures shown on the main page. Keyed by a normalised name so spelling
// variants match (e.g. "Old-Port" / "Old Port", "Saint Roch" / "Saint-Roch").

export const DEFAULT_NBHD_IMG =
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600';

function norm(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Local artwork used on the home page, by neighbourhood name.
const LOCAL_IMAGES: Record<string, string> = {
  [norm('Old Port')]: '/nbhd/old-port.jpeg',
  [norm('Vieux-Port')]: '/nbhd/old-port.jpeg',
  [norm('Saint-Roch')]: '/nbhd/saint-roch.webp',
  [norm('Petit-Champlain')]: '/nbhd/champlain.jpeg',
  [norm('Montcalm')]: '/nbhd/montcalm.jpg',
  [norm('Limoilou')]: '/nbhd/limoilou.jpeg',
};

// WebP companions for the local JPEGs above (smaller, used as the preferred
// <source> — falls back to the JPEG in LOCAL_IMAGES for browsers/paths that
// don't have one).
const LOCAL_IMAGES_WEBP: Record<string, string> = {
  [norm('Old Port')]: '/nbhd/old-port.webp',
  [norm('Vieux-Port')]: '/nbhd/old-port.webp',
  [norm('Petit-Champlain')]: '/nbhd/champlain.webp',
  [norm('Montcalm')]: '/nbhd/montcalm.webp',
  [norm('Limoilou')]: '/nbhd/limoilou.webp',
};

/**
 * Resolve the image for a neighbourhood: an explicit cover image wins,
 * otherwise reuse the main-page artwork for a matching name, otherwise the
 * shared default.
 */
export function neighbourhoodImage(name: string, coverImage?: string | null): string {
  if (coverImage) return coverImage;
  return LOCAL_IMAGES[norm(name)] || DEFAULT_NBHD_IMG;
}

/**
 * WebP variant of neighbourhoodImage(), only available for the local
 * fallback artwork (not for admin-set coverImage URLs, which may point
 * anywhere). Returns null when there's no local webp companion.
 */
export function neighbourhoodImageWebp(name: string, coverImage?: string | null): string | null {
  if (coverImage) return null;
  return LOCAL_IMAGES_WEBP[norm(name)] || null;
}
