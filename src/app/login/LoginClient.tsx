"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { login } from "@/app/actions/auth";
import OAuthButtons from "@/components/OAuthButtons";

export default function LoginClient({ initialError, next }: { initialError: string | null; next?: string | null }) {
    const [error, setError] = useState<string | null>(initialError);
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
                        <img src="/brand/ommi-sissi-icon.svg" alt="Ommi Sissi" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                        <span className="heading-font" style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-heading)" }}>Ommi Sissi</span>
                    </div>

                    <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, textAlign: "center", marginBottom: "8px", color: "var(--text-heading)" }}>Bon retour</h1>
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "40px" }}>Connectez-vous pour gérer vos dîners et vos réservations.</p>

                    <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {next && <input type="hidden" name="next" value={next} />}
                        {error && (
                            <div style={{ padding: "12px", backgroundColor: "rgba(220, 38, 38, 0.1)", color: "#dc2626", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                                {error}
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>E-mail</label>
                            <input name="email" type="email" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="hello@example.com" />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>Mot de passe</label>
                            <input name="password" type="password" required style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)" }} placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", padding: "16px", marginTop: "16px", fontSize: "16px", opacity: loading ? 0.7 : 1 }}>
                            {loading ? "Connexion…" : "Se connecter"} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: "20px" }}>
                        <OAuthButtons next={next} />
                    </div>

                    <p style={{ textAlign: "center", marginTop: "32px", fontSize: "14px", color: "var(--text-muted)" }}>
                        Besoin d’un compte ? <Link href="/signup" style={{ color: "var(--brand-primary)", fontWeight: 700, textDecoration: "none" }}>S’inscrire</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
