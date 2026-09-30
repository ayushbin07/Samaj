"use client";

/**
 * UI components styled for Obsidian + Champagne Cinematic Dark design system.
 * Implements the rounded design language (HeroUI rounded options: full pill controls,
 * rounded-2xl medium cards, rounded-3xl large surfaces).
 */

import React from "react";
import { Tooltip as HTooltip } from "@heroui/react";
import clsx from "clsx";
import { triggerHaptic, type HapticPreset } from "@/lib/haptics";
import { Blobatar } from "@/components/ui/blobatar";
import { BlobSpinner, type BlobSpinnerProps } from "./blob-spinner";
import "blobatar/motion.css";

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: () => void;
  onPress?: () => void;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  isDisabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "flat" | "ghost" | "light";
  color?: "default" | "primary" | "secondary" | "danger" | "success";
  radius?: "full" | "lg" | "md" | "sm" | "none";
  isIconOnly?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  title?: string;
  haptic?: HapticPreset | boolean;
}

export function Button({
  children,
  onClick,
  onPress,
  type = "button",
  isLoading,
  isDisabled,
  size = "md",
  variant = "solid",
  color = "default",
  radius = "full",
  isIconOnly,
  startContent,
  endContent,
  className,
  "aria-label": ariaLabel,
  title,
  haptic,
  ...rest
}: ButtonProps) {
  const sizeClass = {
    sm: "h-8 px-3.5 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-11 px-6 text-sm gap-2.5",
  }[size];

  const radiusClass = {
    full: "rounded-full",
    lg: "rounded-2xl",
    md: "rounded-xl",
    sm: "rounded-lg",
    none: "rounded-none",
  }[radius];

  let variantClass = "";
  if (color === "primary" && variant === "solid") {
    variantClass =
      "bg-[var(--color-accent)] text-[#09090B] font-semibold hover:bg-[var(--color-accent-hover)] shadow-sm active:scale-[0.98]";
  } else if (color === "danger" && variant === "solid") {
    variantClass =
      "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25";
  } else {
    variantClass = {
      solid:
        "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
      bordered:
        "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] bg-transparent",
      flat: "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
      ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]",
      light:
        "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
    }[variant];
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic !== false) {
      triggerHaptic(typeof haptic === "string" ? haptic : "tap");
    }
    const handler = onClick ?? onPress;
    handler?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled ?? isLoading}
      aria-label={ariaLabel}
      title={title}
      className={clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.99]",
        radiusClass,
        isIconOnly ? "!px-0 aspect-square" : sizeClass,
        variantClass,
        (isDisabled ?? isLoading) && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : startContent ? (
        startContent
      ) : null}
      {!isIconOnly && children}
      {isIconOnly && !isLoading && children}
      {!isLoading && endContent}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
export interface InputProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isRequired?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  radius?: "full" | "lg" | "md";
  classNames?: {
    label?: string;
    inputWrapper?: string;
    input?: string;
  };
}

export function Input({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  onChange,
  type = "text",
  isRequired,
  startContent,
  endContent,
  className,
  radius = "full",
  classNames,
}: InputProps) {
  const radiusClass = radius === "full" ? "rounded-full" : radius === "lg" ? "rounded-2xl" : "rounded-xl";

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "text-xs font-medium text-[var(--color-text-secondary)] pl-1",
            classNames?.label
          )}
        >
          {label}
          {isRequired && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={clsx(
          "flex items-center gap-2.5 h-10 px-4 border border-[var(--color-border)] bg-[var(--color-surface-2)] focus-within:border-[var(--color-accent)] hover:border-[var(--color-border-hover)] transition-all",
          radiusClass,
          classNames?.inputWrapper
        )}
      >
        {startContent}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          required={isRequired}
          onChange={
            onChange ??
            ((e) => onValueChange?.(e.target.value))
          }
          style={{ outline: "none", boxShadow: "none" }}
          className={clsx(
            "flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none",
            classNames?.input
          )}
        />
        {endContent}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextArea
// ---------------------------------------------------------------------------
export interface TextAreaProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  isRequired?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  classNames?: {
    label?: string;
    inputWrapper?: string;
    input?: string;
  };
}

