"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const bookingId = formData.get("bookingId") as string;
    const rating = parseInt(formData.get("rating") as string, 10);
    const comment = ((formData.get("comment") as string) || "").trim().slice(0, 1000);

    if (!bookingId) {
        return { error: "Missing booking." };
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return { error: "Please pick a rating from 1 to 5 stars." };
    }

    // The review must target one of the caller's own COMPLETED bookings
    const { data: booking } = await supabase
        .from('bookings')
        .select('id, cook_id, family_id, status')
        .eq('id', bookingId)
        .eq('family_id', user.id)
        .single();

    if (!booking) {
        return { error: "Booking not found." };
    }
    if (booking.status !== 'completed') {
        return { error: "You can review a booking once the meal is completed." };
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
            return { error: "You have already reviewed this booking." };
        }
        console.error("Error submitting review:", error);
        return { error: "Failed to submit your review. " + error.message };
    }

    revalidatePath("/dashboard/family");
    return { success: true };
}
