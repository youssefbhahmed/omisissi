import React from "react";
import BrandMark from "@/components/BrandMark";

export const metadata = { title: "Hors ligne — Ommi Sissi" };

export default function OfflinePage() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-base)", padding: "24px" }}>
            <div style={{ textAlign: "center", maxWidth: "360px" }}>
                <BrandMark size={64} style={{ margin: "0 auto 24px auto" }} />
                <h1 className="heading-font" style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 12px 0" }}>
                    Vous êtes hors ligne
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                    Ommi Sissi a besoin d’une connexion internet pour charger les cuisiniers et les réservations.
                    Vérifiez votre connexion et réessayez.
                </p>
                <a href="/dashboard" className="btn-primary" style={{ display: "inline-flex", padding: "12px 28px", textDecoration: "none" }}>
                    Réessayer
                </a>
            </div>
        </div>
    );
}
