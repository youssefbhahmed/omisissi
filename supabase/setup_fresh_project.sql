-- ============================================================================
-- FOODIE — complete setup for a FRESH Supabase project
--
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- It replaces every script in legacy/ plus migrations/ — do NOT run those
-- afterwards. It seeds no demo accounts. Idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Core tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'family' CHECK (role IN ('family', 'cook')),
    address TEXT,
    lat FLOAT,
    lng FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.cook_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    city TEXT,
    price_per_session NUMERIC,
    rating_average NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    available_days JSONB DEFAULT '[]'::jsonb,
    lat FLOAT,
    lng FLOAT
);

CREATE TABLE IF NOT EXISTS public.dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    category TEXT NOT NULL CHECK (category IN ('starter', 'main', 'dessert', 'side', 'other')),
    dietary_tags TEXT[] DEFAULT '{}',
    complexity INTEGER NOT NULL DEFAULT 2 CHECK (complexity BETWEEN 1 AND 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.menu_dishes (
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_id, dish_id)
);

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cook_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES public.menus(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_hours NUMERIC NOT NULL DEFAULT 2.0,
    guests INTEGER DEFAULT 4 CHECK (guests IS NULL OR (guests >= 1 AND guests <= 30)),
    location TEXT NOT NULL CHECK (location IN ('client_home', 'cook_home')),
    address TEXT,
    total_price NUMERIC NOT NULL CHECK (total_price >= 0),
    grocery_delivery BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.booking_dishes (
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES public.dishes(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 20),
    PRIMARY KEY (booking_id, dish_id)
);

-- ----------------------------------------------------------------------------
-- 2. Signup trigger: creates the profile (and cook_details for cooks) from
--    the metadata the app sends on supabase.auth.signUp()
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        CASE WHEN COALESCE((NEW.raw_user_meta_data ->> 'is_cook')::boolean, false)
             THEN 'cook' ELSE 'family' END
    )
    ON CONFLICT (id) DO NOTHING;

    IF COALESCE((NEW.raw_user_meta_data ->> 'is_cook')::boolean, false) THEN
        INSERT INTO public.cook_details (id) VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. updated_at maintenance for bookings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_modtime ON public.bookings;
CREATE TRIGGER update_bookings_modtime
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ----------------------------------------------------------------------------
-- 4. Row Level Security — profiles & cook_details
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- The role column is immutable to end users (blocks family -> cook
-- self-escalation through direct PostgREST calls). auth.uid() is NULL for
-- service-role / SQL-editor sessions, which stay free to change roles.
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
ON public.cook_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cooks can insert their own details" ON public.cook_details;
CREATE POLICY "Cooks can insert their own details"
ON public.cook_details FOR INSERT
WITH CHECK (
    auth.uid() = id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'cook')
);

DROP POLICY IF EXISTS "Cooks can update their own details" ON public.cook_details;
CREATE POLICY "Cooks can update their own details"
ON public.cook_details FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security — dishes, menus, menu_dishes
-- ----------------------------------------------------------------------------
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view dishes" ON public.dishes;
CREATE POLICY "Anyone can view dishes"
ON public.dishes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cooks can insert their own dishes" ON public.dishes;
CREATE POLICY "Cooks can insert their own dishes"
ON public.dishes FOR INSERT
WITH CHECK (
    auth.uid() = cook_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'cook')
);

DROP POLICY IF EXISTS "Cooks can update their own dishes" ON public.dishes;
CREATE POLICY "Cooks can update their own dishes"
ON public.dishes FOR UPDATE USING (auth.uid() = cook_id);

DROP POLICY IF EXISTS "Cooks can delete their own dishes" ON public.dishes;
CREATE POLICY "Cooks can delete their own dishes"
ON public.dishes FOR DELETE USING (auth.uid() = cook_id);

ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view menus" ON public.menus;
CREATE POLICY "Anyone can view menus"
ON public.menus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cooks can insert their own menus" ON public.menus;
CREATE POLICY "Cooks can insert their own menus"
ON public.menus FOR INSERT
WITH CHECK (
    auth.uid() = cook_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'cook')
);

DROP POLICY IF EXISTS "Cooks can update their own menus" ON public.menus;
CREATE POLICY "Cooks can update their own menus"
ON public.menus FOR UPDATE USING (auth.uid() = cook_id);

DROP POLICY IF EXISTS "Cooks can delete their own menus" ON public.menus;
CREATE POLICY "Cooks can delete their own menus"
ON public.menus FOR DELETE USING (auth.uid() = cook_id);

