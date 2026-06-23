import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Neighbourhood {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
  boundary: [number, number][] | null;
  famousStreets: string[];
}

export function mapNeighbourhoodRow(row: any): Neighbourhood {
  return {
    id: row.id,
    name: row.name || '',
    slug: row.slug || '',
    tagline: row.tagline || '',
    description: row.description || '',
    coverImage: row.cover_image_url || '',
    sortOrder: row.sort_order ?? 0,
    lat: row.latitude ?? null,
    lng: row.longitude ?? null,
    boundary: Array.isArray(row.boundary) ? row.boundary : null,
    famousStreets: Array.isArray(row.famous_streets) ? row.famous_streets : [],
  };
}

/**
 * Loads the admin-managed neighbourhoods (the ones created in the admin
 * "Neighbourhoods" tab). Returns only active rows, ordered by sort order.
 * The table may not exist yet on older deployments — in that case we simply
 * return an empty list and let callers fall back to their static defaults.
 */
export function useNeighbourhoods() {
  const [neighbourhoods, setNeighbourhoods] = useState<Neighbourhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      if (!active) return;
      if (!error && data) setNeighbourhoods(data.map(mapNeighbourhoodRow));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { neighbourhoods, loading };
}
