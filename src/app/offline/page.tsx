import React from "react";
import { ChefHat } from "lucide-react";

export const metadata = { title: "Offline — Foodie" };

export default function OfflinePage() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-base)", padding: "24px" }}>
            <div style={{ textAlign: "center", maxWidth: "360px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
                    <ChefHat color="#121212" size={36} />
                </div>
                <h1 className="heading-font" style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 12px 0" }}>
                    You&apos;re offline
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                    Foodie needs an internet connection to load cooks and bookings.
                    Check your connection and try again.
                </p>
                <a href="/dashboard" className="btn-primary" style={{ display: "inline-flex", padding: "12px 28px", textDecoration: "none" }}>
                    Retry
                </a>
            </div>
        </div>
    );
}
