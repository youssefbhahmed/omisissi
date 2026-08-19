"use client";

import { useEffect } from "react";

// Registers the service worker that makes the app installable and provides
// the offline fallback. Renders nothing.
export default function PwaRegister() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/sw.js").catch((err) => {
            console.error("Service worker registration failed:", err);
        });
    }, []);

    return null;
}
