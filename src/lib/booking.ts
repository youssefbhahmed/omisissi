// Booking pricing and availability rules, shared by the BookingWidget (for the
// live estimate) and the submitBooking server action (which recomputes the
// price authoritatively — the client's number is never trusted).

export const TRAVEL_FEE = 10; // flat TND fee when the cook travels to the family

// Complexity level → prep time in hours per dish
export const COMPLEXITY_TIME: Record<number, number> = {
    1: 0.4, // Easy (salads, cold dishes)
    2: 0.8, // Medium (standard cooking)
    3: 1.2, // Hard (slow-cook, multi-step)
    4: 1.5, // Expert (pastries, complex prep)
};

export const MAX_GUESTS = 30;
export const MAX_DISH_QUANTITY = 20;

// Extra hours added per guest, by bracket
export function getGuestTime(guests: number): number {
    if (guests <= 4) return 0;
    if (guests <= 9) return (guests - 4) * 0.2;
    if (guests <= 15) return 5 * 0.2 + (guests - 9) * 0.3;
    return 5 * 0.2 + 6 * 0.3 + (guests - 15) * 0.4;
}

// Grocery-shopping fee scales with the number of guests
export function getGroceryFee(guests: number): number {
    if (guests <= 4) return 40;
    if (guests <= 8) return 60;
    if (guests <= 15) return 85;
    return 110;
}

/** Estimated cook time for an a-la-carte order (minimum 1h, rounded to 0.1h). */
export function estimateHours(
    selectedQuantities: Record<string, number>,
    dishes: Array<{ id: string; complexity: number | null }>,
    guests: number
): number {
    let prep = 0;
    for (const [dishId, qty] of Object.entries(selectedQuantities)) {
        const dish = dishes.find((d) => d.id === dishId);
        const complexity = dish?.complexity ?? 2;
        prep += qty * (COMPLEXITY_TIME[complexity] ?? 0.8);
    }
    const raw = prep + getGuestTime(guests);
    return Math.max(1, Math.round(raw * 10) / 10);
}

export const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

/** Weekday name for a YYYY-MM-DD string, independent of the runtime timezone.
 *  (new Date("YYYY-MM-DD") parses as UTC midnight, so formatting it in a
 *  UTC-negative timezone shifts the weekday back a day — build from parts.) */
export function weekdayName(dateString: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (!match) return "";
    const [, y, m, d] = match;
    return WEEKDAYS[new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).getUTCDay()];
}

/** Parse the selected-dishes payload ({ dishId: quantity }) from the client.
 *  Returns null when the payload is malformed. */
export function parseSelectedDishes(raw: string): Record<string, number> | null {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const result: Record<string, number> = {};
    for (const [dishId, qty] of Object.entries(parsed)) {
        if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_DISH_QUANTITY) {
            return null;
        }
        result[dishId] = qty;
    }
    if (Object.keys(result).length === 0 || Object.keys(result).length > 50) return null;
    return result;
}
