--
-- PostgreSQL database dump
--

\restrict wN9tpc7oIGQqURtJDP8MaDZTOjMZBV5ZE8FC2EuisZUlUqSthxciE4Aa2VmGq7F

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: decrement_spots(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_spots(experience_id text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE business_perks
  SET spots_remaining = spots_remaining - 1
  WHERE id::TEXT = experience_id
    AND spots_remaining > 0;
END;
$$;


ALTER FUNCTION public.decrement_spots(experience_id text) OWNER TO postgres;

--
-- Name: decrement_spots(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.decrement_spots(experience_id uuid) RETURNS void
    LANGUAGE sql
    AS $$
  update business_perks
  set spots_remaining = spots_remaining - 1
  where id = experience_id and spots_remaining > 0;
$$;


ALTER FUNCTION public.decrement_spots(experience_id uuid) OWNER TO postgres;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, location, interests, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', ''),
    'Quebec City, QC',
    ARRAY[]::text[],
    null
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_code text,
    experience_id uuid,
    user_id uuid,
    business_id uuid,
    business_name text,
    experience_title text,
    address text,
    stripe_session_id text,
    amount_paid_cents integer,
    client_email text,
    client_name text,
    status text DEFAULT 'confirmed'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: business_perks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_perks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    business_name text,
    title text NOT NULL,
    description text,
    offer text,
    category text,
    timing text,
    image_url text,
    location text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    type text DEFAULT 'free'::text,
    price_cents integer,
    spots_total integer,
    spots_remaining integer,
    event_date timestamp with time zone,
    address text
);


ALTER TABLE public.business_perks OWNER TO postgres;

--
-- Name: experience_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experience_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experience_id text NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer_name text,
    created_at timestamp with time zone DEFAULT now(),
    approved boolean DEFAULT false,
    CONSTRAINT experience_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT experience_reviews_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


ALTER TABLE public.experience_reviews OWNER TO postgres;

--
-- Name: neighbourhoods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neighbourhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    tagline text DEFAULT ''::text,
    description text DEFAULT ''::text,
    cover_image_url text DEFAULT ''::text,
    sort_order integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    latitude numeric,
    longitude numeric,
    boundary jsonb,
    famous_streets text[] DEFAULT '{}'::text[],
    route jsonb,
    tagline_fr text DEFAULT ''::text,
    description_fr text DEFAULT ''::text
);


ALTER TABLE public.neighbourhoods OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_session_id text NOT NULL,
    user_id uuid,
    customer_email text,
    amount_total integer,
    currency text,
    status text DEFAULT 'completed'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    name text,
    email text,
    location text DEFAULT 'Quebec City, QC'::text,
    interests text[] DEFAULT '{}'::text[],
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now(),
    account_type text DEFAULT 'user'::text,
    business_name text,
    business_type text,
    business_website text,
    stripe_connect_account_id text,
    stripe_connect_onboarded boolean DEFAULT false,
    is_admin boolean DEFAULT false NOT NULL,
    language text DEFAULT 'fr'::text
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: xplora_experiences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.xplora_experiences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    long_description text,
    price_cents integer DEFAULT 0 NOT NULL,
    image_url text,
    duration text,
    spots integer,
    difficulty text,
    category text,
    badge text,
    highlights text[],
    includes text[],
    to_bring text[],
    meeting_point text,
    languages text[],
    host_name text,
    host_bio text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    itinerary text[],
    neighbourhood text,
    vibes text[],
    image_urls text[],
    archived_at timestamp with time zone,
    name_fr text,
    description_fr text,
    long_description_fr text,
    highlights_fr text[],
    includes_fr text[],
    to_bring_fr text[],
    itinerary_fr text[],
    host_bio_fr text,
    badge_fr text,
    difficulty_fr text,
    worth_noting text[],
    worth_noting_fr text[],
    event_date timestamp with time zone,
    featured boolean DEFAULT false,
    available_dates text[],
    available_times text[],
    stops jsonb,
    walking_distance text,
    spot_ids uuid[],
    distance text,
    distance_mode text DEFAULT 'walking'::text
);


ALTER TABLE public.xplora_experiences OWNER TO postgres;

