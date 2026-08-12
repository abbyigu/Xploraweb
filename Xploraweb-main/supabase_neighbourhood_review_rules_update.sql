-- Self-contained: creates the neighbourhood-reviews feature from scratch if it
-- doesn't exist yet (its original migration, supabase_neighbourhood_reviews.sql,
-- was apparently never actually run in production — confirmed by "relation
-- public.xplora_neighbourhood_reviews does not exist" when this file was first
-- run as an ALTER-only follow-up), with the updated rules already baked in:
-- auto-approve threshold is >=4-star (not 5-star-only), plus the same
-- keyword-heuristic mismatch flag used by itinerary/place reviews. Safe to
-- run even if the table already exists — every statement is idempotent.

CREATE TABLE IF NOT EXISTS public.xplora_neighbourhood_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    neighbourhood_id uuid NOT NULL REFERENCES public.neighbourhoods(id) ON DELETE CASCADE,
    rating integer NOT NULL,
    comment text,
    reviewer_name text,
    reviewer_email text,
    status text NOT NULL DEFAULT 'pending',
    admin_reply text,
    admin_reply_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT xplora_neighbourhood_reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT xplora_neighbourhood_reviews_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);

ALTER TABLE public.xplora_neighbourhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xplora_neighbourhood_reviews
  ADD COLUMN IF NOT EXISTS mismatch_flag boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_neighbourhood_review_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  comment_lower text;
  has_negative_words boolean;
  has_positive_words boolean;
BEGIN
  comment_lower := lower(coalesce(NEW.comment, ''));
  has_negative_words := comment_lower ~ '(terrible|awful|horrible|worst|disappoint|rude|dirty|overpriced|waste of|wouldn.?t recommend|wouldn.?t go back|avoid|mediocre)';
  has_positive_words := comment_lower ~ '(amazing|wonderful|perfect|the best|loved it|excellent|fantastic|incredible|great time|awesome)';

  NEW.mismatch_flag := (NEW.rating >= 4 AND has_negative_words) OR (NEW.rating <= 2 AND has_positive_words);

  NEW.status := CASE
    WHEN NEW.mismatch_flag THEN 'pending'
    WHEN NEW.rating >= 4 THEN 'approved'
    ELSE 'pending'
  END;
  NEW.admin_reply := NULL;
  NEW.admin_reply_at := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_neighbourhood_review_status ON public.xplora_neighbourhood_reviews;
CREATE TRIGGER trg_neighbourhood_review_status
  BEFORE INSERT ON public.xplora_neighbourhood_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_neighbourhood_review_status();

DROP POLICY IF EXISTS "anyone can submit a neighbourhood review" ON public.xplora_neighbourhood_reviews;
CREATE POLICY "anyone can submit a neighbourhood review" ON public.xplora_neighbourhood_reviews
  FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "anyone can read approved neighbourhood reviews" ON public.xplora_neighbourhood_reviews;
CREATE POLICY "anyone can read approved neighbourhood reviews" ON public.xplora_neighbourhood_reviews
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "admin full access neighbourhood reviews" ON public.xplora_neighbourhood_reviews;
CREATE POLICY "admin full access neighbourhood reviews" ON public.xplora_neighbourhood_reviews
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));


-- Private admin <-> reviewer follow-up log (the "Email reviewer" button's
-- history), used once a public reply already exists.
CREATE TABLE IF NOT EXISTS public.xplora_neighbourhood_review_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid NOT NULL REFERENCES public.xplora_neighbourhood_reviews(id) ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.xplora_neighbourhood_review_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin full access neighbourhood review messages" ON public.xplora_neighbourhood_review_messages;
CREATE POLICY "admin full access neighbourhood review messages" ON public.xplora_neighbourhood_review_messages
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
