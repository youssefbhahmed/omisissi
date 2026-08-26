import React from "react";
import { createClient } from "@/lib/supabase/server";
import DiscoverClient from "./DiscoverClient";
import { normalizeStringArray, type CookDetails, type DiscoverCook } from "@/lib/types";

// Haversine formula
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Public page: anyone can browse the cook directory — logging in is only
// required at booking time.
export default async function DiscoverCooks() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Logged-in visitors get distances from their saved coordinates
    let userLat: number | null = null;
    let userLng: number | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('lat, lng')
            .eq('id', user.id)
            .single();
        userLat = profile?.lat ?? null;
        userLng = profile?.lng ?? null;
    }

    // 2. Get ALL cook profiles and details
    const { data: cookProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'cook');

    const { data: cookDetails } = await supabase
        .from('cook_details')
        .select('*');

    // 3. Merge and calculate distances
    let cooks: DiscoverCook[] = [];
    if (cookProfiles && cookDetails) {
        cooks = cookProfiles.flatMap((p): DiscoverCook[] => {
            const detail = (cookDetails as CookDetails[]).find((d) => d.id === p.id);
            if (!detail) return [];
            // Only admin-approved cooks are listed. `!== false` keeps the page
            // working before the is_approved migration has been applied.
            if (detail.is_approved === false) return [];

            let distanceKm: number | null = null;
            if (userLat && userLng && detail.lat && detail.lng) {
                distanceKm = getDistanceKm(userLat, userLng, detail.lat, detail.lng);
            }

            return [{
                id: p.id,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                bio: detail.bio,
                city: detail.city,
                rating_average: detail.rating_average,
                total_reviews: detail.total_reviews,
                price_per_hour: detail.price_per_session,
                specialties: normalizeStringArray(detail.specialties),
                distanceKm,
            }];
        });

        // Sort by distance
        cooks.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    const hasLocation = !!(userLat && userLng);

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                    Trouver un cuisinier
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Parcourez les cuisiniers à domicile vérifiés près de chez vous.</p>
            </div>

            <DiscoverClient cooks={cooks} hasLocation={hasLocation} />
        </div>
    );
}