--
-- Name: xplora_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.xplora_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    email text,
    message text NOT NULL,
    page text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.xplora_feedback OWNER TO postgres;

--
-- Name: xplora_saved_itineraries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.xplora_saved_itineraries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    summary text,
    estimated_duration_min integer,
    estimated_distance_km numeric,
    stops jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.xplora_saved_itineraries OWNER TO postgres;

--
-- Name: xplora_spots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.xplora_spots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    name_fr text,
    description text,
    description_fr text,
    address text,
    lat double precision,
    lng double precision,
    website text,
    image_url text,
    neighbourhood text,
    vibes text[],
    category text,
    visit_time text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    xplora_tips text[],
    price_range text,
    is_brunch boolean DEFAULT false,
    is_hotspot boolean DEFAULT false,
    is_loved boolean DEFAULT false,
    xplora_tips_fr text[]
);


ALTER TABLE public.xplora_spots OWNER TO postgres;

--
-- Name: bookings bookings_booking_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_booking_code_key UNIQUE (booking_code);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: business_perks business_perks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_perks
    ADD CONSTRAINT business_perks_pkey PRIMARY KEY (id);


--
-- Name: experience_reviews experience_reviews_experience_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experience_reviews
    ADD CONSTRAINT experience_reviews_experience_id_user_id_key UNIQUE (experience_id, user_id);


--
-- Name: experience_reviews experience_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experience_reviews
    ADD CONSTRAINT experience_reviews_pkey PRIMARY KEY (id);


--
-- Name: neighbourhoods neighbourhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighbourhoods
    ADD CONSTRAINT neighbourhoods_pkey PRIMARY KEY (id);


--
-- Name: neighbourhoods neighbourhoods_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighbourhoods
    ADD CONSTRAINT neighbourhoods_slug_key UNIQUE (slug);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: orders orders_stripe_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_stripe_session_id_key UNIQUE (stripe_session_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: xplora_experiences xplora_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_experiences
    ADD CONSTRAINT xplora_experiences_pkey PRIMARY KEY (id);


--
-- Name: xplora_feedback xplora_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_feedback
    ADD CONSTRAINT xplora_feedback_pkey PRIMARY KEY (id);


--
-- Name: xplora_saved_itineraries xplora_saved_itineraries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_saved_itineraries
    ADD CONSTRAINT xplora_saved_itineraries_pkey PRIMARY KEY (id);


--
-- Name: xplora_spots xplora_spots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_spots
    ADD CONSTRAINT xplora_spots_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_experience_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_experience_id_fkey FOREIGN KEY (experience_id) REFERENCES public.business_perks(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: business_perks business_perks_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_perks
    ADD CONSTRAINT business_perks_business_id_fkey FOREIGN KEY (business_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: experience_reviews experience_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experience_reviews
    ADD CONSTRAINT experience_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: xplora_feedback xplora_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_feedback
    ADD CONSTRAINT xplora_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: xplora_saved_itineraries xplora_saved_itineraries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.xplora_saved_itineraries
    ADD CONSTRAINT xplora_saved_itineraries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: neighbourhoods Admin all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin all" ON public.neighbourhoods USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: xplora_experiences Admin delete experiences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin delete experiences" ON public.xplora_experiences FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: xplora_experiences Admin insert experiences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin insert experiences" ON public.xplora_experiences FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: xplora_experiences Admin update experiences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin update experiences" ON public.xplora_experiences FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: xplora_experiences Admins can do everything; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can do everything" ON public.xplora_experiences USING (true) WITH CHECK (true);


--
-- Name: experience_reviews Anyone can read approved reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can read approved reviews" ON public.experience_reviews FOR SELECT USING ((approved = true));


--
-- Name: experience_reviews Anyone can submit a review; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can submit a review" ON public.experience_reviews FOR INSERT WITH CHECK (true);


--
-- Name: business_perks Businesses can manage own perks; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Businesses can manage own perks" ON public.business_perks USING ((auth.uid() = business_id));


--
-- Name: business_perks Members can read active perks; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Members can read active perks" ON public.business_perks FOR SELECT USING ((status = 'active'::text));


--
-- Name: xplora_experiences Public can read active experiences; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can read active experiences" ON public.xplora_experiences FOR SELECT USING ((status = 'active'::text));


--
-- Name: neighbourhoods Public read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public read" ON public.neighbourhoods FOR SELECT USING ((status = 'active'::text));


--
-- Name: bookings Service role can insert/update bookings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role can insert/update bookings" ON public.bookings USING (true) WITH CHECK (true);


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: bookings Users can see their own bookings; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can see their own bookings" ON public.bookings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: orders Users can view own orders; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: xplora_spots admin manage spots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admin manage spots" ON public.xplora_spots USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND p.is_admin)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND p.is_admin))));


