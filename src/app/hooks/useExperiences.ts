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
  };
}

export function useExperiences() {
  const [experiences, setExperiences] = useState<Product[]>(staticExperiences);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase
      .from('xplora_experiences')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data && data.length > 0) {
      setExperiences([...data.map(mapRow), ...staticExperiences]);
    } else {
      setExperiences(staticExperiences);
    }
    setLoading(false);
  };

  useEffect(() => { reload(); }, []);

  return { experiences, loading, reload };
}
