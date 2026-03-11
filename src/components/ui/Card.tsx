"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    variant?: "elevated" | "flat" | "glass" | "outlined";
    padding?: "none" | "sm" | "md" | "lg";
    hoverable?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const variantMap: Record<string, string> = {
    elevated: "bg-white rounded-2xl shadow-lg border border-neutral-100",
    flat: "bg-neutral-50 rounded-2xl border border-transparent",
    glass: "glass rounded-2xl",
    outlined: "bg-white rounded-2xl border border-neutral-200",
};

const paddingMap: Record<string, string> = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
};

export default function Card({
    children,
    variant = "elevated",
    padding = "md",
    hoverable = false,
    className,
    style,
    onClick,
}: CardProps) {
    return (
        <div
            className={cn(
                variantMap[variant],
                paddingMap[padding],
                "transition-all duration-300 ease-out",
                hoverable ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : undefined,
                onClick ? "cursor-pointer" : undefined,
                className
            )}
            style={style}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}
