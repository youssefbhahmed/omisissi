import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export default async function FamilyDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    // If a cook accidentally navigates here, send them to their dashboard
    if (profile?.role === 'cook') {
        redirect("/dashboard/cook");
    }

    return (
        <div>
            <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Family'}! 👋
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Here&apos;s what&apos;s cooking this week.</p>
                </div>
                <Link href="/dashboard/discover" className="btn-primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
                    <Search size={18} /> Find a Cook
                </Link>
            </div>

            <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,184,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                    <Calendar size={32} />
                </div>
                <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>No upcoming bookings</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                    You don&apos;t have any meals scheduled yet. Browse our verified home cooks and book your first dinner!
                </p>
                <Link href="/dashboard/discover" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none", display: "inline-flex" }}>
                    Browse Cooks Near You <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

