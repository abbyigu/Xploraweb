// Generates static HTML snapshots for the highest-value public routes so
// non-JS-rendering crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) see real
// per-page titles/meta/canonical/JSON-LD/content instead of the same empty
// SPA shell on every URL. Real visitors are unaffected: main.tsx mounts with
// createRoot (not hydrateRoot), so React simply replaces this snapshot on load.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const BASE_URL = 'https://goxplora.ca';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceAttr(html, selectorRegex, newValue) {
  return html.replace(selectorRegex, (match, before, after) => `${before}${escapeHtml(newValue)}${after}`);
}

// Meta/OG/Twitter content should read as one line — admin-entered Supabase
// text (e.g. neighbourhood descriptions) can contain literal "\n\n" breaks
// that are fine in the visible <p> body but look broken in a content="" attr.
function singleLine(str) {
  return String(str ?? '').replace(/\s+/g, ' ').trim();
}

function injectHead(html, { title, description, canonical, schemas = [] }) {
  const url = `${BASE_URL}${canonical}`;
  const oneLineDescription = singleLine(description);
  let out = html;
  out = replaceAttr(out, /(<title>)[^<]*(<\/title>)/, title);
  out = replaceAttr(out, /(<meta name="description" content=")[^"]*("\s*\/>)/, oneLineDescription);
  out = replaceAttr(out, /(<link rel="canonical" href=")[^"]*("\s*\/>)/, url);
  out = replaceAttr(out, /(<meta property="og:title" content=")[^"]*("\s*\/>)/, title);
  out = replaceAttr(out, /(<meta property="og:description" content=")[^"]*("\s*\/>)/, oneLineDescription);
  out = replaceAttr(out, /(<meta property="og:url" content=")[^"]*("\s*\/>)/, url);
  out = replaceAttr(out, /(<meta name="twitter:title" content=")[^"]*("\s*\/>)/, title);
  out = replaceAttr(out, /(<meta name="twitter:description" content=")[^"]*("\s*\/>)/, oneLineDescription);

  const ldJson = schemas
    // Escape "</" so admin-entered text (e.g. a description containing the
    // literal string "</script>") can't break out of the JSON-LD block.
    .map(s => `<script type="application/ld+json">${JSON.stringify(s).replace(/<\//g, '<\\/')}</script>`)
    .join('\n      ');
  out = out.replace('</head>', `      ${ldJson}\n    </head>`);
  return out;
}

function injectBody(html, bodyHtml) {
  return html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function writeSnapshot(routePath, html) {
  const dir = routePath === '/' ? DIST : join(DIST, routePath.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf-8');
  console.log(`Prerendered ${routePath}`);
}

// ---- data ----

const { data: neighbourhoods, error: nErr } = await supabase
  .from('neighbourhoods')
  .select('*')
  .eq('status', 'active')
  .order('sort_order', { ascending: true });
if (nErr) {
  console.error('Failed to fetch neighbourhoods:', nErr.message);
  process.exit(1);
}

const { data: experiences, error: eErr } = await supabase
  .from('xplora_experiences')
  .select('*')
  .eq('status', 'active');
if (eErr) {
  console.error('Failed to fetch experiences:', eErr.message);
  process.exit(1);
}

const en = JSON.parse(readFileSync(join(ROOT, 'src/app/i18n/en.json'), 'utf-8'));

// ---- /  (homepage: add Organization schema on top of existing static meta) ----

{
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Xplora',
    url: `${BASE_URL}/`,
    logo: `${BASE_URL}/goxplora-logo.png`,
    description: 'Xplora is an insider guide to Québec City: guided tours, self-guided neighbourhood walks, local perks, and events.',
    areaServed: {
      '@type': 'City',
      name: 'Québec City',
    },
  };
  // Plain-text literals (not extracted from the already-HTML-escaped
  // template) since injectHead()/escapeHtml() will escape them itself.
  const html = injectHead(template, {
    title: 'Québec City Tours & Experiences — Xplora',
    description: 'Discover the best of Québec City: guided tours, self-guided walks, local perks, and events in Vieux-Québec and beyond. Xplora is your insider guide to the city.',
    canonical: '/',
    schemas: [organizationSchema],
  });
  writeSnapshot('/', html);
}

// ---- /neighbourhoods (list) ----

{
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: neighbourhoods.map((n, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: n.name,
      url: `${BASE_URL}/neighbourhoods/${n.slug || n.id}`,
    })),
  };
  const bodyHtml = `
    <h1>${escapeHtml(en.neighbourhoods.title)}</h1>
    <p>${escapeHtml(en.neighbourhoods.subtitle)}</p>
    <ul>
      ${neighbourhoods.map(n => `
      <li>
        <a href="/neighbourhoods/${escapeHtml(n.slug || n.id)}">${escapeHtml(n.name)}</a>
        ${n.tagline ? `<p>${escapeHtml(n.tagline)}</p>` : ''}
      </li>`).join('')}
    </ul>`;
  const html = injectBody(
    injectHead(template, {
      title: en.neighbourhoods.seoTitle,
      description: en.neighbourhoods.seoDesc,
      canonical: '/neighbourhoods',
      schemas: [itemListSchema],
    }),
    bodyHtml,
  );
  writeSnapshot('/neighbourhoods', html);
}

// ---- /neighbourhoods/:slug (detail) ----

for (const n of neighbourhoods) {
  const slug = n.slug || n.id;
  const title = en.neighbourhoodDetail.seoTitleSuffix.replace('{{name}}', n.name);
  const description = n.description || n.tagline || en.neighbourhoodDetail.seoDescFallback.replace('{{name}}', n.name);
  const famousStreets = Array.isArray(n.famous_streets) ? n.famous_streets : [];
  const localExperiences = experiences.filter(
    e => (e.neighbourhood || '').trim().toLowerCase() === n.name.trim().toLowerCase(),
  );

  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: n.name,
    description,
    image: n.cover_image_url || undefined,
    url: `${BASE_URL}/neighbourhoods/${slug}`,
    touristType: 'Tourists, Locals',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Québec City',
      addressRegion: 'QC',
      addressCountry: 'CA',
    },
  };

  const bodyHtml = `
    <h1>${escapeHtml(n.name)}</h1>
    ${n.tagline ? `<p>${escapeHtml(n.tagline)}</p>` : ''}
    ${n.description ? `<p>${escapeHtml(n.description)}</p>` : ''}
    ${famousStreets.length > 0 ? `
    <h2>${escapeHtml(en.neighbourhoodDetail.famousStreets)}</h2>
    <ul>${famousStreets.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : ''}
    ${localExperiences.length > 0 ? `
    <h2>${escapeHtml(en.neighbourhoodDetail.tours)}</h2>
    <ul>${localExperiences.map(e => `<li><a href="/experience/${escapeHtml(e.id)}">${escapeHtml(e.name)}</a></li>`).join('')}</ul>` : ''}`;

  const html = injectBody(
    injectHead(template, { title, description, canonical: `/neighbourhoods/${slug}`, schemas: [touristAttractionSchema] }),
    bodyHtml,
  );
  writeSnapshot(`/neighbourhoods/${slug}`, html);
}

// ---- /experience/:id (tours / experiences) ----

for (const e of experiences) {
  const title = en.experienceDetail.seoTitle.replace('{{name}}', e.name);
  const description = e.description || [
    en.experienceDetail.seoDescBook.replace('{{name}}', e.name),
    e.duration ? en.experienceDetail.seoDescDuration.replace('{{duration}}', e.duration) : '',
    e.neighbourhood ? en.experienceDetail.seoDescLocated.replace('{{neighbourhood}}', e.neighbourhood) : '',
    en.experienceDetail.seoDescCurated,
  ].filter(Boolean).join(' ');

  // Same shape as ExperienceDetailScreen.tsx's touristAttractionSchema — no
  // `offers` block while paid bookings aren't open.
  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: e.name,
    description: e.description,
    image: e.image_url,
    url: `${BASE_URL}/experience/${e.id}`,
    touristType: 'Tourists, Locals',
    address: {
      '@type': 'PostalAddress',
      addressLocality: e.neighbourhood || 'Québec City',
      addressRegion: 'QC',
      addressCountry: 'CA',
    },
  };

  const highlights = Array.isArray(e.highlights) ? e.highlights : [];
  const includes = Array.isArray(e.includes) ? e.includes : [];

  const bodyHtml = `
    <h1>${escapeHtml(e.name)}</h1>
    <p>${escapeHtml(e.description)}</p>
    ${highlights.length > 0 ? `
    <h2>${escapeHtml(en.experienceDetail.highlights)}</h2>
    <ul>${highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>` : ''}
    ${includes.length > 0 ? `
    <h2>${escapeHtml(en.experienceDetail.whatsIncluded)}</h2>
    <ul>${includes.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}
    ${e.long_description ? `
    <h2>${escapeHtml(en.experienceDetail.about)}</h2>
    ${e.long_description.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}` : ''}`;

  const html = injectBody(
    injectHead(template, { title, description, canonical: `/experience/${e.id}`, schemas: [touristAttractionSchema] }),
    bodyHtml,
  );
  writeSnapshot(`/experience/${e.id}`, html);
}

// ---- /faq ----

{
  const categories = [
    { title: en.faq.languageTitle, items: [
      ['q_language_en', 'a_language_en'], ['q_language_fr', 'a_language_fr'], ['q_guide', 'a_guide'],
    ] },
    { title: en.faq.logisticsTitle, items: [
      ['q_meetingpoint', 'a_meetingpoint'], ['q_late', 'a_late'], ['q_phone', 'a_phone'],
    ] },
    { title: en.faq.weatherTitle, items: [
      ['q_rain', 'a_rain'], ['q_weather_cancel', 'a_weather_cancel'], ['q_self_guided_weather', 'a_self_guided_weather'],
    ] },
    { title: en.faq.accessibilityTitle, items: [
      ['q_wheelchair', 'a_wheelchair'], ['q_kids', 'a_kids'], ['q_age', 'a_age'],
    ] },
  ].map(cat => ({
    title: cat.title,
    items: cat.items.map(([qKey, aKey]) => ({ q: en.faq[qKey], a: en.faq[aKey] })),
  }));

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categories.flatMap(cat => cat.items).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  const bodyHtml = `
    <h1>${escapeHtml(en.faq.headline)}</h1>
    <p>${escapeHtml(en.faq.subheadline)}</p>
    ${categories.map(cat => `
    <h2>${escapeHtml(cat.title)}</h2>
    ${cat.items.map(({ q, a }) => `<h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p>`).join('')}`).join('')}`;

  const html = injectBody(
    injectHead(template, { title: en.faq.seoTitle, description: en.faq.seoDesc, canonical: '/faq', schemas: [faqPageSchema] }),
    bodyHtml,
  );
  writeSnapshot('/faq', html);
}

console.log(`Prerendered ${1 + 1 + neighbourhoods.length + experiences.length + 1} pages.`);
