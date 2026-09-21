import React from "react";
import Link from "next/link";
import { GRAND_TUNIS_PATHS, GRAND_TUNIS_VIEWBOX } from "./grand-tunis-paths";

// The hero's right side: Grand Tunis (Tunis, Ariana, Ben Arous, La Manouba
// governorates) with a live radar over the operating zone and the featured
// cooks called out on dotted leader lines. The chips (.map-chip) and lines
// (.map-link) start hidden and get the `on` class from the hero scroll
// handler — on scroll, or automatically after a short delay so nobody
// misses them (see useHeroCinematic in LandingClient.tsx).
//
// Cities, ratings and ids mirror the live cook accounts (the two e-UUIDs come
// from supabase/seed_more_cooks.sql). Markers sit at each city's real
// coordinates, projected with the same transform as grand-tunis-paths.ts.
const COOKS = [
    { id: "a1111111-1111-1111-1111-111111111111", img: "/cook-fatma.jpg", name: "Fatma", city: "La Marsa", note: "★ 5,0", left: "58%", top: "12%", marker: [872, 420], anchor: [800, 220] },
    { id: "a3333333-3333-3333-3333-333333333333", img: "/cook-leila.jpg", name: "Leila", city: "Sidi Bou Said", note: "★ 5,0", left: "72%", top: "34%", marker: [888, 432], anchor: [900, 420] },
    { id: "a2222222-2222-2222-2222-222222222222", img: "/cook-amira.jpg", name: "Amira", city: "Ariana", note: "★ 4,8", left: "14%", top: "20%", marker: [732, 436], anchor: [400, 290] },
    { id: "e1111111-1111-1111-1111-111111111111", img: "/cook-portrait.png", name: "Salha", city: "La Manouba", note: "★ 4,7", left: "2%", top: "48%", marker: [631, 513], anchor: [270, 560] },
    { id: "e2222222-2222-2222-2222-222222222222", img: "/cook-tunisian.png", name: "Mounira", city: "Ben Arous", note: "★ 4,8", left: "48%", top: "70%", marker: [759, 585], anchor: [680, 780] },
];

// Radar hub: the heart of the operating zone, between the three cities
const HUB: [number, number] = [775, 455];

export default function TunisiaMap() {
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg viewBox={GRAND_TUNIS_VIEWBOX} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} aria-hidden="true">
                <defs>
                    <radialGradient id="tn-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(244,193,47,0.5)" />
                        <stop offset="100%" stopColor="rgba(244,193,47,0)" />
                    </radialGradient>
                </defs>

                {/* Governorates */}
                {GRAND_TUNIS_PATHS.map((p) => (
                    <path key={p.name} d={p.d} fill="rgba(246,239,226,0.09)" stroke="#F6CC4F" strokeWidth="3.5" strokeLinejoin="round" />
                ))}

                {/* Operating-zone glow + radar rings */}
                <circle cx={HUB[0]} cy={HUB[1]} r="190" fill="url(#tn-glow)" />
                <circle cx={HUB[0]} cy={HUB[1]} r="40" fill="none" stroke="#F4C12F" strokeWidth="4" opacity="0.9">
                    <animate attributeName="r" values="30;170" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx={HUB[0]} cy={HUB[1]} r="40" fill="none" stroke="#F4C12F" strokeWidth="4" opacity="0.9">
                    <animate attributeName="r" values="30;170" dur="2.8s" begin="1.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="2.8s" begin="1.4s" repeatCount="indefinite" />
                </circle>

                {/* City markers + dotted leader lines to the chips */}
                {COOKS.map((c) => (
                    <g key={c.name}>
                        <circle cx={c.marker[0]} cy={c.marker[1]} r="14" fill="#F4C12F" stroke="#121212" strokeWidth="5" />
                        <line
                            className="map-link"
                            x1={c.marker[0]}
                            y1={c.marker[1]}
                            x2={c.anchor[0]}
                            y2={c.anchor[1]}
                            stroke="rgba(244,193,47,0.75)"
                            strokeWidth="3.5"
                            strokeDasharray="9 11"
                        />
                    </g>
                ))}
            </svg>

            {/* Cook chips, revealed on scroll (or shortly after load) — each one
                links to the cook's live profile */}
            {COOKS.map((c) => (
                <Link key={c.name} href={`/cooks/${c.id}`} className="map-chip" style={{ left: c.left, top: c.top }} aria-label={`Voir le profil de ${c.name} (${c.city})`}>
                    <img src={c.img} alt="" />
                    <div>
                        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "white", lineHeight: 1.2 }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>{c.city}</p>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--brand-primary)", marginLeft: "4px" }}>{c.note}</span>
                </Link>
            ))}

            <p style={{ position: "absolute", bottom: "-14px", left: 0, right: 0, textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "12.5px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(246,239,226,0.85)" }}>
                <span className="pulse-dot" /> Le Grand Tunis aujourd&rsquo;hui — bientôt plus loin
            </p>
        </div>
    );
}
