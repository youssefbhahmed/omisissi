"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";

// Complete list of Tunisian governorates with their center coordinates
const TUNISIAN_REGIONS = [
    { name: "Tunis", lat: 36.8065, lng: 10.1815 },
    { name: "Ariana", lat: 36.8625, lng: 10.1936 },
    { name: "Ben Arous", lat: 36.7471, lng: 10.2181 },
    { name: "Manouba", lat: 36.8101, lng: 10.0863 },
    { name: "Nabeul", lat: 36.4561, lng: 10.7376 },
    { name: "Zaghouan", lat: 36.4029, lng: 10.1429 },
    { name: "Bizerte", lat: 37.2744, lng: 9.8739 },
    { name: "Béja", lat: 36.7256, lng: 9.1817 },
    { name: "Jendouba", lat: 36.5011, lng: 8.7803 },
    { name: "Le Kef", lat: 36.1674, lng: 8.7049 },
    { name: "Siliana", lat: 36.0842, lng: 9.3708 },
    { name: "Sousse", lat: 35.8254, lng: 10.6369 },
    { name: "Monastir", lat: 35.7643, lng: 10.8113 },
    { name: "Mahdia", lat: 35.5047, lng: 11.0622 },
    { name: "Sfax", lat: 34.7398, lng: 10.7600 },
    { name: "Kairouan", lat: 35.6781, lng: 10.0963 },
    { name: "Kasserine", lat: 35.1722, lng: 8.8306 },
    { name: "Sidi Bouzid", lat: 35.0382, lng: 9.4849 },
    { name: "Gabès", lat: 33.8815, lng: 10.0982 },
    { name: "Medenine", lat: 33.3540, lng: 10.5055 },
    { name: "Tataouine", lat: 32.9297, lng: 10.4518 },
    { name: "Gafsa", lat: 34.4250, lng: 8.7842 },
    { name: "Tozeur", lat: 33.9197, lng: 8.1336 },
    { name: "Kebili", lat: 33.7044, lng: 8.9690 },
    // Popular specific areas
    { name: "La Marsa", lat: 36.8782, lng: 10.3246 },
    { name: "Sidi Bou Said", lat: 36.8695, lng: 10.3402 },
    { name: "Carthage", lat: 36.8529, lng: 10.3235 },
    { name: "Hammamet", lat: 36.4000, lng: 10.6167 },
    { name: "Djerba", lat: 33.8076, lng: 10.8452 },
    { name: "Gammarth", lat: 36.8925, lng: 10.2881 },
    { name: "La Goulette", lat: 36.8181, lng: 10.3050 },
];

interface RegionPickerProps {
    defaultValue?: string;
}

export default function RegionPicker({ defaultValue }: RegionPickerProps) {
    const [query, setQuery] = useState(defaultValue || "");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<typeof TUNISIAN_REGIONS[0] | null>(
        TUNISIAN_REGIONS.find(r => r.name === defaultValue) || null
    );
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filtered = TUNISIAN_REGIONS.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} style={{ position: "relative", flex: 1 }}>
            {/* Hidden fields that get submitted with the form */}
            <input type="hidden" name="address" value={selectedRegion?.name || query} />
            <input type="hidden" name="lat" value={selectedRegion?.lat || ""} />
            <input type="hidden" name="lng" value={selectedRegion?.lng || ""} />

            <div style={{ position: "relative" }}>
                <MapPin size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: selectedRegion ? "var(--brand-primary)" : "var(--text-muted)" }} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedRegion(null);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Start typing your city or region..."
                    style={{
                        width: "100%",
                        padding: "12px 12px 12px 40px",
                        borderRadius: "10px",
                        border: `1px solid ${selectedRegion ? "var(--brand-primary)" : "var(--border-medium)"}`,
                        backgroundColor: "var(--bg-base)",
                        color: "var(--text-body)",
                        fontSize: "14px",
                    }}
                    autoComplete="off"
                />
            </div>

            {/* Dropdown */}
            {isOpen && filtered.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-medium)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    maxHeight: "240px",
                    overflowY: "auto",
                }}>
                    {filtered.map((region) => (
                        <button
                            key={region.name}
                            type="button"
                            onClick={() => {
                                setQuery(region.name);
                                setSelectedRegion(region);
                                setIsOpen(false);
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "12px 16px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontSize: "14px",
                                color: "var(--text-body)",
                                textAlign: "left",
                                borderBottom: "1px solid var(--border-light)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-base)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            <MapPin size={14} style={{ color: "var(--brand-primary)", flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>{region.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {selectedRegion && (
                <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--brand-primary)", fontWeight: 600 }}>
                    📍 Region set to {selectedRegion.name}
                </p>
            )}
            {!selectedRegion && query.length > 0 && (
                <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Select a region from the dropdown to enable location-based search.
                </p>
            )}
        </div>
    );
}
