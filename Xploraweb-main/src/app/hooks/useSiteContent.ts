import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface SiteContent {
  bannerEnabled: boolean;
  bannerText: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  heroImageUrl: string;
  itineraryPaywalled: boolean;
}

export const SITE_CONTENT_DEFAULTS: SiteContent = {
  bannerEnabled: true,
  bannerText: 'Built in Québec City. Free to start, always.',
  heroHeadline: 'Discover local.\nLive more.',
  heroSubheadline: 'Free, self-guided walking routes through Québec City\'s best neighbourhoods. Pick a route, follow the map, go at your pace.',
  heroCtaLabel: 'Get My Free Route',
  heroImageUrl: '/hero/window-flower-box.jpg',
  itineraryPaywalled: false,
};

export function mapSiteContentRow(row: any): SiteContent {
  return {
    bannerEnabled: row.banner_enabled ?? SITE_CONTENT_DEFAULTS.bannerEnabled,
    bannerText: row.banner_text || SITE_CONTENT_DEFAULTS.bannerText,
    heroHeadline: row.hero_headline || SITE_CONTENT_DEFAULTS.heroHeadline,
    heroSubheadline: row.hero_subheadline || SITE_CONTENT_DEFAULTS.heroSubheadline,
    heroCtaLabel: row.hero_cta_label || SITE_CONTENT_DEFAULTS.heroCtaLabel,
    heroImageUrl: row.hero_image_url || SITE_CONTENT_DEFAULTS.heroImageUrl,
    itineraryPaywalled: row.itinerary_paywalled ?? SITE_CONTENT_DEFAULTS.itineraryPaywalled,
  };
}

/**
 * Loads the admin-managed homepage hero copy and announcement banner (edited
 * from the admin "Site Content" tab). Falls back to the hardcoded defaults
 * when the table is empty, missing, or hasn't been created yet.
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(SITE_CONTENT_DEFAULTS);
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
