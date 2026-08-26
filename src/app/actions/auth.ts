"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { WEEKDAYS } from "@/lib/booking";

const PHONE_PATTERN = /^[+0-9][0-9 .\-]{6,19}$/;

// GoTrue returns English error strings — map the common ones to French.
function frAuthError(message: string): string {
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
    if (message.includes("Email not confirmed")) return "Email non confirmé — vérifiez votre boîte mail avant de vous connecter.";
    return message;
}

// Phone lives in private_details (owner-only RLS); a missing table (SQL not
// applied yet) must not break the profile save.
async function savePhone(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    phone: string
): Promise<string | null> {
    const { error } = await supabase
        .from('private_details')
        .upsert({ id: userId, phone: phone || null });
    if (error && error.code !== '42P01') {
        console.error("Error saving phone:", error);
        return error.message;
    }
    return null;
}

function parseStringArray(raw: string | null, maxItems: number, maxLength: number): string[] | null {
    if (!raw) return [];
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    if (!Array.isArray(parsed)) return null;
    if (parsed.length > maxItems) return null;
    if (!parsed.every((v) => typeof v === "string" && v.length <= maxLength)) return null;
    return parsed as string[];
}

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: frAuthError(error.message) };
    }

    // Check role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    revalidatePath("/", "layout");

    // Return to the page the visitor was on (e.g. a cook they were booking) —
    // local paths only, never an absolute URL.
    const next = formData.get("next") as string | null;
    if (next && next.startsWith("/") && !next.startsWith("//")) {
        redirect(next);
    }

    if (profile?.role === 'cook') {
        redirect("/dashboard/cook");
    } else {
        redirect("/dashboard");
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = ((formData.get("fullName") as string) || "").trim();
    const roleType = formData.get("roleType") as string; // 'family' or 'cook'

    if (!fullName) {
        return { error: "Veuillez saisir votre nom complet." };
    }
    if (roleType !== "family" && roleType !== "cook") {
        return { error: "Veuillez choisir si vous êtes une famille ou un cuisinier." };
    }

    // We pass is_cook in the metadata so the signup trigger assigns the role
    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                is_cook: roleType === "cook",
            },
        },
    });

    if (error) {
        return { error: frAuthError(error.message) };
    }

    // With email confirmation enabled, Supabase reports an already-registered
    // email as a user with no identities instead of an error.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { error: "Un compte existe déjà avec cet email. Essayez de vous connecter." };
    }

    // No session means email confirmation is required before the first login.
    if (!data.session) {
        return { success: true, message: "Presque fini ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous." };
    }

    revalidatePath("/", "layout");

    if (roleType === 'cook') {
        redirect("/dashboard/cook");
    } else {
        redirect("/dashboard");
    }
}

// Role choice for accounts freshly created via Google/Facebook.
// The set_signup_role function only allows this within 15 minutes of signup.
export async function chooseSignupRole(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const role = formData.get("role") as string;
    if (role !== "family" && role !== "cook") {
        redirect("/dashboard");
    }

    const { error } = await supabase.rpc('set_signup_role', { p_role: role });
    if (error) {
        console.error("set_signup_role failed:", error);
        // Too late or SQL not applied — the account simply stays a family
        redirect("/dashboard");
    }

    revalidatePath("/", "layout");
    redirect(role === "cook" ? "/dashboard/cook" : "/dashboard");
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/");
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const newPassword = formData.get("newPassword") as string;

    if (!newPassword || newPassword.length < 6) {
        return { error: "Le mot de passe doit contenir au moins 6 caractères." };
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updateFamilyProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const fullName = ((formData.get("fullName") as string) || "").trim();
    const address = ((formData.get("address") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);

    if (!fullName) {
        return { error: "Veuillez saisir votre nom complet." };
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
        return { error: "Veuillez saisir un numéro de téléphone valide (ex. +216 12 345 678)." };
    }

    const updates: { full_name: string; address: string; lat?: number; lng?: number } = {
        full_name: fullName,
        address,
    };

    // Coordinates come from the RegionPicker when a region is selected
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        updates.lat = lat;
        updates.lng = lng;
    }

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        console.error("Error updating profile:", error);
        return { error: error.message };
    }

    const phoneError = await savePhone(supabase, user.id, phone);
    if (phoneError) {
        return { error: phoneError };
    }

    revalidatePath("/dashboard/profile");
    return { success: true };
}

export async function updateCookProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'cook') {
        return { error: "Seuls les cuisiniers peuvent modifier un profil cuisinier." };
    }

    const fullName = ((formData.get("fullName") as string) || "").trim();
    const address = ((formData.get("address") as string) || "").trim();
    const phone = ((formData.get("phone") as string) || "").trim();
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);
    const bio = ((formData.get("bio") as string) || "").trim();
    const price = parseFloat(formData.get("pricePerHour") as string);
    const specialties = parseStringArray(formData.get("specialties") as string, 20, 40);

    if (!fullName) {
        return { error: "Veuillez saisir votre nom complet." };
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
        return { error: "Veuillez saisir un numéro de téléphone valide (ex. +216 12 345 678)." };
    }
    if (specialties === null) {
        return { error: "Sélection de spécialités invalide." };
    }
    if (!Number.isFinite(price) || price < 0) {
        return { error: "Veuillez saisir un tarif horaire valide." };
    }

    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

    // 1. Update the shared profile (name & location)
    const profileUpdates: { full_name: string; address: string; lat?: number; lng?: number } = {
        full_name: fullName,
        address,
    };
    if (hasCoords) {
        profileUpdates.lat = lat;
        profileUpdates.lng = lng;
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

    if (profileError) {
        console.error("Error updating cook profile:", profileError);
        return { error: profileError.message };
    }

    // 2. Upsert cook details (bio, price, specialties — and the coordinates
    //    Discover uses for its radius search).
    const detailsUpdates: {
        id: string;
        bio: string;
        price_per_session: number;
        specialties: string[];
        city: string;
        lat?: number;
        lng?: number;
    } = {
        id: user.id,
        bio,
        price_per_session: price,
        specialties,
        city: address.split(',')[0]?.trim() || address,
    };
    if (hasCoords) {
        detailsUpdates.lat = lat;
        detailsUpdates.lng = lng;
    }

    const { error: detailsError } = await supabase
        .from('cook_details')
        .upsert(detailsUpdates);

    if (detailsError) {
        console.error("Error updating cook details:", detailsError);
        return { error: detailsError.message };
    }

    const phoneError = await savePhone(supabase, user.id, phone);
    if (phoneError) {
        return { error: phoneError };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/cook/profile");
    return { success: true };
}

export async function updateCookAvailability(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'cook') {
        return { error: "Seuls les cuisiniers peuvent définir leurs disponibilités." };
    }

    const availableDays = parseStringArray(formData.get("availableDays") as string, 7, 12);
    if (availableDays === null || !availableDays.every((d) => (WEEKDAYS as readonly string[]).includes(d))) {
        return { error: "Sélection de disponibilités invalide." };
    }

    const { error } = await supabase
        .from('cook_details')
        .upsert({ id: user.id, available_days: availableDays });

    if (error) {
        console.error("Error updating availability:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/cook/profile");
    return { success: true };
}
