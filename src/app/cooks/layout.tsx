import React from "react";
import BrandMark from "@/components/BrandMark";
import Link from "next/link";
import { Calendar, LayoutDashboard, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Public shell: the cook directory is browsable without an account —
// visitors only need to log in when they actually book.
export default async function CooksLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let role: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
        role = profile?.role ?? null;
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)", display: "flex", flexDirection: "column" }}>
            <header style={{ backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border-light)", position: "sticky", top: 0, zIndex: 40 }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", gap: "10px", alignItems: "center", textDecoration: "none" }}>
                        <BrandMark size={44} />
                    </Link>

                    <nav style={{ gap: "28px", fontSize: "14px" }} className="hidden md:flex">
                        <Link href="/" className="nav-link">Accueil</Link>
                        <Link href="/cooks" className="nav-link" style={{ color: "var(--brand-primary)" }}>Trouver un cuisinier</Link>
                        <Link href="/#how-it-works" className="nav-link">Comment ça marche</Link>
                        <Link href="/signup" className="nav-link">Devenir cuisinière</Link>
                    </nav>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ThemeToggle />
                        {user ? (
                            <>
                                <Link href="/dashboard/family" className="btn-nav" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                                    <Calendar size={18} /> <span className="hidden md:inline">Mes réservations</span>
                                </Link>
                                <Link href={role === "cook" ? "/dashboard/cook" : "/dashboard"} className="btn-primary" style={{ padding: "10px 18px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <LayoutDashboard size={18} /> <span className="hidden md:inline">Mon espace</span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-nav" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", textDecoration: "none", fontWeight: 600 }}>
                                    <LogIn size={18} /> Se connecter
                                </Link>
                                <Link href="/signup" className="btn-primary" style={{ padding: "10px 18px", textDecoration: "none" }}>
                                    S’inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, padding: "40px 24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
