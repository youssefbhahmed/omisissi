import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle, XCircle, MapPin, ChefHat, Calendar } from "lucide-react";

export default async function FamilyBookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user's profile to verify they are a family account
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== "family") {
        redirect("/dashboard/profile");
    }

    // Fetch all bookings for this family
    const { data: rawBookings } = await supabase
        .from('bookings')
        .select(`
            *,
            cook_profile:profiles!bookings_cook_id_fkey(full_name, avatar_url),
            menu:menus(name),
            dishes:booking_dishes(
                quantity,
                dish:dishes(name)
            )
        `)
        .eq('family_id', user.id)
        .order('created_at', { ascending: false });

    const bookings = rawBookings || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return { bg: "rgba(235, 171, 33, 0.1)", color: "var(--brand-primary)" };
            case "accepted": return { bg: "rgba(34, 197, 94, 0.1)", color: "var(--brand-success)" };
            case "declined": case "cancelled": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" };
            case "completed": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
            default: return { bg: "var(--bg-subtle)", color: "var(--text-muted)" };
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case "pending": return <Clock size={16} />;
            case "accepted": case "completed": return <CheckCircle size={16} />;
            case "declined": case "cancelled": return <XCircle size={16} />;
            default: return null;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                    My Bookings
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>
                    Track your upcoming meals and past requests.
                </p>
            </div>

            {bookings.length === 0 ? (
                <div className="card" style={{ padding: "60px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", color: "var(--text-muted)" }}>
                        <Calendar size={32} />
                    </div>
                    <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 12px 0", color: "var(--text-heading)" }}>No bookings yet</h3>
                    <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" }}>
                        You haven't requested any home-cooked meals yet. Head over to the discover page to find a cook near you.
                    </p>
                    <a href="/dashboard/discover" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>Discover Cooks</a>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {bookings.map((booking: any) => {
                        const sColor = getStatusColor(booking.status);
                        const cookName = booking.cook_profile?.full_name || "Unknown Cook";
                        const cookAvatar = booking.cook_profile?.avatar_url || "/hero-tunisian-food-1.png";
                        
                        return (
                            <div key={booking.id} className="card" style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid var(--border-light)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden" }}>
                                            <img src={cookAvatar} alt={cookName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "18px", color: "var(--text-heading)" }}>{cookName}</h3>
                                            <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Calendar size={14} /> 
                                                {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time} ({booking.duration_hours}h)
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: sColor.bg, color: sColor.color, 
                                        padding: "6px 12px", borderRadius: "99px", 
                                        fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                                        display: "flex", alignItems: "center", gap: "6px"
                                    }}>
                                        <StatusIcon status={booking.status} /> {booking.status}
                                    </div>
                                </div>
                                
                                <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", backgroundColor: "var(--bg-base)" }} className="md:grid-cols-1">
                                    <div>
                                        <h4 style={{ fontSize: "13px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px 0", letterSpacing: "0.5px" }}>Order Details</h4>
                                        <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-surface)" }}>
                                            {booking.menu ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                                                    <ChefHat size={16} color="var(--brand-primary)" /> Set Menu: {booking.menu.name}
                                                </div>
                                            ) : booking.dishes && booking.dishes.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-body)", fontSize: "14px" }}>
                                                    {booking.dishes.map((d: any, i: number) => (
                                                        <li key={i}>{d.quantity}x {d.dish?.name || "Dish"}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No specific dishes selected</span>
                                            )}
                                        </div>

                                        {booking.grocery_delivery && (
                                            <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-body)", display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ backgroundColor: "var(--brand-primary)", color: "white", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>EXTRA</span>
                                                Grocery Shopping Included
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: "13px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", margin: "0 0 12px 0", letterSpacing: "0.5px" }}>Location & Price</h4>
                                        <div style={{ marginBottom: "16px", fontSize: "14px", color: "var(--text-body)", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                            <MapPin size={16} color="var(--text-muted)" style={{ marginTop: "2px" }} />
                                            <div>
                                                <strong>{booking.location === "client_home" ? "My Home" : "Cook's Home (Pickup)"}</strong>
                                                {booking.address && <div style={{ color: "var(--text-muted)", marginTop: "4px" }}>{booking.address}</div>}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-heading)" }}>
                                            {booking.total_price} <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>TND total</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
