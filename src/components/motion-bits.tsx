"use client";

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring } from "motion/react";

/** Generic viewport reveal: fades and rises with a spring when scrolled into
 *  view. Client component, safe to drop inside server pages. */
export function Reveal({ children, delay = 0, y = 40 }: { children: React.ReactNode; delay?: number; y?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 100, damping: 17, delay }}
        >
            {children}
        </motion.div>
    );
}

/** 3D tilt with a moving glare: the card leans toward the cursor like a
 *  physical card and a soft light sweep follows the pointer. */
export function TiltCard({ children, max = 7 }: { children: React.ReactNode; max?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const srx = useSpring(rx, { stiffness: 200, damping: 20 });
    const sry = useSpring(ry, { stiffness: 200, damping: 20 });
    const gx = useMotionValue(50);
    const gy = useMotionValue(50);
    const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.16), transparent 62%)`;

    return (
        <motion.div
            ref={ref}
            style={{ rotateX: srx, rotateY: sry, transformPerspective: 900, position: "relative" }}
            onPointerMove={(e) => {
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                const px = (e.clientX - r.x) / r.width;
                const py = (e.clientY - r.y) / r.height;
                ry.set((px - 0.5) * 2 * max);
                rx.set(-(py - 0.5) * 2 * max);
                gx.set(px * 100);
                gy.set(py * 100);
            }}
            onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
            }}
        >
            {children}
            <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: glare, pointerEvents: "none", borderRadius: "24px", opacity: 0.9 }} />
        </motion.div>
    );
}

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
