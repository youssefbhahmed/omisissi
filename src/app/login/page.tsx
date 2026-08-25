import React from "react";
import LoginClient from "./LoginClient";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams;
    return (
        <LoginClient
            initialError={error === "oauth" ? "Social sign-in didn't complete. Please try again." : null}
        />
    );
}
