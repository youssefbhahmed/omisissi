import { createClient } from "@supabase/supabase-js";
import LandingClient, { type LandingCook } from "./LandingClient";

// Refresh the featured-cooks section every 5 minutes
export const revalidate = 300;

// Marketing fallback shown when no real cooks are available yet
const FALLBACK_COOKS: LandingCook[] = [
    { id: "1", name: "Fatma Ben Ali", bio: "Cuisine tunisienne traditionnelle · 12 ans d’expérience", rating: 4.9, reviews: 127, pricePerHour: 45, city: "Tunis, La Marsa", img: "/cook-tunisian.png", href: "/signup" },
    { id: "2", name: "Amira Trabelsi", bio: "Cuisine tunisienne saine et végane", rating: 4.8, reviews: 89, pricePerHour: 40, city: "Sousse", img: "/tunisian-mechouia.png", href: "/signup" },
    { id: "3", name: "Leila Mansouri", bio: "Pâtisseries, desserts et plats réconfortants", rating: 5.0, reviews: 64, pricePerHour: 55, city: "Sfax", img: "/tunisian-pastries.png", href: "/signup" },
];

async function getFeaturedCooks(): Promise<LandingCook[]> {
    try {
        // Cookie-less anon client: this is public directory data, and it keeps
        // the landing page statically cacheable.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // select("*") so this works both before and after the is_approved
        // migration: only an explicit `false` hides a cook.
        const { data: rawDetails } = await supabase
            .from("cook_details")
            .select("*")
            .not("price_per_session", "is", null)
            .order("rating_average", { ascending: false })
            .limit(12);

        const details = (rawDetails ?? [])
            .filter((d) => d.is_approved !== false)
            .slice(0, 3);
        if (details.length === 0) return FALLBACK_COOKS;

        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", details.map((d) => d.id));

        return details.map((d) => {
            const profile = profiles?.find((p) => p.id === d.id);
            return {
                id: d.id,
                name: profile?.full_name || "Cuisinier à domicile",
                bio: d.bio || "Cuisinier tunisien à domicile vérifié.",
                rating: Number(d.rating_average) || 5,
                reviews: d.total_reviews || 0,
                pricePerHour: Number(d.price_per_session) || 0,
                city: d.city || "Tunisie",
                img: profile?.avatar_url || "/cook-tunisian.png",
                href: `/cooks/${d.id}`,
            };
        });
    } catch {
        return FALLBACK_COOKS;
    }
}

export default async function LandingPage() {
    const cooks = await getFeaturedCooks();
    return <LandingClient cooks={cooks} />;
}
