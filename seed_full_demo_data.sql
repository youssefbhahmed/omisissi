-- ============================================================
-- SQL Script: Seed Full Demo Data (Cooks, Dishes, Menus)
-- Run this in the Supabase SQL Editor.
-- NOTE: ALL IDs MUST BE VALID HEX FOR UUIDS (0-9, a-f)
-- ============================================================

-- Fix Schema mapping for Menus
ALTER TABLE public.menu_dishes ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- 1. Create Auth Users (c4... through c7...)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token)
VALUES
  ('c4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'mohamed@demo.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Mohamed Zairi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('c5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'nadia@demo.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Nadia Khemiri","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('c6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'selim@demo.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Selim Gharbi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), ''),
  ('c7777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'hiba@demo.com', crypt('password123', gen_salt('bf')), now(), '{"full_name":"Hiba Mzoughi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), '')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Auth Identities
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('c4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', '{"sub":"c4444444-4444-4444-4444-444444444444","email":"mohamed@demo.com"}'::jsonb, 'email', now(), now(), now()),
  ('c5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', '{"sub":"c5555555-5555-5555-5555-555555555555","email":"nadia@demo.com"}'::jsonb, 'email', now(), now(), now()),
  ('c6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', '{"sub":"c6666666-6666-6666-6666-666666666666","email":"selim@demo.com"}'::jsonb, 'email', now(), now(), now()),
  ('c7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', '{"sub":"c7777777-7777-7777-7777-777777777777","email":"hiba@demo.com"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Public Profiles
INSERT INTO public.profiles (id, full_name, role, avatar_url)
VALUES
  ('c4444444-4444-4444-4444-444444444444', 'Mohamed Zairi', 'cook', '/cook-tunisian.png'),
  ('c5555555-5555-5555-5555-555555555555', 'Nadia Khemiri', 'cook', '/cook-portrait.png'),
  ('c6666666-6666-6666-6666-666666666666', 'Selim Gharbi', 'cook', '/cook-tunisian.png'),
  ('c7777777-7777-7777-7777-777777777777', 'Hiba Mzoughi', 'cook', '/cook-portrait.png')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url;

-- 4. Create Cook Details (Bios, Rates, Locations)
INSERT INTO public.cook_details (id, bio, specialties, city, rating_average, total_reviews, price_per_session, location, lat, lng, available_days)
VALUES
  (
    'c4444444-4444-4444-4444-444444444444',
    'Grill master specializing in authentic Tunisian BBQ. From perfectly spiced Merguez to charred Mechouia and comforting brik. I bring the spirit of a summer feast to your dining table!',
    ARRAY['Grill', 'Comfort Food', 'Traditional'],
    'Ariana', 4.9, 142, 50,
    ST_SetSRID(ST_Point(10.1915, 36.8580), 4326)::geography,
    36.8580, 10.1915,
    '["Friday", "Saturday", "Sunday"]'::jsonb
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'Hearty, comforting, grandmother-style cooking. I specialize in slow-cooked stews, authentic couscous, fresh homemade bread, and dishes that feed the soul.',
    ARRAY['Comfort Food', 'Traditional', 'Couscous'],
    'Carthage', 5.0, 215, 45,
    ST_SetSRID(ST_Point(10.3228, 36.8586), 4326)::geography,
    36.8586, 10.3228,
    '["Monday", "Tuesday", "Wednesday", "Thursday"]'::jsonb
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'I offer a modern, healthy take on Tunisian classics. If you love the flavors of our cuisine but want lighter options like healthy shakshuka, I am your chef!',
    ARRAY['Healthy', 'Vegetarian', 'Modern'],
    'La Marsa', 4.8, 89, 40,
    ST_SetSRID(ST_Point(10.3246, 36.8782), 4326)::geography,
    36.8782, 10.3246,
    '["Wednesday", "Friday", "Saturday"]'::jsonb
  ),
  (
    'c7777777-7777-7777-7777-777777777777',
    'Sweet tooth? Specializing in traditional Tunisian pastries, from honey-soaked Makroudh to delicate almond sweets. Perfect for tea parties and family celebrations.',
    ARRAY['Pastries', 'Desserts', 'Baking'],
    'Sidi Bou Said', 4.9, 64, 55,
    ST_SetSRID(ST_Point(10.3402, 36.8695), 4326)::geography,
    36.8695, 10.3402,
    '["Friday", "Saturday"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET 
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  city = EXCLUDED.city,
  rating_average = EXCLUDED.rating_average,
  total_reviews = EXCLUDED.total_reviews,
  price_per_session = EXCLUDED.price_per_session,
  available_days = EXCLUDED.available_days,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  location = EXCLUDED.location;

-- 5. Clear Old Demo Dishes to avoid duplicates if re-run
DELETE FROM public.menu_dishes WHERE menu_id IN (SELECT id FROM public.menus WHERE cook_id IN ('c4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', 'c7777777-7777-7777-7777-777777777777'));
DELETE FROM public.menus WHERE cook_id IN ('c4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', 'c7777777-7777-7777-7777-777777777777');
DELETE FROM public.dishes WHERE cook_id IN ('c4444444-4444-4444-4444-444444444444', 'c5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666', 'c7777777-7777-7777-7777-777777777777');

-- 6. Insert Dishes for Mohamed (Grill Master)
-- using 'd4444...' for dishes
INSERT INTO public.dishes (id, cook_id, name, description, category, dietary_tags, image_url)
VALUES
  ('d4444444-0001-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Smoky Slata Mechouia', 'Charcoal-grilled peppers and tomatoes, pounded with garlic, caraway, and olive oil. Topped with tuna and eggs.', 'starter', ARRAY['Spicy'], '/tunisian-mechouia.png'),
  ('d4444444-0002-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Crispy Brik', 'A thin, crispy pastry folded over a soft egg, parsley, and tuna. Fried to a perfect golden crunch.', 'starter', '{}'::text[], '/tunisian-brik.png'),
  ('d4444444-0003-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'Tunisian Feast Platter', 'A massive spread of grilled meats, sausages, and traditional sides. Perfect for large family gatherings.', 'main', '{}'::text[], '/hero-feast.png');

-- 7. Insert Menus & Menu Dishes for Mohamed
-- using 'e4444...' for menus (e is valid hex, m was not)
INSERT INTO public.menus (id, cook_id, name, description, price)
VALUES
  ('e4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'The Summer BBQ Feast', 'The ultimate weekend grill package. Includes starters, the main grill platter, and fresh bread.', 180);

INSERT INTO public.menu_dishes (menu_id, dish_id, quantity)
VALUES
  ('e4444444-4444-4444-4444-444444444444', 'd4444444-0001-4444-4444-444444444444', 2),
  ('e4444444-4444-4444-4444-444444444444', 'd4444444-0002-4444-4444-444444444444', 6),
  ('e4444444-4444-4444-4444-444444444444', 'd4444444-0003-4444-4444-444444444444', 1);

-- 8. Insert Dishes for Nadia (Comfort Food/Couscous)
INSERT INTO public.dishes (id, cook_id, name, description, category, dietary_tags, image_url)
VALUES
  ('d5555555-0001-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'Traditional Lamb Couscous', 'Fluffy semolina steamed in a rich, spicy lamb and vegetable broth. The ultimate Tunisian comfort food.', 'main', ARRAY['Spicy'], '/tunisian-couscous.png'),
  ('d5555555-0002-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'Spicy Shakshuka', 'Eggs poached in a saucy, spicy tomato and pepper base. Perfect for brunch or a light dinner with fresh bread.', 'main', ARRAY['Vegetarian', 'Spicy'], '/tunisian-shakshuka.png');

-- 9. Insert Menus & Menu Dishes for Nadia
INSERT INTO public.menus (id, cook_id, name, description, price)
VALUES
  ('e5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'Friday Family Couscous', 'A huge spread of authentic lamb couscous designed to feed the whole family. Comes with extra sauce and vegetables.', 140);

INSERT INTO public.menu_dishes (menu_id, dish_id, quantity)
VALUES
  ('e5555555-5555-5555-5555-555555555555', 'd5555555-0001-5555-5555-555555555555', 1);

-- 10. Insert Dishes for Hiba (Pastries)
INSERT INTO public.dishes (id, cook_id, name, description, category, dietary_tags, image_url)
VALUES
  ('d7777777-0001-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 'Assorted Tunisian Pastries', 'A box of handcrafted, honey-drenched and almond-stuffed pastries. Includes Makroudh, Baklawa, and Kaak Warka.', 'dessert', '{}'::text[], '/tunisian-pastries.png');

-- 11. Insert Menus & Menu Dishes for Hiba
INSERT INTO public.menus (id, cook_id, name, description, price)
VALUES
  ('e7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777', 'Celebration Sweet Box', 'A massive 2kg assortment of premium Tunisian pastries perfectly suited for parties, weddings, and Eid celebrations.', 95);

INSERT INTO public.menu_dishes (menu_id, dish_id, quantity)
VALUES
  ('e7777777-7777-7777-7777-777777777777', 'd7777777-0001-7777-7777-777777777777', 1);
