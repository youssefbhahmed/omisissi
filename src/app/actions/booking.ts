"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitBooking(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to book a cook." };
    }

    const cookId = formData.get("cookId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const duration = parseFloat(formData.get("duration") as string) || 2;
    const guestsCount = parseInt(formData.get("guests") as string) || 4;
    const locationType = formData.get("locationType") as string;
    const address = formData.get("address") as string;
    const orderType = formData.get("orderType") as string;
    const menuId = formData.get("menuId") as string;
    const dishesStr = formData.get("dishes") as string;
    const groceryDelivery = formData.get("groceryDelivery") === "true";
    const notes = formData.get("notes") as string;
    const totalPrice = parseFloat(formData.get("totalPrice") as string) || 0;

    // 1. Create the main Booking Record
    const bookingData: any = {
        family_id: user.id,
        cook_id: cookId,
        scheduled_date: date,
        scheduled_time: time,
        duration_hours: duration,
        guests: guestsCount,
        location: locationType,
        total_price: totalPrice,
        grocery_delivery: groceryDelivery,
        notes: notes || null,
        status: "pending"
    };

    if (locationType === "client_home" && address) {
        bookingData.address = address;
    }

    if (orderType === "menu" && menuId) {
        bookingData.menu_id = menuId;
    }

    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

    if (bookingError) {
        console.error("Booking error:", bookingError);
        return { error: "Failed to submit booking request. " + bookingError.message };
    }

    // 2. If it's an A La Carte order, insert the selected dishes into booking_dishes
    if (orderType === "alacarte" && dishesStr) {
        try {
            const dishes = JSON.parse(dishesStr);
            const dishInserts = Object.keys(dishes).map(dishId => ({
                booking_id: booking.id,
                dish_id: dishId,
                quantity: dishes[dishId]
            }));

            if (dishInserts.length > 0) {
                const { error: dishError } = await supabase
                    .from('booking_dishes')
                    .insert(dishInserts);

                if (dishError) {
                    console.error("Booking dishes error:", dishError);
                    // Non-fatal, but ideally we'd rollback. For Foodie IV we log it.
                }
            }
        } catch (e) {
            console.error("Error parsing dishes:", e);
        }
    }

    revalidatePath("/dashboard/family");
    return { success: true, bookingId: booking.id };
}

export async function updateBookingStatus(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in." };
    }

    const bookingId = formData.get("bookingId") as string;
    const newStatus = formData.get("status") as "accepted" | "declined" | "completed" | "cancelled";

    if (!bookingId || !newStatus) {
        return { error: "Missing required fields." };
    }

    // Verify this cook owns this booking before updating
    const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('cook_id')
        .eq('id', bookingId)
        .single();

    if (fetchError || !existingBooking) {
        return { error: "Booking not found." };
    }

    if (existingBooking.cook_id !== user.id) {
        return { error: "You do not have permission to update this booking." };
    }

    // Perform the update
    const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

    if (updateError) {
        console.error("Error updating booking status:", updateError);
        return { error: "Failed to update booking. " + updateError.message };
    }

    revalidatePath("/dashboard/cook/bookings");
    return { success: true };
}
