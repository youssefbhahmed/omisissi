"use client";

import React, { useEffect, useRef } from "react";
import BrandMark from "@/components/BrandMark";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  MapPin,
  ChevronRight,
  Check,
  Heart,
  Search,
  Utensils,
  ShoppingCart,
  Home,
  Clock,
  Award,
  BookOpen,
  Smartphone,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const STEPS = [
  { icon: Search, n: 1, title: "Parcourez les cuisiniers", desc: "Découvrez des mamans vérifiées dans votre quartier. Consultez photos, spécialités, notes et avis — comme sur Airbnb." },
  { icon: Utensils, n: 2, title: "Choisissez un menu", desc: "Choisissez parmi ses menus hebdomadaires signature, ou composez le vôtre. L’appli génère automatiquement la liste de courses." },
  { icon: Home, n: 3, title: "Elle cuisine chez vous", desc: "Votre cuisinière arrive dans votre cuisine avec des ingrédients frais et prépare tout sur place." },
  { icon: Heart, n: 4, title: "Savourez et notez", desc: "Savourez des plats faits maison authentiques en famille, puis laissez un avis pour l’aider à se développer." },
];

export interface LandingCook {
  id: string;
  name: string;
  bio: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  city: string;
  img: string;
  href: string;
}

const FAMILY_PERKS = [
  { icon: ShieldCheck, title: "Vérifiées et formées", desc: "Chaque cuisinière fait l’objet d’une vérification d’antécédents et suit une formation à l’hygiène alimentaire." },
  { icon: Home, title: "Elle vient chez vous", desc: "Votre cuisinière arrive dans votre cuisine. Ou optez pour la livraison de plats préparés chez elle." },
  { icon: ShoppingCart, title: "Courses prises en charge", desc: "Listes de courses générées automatiquement. Faites vos courses vous-même ou payez la livraison." },
  { icon: Smartphone, title: "Tout dans l’appli", desc: "Planification, messagerie et paiements — sans échange de numéros de téléphone ni d’espèces." },
];

const MOM_BENEFITS = [
  { icon: Clock, title: "Horaires flexibles", desc: "Acceptez ou refusez les réservations. Cuisinez quand cela vous arrange." },
  { icon: Award, title: "Nous vous aidons à démarrer", desc: "Notre équipe crée votre profil, s’occupe de la technique et vous forme." },
  { icon: CreditCard, title: "Gagnez chaque semaine", desc: "Paiements sécurisés dans l’appli, versés directement sur votre compte." },
  { icon: BookOpen, title: "Bâtissez votre réputation", desc: "Développez votre clientèle grâce aux notes et au bouche-à-oreille." },
];

const TESTIMONIALS = [
  { name: "Sonia Bouazizi", role: "Maman de 3 enfants, Tunis", text: "Avant, le dîner était un stress quotidien. Maintenant, Fatma vient deux fois par semaine et mes enfants ont de nouveau hâte de manger à la maison." },
  { name: "Karim Jendoubi", role: "Papa actif, Sousse", text: "C’est comme avoir un chef personnel. Les vendredis couscous sont devenus sacrés chez nous. La meilleure décision que nous ayons prise." },
  { name: "Fatma Ben Ali", role: "Cuisinière Ommi Sissi, La Marsa", text: "J’étais une maman au foyer sans revenu. Aujourd’hui, je gagne 900 TND par mois en faisant ce que j’aime — et l’équipe Ommi Sissi m’a aidée pour tout." },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} color={i < Math.round(n) ? "var(--brand-primary)" : "var(--border-medium)"} />
      ))}
    </div>
  );
}

/** Intersection Observer hook for scroll-reveal */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe the container and all children with .reveal
    const revealElements = el.querySelectorAll(".reveal");
    revealElements.forEach((child) => observer.observe(child));
    if (el.classList.contains("reveal")) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

