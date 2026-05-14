import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import i18n from '../i18n';

function pick(fr: string | null | undefined, en: string | null | undefined): string {
  return (i18n.language === 'fr' && fr) ? fr : (en || '');
}

export interface FeaturedExperience {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  duration?: string;
  badge?: string;
  neighbourhood?: string;
  category?: string;
}

export interface ApprovedReview {
  id: string;
  experience_id: string;
  experience_name: string;
  rating: number;
  comment: string | null;
  reviewer_name: string | null;
}

export function useFeaturedExperiences() {
  const [experiences, setExperiences] = useState<FeaturedExperience[]>([]);
  const [reviews, setReviews] = useState<ApprovedReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: rows } = await supabase
      .from('xplora_experiences')
      .select('id, name, name_fr, description, description_fr, price_cents, image_url, duration, badge, badge_fr, neighbourhood, category')
      .eq('status', 'active')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    const exps: FeaturedExperience[] = (rows ?? []).map((row: any) => ({
      id: row.id,
      name: pick(row.name_fr, row.name),
      description: pick(row.description_fr, row.description),
      price: row.price_cents ?? 0,
      image: row.image_url || 'https://images.unsplash.com/photo-1485675067348-b5ac01cfc282?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      duration: row.duration || undefined,
      badge: pick(row.badge_fr, row.badge) || undefined,
      neighbourhood: row.neighbourhood || undefined,
      category: row.category || undefined,
    }));

    setExperiences(exps);

    if (exps.length > 0) {
      const ids = exps.map(e => e.id);
      const { data: reviewRows } = await supabase
        .from('experience_reviews')
        .select('id, experience_id, rating, comment, reviewer_name')
        .eq('status', 'approved')
        .in('experience_id', ids)
        .order('created_at', { ascending: false })
        .limit(6);

      const nameMap = Object.fromEntries(exps.map(e => [e.id, e.name]));
      setReviews(
        (reviewRows ?? []).map((r: any) => ({
          id: r.id,
          experience_id: r.experience_id,
          experience_name: nameMap[r.experience_id] ?? '',
          rating: r.rating,
          comment: r.comment,
          reviewer_name: r.reviewer_name,
        }))
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    i18n.on('languageChanged', load);
    return () => { i18n.off('languageChanged', load); };
  }, []);

  return { experiences, reviews, loading };
}
