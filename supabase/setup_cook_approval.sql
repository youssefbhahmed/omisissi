-- ============================================================================
-- COOK APPROVAL WORKFLOW
-- Run this once in the Supabase SQL editor (safe to re-run).
--
-- What it adds:
--   * profiles.is_admin        — platform admins (granted via SQL only)
--   * cook_details.is_approved — new cooks start UNAPPROVED and are hidden
--                                from the directory until an admin approves
--                                them from the /dashboard/admin page
--   * set_cook_approval() RPC  — admin-only approve/revoke
--   * bookings tightened       — only approved cooks can receive bookings
--
-- BEFORE RUNNING: replace YOUR_LOGIN_EMAIL below (section 6) with the email
-- address you log into Foodie with, so your own account becomes the admin.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles     ADD COLUMN IF NOT EXISTS is_admin    boolean NOT NULL DEFAULT false;
ALTER TABLE public.cook_details ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- ----------------------------------------------------------------------------
-- 2. Admin check helper (SECURITY DEFINER so it can read profiles under RLS)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
STABLE
SECURITY DEFINER SET search_path = public
LANGUAGE sql
AS $$
    SELECT COALESCE((SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()), false);
$$;

-- ----------------------------------------------------------------------------
-- 3. is_admin is immutable to end users (only the SQL editor / service role,
--    where auth.uid() is NULL, can grant or revoke it)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_profile_admin_change()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL AND NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
        RAISE EXCEPTION 'The admin flag cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_profile_admin_change ON public.profiles;
CREATE TRIGGER prevent_profile_admin_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_admin_change();

-- ----------------------------------------------------------------------------
-- 4. Cooks cannot approve themselves: is_approved can only be changed by an
--    admin (or from the SQL editor). New cook_details rows created by end
--    users are forced to unapproved.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_cook_approval()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
            NEW.is_approved := false;
        END IF;
    ELSIF auth.uid() IS NOT NULL
        AND NOT public.is_admin()
        AND NEW.is_approved IS DISTINCT FROM OLD.is_approved THEN
        RAISE EXCEPTION 'Only an admin can change cook approval';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_cook_approval ON public.cook_details;
CREATE TRIGGER protect_cook_approval
    BEFORE INSERT OR UPDATE ON public.cook_details
    FOR EACH ROW EXECUTE FUNCTION public.protect_cook_approval();

-- ----------------------------------------------------------------------------
-- 5. Admin-only RPC used by the /dashboard/admin page
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_cook_approval(p_cook_id uuid, p_approved boolean)
RETURNS boolean
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only an admin can change cook approval';
    END IF;

    UPDATE public.cook_details SET is_approved = p_approved WHERE id = p_cook_id;
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.set_cook_approval(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_cook_approval(uuid, boolean) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. Make YOUR account the admin  ← EDIT THE EMAIL BEFORE RUNNING
-- ----------------------------------------------------------------------------
UPDATE public.profiles SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'YOUR_LOGIN_EMAIL');

-- ----------------------------------------------------------------------------
-- 7. The demo cooks were already live — keep them visible
-- ----------------------------------------------------------------------------
UPDATE public.cook_details SET is_approved = true
WHERE id IN (
    SELECT id FROM auth.users
    WHERE email IN ('fatma@foodie-demo.com', 'amira@foodie-demo.com', 'leila@foodie-demo.com')
);

-- ----------------------------------------------------------------------------
-- 8. Only APPROVED cooks can receive booking requests
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Families can insert bookings" ON public.bookings;
CREATE POLICY "Families can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (
    auth.uid() = family_id
    AND family_id <> cook_id
    AND status = 'pending'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = cook_id AND p.role = 'cook')
    AND EXISTS (SELECT 1 FROM public.cook_details cd WHERE cd.id = cook_id AND cd.is_approved)
);

-- ----------------------------------------------------------------------------
-- Sanity check: who is admin, and which cooks are approved / pending?
-- ----------------------------------------------------------------------------
SELECT p.full_name,
       CASE WHEN p.is_admin THEN 'ADMIN' ELSE '' END AS admin,
       CASE
           WHEN cd.id IS NULL THEN '(not a cook)'
           WHEN cd.is_approved THEN 'approved'
           ELSE 'PENDING APPROVAL'
       END AS cook_status
FROM public.profiles p
LEFT JOIN public.cook_details cd ON cd.id = p.id
ORDER BY p.created_at;
