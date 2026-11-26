import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Public project URL + publishable anon key (same defaults as src/app/lib/supabase.ts) so the
// build works without VITE_SUPABASE_* being set in Vercel.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qnalvzgqrfjbuoqsffbs.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CCDW9tXRVNYA66aqo190bw_hIVgo8Nt';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}
const BASE_URL = 'https://www.goxplora.ca';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const HIDDEN_CATEGORIES = new Set(['xploratorsplus', 'xploranights', 'xploratours']); // mirrors useExperiences.ts: the app 404s these

const { data: experiences, error } = await supabase
  .from('xplora_experiences')
  .select('id, category, created_at')
  .eq('status', 'active');

if (error) {
  console.error('Failed to fetch experiences:', error.message);
  process.exit(1);
}

const { data: neighbourhoods, error: nError } = await supabase
  .from('neighbourhoods')
  .select('id, slug, created_at')
  .eq('status', 'active');

if (nError) {
  console.error('Failed to fetch neighbourhoods:', nError.message);
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];

const experienceUrls = (experiences ?? []).filter(e => !HIDDEN_CATEGORIES.has(e.category)).map(({ id, created_at }) => {
  const lastmod = created_at ? created_at.split('T')[0] : today;
  return `
  <url>
    <loc>${BASE_URL}/experience/${id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('');

const neighbourhoodUrls = (neighbourhoods ?? []).map(({ id, slug, created_at }) => {
  const lastmod = created_at ? created_at.split('T')[0] : today;
  return `
  <url>
    <loc>${BASE_URL}/neighbourhoods/${slug || id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('');

const basePath = join(__dirname, '..', 'public', 'sitemap.base.xml');
const sitemapPath = join(__dirname, '..', 'public', 'sitemap.xml');
const static_sitemap = readFileSync(basePath, 'utf-8');

const updated = static_sitemap.replace(
  '</urlset>',
  `${experienceUrls}${neighbourhoodUrls}
</urlset>`
);

writeFileSync(sitemapPath, updated, 'utf-8');

console.log(`Sitemap updated: added ${(experiences ?? []).length} experience URLs and ${(neighbourhoods ?? []).length} neighbourhood URLs.`);
