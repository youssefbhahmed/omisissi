"use client";

import React from "react";
import { cn, getStarArray } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
    reviewCount?: number;
    className?: string;
}

const sizeMap: Record<string, string> = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
};

export default function StarRating({
    rating,
    size = "md",
    showValue = true,
    reviewCount,
    className,
}: StarRatingProps) {
    const stars = getStarArray(rating);

    return (
        <div className={cn("inline-flex items-center gap-1", className)}>
            <div className="flex items-center gap-0.5">
                {stars.map((type, i) => (
                    <svg
                        key={i}
                        viewBox="0 0 20 20"
                        className={cn(sizeMap[size])}
                    >
                        {type === "full" && (
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                fill="#F97316"
                            />
                        )}
                        {type === "half" && (
                            <>
                                <defs>
                                    <linearGradient id={`half-${i}`}>
                                        <stop offset="50%" stopColor="#F97316" />
                                        <stop offset="50%" stopColor="#E7E5E4" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    fill={`url(#half-${i})`}
                                />
                            </>
                        )}
                        {type === "empty" && (
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                fill="#E7E5E4"
                            />
                        )}
                    </svg>
                ))}
            </div>
            {showValue && (
                <span className="text-sm font-semibold text-neutral-800 ml-0.5">
                    {rating.toFixed(1)}
                </span>
            )}
            {reviewCount !== undefined && (
                <span className="text-xs text-neutral-400">({reviewCount})</span>
            )}
        </div>
    );
}
