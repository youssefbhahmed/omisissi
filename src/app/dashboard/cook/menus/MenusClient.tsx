"use client";

import React, { useState } from "react";
import { Plus, Check, Trash2, Library, Utensils, DollarSign } from "lucide-react";
import { createMenu, deleteMenu } from "@/app/actions/menus";

export default function MenusClient({ initialMenus, availableDishes }: { initialMenus: any[], availableDishes: any[] }) {
    const [menus, setMenus] = useState(initialMenus);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
    
    const toggleDish = (id: string) => {
        setSelectedDishIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this menu package?")) return;
        
        const res = await deleteMenu(id);
        if (res.success) {
            setMenus(prev => prev.filter(m => m.id !== id));
        } else {
            alert(res.error);
        }
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        My Set Menus
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Group your individual dishes into fixed-price packages.</p>
                </div>
                <button 
                    onClick={() => { setIsAdding(true); setSelectedDishIds([]); }} 
                    className="btn-primary" 
                    style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                    <Plus size={18} /> Create Package
                </button>
            </div>

            {isAdding ? (
                <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Library size={20} color="var(--brand-primary)" /> Design a New Set Menu
                        </h2>
                        <button onClick={() => setIsAdding(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                    </div>

                    <form action={async (formData) => {
                        if (selectedDishIds.length === 0) {
                            alert("Please select at least one dish for your menu.");
                            return;
                        }
                        const res = await createMenu(formData, selectedDishIds);
                        if (res.success) {
                            setIsAdding(false);
                            window.location.reload(); 
                        } else {
                            alert(res.error);
                        }
                    }} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        
                        {/* Information Row */}
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Package Name</label>
                                    <input name="name" type="text" required placeholder="e.g. 3-Course Traditional Tunisian Dinner" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Description</label>
                                    <textarea name="description" required placeholder="A complete hearty dinner featuring our famous Brik and Lamb Couscous..." rows={3} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} />
                                </div>
                            </div>
                            
                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Package Price (TND)</label>
                                <div style={{ position: "relative", marginBottom: "16px" }}>
                                    <DollarSign size={20} color="var(--text-muted)" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
                                    <input name="price" type="number" min="0" required placeholder="120" style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", fontSize: "20px", fontWeight: 700 }} />
                                </div>
                                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "rgba(235, 171, 33, 0.1)", color: "var(--brand-primary)", fontSize: "13px", lineHeight: 1.5 }}>
                                    Offering a package price helps families order full meals at a slight discount compared to A La Carte.
                                </div>
                            </div>
                        </div>

                        {/* Dish Selection Grid */}
                        <div style={{ paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>Select Dishes for this Package</label>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 600 }}>{selectedDishIds.length} Selected</span>
                            </div>
                            
                            {availableDishes.length === 0 ? (
                                <div style={{ padding: "32px", textAlign: "center", backgroundColor: "var(--bg-base)", borderRadius: "12px", border: "1px dashed var(--border-medium)" }}>
                                    <p style={{ margin: "0 0 16px 0", color: "var(--text-muted)", fontSize: "15px" }}>You need to add some A La Carte dishes first before creating a Set Menu.</p>
                                    <a href="/dashboard/cook/dishes" className="btn-nav" style={{ padding: "10px 20px", display: "inline-block", textDecoration: "none" }}>Go to My Dishes</a>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                                    {availableDishes.map((dish: any) => {
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
                                                    <img src={dish.image_url} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isSelected ? "brightness(0.9)" : "none" }} />
                                                    {isSelected && <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--brand-primary)", opacity: 0.1 }}></div>}
                                                </div>
                                                <div style={{ padding: "12px" }}>
                                                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>{dish.category}</div>
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
                                Publish Set Menu
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {menus.length === 0 ? (
                        <div style={{ padding: "64px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", borderRadius: "16px", border: "1px dashed var(--border-medium)" }}>
                            <Library size={40} color="var(--text-muted)" style={{ margin: "0 auto 16px auto", opacity: 0.5 }} />
                            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 700 }}>No pre-set packages yet.</h3>
                            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px" }}>Group your dishes to make ordering easier for families.</p>
                            <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ padding: "12px 24px", display: "inline-block" }}>Create First Package</button>
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
                                        <button onClick={() => handleDelete(menu.id)} style={{ padding: "8px", background: "none", border: "none", color: "var(--danger)", cursor: "pointer", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600 }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-subtle)"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ padding: "20px 24px", backgroundColor: "var(--bg-subtle)" }}>
                                    <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Utensils size={14} /> Included in this package:
                                    </div>
                                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px" }}>
                                        {(menu.dishes || []).map((dish: any) => (
                                            <div key={dish.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", backgroundColor: "var(--bg-base)", border: "1px solid var(--border-light)", borderRadius: "10px", flexShrink: 0, width: "220px" }}>
                                                <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                                                    <img src={dish.image_url} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                </div>
                                                <div style={{ overflow: "hidden" }}>
                                                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>{dish.category}</div>
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
