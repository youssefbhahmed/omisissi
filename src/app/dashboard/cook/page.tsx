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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "32px" }} className="md:grid-cols-1">
                {/* Quick Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Weekly Earnings</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>0 <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>TND</span></h3>
                    </div>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Active Bookings</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>0</h3>
                    </div>
                </div>

                {/* Orders Area */}
                <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,184,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                        <ShoppingBag size={32} />
                    </div>
                    <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>No orders yet</h3>
                    <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                        {isProfileIncomplete ? 'Complete your profile to start receiving booking requests from nearby families.' : 'You have no active or pending cooking requests right now. We will notify you when a family requests your services.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
