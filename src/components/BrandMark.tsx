import React from "react";

// The ladybug-and-chili mark, theme-aware: the light-background variant shows
// by default and the dark-background variant takes over under
// html[data-theme="dark"] (see the .logo-when-* rules in globals.css).
// Server-safe: no hooks, just CSS-driven swapping.
export default function BrandMark({ size = 36, style }: { size?: number; style?: React.CSSProperties }) {
    const common: React.CSSProperties = { width: `${size}px`, height: `${size}px`, objectFit: "contain", ...style };
    return (
        <>
            <img src="/brand/ommi-sissi-icon-light.svg" alt="Ommi Sissi" className="logo-when-light" style={common} />
            <img src="/brand/ommi-sissi-icon-dark.svg" alt="" aria-hidden="true" className="logo-when-dark" style={common} />
        </>
    );
}
