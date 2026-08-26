// French display labels for values stored in English in the database.
// The stored values (weekday names, dish categories, booking statuses) must
// never be translated — matching in queries, RLS policies and the booking
// engine depends on them. Only their DISPLAY goes through these maps.

export const WEEKDAY_FR: Record<string, string> = {
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
    Sunday: "Dimanche",
};

export const CATEGORY_FR: Record<string, string> = {
    starter: "Entrée",
    main: "Plat",
    dessert: "Dessert",
    side: "Accompagnement",
    other: "Autre",
};

// Feminine agreement: they qualify "réservation" / "demande".
export const STATUS_FR: Record<string, string> = {
    pending: "En attente",
    accepted: "Acceptée",
    declined: "Refusée",
    cancelled: "Annulée",
    completed: "Terminée",
    in_progress: "En cours",
};

export function dayFr(day: string): string {
    return WEEKDAY_FR[day] ?? day;
}

export function categoryFr(category: string): string {
    return CATEGORY_FR[category] ?? category;
}

export function statusFr(status: string): string {
    return STATUS_FR[status] ?? status;
}
