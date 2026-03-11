"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Input({
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    className,
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-neutral-700"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                        {leftIcon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={cn(
                        "w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400",
                        "transition-all duration-200 ease-out",
                        "border-neutral-200 hover:border-neutral-300",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500",
                        error ? "border-accent-500 focus:ring-accent-500/30 focus:border-accent-500" : undefined,
                        leftIcon ? "pl-11" : undefined,
                        rightIcon ? "pr-11" : undefined,
                        className
                    )}
                    {...props}
                />
                {rightIcon && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                        {rightIcon}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-accent-500 mt-0.5">{error}</p>}
            {!error && helperText && (
                <p className="text-xs text-neutral-400 mt-0.5">{helperText}</p>
            )}
        </div>
    );
}
