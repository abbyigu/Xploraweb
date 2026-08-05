-- Adds a structural "role" to xplora_spots, distinct from the existing
-- topical "category" column. Run this once against Supabase before the
-- itinerary-generation role logic (see api/_itineraryLogic.ts) goes live.
--
-- Safe to run multiple times.

alter table xplora_spots add column if not exists role text;

alter table xplora_spots drop constraint if exists xplora_spots_role_check;
alter table xplora_spots add constraint xplora_spots_role_check
  check (role is null or role in (
    'destination', 'restaurant', 'cafe', 'bar', 'shop', 'museum', 'gallery',
    'park', 'viewpoint', 'landmark', 'experience', 'transportation', 'connector'
  ));

-- Backfill existing rows from their category, matching inferDefaultRole() in
-- src/app/data/products.ts. Only fills rows that don't already have a role,
-- so this is safe to re-run after an admin has started setting roles by hand.
update xplora_spots set role = case category
  when 'Food'     then 'restaurant'
  when 'Sweets'   then 'restaurant'
  when 'Cafe'     then 'cafe'
  when 'Bar'      then 'bar'
  when 'Shopping' then 'shop'
  when 'Nature'   then 'park'
  when 'Culture'  then 'landmark'
  when 'History'  then 'landmark'
  when 'Family'   then 'experience'
  else 'destination'
end
where role is null;

-- Once real connectors/transportation spots exist (e.g. Escalier Casse-Cou,
-- the Québec City Funicular), reclassify them by hand:
-- update xplora_spots set role = 'connector' where name = 'Escalier Casse-Cou';
-- update xplora_spots set role = 'transportation' where name ilike '%funicular%';
