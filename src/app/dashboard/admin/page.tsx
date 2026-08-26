import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Clock, ExternalLink, MapPin } from "lucide-react";
import { normalizeStringArray, type CookDetails, type Profile } from "@/lib/types";
import ApprovalToggle from "./ApprovalToggle";

type AdminCookRow = {
    id: string;
    name: string;
    avatar: string | null;
    city: string;
    specialties: string[];
    bio: string;
    hasRate: boolean;
    isApproved: boolean;
};

function CookRow({ cook }: { cook: AdminCookRow }) {
    return (
        <div className="card" style={{ padding: "20px 24px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <img
                src={cook.avatar || "/cook-tunisian.png"}
                alt={cook.name}
                style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border-light)" }}
            />
            <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-heading)" }}>{cook.name}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={12} /> {cook.city}
                    </span>
                    {!cook.hasRate && (
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", backgroundColor: "rgba(255,184,0,0.12)", padding: "2px 8px", borderRadius: "99px" }}>profile incomplete</span>
                    )}
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {cook.specialties.length > 0 ? cook.specialties.join(" · ") : cook.bio || "No bio yet."}
                </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link href={`/cooks/${cook.id}`} className="btn-nav" style={{ padding: "10px 14px", border: "1px solid var(--border-light)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                    <ExternalLink size={14} /> View profile
                </Link>
                <ApprovalToggle cookId={cook.id} isApproved={cook.isApproved} />
            </div>
        </div>
    );
}

// Platform-owner page: approve new cooks before they appear in the public
// directory. Access is limited to profiles with is_admin (granted via SQL —
// see supabase/setup_cook_approval.sql). The database enforces the same rule
// again inside the set_cook_approval RPC.
export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: me } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();

    if (!me || (me as Profile).is_admin !== true) {
        redirect((me as Profile | null)?.role === 'cook' ? "/dashboard/cook" : "/dashboard");
    }

    const { data: cookProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'cook');

    const { data: cookDetails } = await supabase
        .from('cook_details')
        .select('*');

    const details = (cookDetails ?? []) as CookDetails[];
    const migrationApplied = details.length === 0 || details.some((d) => 'is_approved' in d);

    const rows: AdminCookRow[] = (cookProfiles ?? []).flatMap((p) => {
        const d = details.find((x) => x.id === p.id);
        if (!d) return [];
        return [{
            id: p.id,
            name: p.full_name || "Cook",
            avatar: p.avatar_url,
            city: d.city || "Tunisia",
            specialties: normalizeStringArray(d.specialties),
            bio: d.bio || "",
            hasRate: !!d.price_per_session,
            isApproved: d.is_approved !== false,
        }];
    });

    const pending = rows.filter((r) => !r.isApproved);
    const approved = rows.filter((r) => r.isApproved);

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <ShieldCheck size={30} color="var(--brand-primary)" /> Cook Approvals
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>
                    New cooks stay hidden from the directory until you approve them here.
                </p>
            </div>

            {!migrationApplied && (
                <div className="card" style={{ padding: "20px 24px", marginBottom: "24px", backgroundColor: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)" }}>
                    <p style={{ margin: 0, fontSize: "14px", color: "#b45309", fontWeight: 600 }}>
                        The approval system is not active yet — run <code>supabase/setup_cook_approval.sql</code> in the Supabase SQL editor. Until then, every cook is publicly visible.
                    </p>
                </div>
            )}

            <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={18} color="#d97706" /> Pending approval ({pending.length})
            </h2>
            {pending.length === 0 ? (
                <div className="card" style={{ padding: "32px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)", marginBottom: "40px" }}>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>No cooks waiting for approval. 🎉</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
                    {pending.map((cook) => <CookRow key={cook.id} cook={cook} />)}
                </div>
            )}

            <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={18} color="var(--brand-success)" /> Approved ({approved.length})
            </h2>
            {approved.length === 0 ? (
                <div className="card" style={{ padding: "32px 24px", textAlign: "center", backgroundColor: "var(--bg-surface)", border: "1px dashed var(--border-medium)" }}>
                    <p style={{ color: "var(--text-muted)", margin: 0 }}>No approved cooks yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {approved.map((cook) => <CookRow key={cook.id} cook={cook} />)}
                </div>
            )}
        </div>
    );
}
