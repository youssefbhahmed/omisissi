"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    TRAVEL_FEE,
    MAX_GUESTS,
    MAX_DISH_QUANTITY,
    estimateHours,
    getGroceryFee,
    parseSelectedDishes,
    weekdayName,
} from "@/lib/booking";
import { normalizeStringArray, type BookingStatus } from "@/lib/types";

type ActionResult = { error: string } | { success: true; bookingId?: string };

const MIN_NOTICE_HOURS = 24;   // bookings must be made at least this far ahead
const CANCEL_WINDOW_HOURS = 48; // accepted bookings can be cancelled up to this far before
const CONFLICT_WINDOW_HOURS = 3; // a cook is "busy" within this window around an accepted booking

function scheduledMs(date: string, time: string): number {
    return Date.parse(`${date}T${time.slice(0, 5)}:00Z`);
}

function timeToMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
}

/** True when the cook already has an accepted/in-progress booking on that
 *  date within CONFLICT_WINDOW_HOURS of the requested time. */
async function cookHasConflict(
    supabase: Awaited<ReturnType<typeof createClient>>,
    cookId: string,
    date: string,
    time: string,
    ignoreBookingId?: string
): Promise<boolean> {
    const { data: sameDay } = await supabase
        .from('bookings')
        .select('id, scheduled_time')
        .eq('cook_id', cookId)
        .eq('scheduled_date', date)
        .in('status', ['accepted', 'in_progress']);

    const requested = timeToMinutes(time);
    return (sameDay ?? []).some(
        (b) =>
            b.id !== ignoreBookingId &&
            Math.abs(timeToMinutes(b.scheduled_time) - requested) < CONFLICT_WINDOW_HOURS * 60
    );
}

export async function submitBooking(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to book a cook." };
    }

    const cookId = formData.get("cookId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const guests = parseInt(formData.get("guests") as string, 10);
    const locationType = formData.get("locationType") as string;
    const address = ((formData.get("address") as string) || "").trim();
    const orderType = formData.get("orderType") as string;
    const menuId = formData.get("menuId") as string;
    const dishesStr = formData.get("dishes") as string;
    const groceryDelivery = formData.get("groceryDelivery") === "true";
    const notes = ((formData.get("notes") as string) || "").trim().slice(0, 2000);

    // --- Validate the request shape ---
    if (!cookId) return { error: "Missing cook." };
    if (cookId === user.id) return { error: "You cannot book yourself." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Please select a valid date." };
    if (!/^\d{2}:\d{2}/.test(time)) return { error: "Please select a valid time." };
    if (scheduledMs(date, time) - Date.now() < MIN_NOTICE_HOURS * 3600_000) {
        return { error: `Bookings must be made at least ${MIN_NOTICE_HOURS} hours in advance, so the cook can plan and shop.` };
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
        return { error: `Guests must be between 1 and ${MAX_GUESTS}.` };
    }
    if (locationType !== "client_home" && locationType !== "cook_home") {
        return { error: "Please choose a valid location." };
    }
    if (locationType === "client_home" && !address) {
        return { error: "Please provide your address." };
    }
    if (orderType !== "menu" && orderType !== "dishes") {
        return { error: "Please choose a set menu or pick dishes." };
    }

    // --- Load the cook and check availability ---
    // select("*") so this works both before and after the is_approved
    // migration (selecting a missing column would fail the whole query).
    const { data: cookDetails } = await supabase
        .from('cook_details')
        .select('*')
        .eq('id', cookId)
        .single();

    if (!cookDetails) {
        return { error: "This cook is not available for bookings." };
    }
    if (cookDetails.is_approved === false) {
        return { error: "This cook has not been approved by the Foodie team yet." };
    }

    const availableDays = normalizeStringArray(cookDetails.available_days);
    if (availableDays.length === 0) {
        return { error: "This cook has not set their availability yet." };
    }
    if (!availableDays.includes(weekdayName(date))) {
        return { error: `The cook is not available on ${weekdayName(date)}s.` };
    }
    if (await cookHasConflict(supabase, cookId, date, time)) {
        return { error: "This cook already has a confirmed booking around that time. Try another time or day." };
    }

    // --- Compute the price server-side (never trust the client's number) ---
    const travelFee = locationType === "client_home" ? TRAVEL_FEE : 0;
    const groceryFee = groceryDelivery ? getGroceryFee(guests) : 0;

    let durationHours = 0;
    let totalPrice = 0;
    let dishInserts: { booking_id?: string; dish_id: string; quantity: number }[] = [];
    let bookedMenuId: string | null = null;

    if (orderType === "menu") {
        if (!menuId) return { error: "Please select a set menu." };
        const { data: menu } = await supabase
            .from('menus')
            .select('id, price')
            .eq('id', menuId)
            .eq('cook_id', cookId)
            .single();
        if (!menu) return { error: "That menu does not belong to this cook." };
        bookedMenuId = menu.id;
        totalPrice = Number(menu.price) + travelFee + groceryFee;
    } else {
        const trimmedDishes = (dishesStr || "").trim();
        if (!trimmedDishes || trimmedDishes === "{}") {
            return { error: "Please select at least one dish." };
        }
        const selected = parseSelectedDishes(trimmedDishes);
        if (!selected) {
            return { error: `Invalid dish selection — you can order between 1 and ${MAX_DISH_QUANTITY} of each dish.` };
        }

        const dishIds = Object.keys(selected);
        const { data: cookDishes } = await supabase
            .from('dishes')
            .select('id, complexity')
            .in('id', dishIds)
            .eq('cook_id', cookId);

        if (!cookDishes || cookDishes.length !== dishIds.length) {
            return { error: "One or more selected dishes do not belong to this cook." };
        }

        const pricePerHour = Number(cookDetails.price_per_session);
        if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) {
            return { error: "This cook has not set an hourly rate yet." };
        }

        durationHours = estimateHours(selected, cookDishes, guests);
        const cookTimeFee = Math.round(pricePerHour * durationHours * 10) / 10;
        totalPrice = cookTimeFee + travelFee + groceryFee;

        dishInserts = dishIds.map((dishId) => ({
            dish_id: dishId,
            quantity: selected[dishId],
        }));
    }

    // --- Create the booking ---
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
            family_id: user.id,
            cook_id: cookId,
            scheduled_date: date,
            scheduled_time: time,
            duration_hours: durationHours,
            guests,
            location: locationType,
            address: locationType === "client_home" ? address : null,
            menu_id: bookedMenuId,
            total_price: totalPrice,
            grocery_delivery: groceryDelivery,
            notes: notes || null,
            status: "pending",
        })
        .select('id')
        .single();

    if (bookingError || !booking) {
        console.error("Booking error:", bookingError);
        return { error: "Failed to submit booking request. " + (bookingError?.message ?? "") };
    }

    if (dishInserts.length > 0) {
        const { error: dishError } = await supabase
            .from('booking_dishes')
            .insert(dishInserts.map((d) => ({ ...d, booking_id: booking.id })));

        if (dishError) {
            console.error("Booking dishes error:", dishError);
            // Roll back so we never store a paid booking with no order lines.
            await supabase.from('bookings').delete().eq('id', booking.id);
            return { error: "Failed to save your dish selection. Please try again." };
        }
    }

    revalidatePath("/dashboard/family");
    revalidatePath("/dashboard/cook/bookings");
    return { success: true, bookingId: booking.id };
}