ALTER TABLE public.menu_dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view menu_dishes" ON public.menu_dishes;
CREATE POLICY "Anyone can view menu_dishes"
ON public.menu_dishes FOR SELECT USING (true);

-- A cook may only link dishes THEY OWN into their own menus
DROP POLICY IF EXISTS "Cooks can manage dishes in their menus" ON public.menu_dishes;
CREATE POLICY "Cooks can manage dishes in their menus"
ON public.menu_dishes FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.menus
            WHERE menus.id = menu_dishes.menu_id AND menus.cook_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.menus
            WHERE menus.id = menu_dishes.menu_id AND menus.cook_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.dishes
            WHERE dishes.id = menu_dishes.dish_id AND dishes.cook_id = auth.uid())
);

-- ----------------------------------------------------------------------------
-- 6. Row Level Security — bookings & booking_dishes
-- ----------------------------------------------------------------------------
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Families can view their own bookings" ON public.bookings;
CREATE POLICY "Families can view their own bookings"
ON public.bookings FOR SELECT USING (auth.uid() = family_id);

DROP POLICY IF EXISTS "Cooks can view their own bookings" ON public.bookings;
CREATE POLICY "Cooks can view their own bookings"
ON public.bookings FOR SELECT USING (auth.uid() = cook_id);

-- Bookings can only be created as PENDING requests addressed to a real cook.
DROP POLICY IF EXISTS "Families can insert bookings" ON public.bookings;
CREATE POLICY "Families can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (
    auth.uid() = family_id
    AND family_id <> cook_id
    AND status = 'pending'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = cook_id AND p.role = 'cook')
);
-- NOTE: total_price/duration_hours are computed by the submitBooking server
-- action. A user calling PostgREST directly could store a different price on
-- their own PENDING request — it only becomes money if the cook accepts it,
-- and the cook sees the payout before accepting.

DROP POLICY IF EXISTS "Families can update their pending bookings" ON public.bookings;
CREATE POLICY "Families can update their pending bookings"
ON public.bookings FOR UPDATE
USING (auth.uid() = family_id AND status = 'pending')
WITH CHECK (auth.uid() = family_id AND status IN ('pending', 'cancelled'));

DROP POLICY IF EXISTS "Cooks can update bookings assigned to them" ON public.bookings;
CREATE POLICY "Cooks can update bookings assigned to them"
ON public.bookings FOR UPDATE
USING (auth.uid() = cook_id) WITH CHECK (auth.uid() = cook_id);

-- Needed by the server action's rollback path.
DROP POLICY IF EXISTS "Families can delete their own pending bookings" ON public.bookings;
CREATE POLICY "Families can delete their own pending bookings"
ON public.bookings FOR DELETE
USING (auth.uid() = family_id AND status = 'pending');

-- On UPDATE, end users may only change a booking's STATUS, along valid
-- transitions. Everything else (price, dates, counterparty) is immutable.
CREATE OR REPLACE FUNCTION public.bookings_status_only_update()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        IF NEW.family_id        IS DISTINCT FROM OLD.family_id
        OR NEW.cook_id          IS DISTINCT FROM OLD.cook_id
        OR NEW.menu_id          IS DISTINCT FROM OLD.menu_id
        OR NEW.scheduled_date   IS DISTINCT FROM OLD.scheduled_date
        OR NEW.scheduled_time   IS DISTINCT FROM OLD.scheduled_time
        OR NEW.duration_hours   IS DISTINCT FROM OLD.duration_hours
        OR NEW.guests           IS DISTINCT FROM OLD.guests
        OR NEW.location         IS DISTINCT FROM OLD.location
        OR NEW.address          IS DISTINCT FROM OLD.address
        OR NEW.total_price      IS DISTINCT FROM OLD.total_price
        OR NEW.grocery_delivery IS DISTINCT FROM OLD.grocery_delivery
        OR NEW.notes            IS DISTINCT FROM OLD.notes
        OR NEW.created_at       IS DISTINCT FROM OLD.created_at THEN
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

ALTER TABLE public.booking_dishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Families can view their own booking dishes" ON public.booking_dishes;
CREATE POLICY "Families can view their own booking dishes"
ON public.booking_dishes FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.bookings
            WHERE bookings.id = booking_dishes.booking_id
            AND bookings.family_id = auth.uid())
);

DROP POLICY IF EXISTS "Cooks can view dishes for their bookings" ON public.booking_dishes;
CREATE POLICY "Cooks can view dishes for their bookings"
ON public.booking_dishes FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.bookings
            WHERE bookings.id = booking_dishes.booking_id
            AND bookings.cook_id = auth.uid())
);

