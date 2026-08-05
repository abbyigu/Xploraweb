import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteContent {
  // null means "no admin override" — callers should fall back to the
  // translated copy for the current language instead of a hardcoded string.
  heroHeadline: string | null;
  heroSubheadline: string | null;
  heroCtaLabel: string | null;
  heroImageUrl: string;
  itineraryPaywalled: boolean;
}

// English copy used only to prefill the admin "Site Content" form.
export const SITE_CONTENT_DEFAULTS = {
  heroHeadline: 'Discover local.\nLive more.',
  heroSubheadline: 'Curated by locals — self-guided walks, handpicked spots, and experiences that support the community.',
  heroCtaLabel: 'Get My Free Route',
  heroImageUrl: '/hero/window-flower-box.jpg',
  itineraryPaywalled: false,
};

const SITE_CONTENT_INITIAL: SiteContent = {
  heroHeadline: null,
  heroSubheadline: null,
  heroCtaLabel: null,
  heroImageUrl: SITE_CONTENT_DEFAULTS.heroImageUrl,
  itineraryPaywalled: SITE_CONTENT_DEFAULTS.itineraryPaywalled,
};

export function mapSiteContentRow(row: any): SiteContent {
  return {
    heroHeadline: row.hero_headline || null,
    heroSubheadline: row.hero_subheadline || null,
    heroCtaLabel: row.hero_cta_label || null,
    heroImageUrl: row.hero_image_url || SITE_CONTENT_DEFAULTS.heroImageUrl,
    itineraryPaywalled: row.itinerary_paywalled ?? SITE_CONTENT_DEFAULTS.itineraryPaywalled,
  };
}

/**
 * Loads the admin-managed homepage hero copy (edited from the admin "Site
 * Content" tab). Falls back to the hardcoded defaults when the table is
 * empty, missing, or hasn't been created yet.
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(SITE_CONTENT_INITIAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'homepage')
        .maybeSingle();
      if (!active) return;
      if (!error && data) setContent(mapSiteContentRow(data));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { content, loading };
}
