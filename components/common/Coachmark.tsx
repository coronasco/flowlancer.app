"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Coachmark: unobtrusive tip bubble.
 * Usage:
 * <Coachmark title="Complete your profile" onDismiss={() => setStep(1)}>Open Profile to finish setup.</Coachmark>
 */
export function Coachmark({
    title,
    children,
    onDismiss,
    className,
}: {
    title: string;
    children?: ReactNode;
    onDismiss: () => void;
    className?: string;
}) {
    return (
        <div
            role="dialog"
            aria-label={title}
            className={cn(
                "fixed bottom-6 right-6 z-[60] w-[min(90vw,320px)] rounded-[var(--radius-lg)] border border-black/10 bg-white shadow-[var(--shadow-lg)] p-4",
                className
            )}
        >
            <p className="text-sm font-medium mb-1.5">{title}</p>
            {children && <p className="text-sm text-foreground/70">{children}</p>}
            <div className="mt-3 flex justify-end">
                <button
                    onClick={onDismiss}
                    className="inline-flex h-8 px-3 items-center justify-center rounded-[var(--radius-sm)] text-sm border border-black/10 bg-white hover:bg-black/5 focus:outline-none brand-ring"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}


