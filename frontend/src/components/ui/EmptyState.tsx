"use client";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "Nothing here yet",
  description = "Content will appear here once it's available.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="mb-5 p-4 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] inline-flex text-[var(--color-accent)]">
          {icon}
        </div>
      )}
      <h2
        className="text-xl font-semibold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
