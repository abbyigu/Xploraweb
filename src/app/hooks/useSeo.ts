import { useEffect } from 'react';

const SITE_URL = 'https://www.goxplora.ca';
const DEFAULT_TITLE = 'Xplora — Discover Québec City Like an Insider';
const DEFAULT_DESCRIPTION =
  'Xplora helps you explore Québec City beyond the tourist lists — self-guided routes, local experiences, and neighbourhood picks curated by insiders.';

interface SeoOptions {
  title?: string;
  description?: string;
  /** Path (e.g. "/itinerary") used to build the canonical URL. Defaults to the current path. */
  path?: string;
}

function upsertMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets the document title, meta description, canonical link, and Open Graph
 * tags for the current route. Falls back to site-wide defaults when a page
 * doesn't provide its own. */
export function useSeo({ title, description, path }: SeoOptions = {}) {
  useEffect(() => {
    const resolvedTitle = title ?? DEFAULT_TITLE;
    const resolvedDescription = description ?? DEFAULT_DESCRIPTION;
    const resolvedPath = path ?? window.location.pathname;
    const canonicalUrl = `${SITE_URL}${resolvedPath}`;

    document.title = resolvedTitle;
    upsertMeta('description', resolvedDescription);
    upsertCanonical(canonicalUrl);

    upsertProperty('og:title', resolvedTitle);
    upsertProperty('og:description', resolvedDescription);
    upsertProperty('og:url', canonicalUrl);
    upsertProperty('og:type', 'website');
    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', resolvedTitle);
    upsertMeta('twitter:description', resolvedDescription);
  }, [title, description, path]);
}
