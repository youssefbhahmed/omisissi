-- ============================================================================
-- FOODIE — email notifications via Resend (server-side, no app code involved)
--
-- AVANT DE LANCER : remplacez PASTE_YOUR_RESEND_KEY_HERE (ligne ~15) par
-- votre clé API Resend (elle commence par "re_"). Ne commitez jamais ce
-- fichier avec une vraie clé dedans.
--
-- Ce script est idempotent : relancez-le pour changer la clé ou l'expéditeur.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Stocke la clé Resend dans le coffre-fort Supabase (chiffrée au repos)
DELETE FROM vault.secrets WHERE name = 'resend_api_key';
SELECT vault.create_secret('PASTE_YOUR_RESEND_KEY_HERE', 'resend_api_key');

-- 2. Fonction de notification : envoie un email au bon destinataire
--    quand une réservation est créée / acceptée / refusée.
CREATE OR REPLACE FUNCTION public.notify_booking_event()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_key text;
    -- Sans domaine vérifié chez Resend, l'expéditeur DOIT rester
    -- onboarding@resend.dev (et les emails ne partent que vers l'adresse du
    -- compte Resend). Après vérification d'un domaine, remplacez par ex.
    -- 'Ommi Sissi <notifications@votredomaine.com>' et relancez ce script.
    v_from text := 'Ommi Sissi <onboarding@resend.dev>';
    v_to text;
    v_subject text;
    v_html text;
    v_family_name text;
    v_cook_name text;
    v_date text;
BEGIN
    SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets WHERE name = 'resend_api_key' LIMIT 1;
    IF v_key IS NULL OR v_key = 'PASTE_YOUR_RESEND_KEY_HERE' THEN
        RETURN NEW; -- pas de clé configurée : on n'envoie rien, sans erreur
    END IF;

    SELECT full_name INTO v_family_name FROM public.profiles WHERE id = NEW.family_id;
    SELECT full_name INTO v_cook_name   FROM public.profiles WHERE id = NEW.cook_id;
    v_date := to_char(NEW.scheduled_date, 'DD/MM/YYYY') || ' à ' || to_char(NEW.scheduled_time, 'HH24:MI');

    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        -- Nouvelle demande → prévenir la cuisinière
        SELECT email INTO v_to FROM auth.users WHERE id = NEW.cook_id;
        v_subject := '🍳 Nouvelle demande de réservation — ' || v_date;
        v_html := '<p>Bonjour ' || COALESCE(v_cook_name, '') || ',</p>'
            || '<p><strong>' || COALESCE(v_family_name, 'Une famille') || '</strong> souhaite réserver un repas le <strong>'
            || v_date || '</strong> pour <strong>' || COALESCE(NEW.guests::text, '?') || ' personne(s)</strong>'
            || ' — total estimé <strong>' || NEW.total_price || ' TND</strong>.</p>'
            || '<p><a href="https://omisissi.vercel.app/dashboard/cook/bookings">Accepter ou refuser la demande</a></p>';

    ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status
          AND NEW.status IN ('accepted', 'declined') THEN
        -- Réponse de la cuisinière → prévenir la famille
        SELECT email INTO v_to FROM auth.users WHERE id = NEW.family_id;
        IF NEW.status = 'accepted' THEN
            v_subject := '✅ Réservation confirmée — ' || v_date;
            v_html := '<p>Bonne nouvelle ' || COALESCE(v_family_name, '') || ' !</p>'
                || '<p><strong>' || COALESCE(v_cook_name, 'Votre cuisinière') || '</strong> a accepté votre réservation du <strong>'
                || v_date || '</strong>.</p>'
                || '<p>Son numéro de téléphone est maintenant visible sur votre réservation pour organiser les détails.</p>'
                || '<p><a href="https://omisissi.vercel.app/dashboard/family">Voir ma réservation</a></p>';
        ELSE
            v_subject := 'Réservation non disponible — ' || v_date;
            v_html := '<p>Bonjour ' || COALESCE(v_family_name, '') || ',</p>'
                || '<p><strong>' || COALESCE(v_cook_name, 'La cuisinière') || '</strong> n''est malheureusement pas disponible le '
                || v_date || '.</p>'
                || '<p><a href="https://omisissi.vercel.app/dashboard/discover">Trouver une autre cuisinière</a></p>';
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    IF v_to IS NULL THEN RETURN NEW; END IF;

    -- Envoi asynchrone (n'échoue jamais la transaction de réservation)
    PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_key,
            'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
            'from', v_from,
            'to', jsonb_build_array(v_to),
            'subject', v_subject,
            'html', v_html
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_booking_event ON public.bookings;
CREATE TRIGGER notify_booking_event
    AFTER INSERT OR UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.notify_booking_event();

-- Vérification : doit afficher une ligne "resend_api_key"
SELECT name, created_at FROM vault.secrets WHERE name = 'resend_api_key';