-- Order lines may only be attached while the booking is still pending.
DROP POLICY IF EXISTS "Families can insert booking dishes" ON public.booking_dishes;
CREATE POLICY "Families can insert booking dishes"
ON public.booking_dishes FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings
            WHERE bookings.id = booking_dishes.booking_id
            AND bookings.family_id = auth.uid()
            AND bookings.status = 'pending')
);

-- ----------------------------------------------------------------------------
-- 7. Storage — public dish-images bucket with ownership-scoped writes
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('dish-images', 'dish-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dish-images');

-- Uploads land in a per-user folder ("<user_id>/<uuid>.<ext>") so ownership
-- is enforceable, and only cook accounts may upload.
DROP POLICY IF EXISTS "Cooks can upload images" ON storage.objects;
CREATE POLICY "Cooks can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'dish-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'cook')
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
-- 8. Contact sharing, reviews, and booking rules
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- 1. Private contact details (phone) — NOT publicly readable.
--    profiles is a public directory, so the phone lives in its own table
--    where only the owner can read/write it. Counterparties get it through
--    the get_booking_contact() function below, and only after acceptance.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.private_details (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    phone TEXT
);

ALTER TABLE public.private_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own private details" ON public.private_details;
CREATE POLICY "Users can view their own private details"
ON public.private_details FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own private details" ON public.private_details;
CREATE POLICY "Users can insert their own private details"
ON public.private_details FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own private details" ON public.private_details;
CREATE POLICY "Users can update their own private details"
ON public.private_details FOR UPDATE
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Contact reveal: each party of an ACCEPTED (or later) booking can read the
-- other party's name and phone — and nothing else, for no one else.
CREATE OR REPLACE FUNCTION public.get_booking_contact(p_booking_id uuid)
RETURNS TABLE(full_name text, phone text)
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    b record;
    other uuid;
BEGIN
    SELECT family_id, cook_id, status INTO b FROM public.bookings WHERE id = p_booking_id;
    IF b IS NULL THEN RETURN; END IF;

    IF auth.uid() = b.family_id THEN other := b.cook_id;
    ELSIF auth.uid() = b.cook_id THEN other := b.family_id;
    ELSE RETURN; END IF;

    IF b.status NOT IN ('accepted', 'in_progress', 'completed') THEN RETURN; END IF;

    RETURN QUERY
        SELECT p.full_name, pd.phone
        FROM public.profiles p
        LEFT JOIN public.private_details pd ON pd.id = p.id
        WHERE p.id = other;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Reviews — one per completed booking, written by the family.
--    An AFTER INSERT trigger recomputes the cook's average and count, so
--    ratings become real instead of frozen seed values.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    cook_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    family_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT USING (true);

-- Only the family of a COMPLETED booking may review it, exactly once
-- (the UNIQUE constraint on booking_id enforces the "once").
DROP POLICY IF EXISTS "Families can review their completed bookings" ON public.reviews;
CREATE POLICY "Families can review their completed bookings"
ON public.reviews FOR INSERT
WITH CHECK (
    auth.uid() = family_id
    AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_id
        AND b.family_id = auth.uid()
        AND b.cook_id = reviews.cook_id
        AND b.status = 'completed'
    )
);

CREATE OR REPLACE FUNCTION public.refresh_cook_rating()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.cook_details SET
        rating_average = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE cook_id = NEW.cook_id),
        total_reviews  = (SELECT COUNT(*) FROM public.reviews WHERE cook_id = NEW.cook_id)
    WHERE id = NEW.cook_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS refresh_cook_rating ON public.reviews;
CREATE TRIGGER refresh_cook_rating
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.refresh_cook_rating();

-- ----------------------------------------------------------------------------
-- 3. Booking rules — families may also cancel an ACCEPTED booking, but only
--    up to 48 hours before the scheduled time (pending: anytime).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Families can update their pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Families can update their bookings" ON public.bookings;
CREATE POLICY "Families can update their bookings"
ON public.bookings FOR UPDATE
USING (
    auth.uid() = family_id
    AND (
        status = 'pending'
        OR (status = 'accepted' AND (scheduled_date + scheduled_time) > now() + interval '48 hours')
    )
)
WITH CHECK (auth.uid() = family_id AND status IN ('pending', 'accepted', 'cancelled'));

-- ----------------------------------------------------------------------------
-- Done. Sanity check: this should list 8+ tables with rowsecurity = true.
-- ----------------------------------------------------------------------------
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
