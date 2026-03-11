"use client";

import React, { useState } from "react";
import { Plus, Check, Trash2, Search, ArrowRight, Utensils, Image as ImageIcon } from "lucide-react";
import { addDish, deleteDish } from "@/app/actions/dishes";

export default function DishesClient({ initialDishes }: { initialDishes: any[] }) {
    const [dishes, setDishes] = useState(initialDishes);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [category, setCategory] = useState("main");
    const [complexity, setComplexity] = useState(2);
    const [imageMode, setImageMode] = useState<"upload" | "link">("link");

    const availableTags = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free", "Spicy", "Kid-Friendly"];

    const toggleTag = (t: string) => {
        setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this dish?")) return;

        const res = await deleteDish(id);
        if (res.success) {
            setDishes(prev => prev.filter(d => d.id !== id));
        } else {
            alert(res.error);
        }
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        My Dishes (A La Carte)
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Manage the individual items families can order from you.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                    style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={18} /> Add New Dish
                </button>
            </div>

            {/* Content Area */}
            {isAdding ? (
                <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Utensils size={20} color="var(--brand-primary)" /> Create New Dish
                        </h2>
                        <button onClick={() => setIsAdding(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                    </div>

                    <form action={async (formData) => {
                        formData.append("category", category);
                        formData.append("complexity", complexity.toString());
                        formData.append("dietary_tags", JSON.stringify(activeTags));
                        const res = await addDish(formData);
                        if (res.success) {
                            setIsAdding(false);
                            // Normally we'd rely on revalidatePath, but we can optimistically reload
                            window.location.reload();
                        } else {
                            alert(res.error);
                        }
                    }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Dish Name</label>
                                    <input name="name" type="text" required placeholder="e.g. Traditional Brik" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Description</label>
                                    <textarea name="description" required placeholder="Crispy pastry filled with tuna, egg, and parsley..." rows={3} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Dish Photo</label>
                                
                                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setImageMode("upload")}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${imageMode === "upload" ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: imageMode === "upload" ? "var(--bg-subtle)" : "var(--bg-base)", color: imageMode === "upload" ? "var(--brand-primary)" : "var(--text-body)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        Upload File
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setImageMode("link")}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${imageMode === "link" ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: imageMode === "link" ? "var(--bg-subtle)" : "var(--bg-base)", color: imageMode === "link" ? "var(--brand-primary)" : "var(--text-body)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        Paste Link
                                    </button>
                                </div>

                                {imageMode === "upload" ? (
                                    <div style={{ border: "2px dashed var(--border-medium)", borderRadius: "12px", padding: "32px 16px", backgroundColor: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "12px", position: "relative" }}>
                                        <ImageIcon size={28} />
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-body)" }}>Click to Upload Image</span>
                                        <span style={{ fontSize: "12px" }}>JPEG, PNG, WEBP (Max 5MB)</span>
                                        <input name="image_file" type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                                    </div>
                                ) : (
                                    <input name="image_url" type="url" placeholder="https://example.com/my-dish.jpg" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                )}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Category</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {['starter', 'main', 'dessert', 'side', 'other'].map(cat => (
                                        <button
                                            key={cat} type="button"
                                            onClick={() => setCategory(cat)}
                                            style={{ padding: "12px", borderRadius: "8px", textAlign: "left", cursor: "pointer", border: `1px solid ${category === cat ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: category === cat ? "var(--bg-subtle)" : "var(--bg-base)", color: category === cat ? "var(--brand-primary)" : "var(--text-body)", fontWeight: category === cat ? 700 : 500, textTransform: "capitalize", transition: "all 0.2s" }}
                                        >
                                            {cat} {cat === 'main' && ' Course'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Complexity</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {[
                                        { level: 1, label: "Easy", desc: "Salads, cold dishes", color: "#22c55e" },
                                        { level: 2, label: "Medium", desc: "Standard cooking", color: "#eab308" },
                                        { level: 3, label: "Hard", desc: "Slow-cook, multi-step", color: "#f97316" },
                                        { level: 4, label: "Expert", desc: "Pastries, complex prep", color: "#ef4444" },
                                    ].map(c => (
                                        <button
                                            key={c.level} type="button"
                                            onClick={() => setComplexity(c.level)}
                                            style={{ padding: "10px 12px", borderRadius: "8px", textAlign: "left", cursor: "pointer", border: `1px solid ${complexity === c.level ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: complexity === c.level ? "var(--bg-subtle)" : "var(--bg-base)", color: complexity === c.level ? "var(--brand-primary)" : "var(--text-body)", fontWeight: complexity === c.level ? 700 : 500, transition: "all 0.2s" }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: c.color, flexShrink: 0, boxShadow: `0 0 0 3px ${c.color}22` }} />
                                                <div>
                                                    <div style={{ fontSize: "13px", fontWeight: 700 }}>{c.label}</div>
                                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>{c.desc}</div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Dietary Tags</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {availableTags.map(t => {
                                        const isActive = activeTags.includes(t);
                                        return (
                                            <button
                                                key={t} type="button" onClick={() => toggleTag(t)}
                                                style={{ padding: "8px 16px", borderRadius: "99px", border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: isActive ? "var(--brand-primary)" : "var(--bg-base)", color: isActive ? "white" : "var(--text-body)", fontSize: "13px", fontWeight: isActive ? 700 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease" }}
                                            >
                                                {t} {isActive && <Check size={14} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>Save Dish to Menu</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dishes.length === 0 ? (
                        <div style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", borderRadius: "16px", border: "1px dashed var(--border-medium)" }}>
                            <Utensils size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px auto", opacity: 0.5 }} />
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>You haven't added any dishes yet.</h3>
                            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px" }}>Build your a la carte menu by adding your specialties.</p>
                            <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ padding: "12px 24px", display: "inline-block" }}>Add Your First Dish</button>
                        </div>
                    ) : (
                        dishes.map(dish => (
                            <div key={dish.id} className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", display: "flex", gap: "24px", alignItems: "flex-start" }}>
                                <div style={{ width: "120px", height: "120px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--bg-base)" }}>
                                    <img src={dish.image_url} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                                <h3 className="heading-font" style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-heading)" }}>{dish.name}</h3>
                                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 8px", borderRadius: "6px", backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>{dish.category}</span>
                                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "5px", backgroundColor: dish.complexity === 1 ? "rgba(34,197,94,0.1)" : dish.complexity === 2 ? "rgba(235,171,33,0.1)" : dish.complexity === 3 ? "rgba(249,115,22,0.1)" : "rgba(239,68,68,0.1)", color: dish.complexity === 1 ? "#22c55e" : dish.complexity === 2 ? "var(--brand-primary)" : dish.complexity === 3 ? "#f97316" : "#ef4444" }}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }} />
                                                    {dish.complexity === 1 ? "Easy" : dish.complexity === 2 ? "Medium" : dish.complexity === 3 ? "Hard" : "Expert"}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0 0 16px 0", color: "var(--text-body)", fontSize: "15px", lineHeight: 1.5 }}>{dish.description}</p>
                                        </div>
                                        <button onClick={() => handleDelete(dish.id)} style={{ padding: "8px", background: "none", border: "none", color: "var(--danger)", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-subtle)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {dish.dietary_tags?.map((tag: string) => (
                                            <span key={tag} style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand-primary)", backgroundColor: "rgba(235, 171, 33, 0.1)", padding: "4px 10px", borderRadius: "99px" }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
