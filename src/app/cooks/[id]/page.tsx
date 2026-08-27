import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MapPin, Check, ArrowLeft, ChefHat, Star, Clock, Settings } from "lucide-react";
import Link from "next/link";
import BookingWidget from "./BookingWidget";
import { normalizeStringArray, type Dish, type Review } from "@/lib/types";
import { categoryFr } from "@/lib/labels";

function Stars({ n }: { n: number }) {
    return (
        <span style={{ display: "inline-flex", gap: "2px", verticalAlign: "middle" }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(n) ? "var(--brand-primary)" : "transparent"} color={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} />
            ))}
        </span>
    );
}

// Public page: the cook's profile is visible to everyone (logged in or not).
// Only the booking itself requires an account.
export default async function CookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

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
        redirect("/cooks");
    }

    const isOwner = user?.id === id;

    // Unapproved cooks are only visible to themselves (and to admins, so the
    // owner can review the profile before approving it).
    const isApproved = details.is_approved !== false;
    let viewerIsAdmin = false;
    if (user && !isOwner && !isApproved) {
        const { data: viewerProfile } = await supabase
            .from('profiles').select('is_admin').eq('id', user.id).single();
        viewerIsAdmin = viewerProfile?.is_admin === true;
    }
    if (!isApproved && !isOwner && !viewerIsAdmin) {
        redirect("/cooks");
    }

    const specialties = normalizeStringArray(details.specialties);

    // Fetch Cook's Dishes
    const { data: rawDishes } = await supabase
        .from('dishes')
        .select('*')
        .eq('cook_id', id)
        .order('created_at', { ascending: false });

    // Fetch Cook's Menus (menu_dishes only links menus to dishes — no quantity column)
    const { data: rawMenus } = await supabase
        .from('menus')
        .select(`
            *,
            menu_dishes(
                dishes(*)
            )
        `)
        .eq('cook_id', id)
        .order('created_at', { ascending: false });

    const availableDays = normalizeStringArray(details.available_days);

    // Real reviews left by families after completed bookings
    const { data: rawReviews } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, family_id')
        .eq('cook_id', id)
        .order('created_at', { ascending: false })
        .limit(12);
    const reviews = (rawReviews ?? []) as Review[];

    const reviewerIds = [...new Set(reviews.map((r) => r.family_id))];
    const { data: reviewers } = reviewerIds.length > 0
        ? await supabase.from('profiles').select('id, full_name').in('id', reviewerIds)
        : { data: [] };

    const cook = {
        name: profile.full_name || "Cuisinier",
        img: profile.avatar_url || "/hero-tunisian-food-1.png",
        bio: details.bio || "Pas encore de bio.",
        specialties,
        city: details.city || "Tunisie",
        rating: details.rating_average || 5.0,
        reviews: details.total_reviews || 0,
        pricePerHour: details.price_per_session || 0,
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "24px" }}>
                <Link href="/cooks" className="btn-nav" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                    <ArrowLeft size={18} /> Retour à la recherche
                </Link>
            </div>

            {!isApproved && (
                <div className="card" style={{ padding: "16px 24px", marginBottom: "24px", backgroundColor: "rgba(255, 184, 0,0.1)", border: "1px solid rgba(255, 184, 0,0.3)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Clock size={20} color="#d97706" />
                    <p style={{ margin: 0, fontSize: "14px", color: "#b45309", fontWeight: 600 }}>
                        Ce profil est en attente d’approbation par l’équipe Ommi Sissi — vous seul {viewerIsAdmin ? "(et les admins) " : ""}pouvez le voir pour l’instant.
                    </p>
                </div>
            )}

            <div style={{ gap: "40px" }} className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
                {/* Left Column */}
                <div>
                    <div style={{ position: "relative", height: "320px", borderRadius: "24px", overflow: "hidden", marginBottom: "32px", border: "1px solid var(--border-light)" }}>
                        <img src={cook.img} alt={cook.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                        <div style={{ position: "absolute", bottom: "32px", left: "32px", right: "32px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                {isApproved && (
                                    <span style={{ backgroundColor: "var(--brand-success)", color: "white", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Check size={14} strokeWidth={3} /> Cuisinier vérifié
                                    </span>
                                )}
                                <span style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", color: "white", padding: "6px 14px", borderRadius: "99px", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <MapPin size={14} /> {cook.city}
                                </span>
                            </div>
                            <h1 className="heading-font" style={{ fontSize: "42px", fontWeight: 800, color: "white", margin: 0, letterSpacing: "-1px" }}>{cook.name}</h1>
                        </div>
                    </div>

                    <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="heading-font" style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>À propos de {cook.name.split(' ')[0]}</h2>
                        <p style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--text-body)" }}>{cook.bio}</p>
                    </div>

                    <div style={{ marginBottom: "40px", paddingBottom: "32px", borderBottom: "1px solid var(--border-light)" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px" }}>Spécialités</h2>
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
                            Tous les plats {rawDishes && rawDishes.length > 0 && <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-muted)" }}>({rawDishes.length})</span>}
                        </h2>
                        {(!rawDishes || rawDishes.length === 0) ? (
                            <div className="card" style={{ padding: "40px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                                <p style={{ color: "var(--text-muted)", margin: 0 }}>Aucun plat répertorié pour l’instant.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {rawDishes.map((dish: Dish) => (
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
                                                    backgroundColor: dish.category === "main" ? "rgba(255, 184, 0, 0.12)" : dish.category === "starter" ? "rgba(34, 197, 94, 0.12)" : "rgba(168, 85, 247, 0.12)",
                                                    color: dish.category === "main" ? "var(--brand-primary)" : dish.category === "starter" ? "#22c55e" : "#a855f7",
                                                }}>{categoryFr(dish.category)}</span>
                                            </div>
                                            <p style={{ margin: "0 0 10px 0", fontSize: "13px", lineHeight: 1.6, color: "var(--text-body)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {dish.description || "Aucune description disponible."}
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
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                            Avis ({cook.reviews})
                            {reviews.length > 0 && <Stars n={Number(cook.rating)} />}
                        </h2>
                        {reviews.length === 0 ? (
                            <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", margin: 0 }}>Les avis apparaîtront ici dès que {cook.name.split(' ')[0]} aura effectué sa première réservation via la plateforme.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {reviews.map((review) => {
                                    const reviewerName = reviewers?.find((p) => p.id === review.family_id)?.full_name || "Une famille";
                                    return (
                                        <div key={review.id} className="card" style={{ padding: "20px 24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#121212", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                                                        {reviewerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-heading)" }}>{reviewerName}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(review.created_at).toLocaleDateString("fr-FR")}</div>
                                                    </div>
                                                </div>
                                                <Stars n={review.rating} />
                                            </div>
                                            {review.comment && (
                                                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--text-body)" }}>&ldquo;{review.comment}&rdquo;</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Booking Widget (or profile tools when it's your own page) */}
                <div>
                    {isOwner ? (
                        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", position: "sticky", top: "100px", textAlign: "center" }}>
                            <h3 className="heading-font" style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>Ceci est votre profil public</h3>
                            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                                C’est exactement ce que voient les familles lorsqu’elles vous trouvent. Gardez votre bio, vos plats et vos menus à jour !
                            </p>
                            <Link href="/dashboard/cook/profile" className="btn-primary" style={{ padding: "12px 24px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <Settings size={16} /> Modifier mon profil
                            </Link>
                        </div>
                    ) : (
                        <BookingWidget
                            cookId={id}
                            pricePerHour={cook.pricePerHour}
                            availableDays={availableDays}
                            menus={rawMenus || []}
                            dishes={rawDishes || []}
                            isLoggedIn={!!user}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
