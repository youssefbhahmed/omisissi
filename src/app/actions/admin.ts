"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true };

// Approve or revoke a cook. The real authorization lives in the database:
// the set_cook_approval RPC raises unless the caller's profile has is_admin,
// and a trigger blocks direct is_approved updates from non-admins.
export async function setCookApproval(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const cookId = (formData.get("cookId") as string) || "";
    const approved = formData.get("approved") === "true";

    if (!cookId) {
        return { error: "Cuisinier manquant." };
    }

    const { data: found, error } = await supabase.rpc('set_cook_approval', {
        p_cook_id: cookId,
        p_approved: approved,
    });

    if (error) {
        console.error("set_cook_approval failed:", error);
        // 42883 = function does not exist → the migration has not been run yet
        if (error.code === '42883') {
            return { error: "Le système d’approbation n’est pas encore installé — exécutez d’abord setup_cook_approval.sql dans Supabase." };
        }
        return { error: error.message };
    }
    if (!found) {
        return { error: "Cuisinier introuvable." };
    }

    revalidatePath("/dashboard/admin");
    revalidatePath("/cooks");
    revalidatePath("/");
    return { success: true };
}
