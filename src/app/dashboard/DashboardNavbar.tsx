"use client";

import React from "react";
import BrandMark from "@/components/BrandMark";
import Link from "next/link";
import { Search, Calendar, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/ui/NavLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/app/actions/auth";

export default function DashboardNavbar() {
    const pathname = usePathname();

    // Hide this navbar if we are in the cook dashboard (which has its own navbar)
    if (pathname.startsWith("/dashboard/cook")) {
        return null;
    }

    return (
        <header style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-light)", position: "sticky", top: 0, zIndex: 40 }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Link href="/dashboard" style={{ display: "flex", gap: "10px", alignItems: "center", textDecoration: "none" }}>
                    <BrandMark size={36} />
                    <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-heading)" }}>Ommi Sissi</span>
                </Link>

                <nav style={{ display: "flex", gap: "24px", height: "100%" }}>
                    <NavLink href="/cooks">
                        <Search size={18} /> <span className="hidden md:inline">Découvrir les cuisiniers</span>
                    </NavLink>
                    <NavLink href="/dashboard/family">
                        <Calendar size={18} /> <span className="hidden md:inline">Mes réservations</span>
                    </NavLink>
                    <NavLink href="/dashboard/profile">
                        <User size={18} /> <span className="hidden md:inline">Profil</span>
                    </NavLink>
                </nav>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <ThemeToggle />
                    <form action={logout}>
                        <button type="submit" className="btn-nav" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                            <LogOut size={18} /> <span className="hidden md:inline">Se déconnecter</span>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
