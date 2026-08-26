"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, XCircle, MapPin, Calendar, AlertCircle, Phone } from "lucide-react";
import { updateBookingStatus } from "../../../actions/booking";
import type { BookingListItem } from "@/lib/types";
import { statusFr } from "@/lib/labels";

export default function BookingsClient({ pendingRequests, otherBookings }: { pendingRequests: BookingListItem[], otherBookings: BookingListItem[] }) {
    const router = useRouter();
    const [actioningId, setActioningId] = useState<string | null>(null);

    const handleStatusUpdate = async (bookingId: string, newStatus: "accepted" | "declined" | "completed") => {
        setActioningId(bookingId);
        try {
            const formData = new FormData();
            formData.append("bookingId", bookingId);
            formData.append("status", newStatus);

            const res = await updateBookingStatus(formData);

            if ("error" in res) {
                alert(res.error);
            } else {
                router.refresh();
            }
        } catch {
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setActioningId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return { bg: "rgba(235, 171, 33, 0.1)", color: "var(--brand-primary)" };
            case "accepted": return { bg: "rgba(34, 197, 94, 0.1)", color: "var(--brand-success)" };
            case "declined": case "cancelled": return { bg: "rgba(239, 68, 68, 0.1)", color: "var(--danger)" };
            case "completed": return { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" };
            default: return { bg: "var(--bg-subtle)", color: "var(--text-muted)" };
        }
    };

    const StatusIcon = ({ status }: { status: string }) => {
        switch (status) {
            case "pending": return <Clock size={16} />;
            case "accepted": case "completed": return <CheckCircle size={16} />;
            case "declined": case "cancelled": return <XCircle size={16} />;
            default: return null;
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>

            {/* 1. Pending Requests */}
            {pendingRequests.length > 0 && (
                <section>
                    <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 16px 0", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                        <AlertCircle color="var(--brand-primary)" /> Action requise ({pendingRequests.length})
                    </h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                        {pendingRequests.map(req => {
                            const familyName = req.partner?.full_name || "Famille";
                            const familyAvatar = req.partner?.avatar_url || "/hero-tunisian-food-1.png";

                            return (
                                <div key={req.id} className="card" style={{ padding: "24px", backgroundColor: "var(--bg-surface)", border: "2px solid rgba(235, 171, 33, 0.3)", position: "relative" }}>
                                    <div style={{ position: "absolute", top: "24px", right: "24px", backgroundColor: "rgba(235, 171, 33, 0.1)", color: "var(--brand-primary)", padding: "4px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                                        Nouvelle demande
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden" }}>
                                            <img src={familyAvatar} alt={familyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 2px 0", fontWeight: 700, fontSize: "16px", color: "var(--text-heading)" }}>{familyName}</h3>
                                            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Demandée le {new Date(req.created_at).toLocaleDateString("fr-FR")}</div>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: "var(--bg-base)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-light)", marginBottom: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontWeight: 600, color: "var(--text-heading)" }}>
                                            <Calendar size={16} color="var(--brand-primary)" />
                                            {new Date(req.scheduled_date).toLocaleDateString("fr-FR")} &middot; {req.scheduled_time?.slice(0, 5)}
                                            {Number(req.duration_hours) > 0 && ` (${req.duration_hours}h)`}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontSize: "14px", color: "var(--text-body)" }}>
                                            <MapPin size={16} color="var(--text-muted)" />
                                            {req.location === "client_home" ? "Domicile de la famille" : "À emporter (chez vous)"}
                                            {req.guests && (
                                                <span style={{ marginLeft: "auto", fontSize: "13px", fontWeight: 600, color: "var(--brand-primary)" }}>
                                                    👥 {req.guests} convives
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ paddingTop: "12px", borderTop: "1px dashed var(--border-medium)" }}>
                                            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-heading)", marginBottom: "4px" }}>Commande :</div>
                                            {req.menu ? (
                                                <div style={{ fontSize: "14px", color: "var(--text-body)" }}>Menu : <span style={{ fontWeight: 600 }}>{req.menu.name}</span></div>
                                            ) : req.dishes && req.dishes.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-body)", fontSize: "14px" }}>
                                                    {req.dishes.map((d) => (
                                                        <li key={d.dish_id}>{d.quantity}x {d.dish?.name}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Aucun plat spécifique</div>
                                            )}
                                        </div>

                                        {req.notes && (
                                            <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "rgba(235, 171, 33, 0.05)", borderRadius: "8px", borderLeft: "2px solid var(--brand-primary)", fontSize: "13px" }}>
                                                <strong>Notes :</strong> {req.notes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Revenus estimés</div>
                                        <div style={{ fontWeight: 800, fontSize: "20px", color: "var(--brand-primary)" }}>{req.total_price} <span style={{ fontSize: "14px" }}>TND</span></div>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, "declined")}
                                            disabled={actioningId === req.id}
                                            className="btn-nav"
                                            style={{ flex: 1, padding: "12px", border: "1px solid var(--border-medium)", color: "var(--danger)" }}
                                        >
                                            Refuser
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(req.id, "accepted")}
                                            disabled={actioningId === req.id}
                                            style={{ flex: 1, padding: "12px", backgroundColor: "var(--brand-success)", color: "white", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer" }}
                                        >
                                            {actioningId === req.id ? "..." : "Accepter"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 2. Scheduled / Past Bookings */}
            <section>
                <h2 className="heading-font" style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 16px 0", color: "var(--text-heading)", opacity: pendingRequests.length === 0 ? 1 : 0.6 }}>
                    Repas confirmés et passés
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {otherBookings.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Aucune réservation confirmée pour le moment.</p>
                    ) : (
                        otherBookings.map(booking => {
                            const sColor = getStatusColor(booking.status);
                            const familyName = booking.partner?.full_name || "Famille";

                            return (
                                <div key={booking.id} className="card flex flex-col md:flex-row gap-4 items-start md:items-center md:justify-between" style={{ padding: "20px", backgroundColor: "var(--bg-base)", border: "1px solid var(--border-light)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "16px", color: "var(--text-heading)" }}>{familyName}</h3>
                                            <div style={{ fontSize: "13px", color: "var(--text-body)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                {new Date(booking.scheduled_date).toLocaleDateString("fr-FR")} à {booking.scheduled_time?.slice(0, 5)}
                                                <span style={{ color: "var(--border-medium)" }}>•</span>
                                                {booking.menu ? booking.menu.name : (booking.dishes && booking.dishes.length > 0 ? `${booking.dishes.length} plats` : "Temps de cuisine uniquement")}
                                                {(booking.status === "accepted" || booking.status === "in_progress") && booking.partner_phone && (
                                                    <>
                                                        <span style={{ color: "var(--border-medium)" }}>•</span>
                                                        <a href={`tel:${booking.partner_phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 700, color: "var(--brand-success)", textDecoration: "none" }}>
                                                            <Phone size={13} /> {booking.partner_phone}
                                                        </a>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <div style={{ textAlign: "right" }} className="hidden md:block">
                                            <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-heading)" }}>{booking.total_price} TND</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Revenus totaux</div>
                                        </div>
                                        {booking.status === "accepted" && (
                                            <button
                                                onClick={() => handleStatusUpdate(booking.id, "completed")}
                                                disabled={actioningId === booking.id}
                                                className="btn-nav"
                                                style={{ padding: "8px 14px", border: "1px solid var(--border-medium)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: "var(--brand-success)", cursor: "pointer" }}
                                            >
                                                {actioningId === booking.id ? "..." : "Marquer terminée"}
                                            </button>
                                        )}
                                        <div style={{
                                            backgroundColor: sColor.bg, color: sColor.color,
                                            padding: "6px 12px", borderRadius: "99px",
                                            fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                                            display: "flex", alignItems: "center", gap: "4px", minWidth: "110px", justifyContent: "center"
                                        }}>
                                            <StatusIcon status={booking.status} /> {statusFr(booking.status)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
}
