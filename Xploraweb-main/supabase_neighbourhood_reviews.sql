-- Written neighbourhood reviews: 5-star reviews publish immediately, 4-star-and-below
-- go to admin moderation. Run this once in the Supabase SQL editor.

CREATE TABLE public.xplora_neighbourhood_reviews (
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

-- Server-side enforcement of the publish rule — the client's insert never sets
-- status directly, so a forged payload can't bypass moderation.
CREATE OR REPLACE FUNCTION public.set_neighbourhood_review_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := CASE WHEN NEW.rating = 5 THEN 'approved' ELSE 'pending' END;
  NEW.admin_reply := NULL;
  NEW.admin_reply_at := NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_neighbourhood_review_status
BEFORE INSERT ON public.xplora_neighbourhood_reviews
FOR EACH ROW EXECUTE FUNCTION public.set_neighbourhood_review_status();

CREATE POLICY "anyone can submit a neighbourhood review" ON public.xplora_neighbourhood_reviews
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "anyone can read approved neighbourhood reviews" ON public.xplora_neighbourhood_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "admin full access neighbourhood reviews" ON public.xplora_neighbourhood_reviews
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));


-- Private admin <-> reviewer follow-up log. The first reply to a review lives
-- on xplora_neighbourhood_reviews.admin_reply (public); anything after that is
-- a private follow-up delivered by email and only logged here for the admin's
-- own record.
CREATE TABLE public.xplora_neighbourhood_review_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id uuid NOT NULL REFERENCES public.xplora_neighbourhood_reviews(id) ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.xplora_neighbourhood_review_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin full access neighbourhood review messages" ON public.xplora_neighbourhood_review_messages
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
