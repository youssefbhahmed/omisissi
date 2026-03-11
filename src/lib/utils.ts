/* ============================================
   Utility functions shared across the app.
   ============================================ */

/** Merge class names, filtering out falsy values */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

/** Format price with currency symbol */
export function formatPrice(amount: number, currency = "$"): string {
    return `${currency}${amount.toFixed(2)}`;
}

/** Star rating display helper — returns an array of 'full' | 'half' | 'empty' */
export function getStarArray(
    rating: number
): ("full" | "half" | "empty")[] {
    const stars: ("full" | "half" | "empty")[] = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push("full");
        else if (rating >= i - 0.5) stars.push("half");
        else stars.push("empty");
    }
    return stars;
}

/** Truncate text to a maximum length */
export function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen).trimEnd() + "…";
}

/** Generate initials from a name string */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/** Human-friendly relative time */
export function relativeTime(date: string): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return then.toLocaleDateString();
}
