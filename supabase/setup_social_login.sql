-- ============================================================================
-- FOODIE — support de la connexion Google / Facebook
-- À coller dans le SQL Editor et lancer une fois (idempotent).
--
-- 1) Les comptes OAuth récupèrent automatiquement nom + photo de profil.
-- 2) Un compte tout juste créé via OAuth peut choisir son rôle (famille ou
--    cuisinière) pendant 15 minutes — ensuite le rôle redevient immuable.
-- ============================================================================

-- Le trigger de création de profil copie aussi le nom et l'avatar fournis
-- par Google/Facebook (name / avatar_url dans les métadonnées).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
        NEW.raw_user_meta_data ->> 'avatar_url',
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

-- Le verrou anti-changement de rôle reçoit une porte dérobée contrôlée :
-- seul set_signup_role() (ci-dessous) peut l'ouvrir, dans sa transaction.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NOT NULL
       AND COALESCE(current_setting('foodie.allow_role_change', true), '') <> 'on'
       AND NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'The account role cannot be changed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Choix du rôle juste après une inscription OAuth (fenêtre de 15 minutes).
CREATE OR REPLACE FUNCTION public.set_signup_role(p_role text)
RETURNS void
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_created timestamptz;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF p_role NOT IN ('family', 'cook') THEN
        RAISE EXCEPTION 'Invalid role';
    END IF;

    SELECT created_at INTO v_created FROM public.profiles WHERE id = auth.uid();
    IF v_created IS NULL THEN
        RAISE EXCEPTION 'Profile not found';
    END IF;
    IF now() - v_created > interval '15 minutes' THEN
        RAISE EXCEPTION 'The account role can only be chosen right after signup';
    END IF;

    PERFORM set_config('foodie.allow_role_change', 'on', true); -- transaction-scoped
    UPDATE public.profiles SET role = p_role WHERE id = auth.uid();

    IF p_role = 'cook' THEN
        INSERT INTO public.cook_details (id) VALUES (auth.uid())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END;
$$;
