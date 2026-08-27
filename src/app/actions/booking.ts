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
import { dayFr } from "@/lib/labels";
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
        return { error: "Vous devez être connecté pour réserver un cuisinier." };
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
    if (!cookId) return { error: "Cuisinier manquant." };
    if (cookId === user.id) return { error: "Vous ne pouvez pas vous réserver vous-même." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Veuillez choisir une date valide." };
    if (!/^\d{2}:\d{2}/.test(time)) return { error: "Veuillez choisir une heure valide." };
    if (scheduledMs(date, time) - Date.now() < MIN_NOTICE_HOURS * 3600_000) {
        return { error: `Les réservations doivent être faites au moins ${MIN_NOTICE_HOURS} heures à l’avance, pour que le cuisinier puisse s’organiser et faire les courses.` };
    }
    if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS) {
        return { error: `Le nombre de convives doit être entre 1 et ${MAX_GUESTS}.` };
    }
    if (locationType !== "client_home" && locationType !== "cook_home") {
        return { error: "Veuillez choisir un lieu valide." };
    }
    if (locationType === "client_home" && !address) {
        return { error: "Veuillez indiquer votre adresse." };
    }
    if (orderType !== "menu" && orderType !== "dishes") {
        return { error: "Veuillez choisir un menu ou sélectionner des plats." };
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
        return { error: "Ce cuisinier n’est pas disponible à la réservation." };
    }
    if (cookDetails.is_approved === false) {
        return { error: "Ce cuisinier n’a pas encore été approuvé par l’équipe Ommi Sissi." };
    }

    const availableDays = normalizeStringArray(cookDetails.available_days);
    if (availableDays.length === 0) {
        return { error: "Ce cuisinier n’a pas encore défini ses disponibilités." };
    }
    if (!availableDays.includes(weekdayName(date))) {
        return { error: `Le cuisinier n’est pas disponible le ${dayFr(weekdayName(date)).toLowerCase()}.` };
    }
    if (await cookHasConflict(supabase, cookId, date, time)) {
        return { error: "Ce cuisinier a déjà une réservation confirmée à ce créneau. Essayez une autre heure ou un autre jour." };
    }

    // --- Compute the price server-side (never trust the client's number) ---
    const travelFee = locationType === "client_home" ? TRAVEL_FEE : 0;
    const groceryFee = groceryDelivery ? getGroceryFee(guests) : 0;

    let durationHours = 0;
    let totalPrice = 0;
    let dishInserts: { booking_id?: string; dish_id: string; quantity: number }[] = [];
    let bookedMenuId: string | null = null;

    if (orderType === "menu") {
        if (!menuId) return { error: "Veuillez choisir un menu." };
        const { data: menu } = await supabase
            .from('menus')
            .select('id, price')
            .eq('id', menuId)
            .eq('cook_id', cookId)
            .single();
        if (!menu) return { error: "Ce menu n’appartient pas à ce cuisinier." };
        bookedMenuId = menu.id;
        totalPrice = Number(menu.price) + travelFee + groceryFee;
    } else {
        const trimmedDishes = (dishesStr || "").trim();
        if (!trimmedDishes || trimmedDishes === "{}") {
            return { error: "Veuillez sélectionner au moins un plat." };
        }
        const selected = parseSelectedDishes(trimmedDishes);
        if (!selected) {
            return { error: `Sélection invalide — vous pouvez commander entre 1 et ${MAX_DISH_QUANTITY} exemplaires de chaque plat.` };
        }

        const dishIds = Object.keys(selected);
        const { data: cookDishes } = await supabase
            .from('dishes')
            .select('id, complexity')
            .in('id', dishIds)
            .eq('cook_id', cookId);

        if (!cookDishes || cookDishes.length !== dishIds.length) {
            return { error: "Un ou plusieurs plats sélectionnés n’appartiennent pas à ce cuisinier." };
        }

        const pricePerHour = Number(cookDetails.price_per_session);
        if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) {
            return { error: "Ce cuisinier n’a pas encore défini de tarif horaire." };
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
        return { error: "Échec de l’envoi de la demande de réservation. " + (bookingError?.message ?? "") };
    }

    if (dishInserts.length > 0) {
        const { error: dishError } = await supabase
            .from('booking_dishes')
            .insert(dishInserts.map((d) => ({ ...d, booking_id: booking.id })));

        if (dishError) {
            console.error("Booking dishes error:", dishError);
            // Roll back so we never store a paid booking with no order lines.
            await supabase.from('bookings').delete().eq('id', booking.id);
            return { error: "Échec de l’enregistrement de vos plats. Veuillez réessayer." };
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
        return { error: "Vous devez être connecté." };
    }

    const bookingId = formData.get("bookingId") as string;
    const newStatus = formData.get("status") as BookingStatus;

    if (!bookingId || !newStatus) {
        return { error: "Champs requis manquants." };
    }

    const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('cook_id, family_id, status, scheduled_date, scheduled_time')
        .eq('id', bookingId)
        .single();

    if (fetchError || !booking) {
        return { error: "Réservation introuvable." };
    }

    const isCook = booking.cook_id === user.id;
    const isFamily = booking.family_id === user.id;

    if (isCook) {
        if (!COOK_STATUSES.includes(newStatus)) {
            return { error: "Statut invalide." };
        }
        if ((newStatus === "accepted" || newStatus === "declined") && booking.status !== "pending") {
            return { error: "Cette demande a déjà été traitée." };
        }
        if (newStatus === "completed" && booking.status !== "accepted") {
            return { error: "Seules les réservations acceptées peuvent être marquées terminées." };
        }
        if (
            newStatus === "accepted" &&
            await cookHasConflict(supabase, user.id, booking.scheduled_date, booking.scheduled_time, bookingId)
        ) {
            return { error: "Vous avez déjà une réservation confirmée à ce créneau. Refusez celle-ci ou libérez d’abord le créneau." };
        }
    } else if (isFamily) {
        if (newStatus !== "cancelled") {
            return { error: "Vous ne pouvez annuler que vos propres réservations." };
        }
        if (booking.status === "accepted") {
            const hoursLeft = (scheduledMs(booking.scheduled_date, booking.scheduled_time) - Date.now()) / 3600_000;
            if (hoursLeft < CANCEL_WINDOW_HOURS) {
                return { error: `Une réservation acceptée ne peut être annulée que jusqu’à ${CANCEL_WINDOW_HOURS} heures avant le repas. Contactez directement le cuisinier.` };
            }
        } else if (booking.status !== "pending") {
            return { error: "Seules les demandes en attente ou les réservations acceptées à venir peuvent être annulées." };
        }
    } else {
        return { error: "Vous n’avez pas la permission de modifier cette réservation." };
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
        return { error: "Échec de la mise à jour de la réservation. " + updateError.message };
    }
    if (!updatedRows || updatedRows.length === 0) {
        return { error: "Cette réservation vient d’être modifiée par quelqu’un d’autre. Actualisez et réessayez." };
    }

    revalidatePath("/dashboard/cook/bookings");
    revalidatePath("/dashboard/family");
    return { success: true };
}
