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

const DEFAULT_IMAGE = `${BASE_URL}/hero/petit-champlain.jpg`;

function injectHead(html, { title, description, canonical, schemas = [], image = DEFAULT_IMAGE }) {
  const url = `${BASE_URL}${canonical}`;
  const oneLineDescription = singleLine(description);
  let out = html;
  out = replaceAttr(out, /(<title>)[^<]*(<\/title>)/, title);
  out = replaceAttr(out, /(<meta name="description" content=")[^"]*("\s*\/>)/, oneLineDescription);
  out = replaceAttr(out, /(<link rel="canonical" href=")[^"]*("\s*\/>)/, url);
  out = replaceAttr(out, /(<meta property="og:title" content=")[^"]*("\s*\/>)/, title);
  out = replaceAttr(out, /(<meta property="og:description" content=")[^"]*("\s*\/>)/, oneLineDescription);
  out = replaceAttr(out, /(<meta property="og:url" content=")[^"]*("\s*\/>)/, url);
  out = replaceAttr(out, /(<meta property="og:image" content=")[^"]*("\s*\/>)/, image);
  out = replaceAttr(out, /(<meta name="twitter:title" content=")[^"]*("\s*\/>)/, title);
  out = replaceAttr(out, /(<meta name="twitter:description" content=")[^"]*("\s*\/>)/, oneLineDescription);
  out = replaceAttr(out, /(<meta name="twitter:image" content=")[^"]*("\s*\/>)/, image);

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
const fr = JSON.parse(readFileSync(join(ROOT, 'src/app/i18n/fr.json'), 'utf-8'));

const { data: siteContentRow } = await supabase
  .from('site_content')
  .select('*')
  .eq('id', 'homepage')
  .maybeSingle();

// ---- /  (homepage: add Organization schema + above-the-fold static shell) ----
//
// Real visitors get a blank <div id="root"> today until React/Router/i18next/
// Supabase all finish downloading + parsing + executing (~1.3s of main-thread
// work even on a fast desktop — confirmed via local Lighthouse profiling).
// This bakes in a static snapshot of just the above-the-fold content (banner +
// Header + Hero, mirroring App.tsx/Header.tsx/HomeScreen.tsx/HeroSlideshow.tsx's
// real markup and Tailwind classes 1:1) so real users see real pixels
// immediately; React replaces it seamlessly on mount, same as the other
// prerendered routes below. Below-the-fold sections (About, footer, feature
// tiles) are intentionally omitted — they use useReveal()'s IntersectionObserver
// gating and render invisible (opacity-0) until scrolled into view even in the
// live app, so leaving them out of the snapshot changes nothing visible and
// can't shift anything already in the viewport when React appends them later.
//
// Language: this is a single static file served to everyone, so it can't
// detect a visitor's browser language before JS runs. Baked in French to
// match the site's own `fallbackLng: 'fr'` (src/app/i18n/index.ts) — English
// browsers see this French shell for ~1-1.5s before JS swaps to English.
{
  const bannerEnabled = siteContentRow?.banner_enabled ?? true;
  const bannerText = siteContentRow?.banner_text || fr.home.bannerText;
  const heroHeadline = siteContentRow?.hero_headline || fr.home.heroHeadline;
  const heroSubheadline = siteContentRow?.hero_subheadline || fr.home.heroSubheadline;
  const heroCtaLabel = siteContentRow?.hero_cta_label || fr.home.heroCtaLabel;

  const headlineHtml = escapeHtml(heroHeadline)
    .split('\n')
    .map(line => `<span>${line}</span>`)
    .join('<br>');

  const bodyHtml = `
    ${bannerEnabled ? `<div class="bg-[#12343B] text-white text-center text-[11px] leading-snug py-1.5 px-4 font-medium tracking-wide">${escapeHtml(bannerText)}</div>` : ''}
    <header class="hidden md:block bg-white border-b sticky top-0 z-50">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center -ml-4">
            <a href="/" aria-label="${escapeHtml(fr.header.home)}" class="block">
              <img src="/goxplora-logo.png" alt="GoXplora" width="336" height="223" style="width:auto" class="h-28 block">
            </a>
          </div>
          <nav aria-label="Main navigation" class="flex items-center gap-2 lg:gap-3">
            <a href="/" aria-current="page" class="px-3 lg:px-4 py-2 rounded-xl border-2 transition-all text-sm lg:text-base whitespace-nowrap bg-primary/15 border-primary text-foreground font-medium">${escapeHtml(fr.header.home)}</a>
            <a href="/itinerary" class="px-3 lg:px-4 py-2 rounded-xl border-2 transition-all text-sm lg:text-base whitespace-nowrap border-transparent text-foreground hover:bg-muted/40">${escapeHtml(fr.header.experiences)}</a>
            <a href="/neighbourhoods" class="px-3 lg:px-4 py-2 rounded-xl border-2 transition-all text-sm lg:text-base whitespace-nowrap border-transparent text-foreground hover:bg-muted/40">${escapeHtml(fr.header.neighbourhoods)}</a>
            <a href="/about" class="px-3 lg:px-4 py-2 rounded-xl border-2 transition-all text-sm lg:text-base whitespace-nowrap border-transparent text-foreground hover:bg-muted/40">${escapeHtml(fr.header.about)}</a>
          </nav>
          <div class="flex items-center gap-2 lg:gap-4">
            <a href="/business" class="text-sm text-secondary hover:underline transition-colors whitespace-nowrap">${escapeHtml(fr.header.forBusinesses)}</a>
            <button aria-label="${escapeHtml(fr.a11y.switchToEn)}" class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"><span aria-hidden="true">EN</span></button>
            <a href="/dashboard" aria-label="${escapeHtml(fr.a11y.account)}">
              <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity overflow-hidden">
                <span aria-hidden="true" class="text-sm">?</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </header>
    <main id="main-content">
    <div class="md:max-w-none max-w-md mx-auto relative">
    <div class="min-h-screen pb-24 md:pb-0 font-sans">
      <section class="relative min-h-[520px] md:min-h-[600px] flex overflow-hidden">
        <div class="absolute inset-0">
          <picture>
            <source srcset="/hero/park-garden-walk.webp" type="image/webp">
            <img src="/hero/park-garden-walk.jpg" alt="${escapeHtml(fr.home.heroSlideAlt1)}" fetchpriority="high" decoding="sync" class="absolute inset-0 w-full h-full object-cover md:object-[50%_60%] opacity-100">
          </picture>
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65"></div>
        <div class="relative w-full max-w-3xl mx-auto px-6 py-12 md:py-16 text-center flex flex-col items-center justify-center gap-8">
          <div class="flex flex-col items-center gap-5">
            <p class="text-xs uppercase tracking-widest text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both">${escapeHtml(fr.home.heroEyebrow)}</p>
            <h1 class="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight text-white drop-shadow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">${headlineHtml}</h1>
            <p class="text-base md:text-lg text-white/90 max-w-xl drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">${escapeHtml(heroSubheadline)}</p>
          </div>
          <div class="flex flex-col items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <a href="/itinerary" class="inline-flex items-center gap-2 px-8 py-4 bg-[#12343B] text-white rounded-2xl text-base font-medium hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg transition-all w-full sm:w-auto justify-center">
              <img src="/goxplora-logo.png" alt="" width="336" height="223" class="sm:hidden h-5 w-auto flex-shrink-0">
              ${escapeHtml(heroCtaLabel)}
            </a>
            <div class="flex items-center gap-3 text-sm">
              <a href="/how-it-works" class="text-white/90 hover:text-white underline underline-offset-4 transition">${escapeHtml(fr.home.heroSeeHowItWorks)}</a>
              <span class="text-white/40">·</span>
              <a href="/business" class="text-white/90 hover:text-white underline underline-offset-4 transition">${escapeHtml(fr.home.heroForBusiness)}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
    </main>`;

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
  const html = injectBody(
    injectHead(template, {
      title: 'Québec City Tours & Experiences — Xplora',
      description: 'Discover the best of Québec City: guided tours, self-guided walks, local perks, and events in Vieux-Québec and beyond. Xplora is your insider guide to the city.',
      canonical: '/',
      schemas: [organizationSchema],
    }),
    bodyHtml,
  );
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
    injectHead(template, {
      title,
      description,
      canonical: `/neighbourhoods/${slug}`,
      schemas: [touristAttractionSchema],
      image: n.cover_image_url || undefined,
    }),
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
    injectHead(template, {
      title,
      description,
      canonical: `/experience/${e.id}`,
      schemas: [touristAttractionSchema],
      image: e.image_url || undefined,
    }),
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
