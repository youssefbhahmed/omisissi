"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring } from "motion/react";

/** Thin saffron progress bar pinned above everything, driven by page scroll. */
export function ScrollProgressBar() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });
    return (
        <motion.div
            aria-hidden="true"
            style={{
                scaleX,
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "var(--brand-primary)",
                transformOrigin: "0 50%",
                zIndex: 90,
            }}
        />
    );
}

/** Magnetic wrapper: the child is gently pulled toward the cursor and springs
 *  back on leave. Wrap a button or link; inline-block so layout is untouched. */
export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 });

    return (
        <motion.div
            ref={ref}
            style={{ x: sx, y: sy, display: "inline-block" }}
            onPointerMove={(e) => {
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                x.set((e.clientX - r.x - r.width / 2) * strength);
                y.set((e.clientY - r.y - r.height / 2) * strength);
            }}
            onPointerLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            {children}
        </motion.div>
    );
}
