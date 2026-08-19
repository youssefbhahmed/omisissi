-- ============================================================
-- SQL Script to Seed More Test Cooks
-- Run this in your Supabase SQL Editor to populate the map!
-- ============================================================

-- 1. Create Auth Users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token)
VALUES
  ('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'mohamed@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Mohamed Zairi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'nadia@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Nadia Khemiri","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'selim@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Selim Gharbi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a7777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'hiba@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Hiba Mzoughi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a8888888-8888-8888-8888-888888888888', '00000000-0000-0000-0000-000000000000', 'tarek@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Tarek Jlassi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('a9999999-9999-9999-9999-999999999999', '00000000-0000-0000-0000-000000000000', 'yousra@test.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Yousra Feki","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), '')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Auth Identities
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '{"sub":"a4444444-4444-4444-4444-444444444444","email":"mohamed@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', '{"sub":"a5555555-5555-5555-5555-555555555555","email":"nadia@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', '{"sub":"a6666666-6666-6666-6666-666666666666","email":"selim@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '{"sub":"a7777777-7777-7777-7777-777777777777","email":"hiba@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', 'a8888888-8888-8888-8888-888888888888', '{"sub":"a8888888-8888-8888-8888-888888888888","email":"tarek@test.com"}'::jsonb, 'email', now(), now(), now()),
  ('a9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', 'a9999999-9999-9999-9999-999999999999', '{"sub":"a9999999-9999-9999-9999-999999999999","email":"yousra@test.com"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Public Profiles
INSERT INTO public.profiles (id, full_name, role)
VALUES
  ('a4444444-4444-4444-4444-444444444444', 'Mohamed Zairi', 'cook'),
  ('a5555555-5555-5555-5555-555555555555', 'Nadia Khemiri', 'cook'),
  ('a6666666-6666-6666-6666-666666666666', 'Selim Gharbi', 'cook'),
  ('a7777777-7777-7777-7777-777777777777', 'Hiba Mzoughi', 'cook'),
  ('a8888888-8888-8888-8888-888888888888', 'Tarek Jlassi', 'cook'),
  ('a9999999-9999-9999-9999-999999999999', 'Yousra Feki', 'cook')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 4. Create Cook Details (Bios, Rates, Locations)
INSERT INTO public.cook_details (id, bio, specialties, city, rating_average, total_reviews, price_per_session, location, available_days)
VALUES
  (
    'a4444444-4444-4444-4444-444444444444',
    'Grill master specializing in authentic Tunisian BBQ. From perfectly spiced Merguez to charred Mechouia. I bring the spirit of a summer feast to your dining table!',
    ARRAY['Traditional', 'Comfort Food'],
    'Ariana', 4.9, 142, 50,
    ST_SetSRID(ST_Point(10.1915, 36.8580), 4326)::geography,
    '["Friday", "Saturday", "Sunday"]'::jsonb
  ),
  (
    'a5555555-5555-5555-5555-555555555555',
    'Hearty, comforting, grandmother-style cooking. I specialize in slow-cooked stews, fresh homemade bread (Tabouna), and dishes that feed the soul.',
    ARRAY['Comfort Food', 'Traditional', 'Baking'],
    'Carthage', 5.0, 215, 45,
    ST_SetSRID(ST_Point(10.3228, 36.8586), 4326)::geography,
    '["Monday", "Tuesday", "Wednesday", "Thursday"]'::jsonb
  ),
  (
    'a6666666-6666-6666-6666-666666666666',
    'Trained in Paris, returning to my roots. I offer a modern fusion of Tunisian flavors with high-end culinary techniques. Perfect for upscale dinner parties.',
    ARRAY['Modern', 'Healthy', 'Seafood'],
    'Gammarth', 4.7, 56, 75,
    ST_SetSRID(ST_Point(10.2831, 36.9080), 4326)::geography,
    '["Friday", "Saturday"]'::jsonb
  ),
  (
    'a7777777-7777-7777-7777-777777777777',
    '100% organic, locally sourced ingredients. I focus on highly nutritious, seasonal meals that taste incredible while keeping your family healthy.',
    ARRAY['Healthy', 'Vegan', 'Traditional'],
    'Manouba', 4.8, 92, 40,
    ST_SetSRID(ST_Point(10.0886, 36.8090), 4326)::geography,
    '["Monday", "Wednesday", "Friday"]'::jsonb
  ),
  (
    'a8888888-8888-8888-8888-888888888888',
    'Born and raised in La Goulette, seafood is in my blood. From fresh grilled sea bream to spicy octopus pasta, I bring the best of the Mediterranean to you.',
    ARRAY['Seafood', 'Traditional'],
    'La Goulette', 4.9, 188, 60,
    ST_SetSRID(ST_Point(10.3015, 36.8166), 4326)::geography,
    '["Saturday", "Sunday"]'::jsonb
  ),
  (
    'a9999999-9999-9999-9999-999999999999',
    'Gluten-free and allergen-friendly Tunisian cooking! You don''t have to miss out on our rich cuisine just because of dietary restrictions. Let me cook for you securely.',
    ARRAY['Healthy', 'Baking', 'Comfort Food'],
    'El Menzah', 4.9, 41, 55,
    ST_SetSRID(ST_Point(10.1764, 36.8407), 4326)::geography,
    '["Tuesday", "Thursday", "Saturday"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET 
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  city = EXCLUDED.city,
  rating_average = EXCLUDED.rating_average,
  total_reviews = EXCLUDED.total_reviews,
  price_per_session = EXCLUDED.price_per_session,
  available_days = EXCLUDED.available_days,
  location = EXCLUDED.location;
