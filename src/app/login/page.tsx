"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChefHat, ArrowRight } from "lucide-react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await login(formData);
        if (res?.error) {
            setError(res.error);
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "var(--bg-base)" }}>
            {/* Left Panel - Image */}
            <div style={{ flex: 1, position: "relative" }} className="hidden md:block">
                <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/hero-feast.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.9)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0) 0%, var(--bg-base) 100%)" }} />
            </div>

            {/* Right Panel - Form */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                <div style={{ maxWidth: "400px", width: "100%" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "40px", justifyContent: "center" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ChefHat color="#121212" size={24} />
                        </div>
                        <span className="heading-font" style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-heading)" }}>foodie</span>
                    </div>

                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", marginBottom: "8px", color: "var(--text-heading)" }}>Welcome back</h1>
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "40px" }}>Log in to manage your dinners and bookings.</p>

                    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {error && (
                            <div style={{ padding: "12px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Email</label>
                            <input name="email" type="email" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="hello@example.com" />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Password</label>
                            <input name="password" type="password" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "16px", fontSize: "16px", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Logging in..." : "Log In"} <ArrowRight size={18} />
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "var(--text-muted)" }}>
                        Need an account? <Link href="/signup" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
