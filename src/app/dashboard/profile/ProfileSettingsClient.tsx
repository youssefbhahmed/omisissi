"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, DollarSign, Check, Calendar } from "lucide-react";
import RegionPicker from "@/components/RegionPicker";
import { updateFamilyProfile, updatePassword, updateCookProfile, updateCookAvailability } from "@/app/actions/auth";
import { normalizeStringArray, type CookDetails, type Profile } from "@/lib/types";
import { dayFr } from "@/lib/labels";

type SaveStatus = { type: "success" | "error"; text: string } | null;

function StatusBanner({ status }: { status: SaveStatus }) {
    if (!status) return null;
    const isError = status.type === "error";
    return (
        <div style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: 600,
            backgroundColor: isError ? "rgba(220, 38, 38, 0.08)" : "rgba(34, 197, 94, 0.08)",
            color: isError ? "#dc2626" : "var(--brand-success)",
            border: `1px solid ${isError ? "rgba(220, 38, 38, 0.2)" : "rgba(34, 197, 94, 0.2)"}`,
        }}>
            {status.text}
        </div>
    );
}

export default function ProfileSettingsClient({ profile, email, isCook, cookDetails, phone }: { profile: Profile | null, email: string, isCook: boolean, cookDetails: CookDetails | null, phone: string | null }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("personal");
    const [specialties, setSpecialties] = useState<string[]>(() => normalizeStringArray(cookDetails?.specialties));
    const [availableDays, setAvailableDays] = useState<string[]>(() => normalizeStringArray(cookDetails?.available_days));
    const [profileStatus, setProfileStatus] = useState<SaveStatus>(null);
    const [scheduleStatus, setScheduleStatus] = useState<SaveStatus>(null);
    const [passwordStatus, setPasswordStatus] = useState<SaveStatus>(null);

    // Free-text values stored on cook_details.specialties — French, matching
    // the discover-page filter chips (FilterControls.SPECIALTIES_LIST).
    const availableSpecialties = ["Traditionnel", "Végane", "Pâtisseries", "Sain", "Plats réconfortants", "Fruits de mer", "Couscous", "Boulangerie"];

    const toggleSpecialty = (s: string) => {
        setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const toggleDay = (day: string) => {
        setAvailableDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ marginBottom: "40px" }}>
                <h1 className="heading-font" style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                    Paramètres du profil
                </h1>
                <p style={{ margin: 0, fontSize: "16px", color: "var(--text-muted)" }}>
                    {isCook ? "Configurez votre profil public de cuisinier pour attirer les familles." : "Mettez à jour votre adresse pour que les cuisiniers sachent où venir."}
                </p>
            </div>

            {/* Mobile tab bar */}
            <div className="flex md:hidden" style={{ gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
                {[
                    { key: "personal", label: isCook ? "Profil public" : "Infos personnelles" },
                    ...(isCook ? [{ key: "availability", label: "Planning" }] : []),
                    { key: "security", label: "Sécurité" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "10px 16px", borderRadius: "99px", whiteSpace: "nowrap",
                            border: `1.5px solid ${activeTab === tab.key ? "var(--brand-primary)" : "var(--border-medium)"}`,
                            backgroundColor: activeTab === tab.key ? "var(--brand-primary)" : "var(--bg-surface)",
                            color: activeTab === tab.key ? "white" : "var(--text-body)",
                            fontSize: "14px", fontWeight: 700, cursor: "pointer",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
                {/* Sidebar Nav (desktop) */}
                <div style={{ width: "240px", flexShrink: 0, flexDirection: "column", gap: "8px", position: "sticky", top: "100px" }} className="hidden md:flex">
                    <button
                        onClick={() => setActiveTab("personal")}
                        style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", backgroundColor: activeTab === "personal" ? "var(--bg-surface)" : "transparent", border: `1px solid ${activeTab === "personal" ? "var(--border-medium)" : "transparent"}`, color: activeTab === "personal" ? "var(--brand-primary)" : "var(--text-muted)", fontWeight: activeTab === "personal" ? 700 : 600, cursor: "pointer", textAlign: "left" }}
                    >
                        <User size={18} /> {isCook ? "Profil public" : "Infos personnelles"}
                    </button>
                    {isCook && (
                        <button
                            onClick={() => setActiveTab("availability")}
                            style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", backgroundColor: activeTab === "availability" ? "var(--bg-surface)" : "transparent", border: `1px solid ${activeTab === "availability" ? "var(--border-medium)" : "transparent"}`, color: activeTab === "availability" ? "var(--brand-primary)" : "var(--text-muted)", fontWeight: activeTab === "availability" ? 700 : 600, cursor: "pointer", textAlign: "left" }}
                        >
                            <Calendar size={18} /> Planning
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab("security")}
                        style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "12px 16px", borderRadius: "12px", backgroundColor: activeTab === "security" ? "var(--bg-surface)" : "transparent", border: `1px solid ${activeTab === "security" ? "var(--border-medium)" : "transparent"}`, color: activeTab === "security" ? "var(--brand-primary)" : "var(--text-muted)", fontWeight: activeTab === "security" ? 700 : 600, cursor: "pointer", textAlign: "left" }}
                    >
                        <ShieldCheck size={18} /> Sécurité
                    </button>
                </div>

                {/* Main Form Area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>

                    {activeTab === "personal" && (
                        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                            <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 24px 0", color: "var(--text-heading)" }}>
                                {isCook ? "Détails du cuisinier" : "Informations personnelles"}
                            </h2>

                            <StatusBanner status={profileStatus} />

                            <form action={async (formData) => {
                                setProfileStatus(null);
                                let res;
                                if (isCook) {
                                    formData.append("specialties", JSON.stringify(specialties));
                                    res = await updateCookProfile(formData);
                                } else {
                                    res = await updateFamilyProfile(formData);
                                }
                                if (res?.error) {
                                    setProfileStatus({ type: "error", text: res.error });
                                } else {
                                    setProfileStatus({ type: "success", text: "Profil enregistré." });
                                    router.refresh();
                                }
                            }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
                                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--bg-base)", border: "2px dashed var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", overflow: "hidden" }}>
                                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="Votre photo de profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <User size={32} />}
                                    </div>
                                    <button type="button" className="btn-nav" style={{ padding: "8px 16px", fontSize: "14px" }}>Téléverser une photo</button>
                                </div>

                                <div style={{ gap: "20px" }} className="grid grid-cols-1 sm:grid-cols-2">
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Nom complet</label>
                                        <input name="fullName" type="text" required defaultValue={profile?.full_name ?? ""} placeholder="ex. Fatma Ben Ali" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Adresse e-mail</label>
                                        <input type="email" defaultValue={email} disabled style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-light)", backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)", cursor: "not-allowed" }} />
                                    </div>
                                </div>

                                <div style={{ gap: "20px" }} className="grid grid-cols-1 sm:grid-cols-2">
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>{isCook ? "Lieu de cuisine / Ville" : "Votre région"}</label>
                                        <RegionPicker defaultValue={profile?.address ?? undefined} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Numéro de téléphone</label>
                                        <input name="phone" type="tel" defaultValue={phone ?? ""} placeholder="+216 12 345 678" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", fontSize: "14px" }} />
                                        <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                                            Partagé avec l’autre partie uniquement lorsqu’une réservation est acceptée.
                                        </p>
                                    </div>
                                </div>

                                {/* Cook Specific Fields */}
                                {isCook && (
                                    <>
                                        <div style={{ padding: "24px 0", borderTop: "1px solid var(--border-light)", marginTop: "8px" }}>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>À propos de vous (bio)</label>
                                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px", marginTop: 0 }}>Parlez aux familles de votre expérience culinaire, de votre parcours et de ce qui rend vos plats spéciaux.</p>
                                            <textarea name="bio" defaultValue={cookDetails?.bio ?? ""} rows={4} placeholder="J’ai 10 ans d’expérience dans la préparation de dîners familiaux tunisiens traditionnels…" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)", resize: "vertical" }} />
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Prix par heure (TND)</label>
                                            <div style={{ position: "relative", maxWidth: "200px" }}>
                                                <DollarSign size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                                                <input name="pricePerHour" type="number" min="0" step="0.5" required defaultValue={cookDetails?.price_per_session ?? ""} placeholder="45" style={{ width: "100%", padding: "14px 14px 14px 40px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "12px", color: "var(--text-heading)" }}>Vos spécialités</label>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                                {availableSpecialties.map(s => {
                                                    const isActive = specialties.includes(s);
                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => toggleSpecialty(s)}
                                                            style={{
                                                                padding: "10px 18px", borderRadius: "99px",
                                                                border: `1.5px solid ${isActive ? "var(--brand-primary)" : "var(--border-medium)"}`,
                                                                backgroundColor: isActive ? "var(--brand-primary)" : "var(--bg-base)",
                                                                color: isActive ? "white" : "var(--text-body)",
                                                                fontSize: "14px", fontWeight: isActive ? 700 : 600,
                                                                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                                                                transition: "all 0.2s ease"
                                                            }}
                                                        >
                                                            {s} {isActive && <Check size={14} strokeWidth={3} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                                    <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>{isCook ? "Enregistrer le profil" : "Enregistrer les modifications"}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isCook && activeTab === "availability" && (
                        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                            <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 8px 0", color: "var(--text-heading)" }}>
                                Votre planning
                            </h2>
                            <p style={{ margin: "0 0 24px 0", color: "var(--text-muted)", fontSize: "15px" }}>
                                Sélectionnez les jours de la semaine où vous êtes généralement disponible pour accepter des réservations. Les familles ne pourront demander que ces jours-là.
                            </p>

                            <StatusBanner status={scheduleStatus} />

                            <form action={async (formData) => {
                                setScheduleStatus(null);
                                formData.append("availableDays", JSON.stringify(availableDays));
                                const res = await updateCookAvailability(formData);
                                if (res?.error) {
                                    setScheduleStatus({ type: "error", text: res.error });
                                } else {
                                    setScheduleStatus({ type: "success", text: "Planning enregistré." });
                                    router.refresh();
                                }
                            }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {DAYS_OF_WEEK.map(day => {
                                        const isAvailable = availableDays.includes(day);
                                        return (
                                            <div
                                                key={day}
                                                onClick={() => toggleDay(day)}
                                                style={{
                                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                                    padding: "16px 20px", borderRadius: "12px",
                                                    border: `1.5px solid ${isAvailable ? "var(--brand-primary)" : "var(--border-medium)"}`,
                                                    backgroundColor: isAvailable ? "rgba(244, 193, 47, 0.05)" : "var(--bg-base)",
                                                    cursor: "pointer", transition: "all 0.2s ease"
                                                }}
                                            >
                                                <span style={{ fontSize: "16px", fontWeight: isAvailable ? 700 : 600, color: isAvailable ? "var(--brand-primary)" : "var(--text-body)" }}>
                                                    {dayFr(day)}
                                                </span>
                                                <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${isAvailable ? "var(--brand-primary)" : "var(--border-medium)"}`, backgroundColor: isAvailable ? "var(--brand-primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    {isAvailable && <Check size={14} color="white" strokeWidth={3} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", paddingTop: "24px", borderTop: "1px solid var(--border-light)" }}>
                                    <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>Enregistrer le planning</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="card" style={{ padding: "32px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-light)", animation: "fadeIn 0.2s ease" }}>
                            <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 24px 0", color: "var(--text-heading)" }}>Sécurité et mot de passe</h2>

                            <StatusBanner status={passwordStatus} />

                            <form action={async (formData) => {
                                setPasswordStatus(null);
                                const res = await updatePassword(formData);
                                if (res?.error) {
                                    setPasswordStatus({ type: "error", text: res.error });
                                } else {
                                    setPasswordStatus({ type: "success", text: "Mot de passe mis à jour." });
                                }
                            }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ maxWidth: "400px" }}>
                                    <label style={{ display: "block", fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--text-heading)" }}>Nouveau mot de passe</label>
                                    <input name="newPassword" type="password" required minLength={6} placeholder="Saisissez un nouveau mot de passe" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-base)", color: "var(--text-body)" }} />
                                    <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Doit contenir au moins 6 caractères.</p>
                                </div>

                                <div style={{ marginTop: "8px" }}>
                                    <button type="submit" className="btn-primary" style={{ padding: "12px 24px" }}>Mettre à jour le mot de passe</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
