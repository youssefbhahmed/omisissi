import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin, Star, Check, ArrowLeft, Clock, Calendar, ChefHat } from "lucide-react";
import Link from "next/link";
import BookingWidget from "./BookingWidget";

function Stars({ n = 5 }: { n?: number }) {
    return (
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} color={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} />
            ))}
        </div>
    );
}

const DEFAULT_DISHES = ["/hero-tunisian-feast.png", "/tunisian-mechouia.png", "/family-tunisian-dinner-1.png", "/tunisian-pastries.png"];

export default async function CookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    const { data: details } = await supabase
        .from('cook_details')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile || !details) {
        redirect("/dashboard/discover");
    }

    // Parse specialties safely - Supabase may return it as a string or array
    let specialties: string[] = [];
    if (Array.isArray(details.specialties)) {
        specialties = details.specialties;
    } else if (typeof details.specialties === 'string') {
        specialties = details.specialties.replace(/[{}]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    // Fetch Cook's Dishes
    const { data: rawDishes } = await supabase
        .from('dishes')
        .select('*')
        .eq('cook_id', id)
        .order('created_at', { ascending: false });

    // Fetch Cook's Menus
    const { data: rawMenus } = await supabase
        .from('menus')
        .select(`
            *,
            menu_dishes(
                quantity,
                dishes(*)
            )
        `)
        .eq('cook_id', id)
        .order('created_at', { ascending: false });

    // Ensure available days is parsed
    let availableDays = [];
    if (Array.isArray(details.available_days)) {
        availableDays = details.available_days;
    } else if (typeof details.available_days === 'string') {
        try {
            availableDays = JSON.parse(details.available_days);
        } catch(e) {}
    }

    const cook = {
        name: profile.full_name || "Cook",
        img: profile.avatar_url || "/hero-tunisian-food-1.png",
        bio: details.bio || "No bio yet.",
        specialties,
        city: details.city || "Tunisia",
        rating: details.rating_average || 5.0,
        reviews: details.total_reviews || 0,
        pricePerHour: details.price_per_session || 0,
        dishes: DEFAULT_DISHES,
        completedBookings: details.total_reviews || 0,
        joinedYear: new Date(profile.created_at).getFullYear(),
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/dashboard/discover" className="btn-nav" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Back to Search
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px" }} className="md:grid-cols-1">
                {/* Left Column */}
                <div>
                    <div style={{ position: "relative", height: "320px", borderRadius: "24px", overflow: "hidden", marginBottom: "32px", border: "1px solid var(--border-light)" }}>
                        <img src={cook.img} alt={cook.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                        <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                <span style={{ backgroundColor: "var(--brand-success)", color: "white", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Check size={14} strokeWidth={3} /> Verified Home Cook
                                </span>
                                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "white", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <MapPin size={14} /> {cook.city}
                                </span>
                            </div>
                            <h1 className="heading-font" style={{ fontSize: "42px", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-1px" }}>{cook.name}</h1>
                        </div>
                    </div>

                    <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="heading-font" style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>About {cook.name.split(' ')[0]}</h2>
                        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--text-body)" }}>{cook.bio}</p>
                    </div>

                    <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>Specialties</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            {cook.specialties.map((s: string) => (
                                <span key={s} style={{ padding: "8px 16px", borderRadius: "99px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-medium)", color: "var(--brand-primary)", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <ChefHat size={16} /> {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>
                            All Dishes {rawDishes && rawDishes.length > 0 && <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>({rawDishes.length})</span>}
                        </h2>
                        {(!rawDishes || rawDishes.length === 0) ? (
                            <div className="card" style={{ padding: "40px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                                <p style={{ color: "var(--text-muted)", margin: 0 }}>No dishes listed yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {rawDishes.map((dish: any) => (
                                    <div key={dish.id} className="card" style={{ display: "flex", gap: "16px", padding: "0", overflow: "hidden", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", transition: "transform 0.2s, box-shadow 0.2s" }}>
                                        <div style={{ width: "140px", minHeight: "140px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                                            <img
                                                src={dish.image_url || "/hero-tunisian-food.png"}
                                                alt={dish.name}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, padding: "16px 16px 16px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "16px", color: "var(--text-heading)" }}>{dish.name}</h3>
                                                <span style={{
                                                    padding: "3px 10px",
                                                    borderRadius: "99px",
                                                    fontSize: "10px",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px",
                                                    backgroundColor: dish.category === "main" ? "rgba(235, 171, 33, 0.12)" : dish.category === "starter" ? "rgba(34, 197, 94, 0.12)" : "rgba(168, 85, 247, 0.12)",
                                                    color: dish.category === "main" ? "var(--brand-primary)" : dish.category === "starter" ? "#22c55e" : "#a855f7",
                                                }}>{dish.category}</span>
                                            </div>
                                            <p style={{ margin: "0 0 10px 0", fontSize: "13px", lineHeight: 1.6, color: "var(--text-body)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {dish.description || "No description available."}
                                            </p>
                                            {dish.dietary_tags && dish.dietary_tags.length > 0 && (
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                    {dish.dietary_tags.map((tag: string) => (
                                                        <span key={tag} style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>Reviews ({cook.reviews})</h2>
                        <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", margin: 0 }}>Reviews will appear here once {cook.name.split(' ')[0]} completes their first booking through the platform.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Widget */}
                <div>
                     <BookingWidget 
                        cookId={id}
                        pricePerHour={cook.pricePerHour}
                        availableDays={availableDays}
                        menus={rawMenus || []}
                        dishes={rawDishes || []}
                     />
                </div>
            </div>
        </div>
    );
}
