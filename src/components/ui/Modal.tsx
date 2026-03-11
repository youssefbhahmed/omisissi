"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "full";
    className?: string;
}

const sizeMap: Record<string, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-full mx-4",
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    className,
}: ModalProps) {
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Container — slides up on mobile, scales in on desktop */}
            <div
                className={cn(
                    "relative z-10 w-full bg-white shadow-2xl",
                    "sm:rounded-2xl rounded-t-3xl",
                    "animate-fade-in-up sm:animate-scale-in",
                    "max-h-[90dvh] overflow-y-auto",
                    sizeMap[size],
                    className
                )}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 pt-6 pb-2">
                        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 pb-6 pt-2">{children}</div>
            </div>
        </div>
    );
}
