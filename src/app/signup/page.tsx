"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChefHat, ArrowRight, User, Utensils } from "lucide-react";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
    const [roleType, setRoleType] = useState<"family" | "cook">("family");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append("roleType", roleType);
        const res = await signup(formData);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-base)" }}>
            {/* Left Panel - Image */}
            <div style={{ flex: 1, position: "relative", display: "none" }} className="md:block">
                <img
                    src={roleType === "family" ? "/family-tunisian.png" : "/cook-tunisian.png"}
                    alt="Signup background"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "all 0.5s ease" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0) 0%, var(--bg-base) 100%)" }} />
            </div>

            {/* Right Panel - Form */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                <div style={{ maxWidth: "420px", width: "100%" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "32px", justifyContent: "center" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ChefHat color="#121212" size={24} />
                        </div>
                        <span className="heading-font" style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-heading)" }}>foodie</span>
                    </div>

                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", marginBottom: "8px", color: "var(--text-heading)" }}>Join the food revolution</h1>
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "32px" }}>Create your account to get started.</p>

                    <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
                        <button
                            onClick={() => setRoleType("family")}
                            style={{
                                flex: 1, padding: "16px", borderRadius: "16px",
                                border: roleType === "family" ? "2px solid var(--brand-primary)" : "2px solid var(--border-light)",
                                backgroundColor: roleType === "family" ? "rgba(255,184,0,0.05)" : "var(--bg-surface)",
                                cursor: "pointer", transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
                            }}
                        >
                            <User size={24} color={roleType === "family" ? "var(--brand-primary)" : "var(--text-muted)"} />
                            <span style={{ fontWeight: 700, color: roleType === "family" ? "var(--brand-primary)" : "var(--text-muted)" }}>I'm a Family</span>
                        </button>
                        <button
                            onClick={() => setRoleType("cook")}
                            style={{
                                flex: 1, padding: "16px", borderRadius: "16px",
                                border: roleType === "cook" ? "2px solid var(--brand-primary)" : "2px solid var(--border-light)",
                                backgroundColor: roleType === "cook" ? "rgba(255,184,0,0.05)" : "var(--bg-surface)",
                                cursor: "pointer", transition: "all 0.2s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
                            }}
                        >
                            <Utensils size={24} color={roleType === "cook" ? "var(--brand-primary)" : "var(--text-muted)"} />
                            <span style={{ fontWeight: 700, color: roleType === "cook" ? "var(--brand-primary)" : "var(--text-muted)" }}>I want to cook</span>
                        </button>
                    </div>

                    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {error && (
                            <div style={{ padding: "12px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Full Name</label>
                            <input name="fullName" type="text" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="Fatma Ben Ali" />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Email</label>
                            <input name="email" type="email" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="hello@example.com" />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Password</label>
                            <input name="password" type="password" required minLength={6} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "12px", fontSize: "16px", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Creating account..." : "Sign Up"} <ArrowRight size={18} />
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
                        Already have an account? <Link href="/login" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
