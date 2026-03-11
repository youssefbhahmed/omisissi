"use client";

import React, { useState, useMemo } from "react";
import { Clock, MapPin, ShoppingBag, Utensils, Plus, Minus, Users } from "lucide-react";
import { submitBooking } from "../../../actions/booking";

// Complexity → prep time multiplier (hours per dish)
const COMPLEXITY_TIME: Record<number, number> = {
    1: 0.4,  // Easy (salads, cold dishes)
    2: 0.8,  // Medium (standard cooking)
    3: 1.2,  // Hard (slow-cook, multi-step)
    4: 1.5,  // Expert (pastries, complex prep)
};

// Guest time surcharge (hours per guest, by bracket)
function getGuestTime(guests: number): number {
    if (guests <= 4) return 0;
    // 5-9: 0.2h per guest above 4
    if (guests <= 9) return (guests - 4) * 0.2;
    // 10-15: previous bracket + 0.3h per guest above 9
    if (guests <= 15) return (5 * 0.2) + (guests - 9) * 0.3;
    // 16+: previous brackets + 0.4h per guest above 15
    return (5 * 0.2) + (6 * 0.3) + (guests - 15) * 0.4;
}

export default function BookingWidget({ 
    cookId, 
    pricePerHour, 
    availableDays = [], 
    menus = [], 
    dishes = [] 
}: { 
    cookId: string, 
    pricePerHour: number, 
    availableDays: string[],
    menus: any[],
    dishes: any[]
}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [date, setDate] = useState("");
    const [time, setTime] = useState("18:00");
    const [guests, setGuests] = useState(4);
    const [locationType, setLocationType] = useState<"client_home" | "cook_home">("client_home");
    const [address, setAddress] = useState("");
    
    // Order State
    const [orderType, setOrderType] = useState<"menu" | "dishes">("menu");
    const [selectedMenuId, setSelectedMenuId] = useState("");
    const [selectedDishes, setSelectedDishes] = useState<Record<string, number>>({});
    
    // Extras State
    const [groceryDelivery, setGroceryDelivery] = useState(false);
    const [notes, setNotes] = useState("");

    // Helpers
    const handleDishQuantity = (id: string, delta: number) => {
        setSelectedDishes(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            const newState = { ...prev };
            if (next === 0) {
                delete newState[id];
            } else {
                newState[id] = next;
            }
            return newState;
        });
    };

    const getDayOfWeek = (dateString: string) => {
        if (!dateString) return "";
        const dx = new Date(dateString);
        return dx.toLocaleDateString("en-US", { weekday: "long" });
    };

    const isDateAvailable = (dateString: string) => {
        const day = getDayOfWeek(dateString);
        return availableDays.includes(day);
    };

    // --- PRICING CALCULATIONS ---

    // Total dish count
    const totalDishCount = useMemo(() => {
        return Object.values(selectedDishes).reduce((a, b) => a + b, 0);
    }, [selectedDishes]);

    // Dish prep time based on complexity: sum of (quantity × complexity_time) for each selected dish
    const dishPrepTime = useMemo(() => {
        let total = 0;
        for (const [dishId, qty] of Object.entries(selectedDishes)) {
            const dish = dishes.find((d: any) => d.id === dishId);
            const complexity = dish?.complexity || 2;
            total += qty * (COMPLEXITY_TIME[complexity] || 0.8);
        }
        return total;
    }, [selectedDishes, dishes]);

    // Guest time surcharge
    const guestTime = useMemo(() => getGuestTime(guests), [guests]);

    // Total estimated hours (no rounding, min 1h)
    const estimatedHours = useMemo(() => {
        const raw = dishPrepTime + guestTime;
        return Math.max(1, parseFloat(raw.toFixed(1)));
    }, [dishPrepTime, guestTime]);

    // Set Menu price (fixed by cook)
    const getMenuPrice = () => {
        const m = menus.find(x => x.id === selectedMenuId);
        return m ? m.price : 0;
    };

    // Travel fee: flat 10 TND if cook comes to family
    const travelFee = locationType === "client_home" ? 10 : 0;

    // Grocery fee: scales with number of guests
    const groceryFee = useMemo(() => {
        if (!groceryDelivery) return 0;
        if (guests <= 4) return 40;
        if (guests <= 8) return 60;
        if (guests <= 15) return 85;
        return 110;
    }, [groceryDelivery, guests]);

    // Cook time fee (only for "Pick Dishes" mode)
    const cookTimeFee = parseFloat((pricePerHour * estimatedHours).toFixed(1));

    // TOTAL
    const totalEstimate = useMemo(() => {
        if (orderType === "menu" && selectedMenuId) {
            return getMenuPrice() + travelFee + groceryFee;
        }
        return cookTimeFee + travelFee + groceryFee;
    }, [orderType, selectedMenuId, cookTimeFee, travelFee, groceryFee]);

    const handleSubmit = async () => {
        if (!date || !time) return alert("Please select a date and time.");
        if (!isDateAvailable(date)) return alert("The cook is not available on this day of the week.");
        if (locationType === "client_home" && !address) return alert("Please provide your address.");
        if (orderType === "menu" && !selectedMenuId) return alert("Please select a Set Menu.");
        if (orderType === "dishes" && Object.keys(selectedDishes).length === 0) return alert("Please select at least one dish.");

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("cookId", cookId);
        formData.append("date", date);
        formData.append("time", time);
        formData.append("duration", orderType === "dishes" ? estimatedHours.toString() : "0");
        formData.append("guests", guests.toString());
        formData.append("locationType", locationType);
        formData.append("address", address);
        formData.append("orderType", orderType);
        if (selectedMenuId) formData.append("menuId", selectedMenuId);
        formData.append("dishes", JSON.stringify(selectedDishes));
        formData.append("groceryDelivery", groceryDelivery.toString());
        formData.append("notes", notes);
        formData.append("totalPrice", totalEstimate.toString());

        const res = await submitBooking(formData);
        setIsSubmitting(false);

        if (res.error) {
            alert(res.error);
        } else {
            alert("Booking request sent successfully!");
            window.location.href = "/dashboard/family";
        }
    };

    // Complexity label helper
    const getComplexityColor = (c: number) => {
        switch(c) {
            case 1: return "#22c55e";
            case 2: return "#eab308";
            case 3: return "#f97316";
            case 4: return "#ef4444";
            default: return "#eab308";
        }
    };

    return (
        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-light)" }}>
                <span className="heading-font" style={{ fontSize: "36px", fontWeight: 800, color: "var(--text-heading)", lineHeight: 1 }}>{pricePerHour} <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>TND</span></span>
                <span style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>/ hour</span>
            </div>

            {/* Progress Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
                {[1, 2, 3].map(s => (
                    <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: step >= s ? "var(--brand-primary)" : "var(--border-medium)", transition: "all 0.3s" }} />
                ))}
            </div>

            {/* STEP 1: Date & Guests */}
            {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s" }}>
                    <h3 className="heading-font" style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>1. Date & Guests</h3>
                    
                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Select Date</label>
                        <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]} 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} 
                        />
                        {date && !isDateAvailable(date) && (
                            <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "8px" }}>Cook is not available on {getDayOfWeek(date)}s.</p>
                        )}
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                            Available: {availableDays.join(', ') || "No days set"}
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Arrival Time</label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={e => setTime(e.target.value)}
                                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} 
                            />
                        </div>
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>
                                <Users size={16} /> Guests
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid var(--border-medium)", borderRadius: "10px", overflow: "hidden", backgroundColor: "var(--bg-base)" }}>
                                <button 
                                    type="button" 
                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                    style={{ width: "44px", height: "44px", border: "none", backgroundColor: "transparent", cursor: "pointer", color: "var(--text-body)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}
                                >−</button>
                                <div style={{ flex: 1, textAlign: "center", fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>{guests}</div>
                                <button 
                                    type="button" 
                                    onClick={() => setGuests(Math.min(30, guests + 1))}
                                    style={{ width: "44px", height: "44px", border: "none", backgroundColor: "transparent", cursor: "pointer", color: "var(--text-body)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700 }}
                                >+</button>
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", textAlign: "center" }}>
                                {guests <= 4 ? "Small gathering" : guests <= 8 ? "Family dinner" : guests <= 15 ? "Large party" : "Event / Banquet"}
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep(2)} 
                        disabled={!date || !isDateAvailable(date)}
                        className="btn-primary" 
                        style={{ width: "100%", padding: "14px", marginTop: "12px", opacity: (!date || !isDateAvailable(date)) ? 0.5 : 1 }}
                    >
                        Next: Choose Food
                    </button>
                </div>
            )}

            {/* STEP 2: Choose Food */}
            {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s" }}>
                    <h3 className="heading-font" style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>2. Choose Food</h3>
                    
                    <div style={{ display: "flex", backgroundColor: "var(--bg-base)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                        <button onClick={() => { setOrderType("menu"); setSelectedDishes({}); }} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", backgroundColor: orderType === "menu" ? "var(--bg-surface)" : "transparent", color: orderType === "menu" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: 700, boxShadow: orderType === "menu" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}>Set Menus</button>
                        <button onClick={() => { setOrderType("dishes"); setSelectedMenuId(""); }} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", backgroundColor: orderType === "dishes" ? "var(--bg-surface)" : "transparent", color: orderType === "dishes" ? "var(--text-heading)" : "var(--text-muted)", fontWeight: 700, boxShadow: orderType === "dishes" ? "0 2px 8px rgba(0,0,0,0.05)" : "none", cursor: "pointer", transition: "all 0.2s" }}>Pick Dishes</button>
                    </div>

                    {orderType === "menu" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "280px", overflowY: "auto", paddingRight: "8px" }}>
                            {menus.length === 0 ? (
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No set menus available from this cook.</p>
                            ) : menus.map((m: any) => (
                                <div key={m.id} onClick={() => setSelectedMenuId(m.id)} style={{ padding: "16px", borderRadius: "12px", border: `2px solid ${selectedMenuId === m.id ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: "var(--bg-base)", cursor: "pointer", transition: "all 0.2s" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "var(--text-heading)" }}>{m.name}</h4>
                                        <span style={{ fontWeight: 800, color: "var(--brand-primary)", whiteSpace: "nowrap" }}>{m.price} TND</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{m.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {orderType === "dishes" && (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "240px", overflowY: "auto", paddingRight: "8px" }}>
                                {dishes.length === 0 ? (
                                    <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>No dishes available from this cook.</p>
                                ) : dishes.map((d: any) => {
                                    const qty = selectedDishes[d.id] || 0;
                                    const isSelected = qty > 0;
                                    return (
                                    <div key={d.id} style={{ padding: "12px", borderRadius: "14px", border: `1.5px solid ${isSelected ? "var(--brand-primary)" : "var(--border-light)"}`, backgroundColor: isSelected ? "rgba(235, 171, 33, 0.04)" : "var(--bg-base)", transition: "all 0.2s" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <img src={d.image_url || "/hero-tunisian-food.png"} alt={d.name} style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                                    <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>{d.category}</span>
                                                    <span style={{ width: "3px", height: "3px", borderRadius: "50%", backgroundColor: "var(--border-medium)" }} />
                                                    <span style={{ fontSize: "10px", fontWeight: 600, color: getComplexityColor(d.complexity || 2), display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor", flexShrink: 0 }} />
                                                        {COMPLEXITY_TIME[d.complexity || 2]}h
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0", backgroundColor: "var(--bg-surface)", borderRadius: "10px", border: "1px solid var(--border-light)", overflow: "hidden", flexShrink: 0 }}>
                                                <button type="button" onClick={() => handleDishQuantity(d.id, -1)} style={{ width: "32px", height: "32px", border: "none", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: qty > 0 ? "var(--text-heading)" : "var(--border-medium)", transition: "color 0.2s" }}><Minus size={14} strokeWidth={2.5} /></button>
                                                <span style={{ width: "24px", textAlign: "center", fontSize: "14px", fontWeight: 800, color: isSelected ? "var(--brand-primary)" : "var(--text-muted)" }}>{qty}</span>
                                                <button type="button" onClick={() => handleDishQuantity(d.id, 1)} style={{ width: "32px", height: "32px", border: "none", backgroundColor: isSelected ? "var(--brand-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isSelected ? "white" : "var(--text-heading)", borderRadius: "0 9px 9px 0", transition: "all 0.2s" }}><Plus size={14} strokeWidth={2.5} /></button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                            {totalDishCount > 0 && (
                                <div style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(235, 171, 33, 0.08)", border: "1px solid rgba(235, 171, 33, 0.2)", fontSize: "13px", color: "var(--text-body)" }}>
                                    <strong>{totalDishCount} dish{totalDishCount !== 1 ? "es" : ""}</strong> for <strong>{guests} guest{guests !== 1 ? "s" : ""}</strong> → est. <strong>{estimatedHours}h</strong> cook time
                                </div>
                            )}
                        </>
                    )}

                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                        <button onClick={() => setStep(1)} className="btn-nav" style={{ flex: 1, padding: "14px", border: "1px solid var(--border-medium)" }}>Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary" style={{ flex: 2, padding: "14px" }}>Next: Details</button>
                    </div>
                </div>
            )}

            {/* STEP 3: Final Details & Price Breakdown */}
            {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s" }}>
                    <h3 className="heading-font" style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>3. Final Details</h3>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Location</label>
                        <select 
                            value={locationType} 
                            onChange={e => setLocationType(e.target.value as "client_home" | "cook_home")}
                            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", marginBottom: "12px" }} 
                        >
                            <option value="client_home">My Home (Cook comes to me)</option>
                            <option value="cook_home">Pick Up (Cook&apos;s Home)</option>
                        </select>
                        
                        {locationType === "client_home" && (
                            <input 
                                type="text" 
                                placeholder="Enter your full address" 
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} 
                            />
                        )}
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", cursor: "pointer" }}>
                        <input type="checkbox" checked={groceryDelivery} onChange={e => setGroceryDelivery(e.target.checked)} style={{ width: "20px", height: "20px", accentColor: "var(--brand-primary)" }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "14px" }}>Add Grocery Shopping</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Cook buys all ingredients ({guests <= 4 ? "40" : guests <= 8 ? "60" : guests <= 15 ? "85" : "110"} TND for {guests} guests)
                            </div>
                        </div>
                    </label>

                    <div>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>Custom Requests / Dietary Notes</label>
                        <textarea 
                            rows={3} 
                            placeholder="e.g. Please make the couscous extra spicy, no nuts..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} 
                        />
                    </div>

                    {/* --- PRICE BREAKDOWN --- */}
                    <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "var(--bg-subtle)", marginTop: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price Breakdown</div>

                        {orderType === "menu" && selectedMenuId ? (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Utensils size={14} /> {menus.find(m => m.id === selectedMenuId)?.name || "Set Menu"}
                                </span>
                                <span style={{ fontWeight: 600 }}>{getMenuPrice()} TND</span>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "14px" }}>
                                    <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Clock size={14} /> Cook Service ({estimatedHours}h × {pricePerHour} TND)
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{cookTimeFee} TND</span>
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", paddingLeft: "20px" }}>
                                    {totalDishCount} dish{totalDishCount !== 1 ? "es" : ""} ({dishPrepTime.toFixed(1)}h prep) + {guests} guest{guests !== 1 ? "s" : ""} ({guestTime.toFixed(1)}h)
                                </div>
                            </>
                        )}

                        {travelFee > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <MapPin size={14} /> Travel Fee
                                </span>
                                <span style={{ fontWeight: 600 }}>{travelFee} TND</span>
                            </div>
                        )}

                        {groceryFee > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <ShoppingBag size={14} /> Grocery Shopping ({guests} guests)
                                </span>
                                <span style={{ fontWeight: 600 }}>{groceryFee} TND</span>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border-medium)", fontSize: "18px", marginTop: "4px" }}>
                            <span style={{ fontWeight: 800 }}>Total</span>
                            <span style={{ fontWeight: 800, color: "var(--brand-primary)" }}>{totalEstimate} TND</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                        <button onClick={() => setStep(2)} className="btn-nav" style={{ flex: 1, padding: "14px", border: "1px solid var(--border-medium)" }}>Back</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary" style={{ flex: 2, padding: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                            {isSubmitting ? "Sending..." : `Book · ${totalEstimate} TND`}
                        </button>
                    </div>
                </div>
            )}
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
