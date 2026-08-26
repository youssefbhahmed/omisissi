"use client";

import React, { useState } from "react";
import { MapPin, Check, Star } from "lucide-react";
import Link from "next/link";
import type { DiscoverCook } from "@/lib/types";

function Stars({ n = 5 }: { n?: number }) {
    return (
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} color={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} />
            ))}
        </div>
    );
}

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 25;

export default function CookGrid({ cooks, hasLocation }: { cooks: DiscoverCook[]; hasLocation: boolean }) {
    const [maxDistance, setMaxDistance] = useState(10);

    const filtered = hasLocation
        ? cooks.filter((c) => c.distanceKm != null && c.distanceKm <= maxDistance)
        : cooks;

    const sliderPercent = ((maxDistance - MIN_RADIUS_KM) / (MAX_RADIUS_KM - MIN_RADIUS_KM)) * 100;

    return (
        <>
            {/* Distance Slider */}
            {hasLocation && (
                <div className="card" style={{
                    padding: "24px 28px",
                    marginBottom: "24px",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "16px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-heading)", fontSize: "14px", fontWeight: 700 }}>
                            <MapPin size={16} /> Rayon de recherche
                        </span>
                        <span style={{
                            background: "var(--brand-primary)",
                            color: "white",
                            padding: "4px 14px",
                            borderRadius: "99px",
                            fontSize: "13px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                        }}>
                            {maxDistance} km
                        </span>
                    </div>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            right: 0,
                            height: "6px",
                            transform: "translateY(-50%)",
                            borderRadius: "99px",
                            backgroundColor: "var(--border-light)",
                            pointerEvents: "none",
                        }} />
                        <div style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            width: `${sliderPercent}%`,
                            height: "6px",
                            transform: "translateY(-50%)",
                            borderRadius: "99px",
                            background: "linear-gradient(90deg, var(--brand-primary), var(--brand-accent, #f59e0b))",
                            pointerEvents: "none",
                        }} />
                        <input
                            type="range"
                            min={MIN_RADIUS_KM}
                            max={MAX_RADIUS_KM}
                            step={0.5}
                            value={maxDistance}
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            style={{
                                width: "100%",
                                appearance: "none",
                                WebkitAppearance: "none",
                                background: "transparent",
                                cursor: "pointer",
                                height: "24px",
                                position: "relative",
                                zIndex: 2,
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>
                        <span>{MIN_RADIUS_KM} km</span>
                        <span>{MAX_RADIUS_KM} km</span>
                    </div>
                    <style>{`
                        input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 22px;
                            height: 22px;
                            border-radius: 50%;
                            background: white;
                            border: 3px solid var(--brand-primary);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                            cursor: pointer;
                        }
                        input[type="range"]::-moz-range-thumb {
                            width: 22px;
                            height: 22px;
                            border-radius: 50%;
                            background: white;
                            border: 3px solid var(--brand-primary);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                            cursor: pointer;
                        }
                        input[type="range"]::-webkit-slider-runnable-track {
                            height: 6px;
                            background: transparent;
                        }
                        input[type="range"]::-moz-range-track {
                            height: 6px;
                            background: transparent;
                        }
                    `}</style>
                </div>
            )}

            {/* Cook Cards Grid */}
            <div className="auto-grid-3">
                {filtered.length > 0 ? filtered.map((cook) => (
                    <Link href={`/cooks/${cook.id}`} key={cook.id} className="card" style={{ cursor: "pointer", textDecoration: "none", color: "inherit", display: "block" }}>
                        <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                            <img src={cook.avatar_url || "/hero-tunisian-food-1.png"} alt={cook.full_name || "Cuisinier"} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)", pointerEvents: "none" }} />
                            <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--brand-success)", color: "white", padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                                <Check size={14} strokeWidth={3} /> Vérifié
                            </div>
                            <div style={{ position: "absolute", bottom: "16px", left: "16px" }}>
                                <h3 className="heading-font" style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: "white" }}>{cook.full_name}</h3>
                                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <MapPin size={14} /> {cook.city}
                                    {cook.distanceKm != null && ` (${Math.round(cook.distanceKm)} km)`}
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Stars n={cook.rating_average || 5} />
                                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-heading)" }}>{cook.rating_average || "5.0"}</span>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({cook.total_reviews || 0})</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)" }}>{cook.price_per_hour} TND</span>
                                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/heure</span>
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-body)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{cook.bio}</p>
                        </div>
                    </Link>
                )) : (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px 24px", color: "var(--text-muted)" }}>
                        <MapPin size={48} style={{ opacity: 0.2, margin: "0 auto 16px auto" }} />
                        <p style={{ fontSize: "18px", fontWeight: 600 }}>
                            {hasLocation
                                ? maxDistance < MAX_RADIUS_KM
                                    ? `Aucun cuisinier trouvé dans un rayon de ${maxDistance} km. Essayez d’élargir le rayon de recherche.`
                                    : `Aucun cuisinier trouvé dans un rayon de ${MAX_RADIUS_KM} km autour de votre région.`
                                : "Définissez votre région dans votre profil pour trouver des cuisiniers près de chez vous."}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
