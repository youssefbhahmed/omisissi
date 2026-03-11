"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ChefHat,
  Star,
  ShieldCheck,
  Calendar,
  MessageCircle,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Users,
  ChevronRight,
  Check,
  Heart,
  Moon,
  Sun,
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
  { icon: Search, n: 1, title: "Browse Cooks", desc: "Explore verified moms in your neighborhood. Check photos, specialties, ratings and reviews — just like Airbnb." },
  { icon: Utensils, n: 2, title: "Pick a Menu", desc: "Choose from her signature weekly menus, or build a custom one. The app auto-generates a grocery list." },
  { icon: Home, n: 3, title: "She Cooks at Your Home", desc: "Your cook arrives at your kitchen with fresh ingredients and prepares everything on the spot." },
  { icon: Heart, n: 4, title: "Enjoy & Rate", desc: "Savor authentic home-cooked meals with your family, then leave a review to help her grow." },
];

const COOK_PROFILES = [
  { id: "1", name: "Fatma Ben Ali", bio: "Traditional Tunisian · 12 years experience", rating: 4.9, reviews: 127, pricePerHour: 45, city: "Tunis, La Marsa", img: "/cook-tunisian.png" },
  { id: "2", name: "Amira Trabelsi", bio: "Healthy & Vegan Tunisian Cuisine", rating: 4.8, reviews: 89, pricePerHour: 40, city: "Sousse", img: "/tunisian-mechouia.png" },
  { id: "3", name: "Leila Mansouri", bio: "Pastries, Desserts & Comfort Food", rating: 5.0, reviews: 64, pricePerHour: 55, city: "Sfax", img: "/tunisian-pastries.png" },
];

const FAMILY_PERKS = [
  { icon: ShieldCheck, title: "Verified & Trained", desc: "Every cook is background-checked and completes food hygiene training." },
  { icon: Home, title: "She Comes to You", desc: "Your cook arrives at your kitchen. Or opt for cook-at-home delivery." },
  { icon: ShoppingCart, title: "Groceries Handled", desc: "Auto-generated grocery lists. Shop yourself or pay for delivery." },
  { icon: Smartphone, title: "Everything In-App", desc: "Scheduling, chat, and payments — no phone numbers or cash exchanged." },
];

const MOM_BENEFITS = [
  { icon: Clock, title: "Flexible Schedule", desc: "Accept or decline bookings. Cook when it works for you." },
  { icon: Award, title: "We Help You Start", desc: "Our team sets up your profile, handles tech, and trains you." },
  { icon: CreditCard, title: "Earn Weekly", desc: "Secure in-app payments deposited directly to your account." },
  { icon: BookOpen, title: "Build Your Reputation", desc: "Grow your client base through ratings and word-of-mouth." },
];

