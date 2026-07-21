import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Spot } from '../data/products';
import i18n from '../i18n';

function pick(fr: string | null | undefined, en: string | null | undefined): string {
  return (i18n.language === 'fr' && fr) ? fr : (en || '');
}

function pickArr(fr: string[] | null | undefined, en: string[] | null | undefined): string[] | undefined {
  return (i18n.language === 'fr' && fr && fr.length > 0) ? fr : (en || undefined);
}

export function mapSpotRow(row: any): Spot {
  return {
    id: row.id,
    name: pick(row.name_fr, row.name),
    description: pick(row.description_fr, row.description) || undefined,
    address: row.address || undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    website: row.website || undefined,
    michelinUrl: row.michelin_url || undefined,
    image: row.image_url || undefined,
    neighbourhood: row.neighbourhood || undefined,
    vibes: row.vibes || undefined,
    category: row.category || undefined,
    isBrunch: row.is_brunch || undefined,
    isHotspot: row.is_hotspot || undefined,
    isLoved: row.is_loved || undefined,
    visitTime: row.visit_time || undefined,
    priceRange: row.price_range || undefined,
    xploraTips: pickArr(row.xplora_tips_fr, row.xplora_tips),
    status: row.status || undefined,
  };
}

/**
 * Loads the shared spots library. Spots are the reusable building blocks that
 * trails (and, later, the AI trek builder) assemble into routes.
 */
export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase
      .from('xplora_spots')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    setSpots((data || []).map(mapSpotRow));
    setLoading(false);
  };

  useEffect(() => {
    reload();
    i18n.on('languageChanged', reload);
    return () => { i18n.off('languageChanged', reload); };
  }, []);

  // Quick id → spot lookup for resolving trail spotIds.
  const byId = useMemo(() => {
    const m = new Map<string, Spot>();
    for (const s of spots) m.set(s.id, s);
    return m;
  }, [spots]);

  return { spots, byId, loading, reload };
}
