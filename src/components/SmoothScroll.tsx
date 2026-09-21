"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Inertial smooth scrolling (the "rou7" of the restaurant sites this design
// borrows from). Mounted on the marketing pages only — dashboards keep the
// native feel. anchors:true makes the #section nav links glide too.
export default function SmoothScroll() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.6,
            anchors: true,
        });

        let rafId = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return null;
}
