import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShoppingBag, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

// Outside the component: the react-hooks purity rule forbids Date.now()
// directly in render.
function isoDaysAgo(days: number): string {
    return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
}

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

    // Only an explicit false counts — the column arrives with the
    // cook-approval migration.
    const awaitingApproval = cookDetails?.is_approved === false;

    // Real earnings and booking stats
    const { data: myBookings } = await supabase
        .from('bookings')
        .select('status, total_price, scheduled_date')
        .eq('cook_id', user.id);

    const weekAgo = isoDaysAgo(7);
    const completed = (myBookings ?? []).filter((b) => b.status === 'completed');
    const weeklyEarnings = completed
        .filter((b) => b.scheduled_date >= weekAgo)
        .reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    const totalEarnings = completed.reduce((sum, b) => sum + Number(b.total_price || 0), 0);
    const activeCount = (myBookings ?? []).filter((b) => b.status === 'accepted' || b.status === 'in_progress').length;
    const pendingCount = (myBookings ?? []).filter((b) => b.status === 'pending').length;

    return (
        <div>
            {profile?.is_admin === true && (
                <Link href="/dashboard/admin" className="card" style={{ padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-medium)", textDecoration: "none", color: "var(--text-heading)", fontWeight: 700 }}>
                    <ShieldAlert size={20} color="var(--brand-primary)" /> Admin — Approbation des cuisiniers <ArrowRight size={16} style={{ marginLeft: "auto" }} />
                </Link>
            )}
            <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                        Bon retour, {profile?.full_name?.split(' ')[0] || 'Chef'} ! 🍳
                    </h1>
                    <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Gérez votre activité de cuisine.</p>
                </div>
            </div>

            {awaitingApproval && (
                <div className="card" style={{ padding: "24px", display: "flex", gap: "16px", alignItems: "flex-start", backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)", marginBottom: "32px" }}>
                    <div style={{ color: "#2563eb", marginTop: "4px" }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h3 className="heading-font" style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, color: "#1d4ed8" }}>Votre profil est en attente d’approbation</h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "#1e40af" }}>
                            L’équipe Ommi Sissi examine chaque nouveau cuisinier avant qu’il n’apparaisse dans l’annuaire. D’ici là, les familles ne peuvent ni vous trouver ni vous réserver — profitez-en pour peaufiner votre <Link href={`/cooks/${user.id}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>profil public</Link>, vos plats et vos menus.
                        </p>
                    </div>
                </div>
            )}

            {isProfileIncomplete && (
                <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(198, 70, 43,0.1)", border: "1px solid rgba(198, 70, 43,0.3)", marginBottom: "32px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ color: "#d97706", marginTop: "4px" }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="heading-font" style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 700, color: "#92400e" }}>Complétez votre profil cuisinier</h3>
                            <p style={{ margin: 0, fontSize: "14px", color: "#b45309" }}>Les familles ne peuvent pas vous réserver tant que vous n’avez pas renseigné votre bio, vos spécialités et votre tarif horaire.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/cook/profile" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", backgroundColor: "#f59e0b", color: "white" }}>
                        Configurer le profil
                    </Link>
                </div>
            )}

            <div style={{ gap: "32px" }} className="grid grid-cols-1 md:grid-cols-[1fr_3fr]">
                {/* Quick Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Revenus cette semaine</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>{weeklyEarnings} <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>TND</span></h3>
                        {totalEarnings > weeklyEarnings && (
                            <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>{totalEarnings} TND gagnés au total</p>
                        )}
                    </div>
                    <div className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Réservations confirmées</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--text-heading)" }}>{activeCount}</h3>
                    </div>
                    <div className="card" style={{ padding: "24px", backgroundColor: pendingCount > 0 ? "rgba(198, 70, 43,0.08)" : "var(--bg-surface)", border: pendingCount > 0 ? "1px solid rgba(198, 70, 43,0.4)" : "1px solid var(--border-light)" }}>
                        <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>Demandes en attente</p>
                        <h3 className="heading-font" style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: pendingCount > 0 ? "var(--brand-primary)" : "var(--text-heading)" }}>{pendingCount}</h3>
                    </div>
                </div>

                {/* Orders Area */}
                {pendingCount > 0 ? (
                    <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "2px solid rgba(198, 70, 43,0.35)", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(198, 70, 43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
                            {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente de votre réponse
                        </h3>
                        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                            Des familles attendent — acceptez ou refusez avant que la date demandée ne soit trop proche.
                        </p>
                        <Link href="/dashboard/cook/bookings" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            Examiner les demandes <ArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="card" style={{ padding: "40px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(198, 70, 43,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 20px auto" }}>
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>Aucune demande en attente</h3>
                        <p style={{ color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                            {isProfileIncomplete ? 'Complétez votre profil pour commencer à recevoir des demandes de réservation des familles à proximité.' : 'Vous n’avez aucune demande de cuisine en attente pour le moment. Les nouvelles demandes apparaîtront ici et dans votre onglet Réservations.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
