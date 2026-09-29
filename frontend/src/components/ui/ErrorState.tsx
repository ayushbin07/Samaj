"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./index";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-5 p-4 rounded-full bg-red-500/10 border border-red-500/20 inline-flex">
        <AlertTriangle size={32} className="text-red-400" />
      </div>
      <h2
        className="text-xl font-semibold text-[var(--color-text-primary)] mb-2"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mb-6">
        {description}
      </p>
      {onRetry && (
        <Button
          size="sm"
          color="primary"
          variant="solid"
          onPress={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
