// Shared row shapes for the tables this app reads and writes.
// Keep these in sync with the SQL in supabase/ — they are the contract
// between the server actions and the client components.

export type UserRole = "family" | "cook";

export interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    address: string | null;
    lat: number | null;
    lng: number | null;
    created_at: string;
}

export interface CookDetails {
    id: string;
    bio: string | null;
    // Postgres TEXT[] normally arrives as string[], but legacy rows may hold a
    // "{a,b}" string — always run it through normalizeStringArray before use.
    specialties: string[] | string | null;
    city: string | null;
    price_per_session: number | null;
    rating_average: number | null;
    total_reviews: number | null;
    available_days: string[] | string | null;
    lat: number | null;
    lng: number | null;
}

export type DishCategory = "starter" | "main" | "dessert" | "side" | "other";

export interface Dish {
    id: string;
    cook_id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    category: DishCategory;
    dietary_tags: string[] | null;
    complexity: number | null;
    created_at: string;
}

export interface Menu {
    id: string;
    cook_id: string;
    name: string;
    description: string | null;
    price: number;
    created_at: string;
}

export interface MenuWithDishes extends Menu {
    dishes: Dish[];
}

export type BookingStatus =
    | "pending"
    | "accepted"
    | "declined"
    | "in_progress"
    | "completed"
    | "cancelled";

export interface BookingDishLine {
    dish_id: string;
    quantity: number;
    dish: { name: string } | null;
}

export interface BookingListItem {
    id: string;
    family_id: string;
    cook_id: string;
    status: BookingStatus;
    scheduled_date: string;
    scheduled_time: string;
    duration_hours: number;
    guests: number | null;
    location: "client_home" | "cook_home";
    address: string | null;
    total_price: number;
    grocery_delivery: boolean;
    notes: string | null;
    created_at: string;
    menu: { name: string } | null;
    dishes: BookingDishLine[];
    // Filled in by the page after a second profiles query (the bookings FKs
    // point at auth.users, so PostgREST cannot embed profiles directly).
    partner?: { full_name: string | null; avatar_url: string | null } | null;
    // Counterparty phone, revealed via get_booking_contact() once accepted.
    partner_phone?: string | null;
}

export interface Review {
    id: string;
    booking_id: string;
    cook_id: string;
    family_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
}

export interface DiscoverCook {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    rating_average: number | null;
    total_reviews: number | null;
    price_per_hour: number | null;
    specialties: string[];
    distanceKm: number | null;
}

/** Normalize a value that may be a real array, a Postgres "{a,b}" literal,
 *  a JSON-encoded array string, or null into a clean string[]. */
export function normalizeStringArray(value: string[] | string | null | undefined): string[] {
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
    if (typeof value !== "string" || value.length === 0) return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
    } catch {
        // fall through to the "{a,b}" form
    }
    return value
        .replace(/[{}"]/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}
