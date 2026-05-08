import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ExperienceCategory } from '../data/products';
import { experiences as staticExperiences } from '../data/products';

function mapRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    longDescription: row.long_description || undefined,
    price: row.price_cents ?? 0,
    image: row.image_url || 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
    type: 'experience' as const,
    badge: row.badge || undefined,
    duration: row.duration || undefined,
    spots: row.spots || undefined,
    difficulty: row.difficulty || undefined,
    category: (row.category as ExperienceCategory) || undefined,
    highlights: row.highlights || undefined,
    includes: row.includes || undefined,
    toBring: row.to_bring || undefined,
    meetingPoint: row.meeting_point || undefined,
    languages: row.languages || undefined,
    hostName: row.host_name || undefined,
    hostBio: row.host_bio || undefined,
    itinerary: row.itinerary || undefined,
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
      // Fetch all DB names (including drafts) so deleted statics stay suppressed
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

    // Suppress static entries that exist in DB under any status (active, draft, or deleted)
    const allDbNames = new Set((allNamesRes.data || []).map((r: any) => r.name?.toLowerCase()));
    const unpromoted = staticExperiences.filter(e => !allDbNames.has(e.name.toLowerCase()));
    setExperiences([...fromXplora, ...fromPerks, ...unpromoted]);
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  return { experiences, loading, reload };
}
