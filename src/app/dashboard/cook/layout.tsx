import React from "react";
import Link from "next/link";
import { ChefHat, Library, Utensils, Settings, LogOut, Clock, Search } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { NavLink } from "@/components/ui/NavLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function CookDashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)", display: "flex", flexDirection: "column" }}>
            {/* ─── DASHBOARD NAV ─── */}
            <header style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-light)", position: "sticky", top: 0, zIndex: 40 }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    <Link href="/dashboard/cook" style={{ display: "flex", gap: "10px", alignItems: "center", textDecoration: "none" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ChefHat color="#121212" size={20} />
                        </div>
                        <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-heading)", whiteSpace: "nowrap" }}>foodie <span className="hidden sm:inline" style={{ color: "var(--brand-primary)", fontSize: "14px" }}>Cuisine</span></span>
                    </Link>

                    <nav style={{ display: "flex", gap: "clamp(12px, 2.5vw, 20px)", height: "100%" }}>
                        <NavLink href="/dashboard/cook/dishes">
                            <Utensils size={18} /> <span className="hidden md:inline">Mes plats</span>
                        </NavLink>
                        <NavLink href="/dashboard/cook/menus">
                            <Library size={18} /> <span className="hidden md:inline">Mes menus</span>
                        </NavLink>
                        <NavLink href="/dashboard/cook/bookings">
                            <Clock size={18} /> <span className="hidden md:inline">Réservations</span>
                        </NavLink>
                        <NavLink href="/dashboard/cook/profile">
                            <Settings size={18} /> <span className="hidden md:inline">Profil cuisinier</span>
                        </NavLink>
                        {/* Cooks are clients too: they can browse and book other cooks */}
                        <NavLink href="/cooks">
                            <Search size={18} /> <span className="hidden md:inline">Trouver un cuisinier</span>
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

            {/* ─── MAIN CONTENT ─── */}
            <main style={{ flex: 1, padding: "40px 24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
