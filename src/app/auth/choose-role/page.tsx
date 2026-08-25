import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChefHat, User, Utensils } from "lucide-react";
import { chooseSignupRole } from "@/app/actions/auth";

// Shown once to accounts freshly created through Google/Facebook from the
// login page, where no role was picked. The window is enforced server-side
// (set_signup_role allows changes only within 15 minutes of signup).
export default async function ChooseRolePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, created_at, full_name')
        .eq('id', user.id)
        .single();

    // Established accounts have nothing to choose — send them home
    if (!profile || profile.role === 'cook' || Date.now() - Date.parse(profile.created_at) > 15 * 60_000) {
        redirect(profile?.role === 'cook' ? "/dashboard/cook" : "/dashboard");
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-base)", padding: "24px" }}>
            <div style={{ maxWidth: "440px", width: "100%", textAlign: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px", justifyContent: "center" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ChefHat color="#121212" size={24} />
                    </div>
                    <span className="heading-font" style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-heading)" }}>foodie</span>
                </div>

                <h1 className="heading-font" style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px", color: "var(--text-heading)" }}>
                    Welcome{profile.full_name ? `, ${profile.full_name.split(' ')[0]}` : ""}!
                </h1>
                <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                    One last thing — how will you use Foodie?
                </p>

                <form action={chooseSignupRole} style={{ display: "flex", gap: "16px" }}>
                    <button
                        type="submit"
                        name="role"
                        value="family"
                        style={{ flex: 1, padding: "28px 16px", borderRadius: "16px", border: "2px solid var(--border-light)", backgroundColor: "var(--bg-surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "all 0.2s ease" }}
                    >
                        <User size={28} color="var(--brand-primary)" />
                        <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>I&apos;m a Family</span>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Book home cooks near me</span>
                    </button>
                    <button
                        type="submit"
                        name="role"
                        value="cook"
                        style={{ flex: 1, padding: "28px 16px", borderRadius: "16px", border: "2px solid var(--border-light)", backgroundColor: "var(--bg-surface)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", transition: "all 0.2s ease" }}
                    >
                        <Utensils size={28} color="var(--brand-primary)" />
                        <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>I want to cook</span>
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Earn by cooking for families</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
