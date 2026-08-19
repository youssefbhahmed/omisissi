-- ============================================================================
-- Security fixes for Foodie
-- Run this in the Supabase SQL editor (or via `supabase db push`) AFTER the
-- legacy setup scripts in supabase/legacy/ have been applied.
-- Idempotent: safe to run more than once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Row Level Security for profiles and cook_details
--    (previously not defined anywhere in the repo)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

ALTER TABLE public.cook_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cook details are viewable by everyone" ON public.cook_details;
CREATE POLICY "Cook details are viewable by everyone"
ON public.cook_details FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Cooks can insert their own details" ON public.cook_details;
CREATE POLICY "Cooks can insert their own details"
ON public.cook_details FOR INSERT
WITH CHECK (
    auth.uid() = id
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'cook'
    )
);

DROP POLICY IF EXISTS "Cooks can update their own details" ON public.cook_details;
CREATE POLICY "Cooks can update their own details"
ON public.cook_details FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. Only accounts with role = 'cook' may create dishes and menus
--    (previously any authenticated user could list themselves as a vendor)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Cooks can insert their own dishes" ON public.dishes;
CREATE POLICY "Cooks can insert their own dishes"
ON public.dishes FOR INSERT
WITH CHECK (
    auth.uid() = cook_id
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'cook'
    )
);

DROP POLICY IF EXISTS "Cooks can insert their own menus" ON public.menus;
CREATE POLICY "Cooks can insert their own menus"
ON public.menus FOR INSERT
WITH CHECK (
    auth.uid() = cook_id
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'cook'
    )
);

-- A cook may only link dishes THEY OWN into their menus
DROP POLICY IF EXISTS "Cooks can manage dishes in their menus" ON public.menu_dishes;
CREATE POLICY "Cooks can manage dishes in their menus"
ON public.menu_dishes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.menus
        WHERE menus.id = menu_dishes.menu_id
        AND menus.cook_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.menus
        WHERE menus.id = menu_dishes.menu_id
        AND menus.cook_id = auth.uid()
    )
    AND EXISTS (
        SELECT 1 FROM public.dishes
        WHERE dishes.id = menu_dishes.dish_id
        AND dishes.cook_id = auth.uid()
    )
);

-- ----------------------------------------------------------------------------
-- 3. Storage: ownership-scoped policies for the dish-images bucket
--    (previously ANY authenticated user could overwrite/delete ANY image)
--    New uploads are stored under "<user_id>/<uuid>.<ext>".
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

DROP POLICY IF EXISTS "Cooks can upload images" ON storage.objects;
CREATE POLICY "Cooks can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'dish-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Cooks can update their own images" ON storage.objects;
CREATE POLICY "Cooks can update their own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'dish-images'
    AND (
        owner_id = auth.uid()::text
        OR (storage.foldername(name))[1] = auth.uid()::text
    )
);

DROP POLICY IF EXISTS "Cooks can delete their own images" ON storage.objects;
CREATE POLICY "Cooks can delete their own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'dish-images'
    AND (
        owner_id = auth.uid()::text
        OR (storage.foldername(name))[1] = auth.uid()::text
    )
);

-- ----------------------------------------------------------------------------
-- 4. Bookings hardening
-- ----------------------------------------------------------------------------
-- Families may only move a PENDING booking, and only to cancelled
-- (the old policy let them update any own booking).
DROP POLICY IF EXISTS "Families can update their pending bookings" ON public.bookings;
CREATE POLICY "Families can update their pending bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = family_id AND status = 'pending')
WITH CHECK (auth.uid() = family_id AND status IN ('pending', 'cancelled'));

-- Needed by the server action's rollback path (delete a just-created booking
-- when its dish lines fail to insert).
DROP POLICY IF EXISTS "Families can delete their own pending bookings" ON public.bookings;
CREATE POLICY "Families can delete their own pending bookings"
ON public.bookings FOR DELETE
USING (auth.uid() = family_id AND status = 'pending');

-- Sanity constraints
DO $$ BEGIN
    ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_total_price_nonneg CHECK (total_price >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_guests_range CHECK (guests IS NULL OR (guests >= 1 AND guests <= 30));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.booking_dishes
        ADD CONSTRAINT booking_dishes_quantity_range CHECK (quantity >= 1 AND quantity <= 20);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
