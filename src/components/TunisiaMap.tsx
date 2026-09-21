import React from "react";
import { TUNISIA_PATH } from "./tunisia-path";

// The hero's right side: Tunisia with a live "radar" over the operating zone
// (Tunis · La Marsa · Ariana) and the featured cooks fanned out on dotted
// leader lines. The cook chips (.map-chip) and lines (.map-link) start hidden
// and get the `on` class from the hero scroll handler, one by one, as the
// visitor scrolls — see useHeroCinematic in LandingClient.tsx.
const COOKS = [
    { img: "/cook-fatma.jpg", name: "Fatma", city: "La Marsa", note: "4,9", left: "66%", top: "4%", anchor: [700, 105] },
    { img: "/cook-amira.jpg", name: "Amira", city: "Tunis", note: "4,8", left: "72%", top: "24%", anchor: [755, 265] },
    { img: "/cook-leila.jpg", name: "Leila", city: "Ariana", note: "5,0", left: "63%", top: "44%", anchor: [665, 465] },
];

// Gulf-of-Tunis cluster in the SVG's 1024-unit space
const HUB: [number, number] = [645, 165];

export default function TunisiaMap() {
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg viewBox="0 0 1024 1024" style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} aria-hidden="true">
                <defs>
                    <radialGradient id="tn-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(244,193,47,0.55)" />
                        <stop offset="100%" stopColor="rgba(244,193,47,0)" />
                    </radialGradient>
                </defs>

                {/* Country */}
                <g transform="translate(0,1024) scale(0.1,-0.1)" fill="rgba(246,239,226,0.10)" stroke="#F6CC4F" strokeWidth="14" strokeLinejoin="round">
                    <path d={TUNISIA_PATH} />
                </g>

                {/* Operating-zone glow + radar rings */}
                <circle cx={HUB[0]} cy={HUB[1]} r="110" fill="url(#tn-glow)" />
                <circle cx={HUB[0]} cy={HUB[1]} r="26" fill="none" stroke="#F4C12F" strokeWidth="3" opacity="0.9">
                    <animate attributeName="r" values="18;95" dur="2.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={HUB[0]} cy={HUB[1]} r="26" fill="none" stroke="#F4C12F" strokeWidth="3" opacity="0.9">
                    <animate attributeName="r" values="18;95" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
                </circle>
                <circle cx={HUB[0]} cy={HUB[1]} r="13" fill="#F4C12F" stroke="#121212" strokeWidth="4" />

                {/* Dotted leader lines to the cook chips */}
                {COOKS.map((c) => (
                    <line
                        key={c.name}
                        className="map-link"
                        x1={HUB[0]}
                        y1={HUB[1]}
                        x2={c.anchor[0]}
                        y2={c.anchor[1]}
                        stroke="rgba(244,193,47,0.75)"
                        strokeWidth="3"
                        strokeDasharray="8 10"
                    />
                ))}
            </svg>

            {/* Cook chips, revealed on scroll */}
            {COOKS.map((c) => (
                <div key={c.name} className="map-chip" style={{ left: c.left, top: c.top }}>
                    <img src={c.img} alt={`${c.name}, cuisinière à ${c.city}`} />
                    <div>
                        <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 700, color: "white", lineHeight: 1.2 }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: "11.5px", color: "rgba(255,255,255,0.65)", lineHeight: 1.2 }}>{c.city}</p>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 800, color: "var(--brand-primary)", marginLeft: "4px" }}>★ {c.note}</span>
                </div>
            ))}

            <p style={{ position: "absolute", bottom: "-8px", left: 0, right: 0, textAlign: "center", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "12.5px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(246,239,226,0.85)" }}>
                <span className="pulse-dot" /> Notre zone aujourd&rsquo;hui — bientôt plus loin
            </p>
        </div>
    );
}
