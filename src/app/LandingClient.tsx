"use client";

import React, { useEffect, useRef } from "react";
import SiteNav from "@/components/SiteNav";
import SmoothScroll from "@/components/SmoothScroll";
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

/** One word of the headline, rising out of an overflow mask */
function Rise({ children, d = 0 }: { children: React.ReactNode; d?: number }) {
  return (
    <span className="word-mask">
      <span className="word-rise" style={{ animationDelay: `${d}s` }}>{children}</span>
    </span>
  );
}

/** Gentle parallax: drifts the element against the scroll direction */
function useParallax(factor = 0.1, scale = 1.15) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - window.innerHeight / 2) * factor;
        el.style.transform = `scale(${scale}) translateY(${-offset}px)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [factor, scale]);

  return ref;
}

const GALLERY = [
  { src: "/tunisian-lablabi.jpg", alt: "Lablabi" },
  { src: "/mint-tea-pouring.jpg", alt: "Thé à la menthe" },
  { src: "/tunisian-ojja.jpg", alt: "Ojja merguez" },
  { src: "/market-fresh-ingredients.jpg", alt: "Ingrédients frais du marché" },
  { src: "/tunisian-mloukhia.jpg", alt: "Mloukhia" },
  { src: "/tunisian-makroudh.jpg", alt: "Makroudh au miel" },
  { src: "/tunisian-kafteji.jpg", alt: "Kafteji" },
  { src: "/tunisian-almond-sweets.jpg", alt: "Gâteaux aux amandes" },
  { src: "/tunisian-vegan-couscous.jpg", alt: "Couscous végane" },
  { src: "/tunisian-cheese-brik.jpg", alt: "Brik fromage et herbes" },
];

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
      {badge && <p className="eyebrow" style={{ marginBottom: "16px" }}>{badge}</p>}
      <h2 className="display-font" style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.12, color: "var(--text-heading)" }}>
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
  const heroImgRef = useParallax(0.12);
  const familyImgRef = useParallax(0.06);
  const bandImgRef = useParallax(0.22, 1);
  const statementRef = useReveal();
  const bandRef = useReveal();

  return (
    <div style={{ backgroundColor: "var(--bg-base)", color: "var(--text-body)", overflowX: "hidden" }}>
      <SmoothScroll />

      {/* ─────────── NAVBAR ─────────── */}
      <SiteNav active="/" />

      {/* ─────────── HERO — Cream editorial (restaurant style) ─────────── */}
      <section ref={heroRef} style={{ position: "relative", backgroundColor: "var(--bg-base)", overflow: "hidden" }}>
        <div className="hero-blob" aria-hidden="true" />

        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "64px 24px 110px 24px", position: "relative", zIndex: 5 }}>
          <div className="hero-grid">
            {/* Text column */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p className="eyebrow" style={{ marginBottom: "22px" }}>
                Cuisinières tunisiennes à domicile — Tunis · La Marsa · Ariana
              </p>

              <h1 className="display-font" style={{ fontSize: "clamp(44px, 5.6vw, 80px)", fontWeight: 600, margin: "0 0 28px 0", lineHeight: 1.04, color: "var(--text-heading)" }}>
                <Rise d={0}>Le&nbsp;goût&nbsp;de&nbsp;chez</Rise>{" "}
                <Rise d={0.12}><em className="display-italic-ink">Mama</em>,</Rise>
                <br />
                <Rise d={0.24}>dans&nbsp;votre</Rise>{" "}
                <Rise d={0.36}>cuisine.</Rise>
              </h1>

              <p className="reveal" style={{ fontSize: "18px", color: "var(--text-body)", lineHeight: 1.7, margin: "0 0 38px 0", maxWidth: "480px" }}>
                Découvrez des mamans talentueuses près de chez vous, choisissez un menu, et elle viendra cuisiner des plats frais et authentiques directement dans votre cuisine. C’est aussi simple que ça.
              </p>

              <div className="reveal" style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "44px" }}>
                <Link href="/cooks" className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px", textDecoration: "none" }}>
                  Réserver une cuisinière <ArrowRight size={18} />
                </Link>
                <Link href="/signup" className="btn-outline" style={{ padding: "16px 32px", fontSize: "16px" }}>
                  Je veux cuisiner
                </Link>
              </div>

              <div className="reveal" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                  {["F", "A", "L", "K", "S"].map((letter, i) => (
                    <div key={letter} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#121212", fontSize: "13px", border: "2px solid var(--bg-base)", marginLeft: i > 0 ? "-10px" : "0" }}>
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <Stars n={5} />
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
                    Plus de <strong style={{ color: "var(--text-heading)" }}>2 000</strong> familles nous font confiance
                  </p>
                </div>
              </div>
            </div>

            {/* Photo composition: arch + portrait + sticker + rating card */}
            <div className="reveal hero-compo">
              <div className="arch-frame hero-arch">
                <img ref={heroImgRef} src="/tunisian-feast-platter.jpg" alt="Festin tunisien fait maison" />
              </div>
              <span className="sticker">100 % fait maison 🌶</span>
              <div className="hero-portrait">
                <img src="/cook-fatma.jpg" alt="Cuisinière tunisienne à domicile" />
              </div>
              <div className="hero-rating-card">
                <Stars n={5} />
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>
                  4,9 <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>· note moyenne</span>
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

      {/* ─────────── STATEMENT — the brand moment, à la "Food shared is a memory made" ─────────── */}
      <section ref={statementRef} style={{ backgroundColor: "var(--bg-surface)", padding: "110px 24px 30px 24px" }}>
        <div className="reveal" style={{ maxWidth: "980px", margin: "0 auto", textAlign: "center" }}>
          <img
            src="/brand/ommi-sissi-full-light.svg"
            alt="Ommi Sissi — Tunisian Food"
            className="logo-when-light"
            style={{ width: "min(190px, 45vw)", height: "auto", marginBottom: "44px" }}
          />
          <img
            src="/brand/ommi-sissi-full-dark.svg"
            alt=""
            aria-hidden="true"
            className="logo-when-dark"
            style={{ width: "min(190px, 45vw)", height: "auto", marginBottom: "44px" }}
          />
          <p className="display-font statement">
            Un plat partagé,<br />un souvenir <em className="display-italic-ink">créé</em>.
          </p>
          <p className="eyebrow" style={{ marginTop: "28px" }}>— La table tunisienne, chez vous —</p>
        </div>

        {/* Auto-scrolling gallery: the dishes do the talking */}
        <div className="photo-marquee" style={{ marginTop: "70px" }}>
          <div className="photo-marquee-track">
            {Array.from({ length: 2 }).flatMap((_, r) =>
              GALLERY.map((photo, i) => (
                <div key={`${r}-${i}`} className="photo-tile">
                  <img src={photo.src} alt={r === 0 ? photo.alt : ""} aria-hidden={r === 1} loading="lazy" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <Section bgVar="--bg-surface" id="how-it-works">
        <SectionHeader badge="Comment ça marche" title="De la recherche au repas en 4 étapes" subtitle="Toute l’expérience — de la recherche d’un cuisinier au paiement — se déroule simplement dans l’appli." />
        <div className="auto-grid-4 reveal-stagger">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="reveal" style={{ borderTop: "2px solid var(--border-medium)", paddingTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <span className="display-font" style={{ fontSize: "44px", fontWeight: 600, lineHeight: 1, color: "var(--brand-ink)" }}>
                    0{step.n}
                  </span>
                  <span style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "rgba(244, 193, 47,0.14)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--brand-ink)" }}>
                    <Icon size={22} />
                  </span>
                </div>
                <h3 className="heading-font" style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: 800, color: "var(--text-heading)" }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--text-body)" }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─────────── PARALLAX BAND — full-bleed breather with a derja wink ─────────── */}
      <section ref={bandRef} className="parallax-band">
        <img ref={bandImgRef} src="/hands-serving-couscous.jpg" alt="" aria-hidden="true" />
        <div className="parallax-band-overlay">
          <p className="reveal display-font" style={{ fontSize: "clamp(38px, 6vw, 84px)", fontWeight: 600, fontStyle: "italic", color: "#F6EFE2", margin: 0, lineHeight: 1.05 }}>
            « Bessa7a w erra7a »
          </p>
          <p className="reveal eyebrow" style={{ color: "rgba(246,239,226,0.85)", marginTop: "20px" }}>
            — comme on dit chez nous, à la fin de chaque repas
          </p>
        </div>
      </section>

      {/* ─────────── BROWSE COOKS ─────────── */}
      <Section id="cooks">
        <div className="reveal" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "12px" }}>Les mieux notées</p>
            <h2 className="display-font" style={{ fontSize: "38px", fontWeight: 600, margin: 0, color: "var(--text-heading)" }}>Découvrez nos cuisinières</h2>
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
            <div className="arch-frame reveal-img" style={{ aspectRatio: "4/4.6", maxWidth: "460px", margin: "0 auto", boxShadow: "var(--shadow-lg)" }}>
              <img ref={familyImgRef} src="/family-tunisian.png" alt="Famille tunisienne partageant un dîner" />
            </div>
          </div>

          <div style={{ flex: "1 1 450px" }}>
            <SectionHeader align="left" badge="Pour les familles" title="Retrouvez vos soirées." subtitle="Ne stressez plus pour le dîner. Une maman vérifiée vient dans votre cuisine et prépare des plats frais et authentiques pour votre famille." />

            <div className="reveal-stagger" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
              {FAMILY_PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="reveal" style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "rgba(244, 193, 47,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", flexShrink: 0 }}>
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
      <section id="for-moms" className="snap-section parallax-bg" style={{ position: "relative", padding: "120px 0", overflow: "hidden", backgroundImage: "url('/market-fresh-ingredients.jpg')" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1 }} />

        <div ref={momsRef} style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div className="reveal">
                <p className="eyebrow" style={{ marginBottom: "20px", color: "#F6CC4F" }}>Pour les mamans</p>
                <h2 className="display-font" style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 600, margin: "0 0 16px 0", lineHeight: 1.08, color: "white" }}>
                  Transformez vos talents de cuisinière en <em className="display-italic">revenu flexible</em>
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
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(244, 193, 47,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F6EFE2", marginBottom: "12px" }}>
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
                    <p className="heading-font" style={{ margin: "0 0 2px 0", fontSize: "32px", fontWeight: 800, color: "#F6EFE2" }}>{stat.v}</p>
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
              <div className="arch-frame reveal-img" style={{ aspectRatio: "3/4", maxWidth: "420px", margin: "0 auto", border: "1px solid rgba(255,255,255,0.14)" }}>
                <img src="/cook-amira.jpg" alt="Cuisinière tunisienne à domicile" style={{ objectPosition: "top" }} />
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
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#121212", fontWeight: 700, fontSize: "15px" }}>
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
        <div className="reveal" style={{ backgroundImage: "url('/cook-arriving-home.jpg')", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "32px", position: "relative", overflow: "hidden", border: "2px solid rgba(244, 193, 47,0.35)" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.6) 55%, rgba(120,40,0,0.45) 100%)" }} />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "88px 32px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(244, 193, 47,0.16)", border: "1px solid rgba(244, 193, 47,0.4)", backdropFilter: "blur(8px)", color: "#F6EFE2", padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "24px" }}>
              <span className="pulse-dot" /> Des cuisiniers disponibles cette semaine à Tunis, La Marsa et Ariana
            </div>
            <h2 className="display-font" style={{ fontSize: "clamp(34px, 5vw, 60px)", fontWeight: 600, margin: "0 0 12px 0", lineHeight: 1.06, color: "white" }}>
              Ce soir, on mange<br />comme chez <em className="display-italic">Mama</em>. 🌶
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
              <img
                src="/brand/ommi-sissi-full-dark.svg?v=6a"
                alt="Ommi Sissi — Tunisian Food"
                style={{ width: "180px", height: "auto", marginBottom: "20px", display: "block" }}
              />
              <p style={{ fontSize: "14px", lineHeight: 1.65, maxWidth: "300px", margin: 0 }}>
                Nous connectons les familles avec des cuisiniers à domicile talentueux. Des plats frais et authentiques — préparés avec amour dans votre propre cuisine.
              </p>
            </div>

            {[
              { title: "Familles", links: [
                { label: "Trouver un cuisinier", href: "/cooks" },
                { label: "Comment ça marche", href: "/#how-it-works" },
                { label: "Pour les familles", href: "/#families" },
                { label: "Avis", href: "/#reviews" },
              ] },
              { title: "Cuisiniers", links: [
                { label: "Devenir cuisinière", href: "/signup" },
                { label: "Pour les mamans", href: "/#for-moms" },
                { label: "Espace cuisinier", href: "/login" },
              ] },
              { title: "Ommi Sissi", links: [
                { label: "Nos cuisiniers", href: "/#cooks" },
                { label: "Se connecter", href: "/login" },
                { label: "Créer un compte", href: "/signup" },
              ] },
            ].map(col => (
              <div key={col.title} style={{ flex: "1 1 120px" }}>
                <h4 style={{ color: "white", fontSize: "14px", fontWeight: 700, margin: "0 0 16px 0" }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map(l => (
                    <li key={l.label}><a href={l.href} className="nav-link" style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)" }}>{l.label}</a></li>
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
