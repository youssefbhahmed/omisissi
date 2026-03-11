"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700 hover:shadow-lg active:from-primary-700 active:to-primary-800",
    secondary:
        "bg-neutral-800 text-white shadow-md hover:bg-neutral-700 active:bg-neutral-900",
    outline:
        "bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100",
    ghost:
        "bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
    danger:
        "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md hover:from-accent-600 hover:to-accent-700",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-sm rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    xl: "px-8 py-4 text-lg rounded-2xl gap-3",
};

export default function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                "disabled:opacity-50 disabled:pointer-events-none",
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && "w-full",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </button>
    );
}
