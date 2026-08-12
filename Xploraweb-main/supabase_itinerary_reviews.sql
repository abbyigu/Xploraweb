-- Saved-itinerary reviews: 4-star-and-up average (across per-stop ratings) publishes
-- immediately; anything below goes to admin moderation and only becomes visible on
-- the public /i/:slug page once an admin has posted a public response. Mirrors the
-- xplora_neighbourhood_reviews moderation pattern. Run this once in the Supabase SQL editor.

ALTER TABLE public.xplora_saved_itineraries
  ADD COLUMN IF NOT EXISTS review_status text CHECK (review_status IN ('pending', 'approved')),
  ADD COLUMN IF NOT EXISTS admin_response text;

-- Server-side enforcement of the publish rule (mirrors set_neighbourhood_review_status):
-- the client never sets review_status directly, so a forged update can't bypass
-- moderation. Also protects admin_response — only an admin's own write may set or
-- change it, so a review's owner can't fake a reply to auto-publish their own review.
CREATE OR REPLACE FUNCTION public.set_itinerary_review_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
  is_admin_actor boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ) INTO is_admin_actor;

  IF NOT is_admin_actor THEN
    NEW.admin_response := OLD.admin_response;
  END IF;

  IF NEW.stop_ratings IS NULL OR NEW.stop_ratings = '{}'::jsonb THEN
    NEW.review_status := NULL; -- no per-stop ratings yet — nothing to moderate
  ELSE
    SELECT avg(value::numeric) INTO avg_rating FROM jsonb_each_text(NEW.stop_ratings);
    NEW.review_status := CASE
      WHEN avg_rating >= 4 THEN 'approved'
      WHEN NEW.admin_response IS NOT NULL THEN 'approved'
      ELSE 'pending'
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_itinerary_review_status ON public.xplora_saved_itineraries;
CREATE TRIGGER trg_itinerary_review_status
  BEFORE UPDATE ON public.xplora_saved_itineraries
  FOR EACH ROW EXECUTE FUNCTION public.set_itinerary_review_status();

-- Admins need to see every saved itinerary (to find pending reviews) and to write
-- admin_response on someone else's row — the existing "user manage own itineraries"
-- policy only covers the owner. RLS policies are OR'd together, so this only adds
-- access, it doesn't loosen the owner-only policy already in place.
CREATE POLICY "admin can view itineraries" ON public.xplora_saved_itineraries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "admin can respond to itineraries" ON public.xplora_saved_itineraries
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));


-- Unrelated fix found while testing this feature: xplora_feedback has no working
-- INSERT policy in production (confirmed live — inserts 403 with "row violates
-- row-level security policy"), even though supabase_schema.sql's reference dump
-- says this policy should exist. The Footer/"/feedback" page has likely been
-- silently failing to save anything. Re-creating it here to be safe either way.
DROP POLICY IF EXISTS "anyone can submit feedback" ON public.xplora_feedback;
CREATE POLICY "anyone can submit feedback" ON public.xplora_feedback
  FOR INSERT TO authenticated, anon WITH CHECK (true);
