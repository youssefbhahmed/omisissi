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

-- The role column is immutable to end users: without this, a family account
-- could PATCH its own row to role='cook' through PostgREST and pass every
-- role-based policy below. auth.uid() is NULL for service-role/SQL-editor
-- sessions, which remain free to change roles.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'The account role cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;
CREATE TRIGGER prevent_profile_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

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
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'cook'
    )
);

-- Enforce the app's 5MB / image-only rules at the platform level too —
-- the server action's checks are bypassable via the storage REST API.
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'dish-images';

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
-- Bookings can only be created as PENDING requests addressed to a real cook
-- (the old policy accepted any status — including a forged 'accepted' — and
-- any cook_id, including the caller themselves).
DROP POLICY IF EXISTS "Families can insert bookings" ON public.bookings;
CREATE POLICY "Families can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (
    auth.uid() = family_id
    AND family_id <> cook_id
    AND status = 'pending'
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = cook_id AND p.role = 'cook'
    )
);
-- NOTE: total_price/duration_hours are computed by the submitBooking server
-- action. A user calling PostgREST directly can still store a different price
-- on their own PENDING request — that request only becomes money if the cook
-- accepts it, and the cook sees the payout before accepting. Recomputing the
-- price in the database would require moving booking creation into an RPC.

-- On UPDATE, end users may only change a booking's STATUS, and only along
-- valid transitions. Without this, either party could rewrite total_price,
-- dates, or the counterparty on rows their UPDATE policy grants them.
CREATE OR REPLACE FUNCTION public.bookings_status_only_update()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        IF NEW.family_id       IS DISTINCT FROM OLD.family_id
        OR NEW.cook_id         IS DISTINCT FROM OLD.cook_id
        OR NEW.menu_id         IS DISTINCT FROM OLD.menu_id
        OR NEW.scheduled_date  IS DISTINCT FROM OLD.scheduled_date
        OR NEW.scheduled_time  IS DISTINCT FROM OLD.scheduled_time
        OR NEW.duration_hours  IS DISTINCT FROM OLD.duration_hours
        OR NEW.guests          IS DISTINCT FROM OLD.guests
        OR NEW.location        IS DISTINCT FROM OLD.location
        OR NEW.address         IS DISTINCT FROM OLD.address
        OR NEW.total_price     IS DISTINCT FROM OLD.total_price
        OR NEW.grocery_delivery IS DISTINCT FROM OLD.grocery_delivery
        OR NEW.notes           IS DISTINCT FROM OLD.notes
        OR NEW.created_at      IS DISTINCT FROM OLD.created_at THEN
            RAISE EXCEPTION 'Only the booking status may be changed';
        END IF;

        IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
            (OLD.status = 'pending'     AND NEW.status IN ('accepted', 'declined', 'cancelled'))
            OR (OLD.status = 'accepted'    AND NEW.status IN ('in_progress', 'completed', 'cancelled'))
            OR (OLD.status = 'in_progress' AND NEW.status = 'completed')
        ) THEN
            RAISE EXCEPTION 'Invalid booking status transition from % to %', OLD.status, NEW.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_status_only_update ON public.bookings;
CREATE TRIGGER bookings_status_only_update
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.bookings_status_only_update();

-- Order lines may only be attached while the booking is still pending
-- (the old policy let a family append dishes to an already-accepted booking).
DROP POLICY IF EXISTS "Families can insert booking dishes" ON public.booking_dishes;
CREATE POLICY "Families can insert booking dishes"
ON public.booking_dishes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.bookings
        WHERE bookings.id = booking_dishes.booking_id
        AND bookings.family_id = auth.uid()
        AND bookings.status = 'pending'
    )
);

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
