import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FilterControls } from "./FilterControls";
import CookGrid from "./CookGrid";

export default async function DiscoverCooks() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

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

    // 1. Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // 2. Get ALL cook profiles and details
    const { data: cookProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'cook');

    const { data: cookDetails } = await supabase
        .from('cook_details')
        .select('*');

    // 3. Merge and calculate distances
    let cooks: any[] = [];
    if (cookProfiles && cookDetails) {
        cooks = cookProfiles.map((p: any) => {
            const detail = cookDetails.find((d: any) => d.id === p.id);
            if (!detail) return null;

            let distanceKm: number | null = null;
            if (profile?.lat && profile?.lng && detail.lat && detail.lng) {
                distanceKm = getDistanceKm(profile.lat, profile.lng, detail.lat, detail.lng);
            }

            return {
                id: p.id,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                bio: detail.bio,
                city: detail.city,
                rating_average: detail.rating_average,
                total_reviews: detail.total_reviews,
                price_per_hour: detail.price_per_session,
                distanceKm,
            };
        }).filter(Boolean);

        // Sort by distance
        cooks.sort((a: any, b: any) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    const hasLocation = !!(profile?.lat && profile?.lng);

    return (
        <div>
            <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Find a Cook
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Browse verified home cooks in your area.</p>
                </div>

                <FilterControls />
            </div>

            <CookGrid cooks={cooks} hasLocation={hasLocation} />
        </div>
    );
}
