"use client";

import { Clock } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "This feature is on its way. We're working hard to bring it to you.",
  icon,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-5 p-4 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] inline-flex text-[var(--color-accent)]">
        {icon ?? (
          <Clock size={32} className="text-[var(--color-accent)]" />
        )}
      </div>
      <h2
        className="text-xl font-semibold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
    </div>
  );
}
