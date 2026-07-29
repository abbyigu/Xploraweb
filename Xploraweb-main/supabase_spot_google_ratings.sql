-- Google Places ratings cache for xplora_spots. Run this once in the Supabase SQL editor.
--
-- place_id is resolved offline (scripts/fetch-google-place-ids.mjs) rather than looked up
-- live, so a bad text-search match can be reviewed/corrected before it's trusted.
-- google_rating/google_review_count are a cache refreshed weekly by
-- api/refresh-google-ratings.ts — never fetched client-side (keeps the API key server-only
-- and avoids paying for a Places call on every pageview).

ALTER TABLE public.xplora_spots
    ADD COLUMN IF NOT EXISTS place_id text,
    ADD COLUMN IF NOT EXISTS google_rating numeric(2,1),
    ADD COLUMN IF NOT EXISTS google_review_count integer,
    ADD COLUMN IF NOT EXISTS google_rating_fetched_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS xplora_spots_place_id_idx ON public.xplora_spots (place_id) WHERE place_id IS NOT NULL;
