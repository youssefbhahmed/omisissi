"use client";

import React, { useState } from "react";
import { Search, Filter, Star, ChevronDown, Check } from "lucide-react";

export function FilterControls() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSpecialties, setActiveSpecialties] = useState<string[]>([]);
    const [rating, setRating] = useState<string>("Any");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const specialtiesList = ["Traditional", "Vegan", "Pastries", "Healthy", "Comfort Food", "Seafood"];

    const toggleSpecialty = (s: string) => {
        setActiveSpecialties(prev => 
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    return (
        <>
            {/* Search Bar & Filter Trigger */}
            <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
                <div style={{ flex: 1, position: "relative" }}>
                    <Search size={20} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        type="text"
                        placeholder="Search by city, specialty, or cook name..."
                        style={{ 
                            width: "100%", 
                            height: "100%",
                            padding: "16px 16px 16px 48px", 
                            borderRadius: "16px", 
                            border: "1px solid var(--border-medium)", 
                            backgroundColor: "var(--bg-surface)", 
                            fontSize: "16px", 
                            color: "var(--text-body)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            outline: "none",
                            transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"}
                        onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-medium)"}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        padding: "0 24px", 
                        borderRadius: "16px", 
                        border: "1px solid var(--border-medium)", 
                        backgroundColor: "var(--bg-surface)", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        fontWeight: 700, 
                        fontSize: "15px",
                        color: "var(--text-heading)",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-base)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-surface)"}
                >
                    <Filter size={18} style={{ color: "var(--text-muted)" }} /> Filters
                    {activeSpecialties.length > 0 && (
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", marginLeft: "4px" }} />
                    )}
                </button>
            </div>

            {/* Custom Modal Overlay */}
            {isModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
                    zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "fadeIn 0.2s ease"
                }}>
                    <div style={{
                        backgroundColor: "var(--bg-surface)", borderRadius: "24px", width: "100%", maxWidth: "480px",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.12)", overflow: "hidden", display: "flex", flexDirection: "column",
                        maxHeight: "90vh", animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}>
                        {/* Header */}
                        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-surface)" }}>
                            <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-heading)" }}>Filter Cooks</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: "var(--text-muted)", borderRadius: "50%" }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "32px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "32px", backgroundColor: "var(--bg-base)" }}>
                            
                            {/* Price Section */}
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-heading)" }}>Price Range (TND)</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>Min</span>
                                        <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" 
                                            style={{ width: "100%", padding: "16px 16px 16px 52px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)", fontSize: "15px", outline: "none" }} 
                                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-medium)"}
                                        />
                                    </div>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>Max</span>
                                        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="100+" 
                                            style={{ width: "100%", padding: "16px 16px 16px 56px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)", fontSize: "15px", outline: "none" }} 
                                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--brand-primary)"} onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-medium)"}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Specialties Section */}
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-heading)" }}>Specialties</h4>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {specialtiesList.map(s => {
                                        const isActive = activeSpecialties.includes(s);
                                        return (
                                            <button 
                                                key={s} 
                                                onClick={() => toggleSpecialty(s)}
                                                style={{ 
                                                    padding: "10px 18px", 
                                                    borderRadius: "99px", 
                                                    border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-medium)"}`, 
                                                    backgroundColor: isActive ? "var(--brand-primary)" : "var(--bg-surface)", 
                                                    color: isActive ? "white" : "var(--text-body)", 
                                                    fontSize: "14px", 
                                                    fontWeight: isActive ? 700 : 600,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    transition: "all 0.2s ease"
                                                }}
                                            >
                                                {s} {isActive && <Check size={14} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: "var(--text-heading)" }}>Minimum Rating</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                    {["Any", "4.0+", "4.5+"].map(rt => {
                                        const isActive = rating === rt;
                                        return (
                                            <button 
                                                key={rt} 
                                                onClick={() => setRating(rt)}
                                                style={{ 
                                                    padding: "16px 12px", 
                                                    borderRadius: "16px", 
                                                    border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-medium)"}`, 
                                                    backgroundColor: isActive ? "rgba(245, 158, 11, 0.05)" : "var(--bg-surface)", 
                                                    color: isActive ? "var(--brand-primary)" : "var(--text-body)", 
                                                    fontSize: "15px", 
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    transition: "all 0.2s ease"
                                                }}
                                            >
                                                <Star size={18} fill={isActive || rt !== "Any" ? "var(--brand-primary)" : "transparent"} color={isActive || rt !== "Any" ? "var(--brand-primary)" : "var(--text-muted)"} />
                                                {rt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <div style={{ padding: "24px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "16px", backgroundColor: "var(--bg-surface)", marginTop: "auto" }}>
                            <button 
                                onClick={() => { setActiveSpecialties([]); setRating("Any"); setMinPrice(""); setMaxPrice(""); }}
                                style={{ flex: "0 0 auto", padding: "16px 24px", borderRadius: "16px", border: "none", backgroundColor: "transparent", color: "var(--text-body)", fontSize: "16px", fontWeight: 700, cursor: "pointer", transition: "color 0.2s ease" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-heading)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-body)"}
                            >
                                Clear All
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="btn-primary" 
                                style={{ flex: 1, padding: "16px", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </>
    );
}
