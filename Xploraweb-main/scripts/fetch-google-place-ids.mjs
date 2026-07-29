#!/usr/bin/env node
/**
 * Resolve a Google Places `place_id` for existing xplora_spots rows and cache
 * their current rating/review count in the same pass (Place Details is a
 * separate billed call, so grabbing rating/userRatingCount from the Text
 * Search match up front saves one call per spot).
 *
 * This is a one-time backfill you review by eye — text-search name matching
 * can mismatch (wrong branch, permanently-closed listing, etc.), so it
 * always prints what it resolved before writing. Once place_id is set,
 * api/refresh-google-ratings.ts keeps the rating cache current on its own.
 *
 * Usage:
 *   GOOGLE_MAPS_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/fetch-google-place-ids.mjs
 *
 * Flags:
 *   --dry-run   Resolve + print, but write nothing.
 *   --all       Re-resolve spots that already have a place_id too (default: only missing ones).
 *
 * Env:
 *   GOOGLE_MAPS_API_KEY        (required) Places API (New) enabled, billing on.
 *   SUPABASE_SERVICE_ROLE_KEY  (required) bypasses RLS to read/update spots.
 *   SUPABASE_URL               (optional) defaults to the Xplora project URL.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qnalvzgqrfjbuoqsffbs.supabase.co';
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ALL = args.includes('--all');

// Québec City — used to bias the text search toward the right region.
const QC = { lat: 46.8139, lng: -71.2080, radius: 30000 };

function die(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!GOOGLE_KEY) die('Missing GOOGLE_MAPS_API_KEY.');
if (!SERVICE_KEY) die('Missing SUPABASE_SERVICE_ROLE_KEY (needed to read spot ids, even for --dry-run).');

async function resolvePlace(spot) {
  const bias = (spot.lat != null && spot.lng != null)
    ? { lat: spot.lat, lng: spot.lng, radius: 2000 }
    : QC;
  const body = {
    textQuery: [spot.name, spot.address].filter(Boolean).join(', '),
    maxResultCount: 1,
    locationBias: {
      circle: {
        center: { latitude: bias.lat, longitude: bias.lng },
        radius: bias.radius,
      },
    },
  };
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
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
    placeId: p.id,
    matchedName: p.displayName?.text || null,
    matchedAddress: p.formattedAddress || null,
    rating: typeof p.rating === 'number' ? p.rating : null,
    reviewCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  let query = supabase.from('xplora_spots').select('id, name, address, lat, lng, place_id');
  if (!ALL) query = query.is('place_id', null);
  const { data: spots, error } = await query;
  if (error) die(`Could not read spots: ${error.message}`);
  if (!spots || spots.length === 0) {
    console.log('Nothing to resolve — no spots' + (ALL ? '' : ' missing a place_id') + '.');
    return;
  }
  console.log(`Resolving ${spots.length} spot(s)...\n`);

  const updates = [];
  const unresolved = [];
  let i = 0;
  for (const spot of spots) {
    i++;
    try {
      const match = await resolvePlace(spot);
      if (!match) {
        unresolved.push(spot.name);
        console.log(`  [${i}/${spots.length}] ✖ no match: ${spot.name}`);
        continue;
      }
      updates.push({ id: spot.id, ...match });
      const ratingStr = match.rating != null ? `${match.rating}★ (${match.reviewCount})` : 'no rating yet';
      console.log(`  [${i}/${spots.length}] ✓ ${spot.name} → "${match.matchedName}" — ${ratingStr}`);
    } catch (err) {
      unresolved.push(spot.name);
      console.log(`  [${i}/${spots.length}] ✖ error: ${spot.name} — ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 120)); // be gentle on the API
  }

  console.log(`\nResolved ${updates.length} / ${spots.length}. Unresolved: ${unresolved.length}.`);
  if (unresolved.length) console.log('Unresolved (check name/address manually): ' + unresolved.join(', '));
  console.log('\nReview the matched names above before trusting them — a wrong match writes a wrong rating.');

  if (DRY_RUN) {
    console.log('\n--dry-run: nothing written.');
    return;
  }
  if (updates.length === 0) return;

  const now = new Date().toISOString();
  for (const u of updates) {
    const { error: updateError } = await supabase
      .from('xplora_spots')
      .update({
        place_id: u.placeId,
        google_rating: u.rating,
        google_review_count: u.reviewCount,
        google_rating_fetched_at: u.rating != null ? now : null,
      })
      .eq('id', u.id);
    if (updateError) die(`Update failed for spot ${u.id}: ${updateError.message}`);
  }
  console.log(`\n✔ Done. Updated ${updates.length} spot(s).`);
}

main().catch((e) => die(e.stack || e.message));
