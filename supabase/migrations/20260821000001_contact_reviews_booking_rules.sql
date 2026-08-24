-- ============================================================================
-- Contact sharing, real reviews, and booking rules
-- Run AFTER setup_fresh_project.sql (or the earlier migrations).
-- Idempotent: safe to run more than once.
-- ============================================================================

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
