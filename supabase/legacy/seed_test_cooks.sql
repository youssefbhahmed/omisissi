-- ============================================================
-- STEP 1: Add any missing columns first
-- ============================================================
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS price_per_session NUMERIC;
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS rating_average NUMERIC DEFAULT 0;
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- ============================================================
-- STEP 2: Create 3 Test Cook Auth Users
-- ============================================================
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'fatma@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Fatma Ben Ali","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'amira@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Amira Trabelsi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'leila@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Leila Mansouri","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"fatma@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '{"sub":"a2222222-2222-2222-2222-222222222222","email":"amira@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '{"sub":"a3333333-3333-3333-3333-333333333333","email":"leila@test.com"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Create Profiles
-- ============================================================
INSERT INTO public.profiles (id, full_name, role)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Fatma Ben Ali', 'cook'),
  ('a2222222-2222-2222-2222-222222222222', 'Amira Trabelsi', 'cook'),
  ('a3333333-3333-3333-3333-333333333333', 'Leila Mansouri', 'cook')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- ============================================================
-- STEP 4: Create Cook Details with Locations
-- ============================================================
INSERT INTO public.cook_details (id, bio, specialties, city, rating_average, total_reviews, price_per_session, location)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'With 12 years of experience cooking for large families in La Marsa, I specialize in authentic, long-simmered Tunisian dishes. My signature is a rich, spicy Couscous au Poisson and homemade Brik.',
    ARRAY['Traditional', 'Seafood', 'Couscous'],
    'La Marsa', 4.9, 127, 45,
    ST_SetSRID(ST_Point(10.3246, 36.8782), 4326)::geography
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'I offer a modern, healthy take on Tunisian classics. If you love the flavors of our cuisine but want vegan or lighter options, I am your chef! Specializing in smoky Slata Mechouia and vegan couscous.',
    ARRAY['Vegan', 'Healthy', 'Modern'],
    'Ariana', 4.8, 89, 40,
    ST_SetSRID(ST_Point(10.1936, 36.8625), 4326)::geography
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Specializing in traditional Tunisian pastries, from honey-soaked Makroudh to delicate almond sweets. Perfect for tea parties and celebrations.',
    ARRAY['Pastries', 'Desserts', 'Baking'],
    'Sidi Bou Said', 5.0, 64, 55,
    ST_SetSRID(ST_Point(10.3402, 36.8695), 4326)::geography
  )
ON CONFLICT (id) DO UPDATE SET 
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  city = EXCLUDED.city,
  rating_average = EXCLUDED.rating_average,
  total_reviews = EXCLUDED.total_reviews,
  price_per_session = EXCLUDED.price_per_session,
  location = EXCLUDED.location;
