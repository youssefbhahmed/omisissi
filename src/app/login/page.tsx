import React from "react";
import LoginClient from "./LoginClient";

// Only ever redirect to a local path — never to an absolute/protocol-relative
// URL someone pasted into the query string.
function safeNext(next: string | undefined): string | null {
    if (next && next.startsWith("/") && !next.startsWith("//")) return next;
    return null;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
    const { error, next } = await searchParams;
    return (
        <LoginClient
            initialError={error === "oauth" ? "La connexion via un réseau social n’a pas abouti. Veuillez réessayer." : null}
            next={safeNext(next)}
        />
    );
}
