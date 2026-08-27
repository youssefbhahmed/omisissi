"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2, Library, Utensils, DollarSign } from "lucide-react";
import { createMenu, deleteMenu } from "@/app/actions/menus";
import type { Dish, MenuWithDishes } from "@/lib/types";
import { categoryFr } from "@/lib/labels";

export default function MenusClient({ menus, availableDishes }: { menus: MenuWithDishes[], availableDishes: Dish[] }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Form State
    const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);

    const toggleDish = (id: string) => {
        setSelectedDishIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce menu ?")) return;

        setDeletingId(id);
        try {
            const res = await deleteMenu(id);
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
                        Mes menus
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Regroupez vos plats individuels en formules à prix fixe.</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setSelectedDishIds([]); }}
                    className="btn-primary"
                    style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
                >
                    <Plus size={18} /> Créer un menu
                </button>
            </div>

            {isAdding ? (
                <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Library size={20} color="var(--brand-primary)" /> Composer un nouveau menu
                        </h2>
                        <button onClick={() => setIsAdding(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Annuler</button>
                    </div>

                    <form action={async (formData) => {
                        if (selectedDishIds.length === 0) {
                            alert("Veuillez sélectionner au moins un plat pour votre menu.");
                            return;
                        }
                        const res = await createMenu(formData, selectedDishIds);
                        if (res.error) {
                            alert(res.error);
                        } else {
                            setIsAdding(false);
                            setSelectedDishIds([]);
                            router.refresh();
                        }
                    }} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        
                        {/* Information Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Nom du menu</label>
                                    <input name="name" type="text" required placeholder="ex. Dîner traditionnel tunisien en 3 services" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Description</label>
                                    <textarea name="description" required placeholder="Un dîner complet et généreux avec notre fameux brik et notre couscous à l’agneau..." rows={3} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Prix du menu (TND)</label>
                                <div style={{ position: "relative", marginBottom: "16px" }}>
                                    <DollarSign size={20} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                                    <input name="price" type="number" min="0" required placeholder="120" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", fontSize: "20px", fontWeight: 700 }} />
                                </div>
                                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255, 184, 0, 0.1)", color: "var(--brand-primary)", fontSize: "13px", lineHeight: 1.5 }}>
                                    Proposer un prix de menu aide les familles à commander des repas complets avec une légère remise par rapport à la carte.
                                </div>
                            </div>
                        </div>

                        {/* Dish Selection Grid */}
                        <div style={{ paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>Sélectionnez les plats de ce menu</label>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>{selectedDishIds.length} sélectionné(s)</span>
                            </div>
                            
                            {availableDishes.length === 0 ? (
                                <div style={{ padding: "32px", textAlign: "center", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px dashed var(--border-medium)" }}>
                                    <p style={{ margin: "0 0 16px 0", color: "var(--text-muted)", fontSize: "15px" }}>Vous devez d’abord ajouter des plats à la carte avant de créer un menu.</p>
                                    <a href="/dashboard/cook/dishes" className="btn-nav" style={{ padding: "10px 20px", display: "inline-block", textDecoration: "none" }}>Aller à Mes plats</a>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                                    {availableDishes.map((dish) => {
                                        const isSelected = selectedDishIds.includes(dish.id);
                                        return (
                                            <div 
                                                key={dish.id}
                                                onClick={() => toggleDish(dish.id)}
                                                style={{ 
                                                    border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border-medium)"}`, 
                                                    borderRadius: "12px", 
                                                    overflow: "hidden", 
                                                    cursor: "pointer", 
                                                    transition: "all 0.2s",
                                                    position: "relative",
                                                    backgroundColor: "var(--bg-base)"
                                                }}
                                            >
                                                {/* Selection Overlay Checkmark */}
                                                {isSelected && (
                                                    <div style={{ position: "absolute", top: "12px", right: "12px", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", zIndex: 10 }}>
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                )}
                                                <div style={{ height: "120px", width: "100%", position: "relative" }}>
                                                    <img src={dish.image_url || "/hero-tunisian-food.png"} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isSelected ? "brightness(0.9)" : "none" }} />
                                                    {isSelected && <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--brand-primary)", opacity: 0.1 }}></div>}
                                                </div>
                                                <div style={{ padding: "12px" }}>
                                                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>{categoryFr(dish.category)}</div>
                                                    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dish.name}</h3>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <button type="submit" className="btn-primary" disabled={selectedDishIds.length === 0} style={{ padding: "14px 32px", fontSize: "15px", opacity: selectedDishIds.length === 0 ? 0.5 : 1 }}>
                                Publier le menu
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {menus.length === 0 ? (
                        <div style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", borderRadius: "16px", border: "1px dashed var(--border-medium)" }}>
                            <Library size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px auto", opacity: 0.5 }} />
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>Aucun menu pour le moment.</h3>
                            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px" }}>Regroupez vos plats pour faciliter la commande des familles.</p>
                            <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ padding: "12px 24px", display: "inline-block" }}>Créer un premier menu</button>
                        </div>
                    ) : (
                        menus.map(menu => (
                            <div key={menu.id} className="card" style={{ padding: "0", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                                <div style={{ padding: "24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 className="heading-font" style={{ margin: "0 0 8px 0", fontSize: "22px", fontWeight: 800, color: "var(--text-heading)" }}>{menu.name}</h3>
                                        <p style={{ margin: "0 0 0 0", color: "var(--text-body)", fontSize: "15px" }}>{menu.description}</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", marginLeft: "24px" }}>
                                        <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--brand-primary)" }}>
                                            {menu.price} TND
                                        </div>
                                        <button onClick={() => handleDelete(menu.id)} disabled={deletingId === menu.id} style={{ padding: "8px", background: "none", border: "none", color: "var(--danger)", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, opacity: deletingId === menu.id ? 0.5 : 1 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-subtle)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <Trash2 size={16} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ padding: "20px 24px", backgroundColor: "var(--bg-subtle)" }}>
                                    <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Utensils size={14} /> Inclus dans ce menu :
                                    </div>
                                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px" }}>
                                        {(menu.dishes || []).map((dish) => (
                                            <div key={dish.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", backgroundColor: "var(--bg-base)", border: "1px solid var(--border-light)", borderRadius: "10px", flexShrink: 0, width: "220px" }}>
                                                <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                    <img src={dish.image_url || "/hero-tunisian-food.png"} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                                <div style={{ overflow: "hidden" }}>
                                                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>{categoryFr(dish.category)}</div>
                                                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dish.name}</div>
                                                </div>
                                            </div>
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