export function TextArea({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  onKeyDown,
  isRequired,
  minRows = 3,
  maxLength,
  classNames,
}: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "text-xs font-medium text-[var(--color-text-secondary)] pl-1",
            classNames?.label
          )}
        >
          {label}
          {isRequired && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={clsx(
          "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] focus-within:border-[var(--color-accent)] hover:border-[var(--color-border-hover)] transition-colors p-3",
          classNames?.inputWrapper
        )}
      >
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          required={isRequired}
          maxLength={maxLength}
          rows={minRows}
          onChange={(e) => onValueChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          style={{ outline: "none", boxShadow: "none" }}
          className={clsx(
            "w-full bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] border-0 border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none resize-none",
            classNames?.input
          )}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Spinner (User Blob in Thinking Animation)
// ---------------------------------------------------------------------------
export type SpinnerProps = BlobSpinnerProps;
export { BlobSpinner, BlobSpinner as Spinner } from "./blob-spinner";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-[var(--color-surface-2)] rounded-2xl",
        className
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Chip
// ---------------------------------------------------------------------------
export interface ChipProps {
  children: React.ReactNode;
  size?: "sm" | "md";
  color?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  variant?: "flat" | "solid" | "bordered";
  className?: string;
}

export function Chip({
  children,
  size = "sm",
  color = "default",
  variant = "flat",
  className,
}: ChipProps) {
  let colorClass = "";
  if (variant === "bordered") {
    colorClass = {
      default: "border border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent",
      primary: "border border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent",
      success: "border border-emerald-500/30 text-emerald-400 bg-transparent",
      warning: "border border-amber-500/30 text-amber-400 bg-transparent",
      danger: "border border-red-500/30 text-red-400 bg-transparent",
      info: "border border-blue-500/30 text-blue-400 bg-transparent",
    }[color];
  } else if (variant === "solid") {
    colorClass = {
      default: "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]",
      primary: "bg-[var(--color-accent)] text-[#09090B] font-semibold",
      success: "bg-emerald-500 text-black font-semibold",
      warning: "bg-amber-500 text-black font-semibold",
      danger: "bg-red-500 text-white font-semibold",
      info: "bg-blue-500 text-white font-semibold",
    }[color];
  } else {
    // flat (default)
    colorClass = {
      default: "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)]",
      primary: "bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-[var(--color-accent)]",
      success: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
      warning: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
      danger: "bg-red-500/10 border border-red-500/20 text-red-400",
      info: "bg-blue-500/10 border border-blue-500/20 text-blue-400",
    }[color];
  }

  const sizeClass = {
    sm: "text-xs px-3 py-0.5",
    md: "text-sm px-4 py-1",
  }[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full font-medium transition-colors",
        sizeClass,
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tooltip — using HeroUI v3 Tooltip
// ---------------------------------------------------------------------------
export function Tooltip({
  children,
  content,
  placement = "top",
}: {
  children: React.ReactElement;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <HTooltip>
      <HTooltip.Trigger>{children}</HTooltip.Trigger>
      <HTooltip.Content
        placement={placement}
        className="rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] px-3 py-1.5 shadow-xl"
      >
        {content}
      </HTooltip.Content>
    </HTooltip>
  );
}

// ---------------------------------------------------------------------------
// Avatar & Blobatar System
// ---------------------------------------------------------------------------
export type { BlobatarProps } from "./blobatar";
export { Blobatar } from "./blobatar";
export { UserAvatar, BLOBATAR_EXPRESSIONS, isValidUploadedAvatar } from "./user-avatar";
export type { UserAvatarProps, ExpressionKey } from "./user-avatar";
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
