"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className="nav-link"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "100%",
                borderBottom: isActive ? "2px solid var(--brand-primary)" : "2px solid transparent",
                color: isActive ? "var(--text-heading)" : "var(--text-body)"
            }}
        >
            {children}
        </Link>
    );
}
