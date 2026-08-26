import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar, ArrowRight, Search, ShieldCheck } from "lucide-react";
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
            {profile?.is_admin === true && (
                <Link href="/dashboard/admin" className="card" style={{ padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-medium)", textDecoration: "none", color: "var(--text-heading)", fontWeight: 700 }}>
                    <ShieldCheck size={20} color="var(--brand-primary)" /> Admin — Approbation des cuisiniers <ArrowRight size={16} style={{ marginLeft: "auto" }} />
                </Link>
            )}
            <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Bon retour, {profile?.full_name?.split(' ')[0] || 'Famille'} ! 👋
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Voici ce qui mijote cette semaine.</p>
                </div>
                <Link href="/cooks" className="btn-primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
                    <Search size={18} /> Trouver un cuisinier
                </Link>
            </div>

            <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,184,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                    <Calendar size={32} />
                </div>
                <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>Aucune réservation à venir</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                    Vous n’avez pas encore de repas planifiés. Parcourez nos cuisiniers à domicile vérifiés et réservez votre premier dîner !
                </p>
                <Link href="/cooks" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none", display: "inline-flex" }}>
                    Parcourir les cuisiniers près de chez vous <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}