function Section({ children, bgVar = "--bg-base", id }: { children: React.ReactNode; bgVar?: string; id?: string }) {
  const ref = useReveal();
  return (
    <section id={id} ref={ref} className="snap-section" style={{ backgroundColor: `var(${bgVar})`, paddingTop: "100px", paddingBottom: "100px", position: "relative" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
        {children}
      </div>
    </section>
  );
}

function SectionHeader({ badge, title, subtitle, align = "center" }: { badge?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <div className="reveal" style={{ textAlign: align, marginBottom: "48px", maxWidth: align === "center" ? "640px" : "100%", margin: align === "center" ? "0 auto 48px auto" : "0 0 48px 0" }}>
      {badge && (
        <span style={{ display: "inline-block", backgroundColor: "var(--brand-primary)", color: "#F5EDE3", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
          {badge}
        </span>
      )}
      <h2 className="heading-font" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, margin: "0 0 12px 0", lineHeight: 1.15, color: "var(--text-heading)" }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: "17px", color: "var(--text-muted)", margin: 0, lineHeight: 1.6, maxWidth: "560px", marginLeft: align === "center" ? "auto" : undefined, marginRight: align === "center" ? "auto" : undefined }}>{subtitle}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

export default function LandingClient({ cooks }: { cooks: LandingCook[] }) {
  const heroRef = useReveal();
  const momsRef = useReveal();

  return (
    <div style={{ backgroundColor: "var(--bg-base)", color: "var(--text-body)", overflowX: "hidden" }}>

      {/* ─────────── NAVBAR ─────────── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: "72px", backgroundColor: "var(--bg-nav)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", zIndex: 50, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <BrandMark size={36} />
            <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-heading)" }}>Ommi Sissi</span>
          </div>

          <nav style={{ gap: "28px", fontSize: "14px" }} className="hidden md:flex">
            <a href="#how-it-works" className="nav-link">Comment ça marche</a>
            <a href="#cooks" className="nav-link">Nos cuisiniers</a>
            <a href="#families" className="nav-link">Pour les familles</a>
            <a href="#for-moms" className="nav-link">Pour les mamans</a>
            <a href="#reviews" className="nav-link">Avis</a>
          </nav>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <ThemeToggle />
            <Link href="/login" className="btn-nav hidden sm:block" style={{ textDecoration: "none" }}>Se connecter</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none" }}>Commencer <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      {/* ─────────── HERO — Full-Bleed Parallax Cover ─────────── */}
      <section ref={heroRef} className="snap-section parallax-bg" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundImage: "url('/hero-tunisian-food.png')" }}>
        {/* Dark overlay for text readability */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.2) 100%)", zIndex: 1 }} />

        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div className="reveal" style={{ maxWidth: "620px", paddingTop: "120px", paddingBottom: "100px" }}>
            {/* Full brand logo — the dark-background variant, since the hero
                photo sits under a dark overlay in both themes */}
            <img
              src="/brand/ommi-sissi-full-dark.svg"
              alt="Ommi Sissi — Tunisian Food"
              style={{ width: "min(240px, 55vw)", height: "auto", marginBottom: "28px", display: "block", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))" }}
            />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(198, 70, 43,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(198, 70, 43,0.35)", padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, color: "#F5EDE3", marginBottom: "28px" }}>
              <span style={{ width: "7px", height: "7px", backgroundColor: "#F5EDE3", borderRadius: "50%" }} />
              Des repas faits maison, par de vraies personnes
            </div>

            <h1 className="heading-font" style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800, margin: "0 0 24px 0", lineHeight: 1.05, color: "white", letterSpacing: "-1.5px" }}>
              Un cuisinier à domicile<br />pour chaque famille
            </h1>

            <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 40px 0", maxWidth: "500px" }}>
              Découvrez des mamans talentueuses près de chez vous, choisissez un menu, et elle viendra cuisiner des plats frais et authentiques directement dans votre cuisine. C’est aussi simple que ça.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px" }}>
              <Link href="/cooks" className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px", textDecoration: "none" }}>
                Trouver un cuisinier <ArrowRight size={18} />
              </Link>
              <Link href="/signup" style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 700, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "99px", color: "white", cursor: "pointer", transition: "all 0.25s ease", textDecoration: "none" }}>
                Je veux cuisiner
              </Link>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                {["F", "A", "L", "K", "S"].map((letter, i) => (
                  <div key={letter} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#F5EDE3", fontSize: "13px", border: "2px solid rgba(0,0,0,0.3)", marginLeft: i > 0 ? "-10px" : "0" }}>
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <Stars n={5} />
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  Plus de <strong style={{ color: "white" }}>2 000</strong> familles nous font confiance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── DISH MARQUEE ─────────── */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 3 }).flatMap((_, r) =>
            [
              "Couscous au Poisson", "Brik à l'Œuf", "Slata Mechouia", "Ojja Merguez",
              "Lablabi", "Kafteji", "Mloukhia", "Makroudh",
              "Couscous à l'Agneau", "Chorba Frik", "Fricassé", "Tajine Malsouka",
              "Kamounia", "Nwasser", "Mosli", "Bambalouni",
            ].map((dish, i) => (
              <span key={`${r}-${i}`} className="marquee-item heading-font">
                {dish} <span className="marquee-pepper">🌶</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <Section bgVar="--bg-surface" id="how-it-works">
        <SectionHeader badge="Comment ça marche" title="De la recherche au repas en 4 étapes" subtitle="Toute l’expérience — de la recherche d’un cuisinier au paiement — se déroule simplement dans l’appli." />
        <div className="auto-grid-4 reveal-stagger">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="card reveal" style={{ padding: "32px 24px", textAlign: "center", position: "relative" }}>
                {/* .card clips overflow, so the number chip must sit inside the edge */}
                <div style={{ position: "absolute", top: "14px", right: "14px", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", color: "#F5EDE3", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" }}>
                  {step.n}
                </div>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "rgba(198, 70, 43,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 16px auto" }}>
                  <Icon size={28} />
                </div>
                <h3 className="heading-font" style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--text-body)" }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─────────── BROWSE COOKS ─────────── */}
      <Section id="cooks">
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ display: "inline-block", backgroundColor: "var(--brand-primary)", color: "#F5EDE3", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>Les mieux notés</span>
            <h2 className="heading-font" style={{ fontSize: "36px", fontWeight: 800, margin: 0, color: "var(--text-heading)" }}>Découvrez nos cuisiniers</h2>
            <p style={{ margin: "8px 0 0 0", fontSize: "16px", color: "var(--text-muted)", maxWidth: "400px" }}>Chaque cuisinière est recrutée, vérifiée et formée par notre équipe avant sa première réservation.</p>
          </div>
          <Link href="/cooks" className="btn-nav" style={{ color: "var(--brand-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
            Voir tous les cuisiniers <ChevronRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="auto-grid-3 reveal-stagger">
          {cooks.map((cook, i) => (
            // Index keys keep the DOM nodes stable when real cooks replace the
            // fallback cards, so the scroll-reveal "visible" class survives.
            <Link key={i} href={cook.href} className="card reveal" style={{ cursor: "pointer", display: "block", textDecoration: "none", color: "inherit" }}>
              <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                <img src={cook.img} alt={cook.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--brand-success)", color: "white", padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} strokeWidth={3} /> Vérifié
                </div>
                <div style={{ position: "absolute", bottom: "16px", left: "16px" }}>
                  <h3 className="heading-font" style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: 800, color: "white" }}>{cook.name}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} /> {cook.city}
                  </p>
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Stars n={cook.rating} />
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-heading)" }}>{cook.rating}</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>({cook.reviews})</span>
                  </div>
                  <div>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-heading)" }}>{cook.pricePerHour} TND</span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/heure</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-body)" }}>{cook.bio}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ─────────── FOR FAMILIES ─────────── */}
      <Section bgVar="--bg-surface-alt" id="families">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
          <div className="reveal" style={{ flex: "1 1 450px" }}>
            <div className="image-card" style={{ aspectRatio: "4/3" }}>
              <img src="/family-tunisian.png" alt="Famille tunisienne partageant un dîner" />
              <div className="image-card-overlay" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)" }} />
            </div>
          </div>

          <div style={{ flex: "1 1 450px" }}>
            <SectionHeader align="left" badge="Pour les familles" title="Retrouvez vos soirées." subtitle="Ne stressez plus pour le dîner. Une maman vérifiée vient dans votre cuisine et prépare des plats frais et authentiques pour votre famille." />

            <div className="reveal-stagger" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
              {FAMILY_PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="reveal" style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "rgba(198, 70, 43,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", flexShrink: 0 }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>{perk.title}</h4>
                      <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reveal">
              <Link href="/cooks" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none" }}>
                Parcourir les cuisiniers près de chez vous <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────── FOR MOMS / COOKS — Full-Bleed Parallax ─────────── */}
      <section id="for-moms" className="snap-section parallax-bg" style={{ position: "relative", padding: "120px 0", overflow: "hidden", backgroundImage: "url('/hero-feast.png')" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1 }} />

        <div ref={momsRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div className="reveal">
                <span style={{ display: "inline-block", backgroundColor: "rgba(198, 70, 43,0.2)", color: "#F5EDE3", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "20px", border: "1px solid rgba(198, 70, 43,0.3)" }}>Pour les mamans</span>
                <h2 className="heading-font" style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, margin: "0 0 16px 0", lineHeight: 1.1, color: "white" }}>
                  Transformez vos talents de cuisinière en revenu flexible
                </h2>
                <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: "0 0 40px 0", lineHeight: 1.65, maxWidth: "480px" }}>
                  Pas besoin d’être à l’aise avec la technologie. Notre équipe vous recrute, crée votre profil, vous forme à l’hygiène alimentaire et vous aide à obtenir votre première réservation. Vous n’avez qu’à cuisiner.
                </p>
              </div>

              <div className="auto-grid-2 reveal-stagger" style={{ marginBottom: "36px" }}>
                {MOM_BENEFITS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="reveal" style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", padding: "24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(198, 70, 43,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5EDE3", marginBottom: "12px" }}>
                        <Icon size={20} />
                      </div>
                      <h4 className="heading-font" style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "white" }}>{b.title}</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{b.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="reveal" style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "36px" }}>
                {[{ v: "900+ TND", l: "Revenu mensuel moyen" }, { v: "100%", l: "Horaires flexibles" }].map(stat => (
                  <div key={stat.l} style={{ textAlign: "center" }}>
                    <p className="heading-font" style={{ margin: "0 0 2px 0", fontSize: "32px", fontWeight: 800, color: "#F5EDE3" }}>{stat.v}</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{stat.l}</p>
                  </div>
                ))}
              </div>

              <div className="reveal">
                <Link href="/signup" className="btn-primary" style={{ padding: "16px 32px", textDecoration: "none" }}>
                  Devenir cuisinière <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="reveal" style={{ flex: "1 1 350px" }}>
              <div className="image-card" style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src="/cook-portrait.png" alt="Cuisinière tunisienne à domicile" style={{ objectPosition: "top" }} />
                <div className="image-card-overlay" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <Section bgVar="--bg-surface" id="reviews">
        <SectionHeader badge="Témoignages" title="Adoré des familles et des cuisiniers" subtitle="Écoutez celles et ceux qui utilisent Ommi Sissi chaque semaine." />
        <div className="auto-grid-3 reveal-stagger">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card reveal" style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: "12px" }}><Stars n={5} /></div>
              <p style={{ margin: "0 0 20px 0", fontSize: "15px", color: "var(--text-body)", lineHeight: 1.65, flexGrow: 1 }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5EDE3", fontWeight: 700, fontSize: "15px" }}>
                  {t.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: "14px", fontWeight: 700, color: "var(--text-heading)" }}>{t.name}</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────────── CTA ─────────── */}
      <Section>
        <div className="reveal" style={{ backgroundImage: "url('/hero-feast.png')", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "32px", position: "relative", overflow: "hidden", border: "2px solid rgba(198, 70, 43,0.35)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 55%, rgba(120,40,0,0.45) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "88px 32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(198, 70, 43,0.16)", border: "1px solid rgba(198, 70, 43,0.4)", backdropFilter: "blur(8px)", color: "#F5EDE3", padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "24px" }}>
              <span className="pulse-dot" /> Des cuisiniers disponibles cette semaine à Tunis, La Marsa et Ariana
            </div>
            <h2 className="heading-font" style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800, margin: "0 0 12px 0", lineHeight: 1.08, color: "white", letterSpacing: "-1px" }}>
              Ce soir, on mange<br />comme chez <span style={{ color: "#F5EDE3" }}>Mama</span>. 🌶
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", margin: "0 auto 32px auto", lineHeight: 1.6, maxWidth: "520px" }}>
              De vraies mamans tunisiennes qui cuisinent dans votre cuisine. Des vendredis couscous, une brik qui croustille,
              et zéro vaisselle — votre première réservation ne prend que deux minutes.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginBottom: "36px" }}>
              <Link href="/cooks" className="btn-primary" style={{ padding: "16px 36px", fontSize: "16px", textDecoration: "none" }}>
                Trouver un cuisinier près de chez vous <ArrowRight size={18} />
              </Link>
              <Link href="/signup" style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 700, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "99px", color: "white", textDecoration: "none" }}>
                Je veux cuisiner
              </Link>
            </div>
            <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap", fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>
              <span>★ 4,9 de note moyenne</span>
              <span>à partir de 40 TND / heure</span>
              <span>vérifiées et formées à l’hygiène</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────── FOOTER ─────────── */}
      <footer style={{ backgroundColor: "var(--bg-dark)", padding: "80px 24px 40px 24px", color: "rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", marginBottom: "48px" }}>
            <div style={{ flex: "2 1 250px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                <BrandMark size={36} />
                <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>Ommi Sissi</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.65, maxWidth: "300px", margin: 0 }}>
                Nous connectons les familles avec des cuisiniers à domicile talentueux. Des plats frais et authentiques — préparés avec amour dans votre propre cuisine.
              </p>
            </div>

            {[
              { title: "Familles", links: ["Trouver un cuisinier", "Comment ça marche", "Tarifs", "FAQ"] },
              { title: "Cuisiniers", links: ["Devenir cuisinière", "Revenus", "Formation", "Ressources"] },
              { title: "Entreprise", links: ["À propos", "Blog", "Carrières", "Conditions"] },
            ].map(col => (
              <div key={col.title} style={{ flex: "1 1 120px" }}>
                <h4 style={{ color: "white", fontSize: "14px", fontWeight: 700, margin: "0 0 16px 0" }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="nav-link" style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", alignItems: "center", fontSize: "13px" }}>
            <p style={{ margin: 0 }}>&copy; 2026 Ommi Sissi. Tous droits réservés.</p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>Fait avec <Heart size={14} fill="var(--brand-primary)" color="var(--brand-primary)" /> en Tunisie</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
