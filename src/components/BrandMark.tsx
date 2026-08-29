import React from "react";

// The "no tagline" brand lockup (ladybug-fork mark + MMI Sissi), theme-aware:
// the light-background variant shows by default and the dark-background
// variant takes over under html[data-theme="dark"] (see the .logo-when-*
// rules in globals.css). Rendered at its natural aspect ratio — fixed height,
// auto width — so the mark fills the bar without letterboxing.
// Server-safe: no hooks, just CSS-driven swapping.
export default function BrandMark({ size = 44, style }: { size?: number; style?: React.CSSProperties }) {
    const common: React.CSSProperties = { height: `${size}px`, width: "auto", ...style };
    return (
        <>
            <img src="/brand/ommi-sissi-header-light.svg" alt="Ommi Sissi" className="logo-when-light" style={common} />
            <img src="/brand/ommi-sissi-header-dark.svg" alt="" aria-hidden="true" className="logo-when-dark" style={common} />
        </>
    );
}
