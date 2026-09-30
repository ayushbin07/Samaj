"use client";

import React from "react";
import { Blobatar as BlobatarRenderer } from "@blobatar/react";
import { thinking } from "blobatar/expression";
import "blobatar/motion.css";
import { useSafeAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export interface BlobSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  showDots?: boolean;
}

const SIZES = {
  sm: {
    container: "w-7 h-7",
    dots: false,
    glow: false,
  },
  md: {
    container: "w-12 h-12",
    dots: true,
    glow: true,
  },
  lg: {
    container: "w-20 h-20",
    dots: true,
    glow: true,
  },
  xl: {
    container: "w-28 h-28",
    dots: true,
    glow: true,
  },
} as const;

export function BlobSpinner({
  size = "md",
  className,
  label,
  showDots,
}: BlobSpinnerProps) {
  const auth = useSafeAuth();
  const user = auth?.user;

  const identity = (
    user?._id ??
    (user as any)?.id ??
    user?.username ??
    "thinking-blob"
  ).toString();

  const userBlob = user?.blobatar || {};
  const config = SIZES[size] || SIZES.md;
  const shouldShowDots = showDots ?? config.dots;

  return (
    <div
      role="status"
      aria-label={label || "Loading..."}
      className={cn(
        "inline-flex flex-col items-center justify-center select-none relative",
        className
      )}
    >
      <div className={cn("relative flex items-center justify-center", config.container)}>
        {/* Soft atmospheric ambient glow */}
        {config.glow && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-[var(--color-accent)]/15 blur-xl animate-pulse"
          />
        )}

        {/* Floating thought dots */}
        {shouldShowDots && (
          <div
            aria-hidden="true"
            className="absolute -top-2.5 -right-1.5 flex items-center gap-0.5 z-10 pointer-events-none"
          >
            <span className="size-1 rounded-full bg-[var(--color-accent)] animate-bounce [animation-delay:-0.32s] opacity-75" />
            <span className="size-1.5 rounded-full bg-[var(--color-accent)] animate-bounce [animation-delay:-0.16s] opacity-90" />
            <span className="size-2 rounded-full bg-[var(--color-accent)] animate-bounce shadow-sm" />
          </div>
        )}

        {/* The User Blob in Thinking Expression */}
        <div className="size-full overflow-hidden rounded-full flex items-center justify-center transition-transform duration-300">
          <BlobatarRenderer
            name={identity}
            hue={userBlob.hue}
            tone={userBlob.tone}
            traits={userBlob.traits as any}
            palette={userBlob.palette as any}
            expression={thinking}
            animate="always"
            className="size-full select-none"
          />
        </div>
      </div>

      {label && (
        <span className="mt-2.5 text-xs font-medium text-[var(--color-text-tertiary)] animate-pulse">
          {label}
        </span>
      )}

      <span className="sr-only">{label || "Loading..."}</span>
    </div>
  );
}

/** Export as default and named Spinner replacement */
export { BlobSpinner as Spinner };
