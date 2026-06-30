#!/usr/bin/env node
/**
 * Import Google Maps "Saved" places into xplora_spots as DRAFTS.
 *
 * Pipeline:
 *   1. Read one or more Google Takeout "Saved" CSV files (columns: Title, Note, URL).
 *   2. For each row, resolve the place with the Google Places API (Text Search, new v1)
 *      to get lat/lng, formatted address, website, price level and types.
 *   3. Insert into xplora_spots with status='draft' (hidden from the public site;
 *      visible in the admin Spots tab so you can complete + publish each one).
 *
 * Dedupe: skips any place whose name already exists in xplora_spots (case-insensitive).
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/import-google-saved.mjs ./takeout/Saved/*.csv
 *
 * Flags:
 *   --dry-run     Resolve + print what would be inserted, but write nothing.
 *   --status=X    Insert with this status instead of 'draft'.
 *
 * Env:
 *   GOOGLE_MAPS_API_KEY        (required) Places API enabled, billing on.
 *   SUPABASE_SERVICE_ROLE_KEY  (required, unless --dry-run) bypasses RLS to insert.
 *   SUPABASE_URL               (optional) defaults to the Xplora project URL.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qnalvzgqrfjbuoqsffbs.supabase.co';
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const STATUS = (args.find((a) => a.startsWith('--status=')) || '--status=draft').split('=')[1];
const csvPaths = args.filter((a) => !a.startsWith('--'));

// Québec City — used to bias geocoding toward the right region.
const QC = { lat: 46.8139, lng: -71.2080, radius: 30000 };

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!GOOGLE_KEY) die('Missing GOOGLE_MAPS_API_KEY.');
if (!DRY_RUN && !SERVICE_KEY) die('Missing SUPABASE_SERVICE_ROLE_KEY (or pass --dry-run).');
if (csvPaths.length === 0) die('No CSV files given. Pass paths to your Takeout "Saved" CSVs.');

// --- Minimal RFC-4180 CSV parser (handles quoted fields, commas, newlines). ---
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function readSavedCsv(path) {
  const rows = parseCsv(readFileSync(path, 'utf8')).filter((r) => r.some((c) => c.trim()));
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const ti = header.indexOf('title');
  const ni = header.indexOf('note');
  const ui = header.indexOf('url');
  return rows.slice(1).map((r) => ({
    title: (ti >= 0 ? r[ti] : r[0] || '').trim(),
    note: (ni >= 0 ? r[ni] : '').trim(),
    url: (ui >= 0 ? r[ui] : '').trim(),
  })).filter((r) => r.title);
}

// Pull a lat,lng out of a Google Maps URL when present (used only as a search bias).
function coordsFromUrl(url) {
  if (!url) return null;
  let m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lng: +m[2] };
  m = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lng: +m[2] };
  m = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return { lat: +m[1], lng: +m[2] };
  return null;
}

// Map Google place "types" → your SPOT_CATEGORIES. First match wins.
const CATEGORY_RULES = [
  [/restaurant|cafe|coffee|bakery|bar|food|meal_|brewery|winery/, 'Food'],
  [/museum|art_gallery|theater|performing|cultural|tourist_attraction|landmark/, 'Culture'],
  [/park|natural|hiking|campground|beach|garden|zoo|forest/, 'Nature'],
  [/store|shop|market|mall|clothing|book/, 'Shopping'],
  [/amusement|aquarium|playground|family|movie/, 'Family'],
  [/historic|monument|church|place_of_worship|castle/, 'History'],
];
function mapCategory(types = []) {
  const joined = types.join(' ');
  for (const [re, cat] of CATEGORY_RULES) if (re.test(joined)) return cat;
  return null; // leave blank for you to set
}

const PRICE_MAP = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

async function resolvePlace(entry) {
  const bias = coordsFromUrl(entry.url) || QC;
  const body = {
    textQuery: entry.title,
    maxResultCount: 1,
    locationBias: {
      circle: {
        center: { latitude: bias.lat, longitude: bias.lng },
        radius: bias.radius || 30000,
      },
    },
  };
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask':
        'places.displayName,places.formattedAddress,places.location,places.websiteUri,places.priceLevel,places.types',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Places API ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const p = data.places?.[0];
  if (!p) return null;
  return {
    name: p.displayName?.text || entry.title,
    address: p.formattedAddress || null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    website: p.websiteUri || null,
    category: mapCategory(p.types),
    price_range: PRICE_MAP[p.priceLevel] || null,
    description: entry.note || null, // your saved note becomes a starting description
    status: STATUS,
  };
}

async function main() {
  // Gather + dedupe input rows by title.
  const seen = new Set();
  const entries = [];
  for (const path of csvPaths) {
    for (const e of readSavedCsv(path)) {
      const key = e.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push(e);
    }
  }
  console.log(`\nFound ${entries.length} unique saved places across ${csvPaths.length} file(s).`);

  const supabase = SERVICE_KEY ? createClient(SUPABASE_URL, SERVICE_KEY) : null;

  // Existing spot names → skip duplicates already in the DB.
  let existing = new Set();
  if (supabase) {
    const { data, error } = await supabase.from('xplora_spots').select('name');
    if (error) die(`Could not read existing spots: ${error.message}`);
    existing = new Set((data || []).map((r) => (r.name || '').toLowerCase().trim()));
    console.log(`Already in DB: ${existing.size} spots (will be skipped if matched by name).`);
  }

  const toInsert = [];
  const unresolved = [];
  let i = 0;
  for (const e of entries) {
    i++;
    if (existing.has(e.title.toLowerCase().trim())) {
      console.log(`  [${i}/${entries.length}] skip (exists): ${e.title}`);
      continue;
    }
    try {
      const spot = await resolvePlace(e);
      if (!spot || spot.lat == null) {
        unresolved.push(e.title);
        console.log(`  [${i}/${entries.length}] ✖ no match: ${e.title}`);
      } else {
        toInsert.push(spot);
        console.log(`  [${i}/${entries.length}] ✓ ${spot.name}  (${spot.category || '—'}, ${spot.price_range || '—'})`);
      }
    } catch (err) {
      unresolved.push(e.title);
      console.log(`  [${i}/${entries.length}] ✖ error: ${e.title} — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 120)); // be gentle on the API
  }

  console.log(`\nResolved ${toInsert.length} / ${entries.length}. Unresolved: ${unresolved.length}.`);
  if (unresolved.length) console.log('Unresolved (fill manually): ' + unresolved.join(', '));

  if (DRY_RUN) {
    console.log('\n--dry-run: nothing written. Sample of first 3:');
    console.dir(toInsert.slice(0, 3), { depth: null });
    return;
  }
  if (toInsert.length === 0) { console.log('Nothing to insert.'); return; }

  // Insert in batches.
  for (let b = 0; b < toInsert.length; b += 100) {
    const batch = toInsert.slice(b, b + 100);
    const { error } = await supabase.from('xplora_spots').insert(batch);
    if (error) die(`Insert failed at batch ${b}: ${error.message}`);
    console.log(`  inserted ${Math.min(b + 100, toInsert.length)}/${toInsert.length}`);
  }
  console.log(`\n✔ Done. ${toInsert.length} spots added as '${STATUS}'. Open the admin Spots tab to complete + publish them.`);
}

main().catch((e) => die(e.stack || e.message));
