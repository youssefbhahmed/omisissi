import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChefHat, ShoppingBag, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function CookDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: cookDetails } = await supabase.from('cook_details').select('*').eq('id', user.id).single();

    // If a family accidentally navigates here, send them to their dashboard
    if (profile?.role === 'family') {
        redirect("/dashboard");
    }

    // Check if they need to complete their profile setup
    const isProfileIncomplete = !cookDetails || !cookDetails.bio || !cookDetails.price_per_session;

    // Real earnings and booking stats
    const { data: myBookings } = await supabase
        .from('bookings')
        .select('status, total_price, scheduled_date')
        .eq('cook_id', user.id);

    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const completed = (myBookings ?? []).filter((b) => b.status === 'completed');
    const weeklyEarnings = completed
        .filter((b) => b.scheduled_date >= weekAgo)
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    const totalEarnings = completed.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    const activeCount = (myBookings ?? []).filter((b) => b.status === 'accepted' || b.status === 'in_progress').length;
    const pendingCount = (myBookings ?? []).filter((b) => b.status === 'pending').length;

    return (
        <div>
            <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Chef'}! 🍳
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Manage your cooking business.</p>
                </div>
            </div>

            {isProfileIncomplete && (
                <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)", marginBottom: "32px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ color: "#d97706", marginTop: "4px" }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="heading-font" style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, color: "#92400e" }}>Complete Your Cook Profile</h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "#b45309" }}>Families cannot book you until you set your bio, specialties, and hourly rate.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/cook/profile" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", backgroundColor: "#f59e0b", color: "white" }}>
                        Setup Profile
                    </Link>
                </div>
            )}

            <div style={{ gap: "32px" }} className="grid grid-cols-1 md:grid-cols-[1fr_3fr]">
                {/* Quick Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Earnings This Week</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>{weeklyEarnings} <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>TND</span></h3>
                        {totalEarnings > weeklyEarnings && (
                            <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>{totalEarnings} TND earned in total</p>
                        )}
                    </div>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Confirmed Bookings</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>{activeCount}</h3>
                    </div>
                    <div className="card" style={{ padding: "24px", backgroundColor: pendingCount > 0 ? "rgba(255,184,0,0.08)" : "var(--bg-surface)", border: pendingCount > 0 ? "1px solid rgba(255,184,0,0.4)" : "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Pending Requests</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: pendingCount > 0 ? "var(--brand-primary)" : "var(--text-heading)" }}>{pendingCount}</h3>
                    </div>
                </div>

                {/* Orders Area */}
                {pendingCount > 0 ? (
                    <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "2px solid rgba(255,184,0,0.35)", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,184,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
                            {pendingCount} request{pendingCount > 1 ? "s" : ""} waiting for your answer
                        </h3>
                        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                            Families are waiting — accept or decline before the requested date gets too close.
                        </p>
                        <Link href="/dashboard/cook/bookings" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Review Requests <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,184,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>No pending requests</h3>
                        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                            {isProfileIncomplete ? 'Complete your profile to start receiving booking requests from nearby families.' : 'You have no pending cooking requests right now. New requests will appear here and in your Bookings tab.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
