"use client";

import React from "react";
import { cn, getInitials } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    badge?: "online" | "verified" | "none";
    className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
};

const badgeSizeMap: Record<AvatarSize, string> = {
    xs: "w-2.5 h-2.5 border",
    sm: "w-3 h-3 border-2",
    md: "w-3.5 h-3.5 border-2",
    lg: "w-4 h-4 border-2",
    xl: "w-5 h-5 border-2",
};

export default function Avatar({
    src,
    alt = "",
    name,
    size = "md",
    badge = "none",
    className,
}: AvatarProps) {
    const initials = name ? getInitials(name) : "?";

    return (
        <div className={cn("relative inline-flex shrink-0", className)}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name || "Avatar"}
                    className={cn(
                        sizeMap[size],
                        "rounded-full object-cover ring-2 ring-white"
                    )}
                />
            ) : (
                <div
                    className={cn(
                        sizeMap[size],
                        "rounded-full flex items-center justify-center font-semibold",
                        "bg-gradient-to-br from-primary-400 to-primary-600 text-white ring-2 ring-white"
                    )}
                >
                    {initials}
                </div>
            )}

            {badge === "online" && (
                <span
                    className={cn(
                        badgeSizeMap[size],
                        "absolute bottom-0 right-0 rounded-full bg-green-500 border-white"
                    )}
                />
            )}
            {badge === "verified" && (
                <span
                    className={cn(
                        badgeSizeMap[size],
                        "absolute -bottom-0.5 -right-0.5 rounded-full bg-primary-500 border-white flex items-center justify-center"
                    )}
                >
                    <svg
                        viewBox="0 0 12 12"
                        fill="none"
                        className="w-2/3 h-2/3"
                    >
                        <path
                            d="M3.5 6L5.5 8L8.5 4"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            )}
        </div>
    );
}
