import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";
import { updatePassword, updateFamilyProfile } from "@/app/actions/auth";
import RegionPicker from "@/components/RegionPicker";

export default async function FamilyProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "40px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                    Family Profile Settings
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>Update your home address so cooks know where to come.</p>
            </div>

            <div style={{ display: "flex", gap: "32px" }}>
                {/* Sidebar Nav */}
                <div style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }} className="hidden md:flex">
                    <a href="#personal-info" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-medium)", color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>
                        <User size={18} /> Personal Info
                    </a>
                    <a href="#security" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", backgroundColor: "transparent", border: "1px solid transparent", color: "var(--text-muted)", fontWeight: 600, textDecoration: "none" }}>
                        <ShieldCheck size={18} /> Security
                    </a>
                </div>

                {/* Main Form Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div id="personal-info" className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", scrollMarginTop: "90px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 24px 0", color: "var(--text-heading)" }}>Personal Information</h2>

                        <form action={async (formData) => {
                            "use server";
                            await updateFamilyProfile(formData);
                        }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
                                <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--bg-base)", border: "2px dashed var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", overflow: "hidden" }}>
                                    {profile?.avatar_url ? <img src={profile.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} />}
                                </div>
                                <button type="button" className="btn-nav" style={{ padding: "8px 16px", fontSize: "14px" }}>Upload Photo</button>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Full Name</label>
                                    <input name="fullName" type="text" defaultValue={profile?.full_name} placeholder="e.g. Fatma Ben Ali" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Email Address</label>
                                    <input type="email" defaultValue={user.email} disabled style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)", cursor: "not-allowed" }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Your Home Region</label>
                                <RegionPicker defaultValue={profile?.address} />
                            </div>

                            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                                <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>Save Changes</button>
                            </div>
                        </form>
                    </div>

                    <div id="security" className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", scrollMarginTop: "90px" }}>
                        <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 24px 0", color: "var(--text-heading)" }}>Security & Password</h2>

                        <form action={async (formData) => {
                            "use server";
                            await updatePassword(formData);
                        }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <div style={{ maxWidth: "400px" }}>
                                <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>New Password</label>
                                <input name="newPassword" type="password" required minLength={6} placeholder="Enter a new password" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Must be at least 6 characters long.</p>
                            </div>

                            <div style={{ marginTop: "8px" }}>
                                <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
