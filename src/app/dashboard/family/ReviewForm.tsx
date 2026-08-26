"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";

export default function ReviewForm({ bookingId, cookName }: { bookingId: string; cookName: string }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (rating < 1) {
            setError("Veuillez d’abord choisir une note.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("bookingId", bookingId);
            formData.append("rating", rating.toString());
            formData.append("comment", comment);
            const res = await submitReview(formData);
            if (res.error) {
                setError(res.error);
            } else {
                setIsOpen(false);
                router.refresh();
            }
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary"
                style={{ padding: "10px 20px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
                <Star size={16} /> Noter ce repas
            </button>
        );
    }

    return (
        <div style={{ padding: "16px", borderRadius: "12px", border: "1.5px solid var(--brand-primary)", backgroundColor: "rgba(235, 171, 33, 0.05)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-heading)" }}>
                Comment était le repas avec {cookName} ?
            </div>

            <div style={{ display: "flex", gap: "6px" }} onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHovered(n)}
                        aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                    >
                        <Star
                            size={28}
                            fill={n <= (hovered || rating) ? "var(--brand-primary)" : "transparent"}
                            color={n <= (hovered || rating) ? "var(--brand-primary)" : "var(--border-medium)"}
                        />
                    </button>
                ))}
            </div>

            <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Parlez aux autres familles de la cuisine, de la ponctualité, de l’expérience… (facultatif)"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-medium)", backgroundColor: "var(--bg-surface)", color: "var(--text-body)", fontSize: "14px", resize: "vertical" }}
            />

            {error && (
                <div style={{ fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="btn-nav"
                    style={{ padding: "10px 18px", border: "1px solid var(--border-medium)", borderRadius: "10px" }}
                >
                    Annuler
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ padding: "10px 24px", fontSize: "14px" }}
                >
                    {isSubmitting ? "Envoi…" : "Envoyer l’avis"}
                </button>
            </div>
        </div>
    );
}
