"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vous devez être connecté." };
    }

    const bookingId = formData.get("bookingId") as string;
    const rating = parseInt(formData.get("rating") as string, 10);
    const comment = ((formData.get("comment") as string) || "").trim().slice(0, 1000);

    if (!bookingId) {
        return { error: "Réservation manquante." };
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { error: "Veuillez choisir une note de 1 à 5 étoiles." };
    }

    // The review must target one of the caller's own COMPLETED bookings
    const { data: booking } = await supabase
        .from('bookings')
        .select('id, cook_id, family_id, status')
        .eq('id', bookingId)
        .eq('family_id', user.id)
        .single();

    if (!booking) {
        return { error: "Réservation introuvable." };
    }
    if (booking.status !== 'completed') {
        return { error: "Vous pourrez laisser un avis une fois le repas terminé." };
    }

    const { error } = await supabase.from('reviews').insert({
        booking_id: booking.id,
        cook_id: booking.cook_id,
        family_id: user.id,
        rating,
        comment: comment || null,
    });

    if (error) {
        if (error.code === '23505') {
            return { error: "Vous avez déjà laissé un avis pour cette réservation." };
        }
        console.error("Error submitting review:", error);
        return { error: "Échec de l’envoi de votre avis. " + error.message };
    }

    revalidatePath("/dashboard/family");
    return { success: true };
}
