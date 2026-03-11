"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | null>(null);

    useEffect(() => {
        setMounted(true);
        const savedTheme = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
        setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };

    if (!mounted) {
        return <div style={{ width: "36px", height: "36px" }} />;
    }

    return (
        <button
            onClick={toggleTheme}
            style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--border-medium)",
                background: "var(--bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
            }}
            aria-label="Toggle theme"
        >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} color="var(--brand-primary)" />}
        </button>
    );
}
