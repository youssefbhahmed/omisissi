-- ============================================================================
-- CHEFFES DE TEST SUPPLÉMENTAIRES (Grand Tunis) + avatars cohérents
-- À exécuter une fois dans l'éditeur SQL Supabase (sans danger si relancé).
--
-- Ajoute deux cuisinières de démo dans les gouvernorats encore vides :
--   * Salha Ayari    — La Manouba  (e1111111-…)
--   * Mounira Gharbi — Ben Arous   (e2222222-…)
-- Elles sont approuvées d'office et visibles dans l'annuaire ET sur la carte
-- du hero (les fiches de la carte pointent vers /cooks/<id> avec ces UUID —
-- ne pas les changer sans mettre à jour src/components/TunisiaMap.tsx).
--
-- Le mot de passe est aléatoire : ces comptes servent à l'affichage, on ne
-- s'y connecte pas.
-- ============================================================================

-- 1. Comptes auth
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token)
VALUES
  ('e1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'salha@foodie-demo.com',   crypt(md5(random()::text), gen_salt('bf')), now(), '{"full_name":"Salha Ayari","is_cook":true}'::jsonb,    'authenticated', 'authenticated', now(), now(), ''),
  ('e2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'mounira@foodie-demo.com', crypt(md5(random()::text), gen_salt('bf')), now(), '{"full_name":"Mounira Gharbi","is_cook":true}'::jsonb, 'authenticated', 'authenticated', now(), now(), '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '{"sub":"e1111111-1111-1111-1111-111111111111","email":"salha@foodie-demo.com"}'::jsonb,   'email', now(), now(), now()),
  ('e2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', '{"sub":"e2222222-2222-2222-2222-222222222222","email":"mounira@foodie-demo.com"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Profils
INSERT INTO public.profiles (id, full_name, role, avatar_url)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Salha Ayari',    'cook', '/cook-portrait.png'),
  ('e2222222-2222-2222-2222-222222222222', 'Mounira Gharbi', 'cook', '/cook-tunisian.png')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, avatar_url = EXCLUDED.avatar_url;

-- 3. Détails cuisinières (approuvées d'office : lancé depuis l'éditeur SQL,
--    le trigger protect_cook_approval laisse passer)
INSERT INTO public.cook_details (id, bio, specialties, city, rating_average, total_reviews, price_per_session, lat, lng, available_days, is_approved)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'Cuisine familiale généreuse de la Manouba : couscous du dimanche, mloukhia longuement mijotée et pain maison. Chez moi, personne ne quitte la table avec une petite faim.',
    ARRAY['Traditionnel', 'Plats réconfortants', 'Couscous'],
    'La Manouba', 4.7, 38, 40,
    36.8093, 10.0863,
    ARRAY['Monday', 'Wednesday', 'Friday', 'Sunday'],
    true
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'À Ben Arous, je prépare l''ojja, le kafteji et les grillades comme au marché — des plats francs, épicés juste comme il faut, prêts quand vous rentrez du travail.',
    ARRAY['Traditionnel', 'Plats réconfortants'],
    'Ben Arous', 4.8, 52, 42,
    36.7531, 10.2189,
    ARRAY['Tuesday', 'Thursday', 'Friday', 'Saturday'],
    true
  )
ON CONFLICT (id) DO UPDATE SET
  bio = EXCLUDED.bio,
  specialties = EXCLUDED.specialties,
  city = EXCLUDED.city,
  rating_average = EXCLUDED.rating_average,
  total_reviews = EXCLUDED.total_reviews,
  price_per_session = EXCLUDED.price_per_session,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  available_days = EXCLUDED.available_days,
  is_approved = EXCLUDED.is_approved;

-- 4. Les trois cuisinières démo historiques prennent leurs vrais portraits
--    (les mêmes visages que sur la carte du hero)
UPDATE public.profiles SET avatar_url = '/cook-fatma.jpg'  WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET avatar_url = '/cook-amira.jpg'  WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET avatar_url = '/cook-leila.jpg'  WHERE id = 'a3333333-3333-3333-3333-333333333333';

-- Vérification
SELECT p.full_name, cd.city, cd.is_approved, p.avatar_url
FROM public.profiles p JOIN public.cook_details cd ON cd.id = p.id
ORDER BY cd.city;
