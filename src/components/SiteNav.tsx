"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ArrowRight, Calendar, Menu, X } from "lucide-react";

// Restaurant-style site navigation (Neni / Comptoir Libanais / Saffy's):
// a slim announcement bar, a sticky bar with the logo left, centered links
// with an animated underline, a prominent "Réserver" pill on the right, and
// a full-screen menu on mobile.
//
// variant "overlay": transparent over the hero photo, turns solid cream once
// the page scrolls (landing page). variant "solid": always solid (directory).

const NAV_LINKS = [
    { label: "Accueil", href: "/" },
    { label: "Nos cuisinières", href: "/cooks" },
    { label: "Comment ça marche", href: "/#how-it-works" },
    { label: "Devenir cuisinière", href: "/#for-moms" },
    { label: "Avis", href: "/#reviews" },
];

export default function SiteNav({
    variant = "solid",
    active,
    authed = false,
    dashboardHref = "/dashboard",
}: {
    variant?: "overlay" | "solid";
    active?: string;
    authed?: boolean;
    dashboardHref?: string;
}) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (variant !== "overlay") return;
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [variant]);

    // The full-screen menu owns the viewport while open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const transparent = variant === "overlay" && !scrolled && !menuOpen;

    return (
        <>
            {/* sticky top:-40px = the 40px announcement bar scrolls away, the bar itself sticks */}
            <div style={{ position: variant === "overlay" ? "fixed" : "sticky", top: variant === "overlay" ? 0 : "-40px", left: 0, right: 0, zIndex: 60 }}>
                {/* ── Announcement bar (scrolls away) ── */}
                <div className="announce-bar" style={{ maxHeight: transparent || variant === "solid" ? "40px" : scrolled ? "0px" : "40px" }}>
                    Des cuisinières disponibles cette semaine à Tunis, La Marsa &amp; Ariana&nbsp;
                    <span aria-hidden="true">🌶</span>
                </div>

                {/* ── Main bar ── */}
                <header
                    className={transparent ? "site-nav nav-transparent" : "site-nav"}
                    style={{
                        backgroundColor: transparent ? "transparent" : "var(--bg-nav)",
                        backdropFilter: transparent ? "none" : "blur(16px)",
                        WebkitBackdropFilter: transparent ? "none" : "blur(16px)",
                        borderBottom: transparent ? "1px solid transparent" : "1px solid var(--border-light)",
                        transition: "background-color 0.3s ease, border-color 0.3s ease",
                    }}
                >
                    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "0 24px", height: "76px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "24px" }}>
                        <Link href="/" aria-label="Ommi Sissi — accueil" className={transparent ? "force-dark-logo" : undefined} style={{ display: "flex", alignItems: "center" }}>
                            <BrandMark size={46} />
                        </Link>

                        <nav className="hidden lg:flex" style={{ justifyContent: "center", gap: "34px" }}>
                            {NAV_LINKS.map((l) => (
                                <Link key={l.href} href={l.href} className={active === l.href ? "site-nav-link active" : "site-nav-link"}>
                                    {l.label}
                                </Link>
                            ))}
                        </nav>

                        <div style={{ display: "flex", alignItems: "center", gap: "14px", justifyContent: "flex-end" }}>
                            <ThemeToggle />
                            {authed ? (
                                <>
                                    <Link href="/dashboard/family" className="site-nav-link hidden md:flex" style={{ alignItems: "center", gap: "6px" }}>
                                        <Calendar size={16} /> Mes réservations
                                    </Link>
                                    <Link href={dashboardHref} className="btn-primary" style={{ padding: "11px 24px", fontSize: "14px", textDecoration: "none" }}>
                                        Mon espace
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="site-nav-link hidden sm:block">
                                        Se connecter
                                    </Link>
                                    {/* Like the reference sites, the Book-Now pill stays visible on mobile too */}
                                    <Link href="/cooks" className="btn-primary" style={{ padding: "11px 24px", fontSize: "14px", textDecoration: "none" }}>
                                        Réserver
                                    </Link>
                                </>
                            )}
                            <button
                                type="button"
                                className="nav-burger"
                                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                                aria-expanded={menuOpen}
                                onClick={() => setMenuOpen((o) => !o)}
                            >
                                {menuOpen ? <X size={26} /> : <Menu size={26} />}
                            </button>
                        </div>
                    </div>
                </header>
            </div>

            {/* ── Full-screen mobile menu (Comptoir style) ── */}
            {menuOpen && (
                <div className="mobile-menu" role="dialog" aria-modal="true">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "76px", flexShrink: 0 }}>
                        <BrandMark size={44} />
                        <button type="button" className="nav-burger" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}>
                            <X size={28} />
                        </button>
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", marginTop: "24px", flexGrow: 1 }}>
                        {NAV_LINKS.map((l, i) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="mobile-menu-link"
                                style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {l.label}
                                <ArrowRight size={22} style={{ opacity: 0.35 }} />
                            </Link>
                        ))}
                    </nav>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "32px" }}>
                        {authed ? (
                            <Link href={dashboardHref} className="btn-primary" style={{ padding: "16px", fontSize: "16px", textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                                Mon espace
                            </Link>
                        ) : (
                            <>
                                <Link href="/cooks" className="btn-primary" style={{ padding: "16px", fontSize: "16px", textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
                                    Réserver une cuisinière <ArrowRight size={18} />
                                </Link>
                                <Link href="/login" className="mobile-menu-secondary" onClick={() => setMenuOpen(false)}>
                                    Se connecter
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
