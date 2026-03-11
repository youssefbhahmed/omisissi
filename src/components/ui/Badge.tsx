"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "success" | "warning" | "neutral" | "accent";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
    primary: "bg-primary-100 text-primary-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    neutral: "bg-neutral-100 text-neutral-600",
    accent: "bg-accent-100 text-accent-700",
};

const dotColorMap: Record<BadgeVariant, string> = {
    primary: "bg-primary-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    neutral: "bg-neutral-400",
    accent: "bg-accent-500",
};

export default function Badge({
    children,
    variant = "primary",
    dot = false,
    className,
}: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                variantMap[variant],
                className
            )}
        >
            {dot && (
                <span className={cn("w-1.5 h-1.5 rounded-full", dotColorMap[variant])} />
            )}
            {children}
        </span>
    );
}