const COOK_STATUSES: BookingStatus[] = ["accepted", "declined", "completed"];

export async function updateBookingStatus(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in." };
    }

    const bookingId = formData.get("bookingId") as string;
    const newStatus = formData.get("status") as BookingStatus;

    if (!bookingId || !newStatus) {
        return { error: "Missing required fields." };
    }

    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('cook_id, family_id, status, scheduled_date, scheduled_time')
        .eq('id', bookingId)
        .single();

    if (fetchError || !booking) {
        return { error: "Booking not found." };
    }

    const isCook = booking.cook_id === user.id;
    const isFamily = booking.family_id === user.id;

    if (isCook) {
        if (!COOK_STATUSES.includes(newStatus)) {
            return { error: "Invalid status." };
        }
        if ((newStatus === "accepted" || newStatus === "declined") && booking.status !== "pending") {
            return { error: "This request has already been handled." };
        }
        if (newStatus === "completed" && booking.status !== "accepted") {
            return { error: "Only accepted bookings can be completed." };
        }
        if (
            newStatus === "accepted" &&
            await cookHasConflict(supabase, user.id, booking.scheduled_date, booking.scheduled_time, bookingId)
        ) {
            return { error: "You already have a confirmed booking around that time. Decline this one or free up the slot first." };
        }
    } else if (isFamily) {
        if (newStatus !== "cancelled") {
            return { error: "You can only cancel your own bookings." };
        }
        if (booking.status === "accepted") {
            const hoursLeft = (scheduledMs(booking.scheduled_date, booking.scheduled_time) - Date.now()) / 3600_000;
            if (hoursLeft < CANCEL_WINDOW_HOURS) {
                return { error: `Accepted bookings can only be cancelled up to ${CANCEL_WINDOW_HOURS} hours before the meal. Please contact the cook directly.` };
            }
        } else if (booking.status !== "pending") {
            return { error: "Only pending requests or upcoming accepted bookings can be cancelled." };
        }
    } else {
        return { error: "You do not have permission to update this booking." };
    }

    // Compare-and-swap on the status we validated against, so a concurrent
    // change (e.g. the family cancelling while the cook accepts) fails
    // instead of silently overwriting it.
    const { data: updatedRows, error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
        .eq('status', booking.status)
        .select('id');

    if (updateError) {
        console.error("Error updating booking status:", updateError);
        return { error: "Failed to update booking. " + updateError.message };
    }
    if (!updatedRows || updatedRows.length === 0) {
        return { error: "This booking was just updated by someone else. Please refresh and try again." };
    }

    revalidatePath("/dashboard/cook/bookings");
    revalidatePath("/dashboard/family");
    return { success: true };
}