const TESTIMONIALS = [
  { name: "Sonia Bouazizi", role: "Mother of 3, Tunis", text: "I used to stress about dinner every single day. Now Fatma comes twice a week and my kids actually look forward to eating at home again." },
  { name: "Karim Jendoubi", role: "Working Dad, Sousse", text: "It's like having a personal chef. The couscous Fridays are sacred in our house now. Best thing we ever signed up for." },
  { name: "Fatma Ben Ali", role: "Foodie Cook, La Marsa", text: "I was a stay-at-home mom with no income. Now I earn 900 TND a month doing what I love — and the Foodie team helped me with everything." },
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
        <span style={{ display: "inline-block", backgroundColor: "var(--brand-primary)", color: "#121212", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
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

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const heroRef = useReveal();

  useEffect(() => {
    setMounted(true);
    const savedTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div style={{ backgroundColor: "var(--bg-base)", color: "var(--text-body)", overflowX: "hidden" }}>

      {/* ─────────── NAVBAR ─────────── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: "72px", backgroundColor: "var(--bg-nav)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", zIndex: 50, display: "flex", alignItems: "center", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChefHat color="#121212" size={20} />
            </div>
            <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-heading)" }}>foodie</span>
          </div>

          <nav style={{ display: "flex", gap: "28px", fontSize: "14px" }} className="hidden md:flex">
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#cooks" className="nav-link">Our Cooks</a>
            <a href="#families" className="nav-link">For Families</a>
            <a href="#for-moms" className="nav-link">For Moms</a>
            <a href="#reviews" className="nav-link">Reviews</a>
          </nav>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {mounted && (
              <button onClick={toggleTheme} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border-medium)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} aria-label="Toggle theme">
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} color="var(--brand-primary)" />}
              </button>
            )}
            <Link href="/login" className="btn-nav" style={{ textDecoration: "none" }}>Log In</Link>
            <Link href="/signup" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none" }}>Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      {/* ─────────── HERO — Full-Bleed Parallax Cover ─────────── */}
      <section ref={heroRef} className="snap-section parallax-bg" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", backgroundImage: "url('/hero-tunisian-food.png')" }}>
        {/* Dark overlay for text readability */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.2) 100%)", zIndex: 1 }} />

        <div style={{ maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div className="reveal" style={{ maxWidth: "620px", paddingTop: "140px", paddingBottom: "100px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,184,0,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,184,0,0.35)", padding: "8px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, color: "#ffc436", marginBottom: "28px" }}>
              <span style={{ width: "7px", height: "7px", backgroundColor: "#ffc436", borderRadius: "50%" }} />
              Homemade meals, real people
            </div>

            <h1 className="heading-font" style={{ fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800, margin: "0 0 24px 0", lineHeight: 1.05, color: "white", letterSpacing: "-1.5px" }}>
              A home cook<br />for every family
            </h1>

            <p style={{ fontSize: "19px", color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 40px 0", maxWidth: "500px" }}>
              Browse talented moms in your area, pick a menu, and she&apos;ll come cook fresh, authentic meals right in your kitchen. It&apos;s that simple.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px" }}>
              <Link href="/signup" className="btn-primary" style={{ padding: "16px 32px", fontSize: "16px", textDecoration: "none" }}>
                Find a Cook <ArrowRight size={18} />
              </Link>
              <Link href="/signup" style={{ padding: "16px 32px", fontSize: "16px", fontWeight: 700, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "99px", color: "white", cursor: "pointer", transition: "all 0.25s ease", textDecoration: "none" }}>
                I Want to Cook
              </Link>
            </div>

            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ display: "flex" }}>
                {["F", "A", "L", "K", "S"].map((letter, i) => (
                  <div key={letter} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#121212", fontSize: "13px", border: "2px solid rgba(0,0,0,0.3)", marginLeft: i > 0 ? "-10px" : "0" }}>
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <Stars n={5} />
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  Trusted by <strong style={{ color: "white" }}>2,000+</strong> families
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <Section bgVar="--bg-surface" id="how-it-works">
        <SectionHeader badge="How It Works" title="From browsing to eating in 4 steps" subtitle="The entire experience — from finding a cook to paying — happens seamlessly inside the app." />
        <div className="auto-grid-4 reveal-stagger">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="card reveal" style={{ padding: "32px 24px", textAlign: "center", position: "relative" }}>
                <div style={{ position: "absolute", top: "-14px", right: "20px", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", color: "#121212", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "14px" }}>
                  {step.n}
                </div>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: "rgba(255,184,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", margin: "0 auto 16px auto" }}>
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
            <span style={{ display: "inline-block", backgroundColor: "var(--brand-primary)", color: "#121212", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "12px" }}>Top Rated</span>
            <h2 className="heading-font" style={{ fontSize: "36px", fontWeight: 800, margin: 0, color: "var(--text-heading)" }}>Meet Our Cooks</h2>
            <p style={{ margin: "8px 0 0 0", fontSize: "16px", color: "var(--text-muted)", maxWidth: "400px" }}>Each cook is recruited, verified, and trained by our team before her first booking.</p>
          </div>
          <button className="btn-nav" style={{ color: "var(--brand-primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            View All Cooks <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="auto-grid-3 reveal-stagger">
          {COOK_PROFILES.map((cook) => (
            <div key={cook.id} className="card reveal" style={{ cursor: "pointer" }}>
              <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                <img src={cook.img} alt={cook.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--brand-success)", color: "white", padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} strokeWidth={3} /> Verified
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
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>/hour</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-body)" }}>{cook.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─────────── FOR FAMILIES ─────────── */}
      <Section bgVar="--bg-surface-alt" id="families">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
          <div className="reveal" style={{ flex: "1 1 450px" }}>
            <div className="image-card" style={{ aspectRatio: "4/3" }}>
              <img src="/family-tunisian.png" alt="Tunisian family enjoying dinner together" />
              <div className="image-card-overlay" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)" }} />
            </div>
          </div>

          <div style={{ flex: "1 1 450px" }}>
            <SectionHeader align="left" badge="For Families" title="Reclaim your evenings." subtitle="Stop stressing about what to cook. A verified mom comes to your kitchen and prepares fresh, authentic meals for your family." />

            <div className="reveal-stagger" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
              {FAMILY_PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="reveal" style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "rgba(255,184,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", flexShrink: 0 }}>
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
              <Link href="/signup" className="btn-primary" style={{ padding: "14px 28px", textDecoration: "none" }}>
                Browse Cooks Near You <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────── FOR MOMS / COOKS — Full-Bleed Parallax ─────────── */}
      <section id="for-moms" className="snap-section parallax-bg" style={{ position: "relative", padding: "120px 0", overflow: "hidden", backgroundImage: "url('/hero-feast.png')" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 1 }} />

        <div ref={useReveal()} style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", alignItems: "center" }}>
            <div style={{ flex: "1 1 500px" }}>
              <div className="reveal">
                <span style={{ display: "inline-block", backgroundColor: "rgba(255,184,0,0.2)", color: "#ffc436", padding: "6px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: 700, marginBottom: "20px", border: "1px solid rgba(255,184,0,0.3)" }}>For Moms</span>
                <h2 className="heading-font" style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 800, margin: "0 0 16px 0", lineHeight: 1.1, color: "white" }}>
                  Turn your cooking skills into flexible income
                </h2>
                <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: "0 0 40px 0", lineHeight: 1.65, maxWidth: "480px" }}>
                  You don&apos;t need to be tech-savvy. Our team recruits you, sets up your profile, trains you on food hygiene, and helps you get your first booking. You just cook.
                </p>
              </div>

              <div className="auto-grid-2 reveal-stagger" style={{ marginBottom: "36px" }}>
                {MOM_BENEFITS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div key={i} className="reveal" style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", padding: "24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "rgba(255,184,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffc436", marginBottom: "12px" }}>
                        <Icon size={20} />
                      </div>
                      <h4 className="heading-font" style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "white" }}>{b.title}</h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{b.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="reveal" style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "36px" }}>
                {[{ v: "900+ TND", l: "Avg. monthly earnings" }, { v: "100%", l: "Flexible schedule" }].map(stat => (
                  <div key={stat.l} style={{ textAlign: "center" }}>
                    <p className="heading-font" style={{ margin: "0 0 2px 0", fontSize: "32px", fontWeight: 800, color: "#ffc436" }}>{stat.v}</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{stat.l}</p>
                  </div>
                ))}
              </div>

              <div className="reveal">
                <Link href="/signup" className="btn-primary" style={{ padding: "16px 32px", textDecoration: "none" }}>
                  Apply to Cook <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="reveal" style={{ flex: "1 1 350px" }}>
              <div className="image-card" style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.1)" }}>
                <img src="/cook-portrait.png" alt="Tunisian home cook" style={{ objectPosition: "top" }} />
                <div className="image-card-overlay" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <Section bgVar="--bg-surface" id="reviews">
        <SectionHeader badge="Testimonials" title="Loved by families and cooks" subtitle="Hear from the people who use Foodie every single week." />
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
        <div className="reveal" style={{ backgroundImage: "url('/tunisian-pastries.png')", backgroundSize: "cover", backgroundPosition: "center", borderRadius: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "80px 32px" }}>
            <h2 className="heading-font" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, margin: "0 0 16px 0", lineHeight: 1.1, color: "white" }}>
              Ready for better dinners?
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.8)", margin: "0 auto 32px auto", lineHeight: 1.6, maxWidth: "500px" }}>
              Join thousands of families already enjoying fresh, home-cooked meals — made by real Tunisian moms.
            </p>
            <Link href="/signup" className="btn-primary" style={{ padding: "16px 36px", fontSize: "16px", textDecoration: "none" }}>
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ─────────── FOOTER ─────────── */}
      <footer style={{ backgroundColor: "var(--bg-dark)", padding: "80px 24px 40px 24px", color: "rgba(255,255,255,0.6)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "48px", marginBottom: "48px" }}>
            <div style={{ flex: "2 1 250px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChefHat color="#121212" size={20} />
                </div>
                <span className="heading-font" style={{ fontSize: "22px", fontWeight: 800, color: "white" }}>foodie</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.65, maxWidth: "300px", margin: 0 }}>
                Connecting families with talented home cooks. Fresh, authentic meals — made with love in your own kitchen.
              </p>
            </div>

            {[
              { title: "Families", links: ["Find a Cook", "How it Works", "Pricing", "FAQ"] },
              { title: "Cooks", links: ["Apply to Cook", "Earnings", "Training", "Resources"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Terms"] },
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
            <p style={{ margin: 0 }}>&copy; 2026 Foodie. All rights reserved.</p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>Made with <Heart size={14} fill="var(--brand-primary)" color="var(--brand-primary)" /> in Tunisia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
