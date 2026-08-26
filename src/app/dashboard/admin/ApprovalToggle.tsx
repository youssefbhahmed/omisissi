"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { setCookApproval } from "@/app/actions/admin";

export default function ApprovalToggle({ cookId, isApproved }: { cookId: string; isApproved: boolean }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function toggle() {
        setBusy(true);
        try {
            const formData = new FormData();
            formData.append("cookId", cookId);
            formData.append("approved", (!isApproved).toString());
            const res = await setCookApproval(formData);
            if ("error" in res) {
                alert(res.error);
            } else {
                router.refresh();
            }
        } finally {
            setBusy(false);
        }
    }

    return isApproved ? (
        <button onClick={toggle} disabled={busy} className="btn-nav" style={{ padding: "10px 18px", border: "1px solid var(--border-medium)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px", opacity: busy ? 0.6 : 1 }}>
            <X size={16} /> {busy ? "En cours…" : "Révoquer"}
        </button>
    ) : (
        <button onClick={toggle} disabled={busy} className="btn-primary" style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: "8px", opacity: busy ? 0.6 : 1 }}>
            <Check size={16} /> {busy ? "En cours…" : "Approuver"}
        </button>
    );
}
