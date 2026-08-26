"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2, Utensils, Image as ImageIcon } from "lucide-react";
import { addDish, deleteDish } from "@/app/actions/dishes";
import type { Dish } from "@/lib/types";
import { categoryFr } from "@/lib/labels";

export default function DishesClient({ dishes }: { dishes: Dish[] }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form State
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [category, setCategory] = useState("main");
    const [complexity, setComplexity] = useState(2);
    const [imageMode, setImageMode] = useState<"upload" | "link">("link");

    const availableTags = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free", "Spicy", "Kid-Friendly"];

    // Stored tag values stay English; only their display is French.
    const TAG_FR: Record<string, string> = {
        "Vegan": "Végan",
        "Vegetarian": "Végétarien",
        "Gluten-Free": "Sans gluten",
        "Halal": "Halal",
        "Dairy-Free": "Sans lactose",
        "Nut-Free": "Sans fruits à coque",
        "Spicy": "Épicé",
        "Kid-Friendly": "Adapté aux enfants",
    };
    const tagFr = (t: string) => TAG_FR[t] ?? t;

    const toggleTag = (t: string) => {
        setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce plat ?")) return;

        setDeletingId(id);
        try {
            const res = await deleteDish(id);
            if (res.error) {
                alert(res.error);
            } else {
                router.refresh();
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Mes plats (à la carte)
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Gérez les plats individuels que les familles peuvent vous commander.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-primary"
                    style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
                >
                    <Plus size={18} /> Ajouter un plat
                </button>
            </div>

            {/* Content Area */}
            {isAdding ? (
                <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Utensils size={20} color="var(--brand-primary)" /> Créer un nouveau plat
                        </h2>
                        <button onClick={() => setIsAdding(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
                    </div>

                    <form action={async (formData) => {
                        formData.append("category", category);
                        formData.append("complexity", complexity.toString());
                        formData.append("dietary_tags", JSON.stringify(activeTags));
                        const res = await addDish(formData);
                        if (res.error) {
                            alert(res.error);
                        } else {
                            setIsAdding(false);
                            setActiveTags([]);
                            router.refresh();
                        }
                    }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Nom du plat</label>
                                    <input name="name" type="text" required placeholder="ex. Brik traditionnel" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Description</label>
                                    <textarea name="description" required placeholder="Feuilleté croustillant garni de thon, d’œuf et de persil..." rows={3} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Photo du plat</label>
                                
                                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setImageMode("upload")}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${imageMode === "upload" ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: imageMode === "upload" ? "var(--bg-subtle)" : "var(--bg-base)", color: imageMode === "upload" ? "var(--brand-primary)" : "var(--text-body)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        Téléverser un fichier
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setImageMode("link")}
                                        style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${imageMode === "link" ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: imageMode === "link" ? "var(--bg-subtle)" : "var(--bg-base)", color: imageMode === "link" ? "var(--brand-primary)" : "var(--text-body)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                        Coller un lien
                                    </button>
                                </div>

                                {imageMode === "upload" ? (
                                    <div style={{ border: "2px dashed var(--border-medium)", borderRadius: "12px", padding: "32px 16px", backgroundColor: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: "12px", position: "relative" }}>
                                        <ImageIcon size={28} />
                                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-body)" }}>Cliquez pour téléverser une image</span>
                                        <span style={{ fontSize: "12px" }}>JPEG, PNG, WEBP (5 Mo max)</span>
                                        <input name="image_file" type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
                                    </div>
                                ) : (
                                    <input name="image_url" type="url" placeholder="https://example.com/my-dish.jpg" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                )}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "24px", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Catégorie</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {['starter', 'main', 'dessert', 'side', 'other'].map(cat => (
                                        <button
                                            key={cat} type="button"
                                            onClick={() => setCategory(cat)}
                                            style={{ padding: "12px", borderRadius: "8px", textAlign: "left", cursor: "pointer", border: `1px solid ${category === cat ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: category === cat ? "var(--bg-subtle)" : "var(--bg-base)", color: category === cat ? "var(--brand-primary)" : "var(--text-body)", fontWeight: category === cat ? 700 : 500, textTransform: "capitalize", transition: "all 0.2s" }}
                                        >
                                            {categoryFr(cat)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Complexité</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {[
                                        { level: 1, label: "Facile", desc: "Salades, plats froids", color: "#22c55e" },
                                        { level: 2, label: "Moyen", desc: "Cuisine courante", color: "#eab308" },
                                        { level: 3, label: "Difficile", desc: "Cuisson lente, plusieurs étapes", color: "#f97316" },
                                        { level: 4, label: "Expert", desc: "Pâtisseries, préparation complexe", color: "#ef4444" },
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
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Régimes alimentaires</label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                    {availableTags.map(t => {
                                        const isActive = activeTags.includes(t);
                                        return (
                                            <button
                                                key={t} type="button" onClick={() => toggleTag(t)}
                                                style={{ padding: "8px 16px", borderRadius: "99px", border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: isActive ? "var(--brand-primary)" : "var(--bg-base)", color: isActive ? "white" : "var(--text-body)", fontSize: "13px", fontWeight: isActive ? 700 : 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s ease" }}
                                            >
                                                {tagFr(t)} {isActive && <Check size={14} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>Enregistrer le plat</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dishes.length === 0 ? (
                        <div style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", borderRadius: "16px", border: "1px dashed var(--border-medium)" }}>
                            <Utensils size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px auto", opacity: 0.5 }} />
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>Vous n’avez pas encore ajouté de plat.</h3>
                            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px" }}>Construisez votre carte en ajoutant vos spécialités.</p>
                            <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ padding: "12px 24px", display: "inline-block" }}>Ajouter votre premier plat</button>
                        </div>
                    ) : (
                        dishes.map(dish => (
                            <div key={dish.id} className="card" style={{ padding: "clamp(16px, 4vw, 24px)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", display: "flex", gap: "clamp(12px, 3vw, 24px)", alignItems: "flex-start" }}>
                                <div style={{ width: "clamp(88px, 24vw, 120px)", height: "clamp(88px, 24vw, 120px)", borderRadius: "12px", overflow: "hidden", flexShrink: 0, backgroundColor: "var(--bg-base)" }}>
                                    <img src={dish.image_url || "/hero-tunisian-food.png"} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                                                <h3 className="heading-font" style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-heading)" }}>{dish.name}</h3>
                                                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", padding: "4px 8px", borderRadius: "6px", backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>{categoryFr(dish.category)}</span>
                                                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "5px", backgroundColor: dish.complexity === 1 ? "rgba(34,197,94,0.1)" : dish.complexity === 2 ? "rgba(235,171,33,0.1)" : dish.complexity === 3 ? "rgba(249,115,22,0.1)" : "rgba(239,68,68,0.1)", color: dish.complexity === 1 ? "#22c55e" : dish.complexity === 2 ? "var(--brand-primary)" : dish.complexity === 3 ? "#f97316" : "#ef4444" }}>
                                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor" }} />
                                                    {dish.complexity === 1 ? "Facile" : dish.complexity === 2 ? "Moyen" : dish.complexity === 3 ? "Difficile" : "Expert"}
                                                </span>
                                            </div>
                                            <p style={{ margin: "0 0 16px 0", color: "var(--text-body)", fontSize: "15px", lineHeight: 1.5 }}>{dish.description}</p>
                                        </div>
                                        <button onClick={() => handleDelete(dish.id)} disabled={deletingId === dish.id} style={{ padding: "8px", background: "none", border: "none", color: "var(--danger)", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", opacity: deletingId === dish.id ? 0.5 : 1 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-subtle)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                        {dish.dietary_tags?.map((tag: string) => (
                                            <span key={tag} style={{ fontSize: "12px", fontWeight: 600, color: "var(--brand-primary)", backgroundColor: "rgba(235, 171, 33, 0.1)", padding: "4px 10px", borderRadius: "99px" }}>
                                                {tagFr(tag)}
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
