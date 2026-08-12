-- Follow-up to supabase_itinerary_reviews.sql (run that one first if you haven't).
--
-- Gap this closes: a >=4-star average auto-publishes with zero human check, even if
-- the written notes clearly contradict the rating (e.g. 5 stars but "terrible service,
-- wouldn't go back"). This adds a keyword-heuristic mismatch check to the same trigger
-- so those cases are held for a response too, instead of only sub-4-star ones. It's a
-- deliberately simple heuristic meant to catch obvious cases for a human to double
-- check — not a real sentiment model — false positives are fine since a person reviews
-- every flagged case before anything changes.

ALTER TABLE public.xplora_saved_itineraries
  ADD COLUMN IF NOT EXISTS review_mismatch_flag boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_itinerary_review_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
  is_admin_actor boolean;
  notes_lower text;
  has_negative_words boolean;
  has_positive_words boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ) INTO is_admin_actor;

  IF NOT is_admin_actor THEN
    NEW.admin_response := OLD.admin_response;
  END IF;

  IF NEW.stop_ratings IS NULL OR NEW.stop_ratings = '{}'::jsonb THEN
    NEW.review_status := NULL; -- no per-stop ratings yet — nothing to moderate
    NEW.review_mismatch_flag := false;
  ELSE
    SELECT avg(value::numeric) INTO avg_rating FROM jsonb_each_text(NEW.stop_ratings);

    notes_lower := lower(coalesce(NEW.notes, ''));
    has_negative_words := notes_lower ~ '(terrible|awful|horrible|worst|disappoint|rude|dirty|overpriced|waste of|wouldn.?t recommend|wouldn.?t go back|avoid|mediocre)';
    has_positive_words := notes_lower ~ '(amazing|wonderful|perfect|the best|loved it|excellent|fantastic|incredible|great time|awesome)';

    NEW.review_mismatch_flag := (avg_rating >= 4 AND has_negative_words) OR (avg_rating <= 2 AND has_positive_words);

    NEW.review_status := CASE
      WHEN NEW.admin_response IS NOT NULL THEN 'approved'
      WHEN NEW.review_mismatch_flag THEN 'pending'
      WHEN avg_rating >= 4 THEN 'approved'
      ELSE 'pending'
    END;
  END IF;

  RETURN NEW;
END;
$$;
