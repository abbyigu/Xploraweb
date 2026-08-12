-- New: reviews on individual places (xplora_spots), following the same
-- moderation rules as saved-itinerary reviews and neighbourhood reviews:
-- >=4-star rating auto-publishes; below that (or a keyword-heuristic
-- rating/comment mismatch) holds the review for an admin response, which is
-- what publishes it. Run this once in the Supabase SQL editor.

CREATE TABLE public.xplora_spot_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    spot_id uuid NOT NULL REFERENCES public.xplora_spots(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rating integer NOT NULL,
    comment text,
    review_status text CHECK (review_status IN ('pending', 'approved')),
    review_mismatch_flag boolean NOT NULL DEFAULT false,
    admin_response text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT xplora_spot_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
    -- One review per person per place — resubmitting updates it (see
    -- upsertSpotReview in spotReviews.ts) rather than piling up duplicates.
    CONSTRAINT xplora_spot_reviews_spot_user_key UNIQUE (spot_id, user_id)
);

ALTER TABLE public.xplora_spot_reviews ENABLE ROW LEVEL SECURITY;

-- Mirrors set_itinerary_review_status (see supabase_itinerary_reviews.sql /
-- supabase_itinerary_review_mismatch_flag.sql) — same publish rule, same
-- heuristic, same admin_response protection. Fires on INSERT and UPDATE since
-- a reviewer can revise their own review (unlike the one-shot neighbourhood
-- review flow).
CREATE OR REPLACE FUNCTION public.set_spot_review_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  is_admin_actor boolean;
  comment_lower text;
  has_negative_words boolean;
  has_positive_words boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ) INTO is_admin_actor;

  IF NOT is_admin_actor THEN
    NEW.admin_response := CASE WHEN TG_OP = 'UPDATE' THEN OLD.admin_response ELSE NULL END;
  END IF;

  comment_lower := lower(coalesce(NEW.comment, ''));
  has_negative_words := comment_lower ~ '(terrible|awful|horrible|worst|disappoint|rude|dirty|overpriced|waste of|wouldn.?t recommend|wouldn.?t go back|avoid|mediocre)';
  has_positive_words := comment_lower ~ '(amazing|wonderful|perfect|the best|loved it|excellent|fantastic|incredible|great time|awesome)';

  NEW.review_mismatch_flag := (NEW.rating >= 4 AND has_negative_words) OR (NEW.rating <= 2 AND has_positive_words);

  NEW.review_status := CASE
    WHEN NEW.admin_response IS NOT NULL THEN 'approved'
    WHEN NEW.review_mismatch_flag THEN 'pending'
    WHEN NEW.rating >= 4 THEN 'approved'
    ELSE 'pending'
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_spot_review_status
  BEFORE INSERT OR UPDATE ON public.xplora_spot_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_spot_review_status();

-- A reviewer manages their own review (insert/update/delete/read); anyone can
-- read approved reviews; admins can read/update everything (to find pending
-- ones and write admin_response).
CREATE POLICY "user manage own spot review" ON public.xplora_spot_reviews
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anyone can read approved spot reviews" ON public.xplora_spot_reviews
  FOR SELECT USING (review_status = 'approved');

CREATE POLICY "admin can view spot reviews" ON public.xplora_spot_reviews
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin can respond to spot reviews" ON public.xplora_spot_reviews
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