--
-- Name: experience_reviews admin_full_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_full_access ON public.experience_reviews TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));


--
-- Name: xplora_feedback anyone can submit feedback; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "anyone can submit feedback" ON public.xplora_feedback FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: experience_reviews approved_reviews_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY approved_reviews_public ON public.experience_reviews FOR SELECT USING ((status = 'approved'::text));


--
-- Name: bookings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

--
-- Name: business_perks; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.business_perks ENABLE ROW LEVEL SECURITY;

--
-- Name: experience_reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.experience_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: neighbourhoods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.neighbourhoods ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: experience_reviews own_reviews_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY own_reviews_insert ON public.experience_reviews FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: experience_reviews own_reviews_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY own_reviews_select ON public.experience_reviews FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: xplora_spots public read active spots; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public read active spots" ON public.xplora_spots FOR SELECT USING ((status = 'active'::text));


--
-- Name: xplora_saved_itineraries user manage own itineraries; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user manage own itineraries" ON public.xplora_saved_itineraries USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: xplora_experiences; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.xplora_experiences ENABLE ROW LEVEL SECURITY;

--
-- Name: xplora_feedback; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.xplora_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: xplora_saved_itineraries; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.xplora_saved_itineraries ENABLE ROW LEVEL SECURITY;

--
-- Name: xplora_spots; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.xplora_spots ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: FUNCTION decrement_spots(experience_id text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_spots(experience_id text) TO anon;
GRANT ALL ON FUNCTION public.decrement_spots(experience_id text) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_spots(experience_id text) TO service_role;


--
-- Name: FUNCTION decrement_spots(experience_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrement_spots(experience_id uuid) TO anon;
GRANT ALL ON FUNCTION public.decrement_spots(experience_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.decrement_spots(experience_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bookings TO anon;
GRANT ALL ON TABLE public.bookings TO authenticated;
GRANT ALL ON TABLE public.bookings TO service_role;


--
-- Name: TABLE business_perks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.business_perks TO anon;
GRANT ALL ON TABLE public.business_perks TO authenticated;
GRANT ALL ON TABLE public.business_perks TO service_role;


--
-- Name: TABLE experience_reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.experience_reviews TO anon;
GRANT ALL ON TABLE public.experience_reviews TO authenticated;
GRANT ALL ON TABLE public.experience_reviews TO service_role;


--
-- Name: TABLE neighbourhoods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.neighbourhoods TO anon;
GRANT ALL ON TABLE public.neighbourhoods TO authenticated;
GRANT ALL ON TABLE public.neighbourhoods TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE xplora_experiences; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.xplora_experiences TO anon;
GRANT ALL ON TABLE public.xplora_experiences TO authenticated;
GRANT ALL ON TABLE public.xplora_experiences TO service_role;


--
-- Name: TABLE xplora_feedback; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.xplora_feedback TO anon;
GRANT ALL ON TABLE public.xplora_feedback TO authenticated;
GRANT ALL ON TABLE public.xplora_feedback TO service_role;


--
-- Name: TABLE xplora_saved_itineraries; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.xplora_saved_itineraries TO anon;
GRANT ALL ON TABLE public.xplora_saved_itineraries TO authenticated;
GRANT ALL ON TABLE public.xplora_saved_itineraries TO service_role;


--
-- Name: TABLE xplora_spots; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.xplora_spots TO anon;
GRANT ALL ON TABLE public.xplora_spots TO authenticated;
GRANT ALL ON TABLE public.xplora_spots TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict wN9tpc7oIGQqURtJDP8MaDZTOjMZBV5ZE8FC2EuisZUlUqSthxciE4Aa2VmGq7F

