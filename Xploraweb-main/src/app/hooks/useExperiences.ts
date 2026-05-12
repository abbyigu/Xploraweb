import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ExperienceCategory } from '../data/products';
import { experiences as staticExperiences } from '../data/products';
import i18n from '../i18n';

function pick(fr: string | null | undefined, en: string | null | undefined): string {
  return (i18n.language === 'fr' && fr) ? fr : (en || '');
}

function pickArr(fr: string[] | null | undefined, en: string[] | null | undefined): string[] | undefined {
  return (i18n.language === 'fr' && fr && fr.length > 0) ? fr : (en || undefined);
}

function mapRow(row: any): Product {
  return {
    id: row.id,
    name: pick(row.name_fr, row.name),
    description: pick(row.description_fr, row.description),
    longDescription: pick(row.long_description_fr, row.long_description) || undefined,
    price: row.price_cents ?? 0,
    image: row.image_url || 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience' as const,
    badge: pick(row.badge_fr, row.badge) || undefined,
    duration: row.duration || undefined,
    spots: row.spots || undefined,
    difficulty: pick(row.difficulty_fr, row.difficulty) || undefined,
    category: (row.category as ExperienceCategory) || undefined,
    highlights: pickArr(row.highlights_fr, row.highlights),
    includes: pickArr(row.includes_fr, row.includes),
    toBring: pickArr(row.to_bring_fr, row.to_bring),
    meetingPoint: row.meeting_point || undefined,
    languages: row.languages || undefined,
    hostName: row.host_name || undefined,
    hostBio: pick(row.host_bio_fr, row.host_bio) || undefined,
    itinerary: pickArr(row.itinerary_fr, row.itinerary),
    neighbourhood: row.neighbourhood || undefined,
    vibes: row.vibes || undefined,
  };
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Product[]>(staticExperiences);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const [xploraRes, allNamesRes, perksRes] = await Promise.all([
      supabase.from('xplora_experiences').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('xplora_experiences').select('name'),
      supabase.from('business_perks').select('*').eq('type', 'xplora_experience').eq('status', 'active').order('created_at', { ascending: false }),
    ]);

    const fromXplora = (xploraRes.data || []).map(mapRow);
    const fromPerks = (perksRes.data || []).map((row: any): Product => ({
      id: row.id,
      name: row.title,
      description: row.description || '',
      price: row.price_cents ?? 0,
      image: row.image_url || 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      type: 'experience' as const,
      badge: undefined,
      duration: row.timing || undefined,
      spots: row.spots_total || undefined,
      difficulty: undefined,
      category: row.category,
    }));

    const allDbNames = new Set((allNamesRes.data || []).map((r: any) => r.name?.toLowerCase()));
    const unpromoted = staticExperiences.filter(e => !allDbNames.has(e.name.toLowerCase()));
    setExperiences([...fromXplora, ...fromPerks, ...unpromoted]);
    setLoading(false);
  };

  // Re-fetch when language changes so translated fields are applied
  useEffect(() => {
    reload();
    i18n.on('languageChanged', reload);
    return () => { i18n.off('languageChanged', reload); };
  }, []);

  return { experiences, loading, reload };
}
