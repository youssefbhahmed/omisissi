"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/booking";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (!confirm("Annuler cette demande de réservation ?")) return;

        setIsCancelling(true);
        try {
            const formData = new FormData();
            formData.append("bookingId", bookingId);
            formData.append("status", "cancelled");
            const res = await updateBookingStatus(formData);
            if ("error" in res) {
                alert(res.error);
            } else {
                router.refresh();
            }
        } catch {
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="btn-nav"
            style={{ padding: "8px 16px", border: "1px solid var(--border-medium)", color: "var(--danger)", fontSize: "13px", fontWeight: 600, borderRadius: "10px", cursor: "pointer" }}
        >
            {isCancelling ? "Annulation…" : "Annuler la demande"}
        </button>
    );
}
