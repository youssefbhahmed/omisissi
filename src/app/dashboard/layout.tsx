import React from "react";
import DashboardNavbar from "./DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)", display: "flex", flexDirection: "column" }}>
            <DashboardNavbar />

            {/* ─── MAIN CONTENT ─── */}
            <main style={{ flex: 1, padding: "40px 24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
