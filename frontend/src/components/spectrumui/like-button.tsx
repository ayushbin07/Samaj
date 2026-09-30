"use client"

import React, { useCallback, useRef, useState } from "react"
import {
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LikeButtonProps {
  /** Controlled liked state. Leave undefined for uncontrolled usage */
  liked?: boolean
  /** Initial liked state when uncontrolled. Default false */
  defaultLiked?: boolean
  /** Fires with the next liked state on every toggle */
  onLikedChange?: (liked: boolean) => void
  /** Like total excluding the current user; +1 is shown while liked */
  count?: number
  /** Hide the counter even when count is provided. Default true */
  showCount?: boolean
  /** Visual size of the button. Default "sm" */
  size?: "sm" | "md" | "lg"
  /** Appearance variant: "ghost" (inline icon + count, no pill/badge) or "pill". Default "ghost" */
  variant?: "ghost" | "pill"
  /** Colors cycled across the burst particles */
  particleColors?: string[]
  /** Disables pointer and keyboard interaction */
  disabled?: boolean
  /** Accessible name of the action. Default "Like" */
  label?: string
  className?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 8
const BURST_DURATION = 0.45

/** Snappy micro spring for the heart fill scaling in */
const FILL_SPRING: Transition = { type: "spring", stiffness: 500, damping: 30 }
/** Tight tween for the un-fill so the heart never overshoots past zero scale */
const UNFILL_TWEEN: Transition = { duration: 0.15, ease: "easeOut" }
/** Celebratory squash-and-stretch pop when liking */
const POP_KEYFRAMES = [1, 0.7, 1.25, 1]
const POP_TRANSITION: Transition = {
  duration: 0.4,
  times: [0, 0.25, 0.6, 1],
  ease: "easeOut",
}
/** The heart's visual mass sits below center, so pops anchor slightly low */
const HEART_ORIGIN = "50% 60%"

const DEFAULT_PARTICLE_COLORS = [
  "#f43f5e",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#38bdf8",
  "#a78bfa",
]

const SIZES = {
  sm: { button: "gap-1.5 text-xs", icon: 14 },
  md: { button: "gap-2 text-sm", icon: 16 },
  lg: { button: "gap-2.5 text-base", icon: 20 },
} as const

const HEART_PATH =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"

function formatCount(value: number) {
  return value >= 1000
    ? new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : String(value)
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LikeButton({
  liked: likedProp,
  defaultLiked = false,
  onLikedChange,
  count,
  showCount = true,
  size = "sm",
  variant = "ghost",
  particleColors = DEFAULT_PARTICLE_COLORS,
  disabled = false,
  label = "Like",
  className,
}: LikeButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const [internalLiked, setInternalLiked] = useState(defaultLiked)
  const [burst, setBurst] = useState<number | null>(null)
  const burstIdRef = useRef(0)

  const liked = likedProp ?? internalLiked
  const { button: sizeClasses, icon } = SIZES[size]
  const displayCount = count !== undefined ? count + (liked ? 1 : 0) : undefined

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const next = !liked
      if (likedProp === undefined) setInternalLiked(next)
      onLikedChange?.(next)
      if (next && !shouldReduceMotion) {
        burstIdRef.current += 1
        setBurst(burstIdRef.current)
      }
    },
    [liked, likedProp, onLikedChange, shouldReduceMotion]
  )

  const variantClasses =
    variant === "pill"
      ? cn(
          "rounded-full border px-3.5 h-9 bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]",
          liked && "border-red-500/30 bg-red-500/10 text-red-400 font-medium",
          sizeClasses
        )
      : cn(
          "bg-transparent border-0 shadow-none p-0",
          liked
            ? "text-red-500 dark:text-red-400 font-medium"
            : "text-[var(--color-text-tertiary)] hover:text-red-500 dark:hover:text-red-400 transition-colors",
          sizeClasses
        )

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={
        displayCount !== undefined && showCount
          ? `${label} (${displayCount})`
          : label
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
      className={cn(
        "group relative inline-flex touch-manipulation select-none items-center justify-center cursor-pointer transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        variantClasses,
        className
      )}
    >
      <motion.span
        className="relative flex items-center justify-center"
        style={{ transformOrigin: HEART_ORIGIN }}
        initial={false}
        animate={
          liked && !shouldReduceMotion
            ? { scale: POP_KEYFRAMES }
            : { scale: 1 }
        }
        transition={POP_TRANSITION}
      >
        <span
          className="relative inline-flex"
          style={{ width: icon, height: icon }}
        >
          <svg
            viewBox="0 0 24 24"
            width={icon}
            height={icon}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={HEART_PATH} />
          </svg>
          <motion.svg
            viewBox="0 0 24 24"
            width={icon}
            height={icon}
            className="absolute inset-0 text-red-500 dark:text-red-400"
            style={{ transformOrigin: HEART_ORIGIN }}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            initial={false}
            animate={{ scale: liked ? 1 : 0, opacity: liked ? 1 : 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : liked
                  ? FILL_SPRING
                  : UNFILL_TWEEN
            }
          >
            <path d={HEART_PATH} />
          </motion.svg>
        </span>

        {/* Burst particles */}
        {burst !== null && !shouldReduceMotion && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.span
              key={`ring-${burst}`}
              className="absolute rounded-full border-2 border-red-400/80"
              style={{ width: icon * 1.5, height: icon * 1.5 }}
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: BURST_DURATION, ease: "easeOut" }}
              onAnimationComplete={() =>
                setBurst((current) => (current === burst ? null : current))
              }
            />
            {Array.from({ length: PARTICLE_COUNT }).map((_, index) => {
              const angle = (index / PARTICLE_COUNT) * Math.PI * 2 - Math.PI / 2
              const distance = icon * (index % 2 === 0 ? 1.7 : 1.3)
              const dotSize = Math.max(3, Math.round(icon * 0.24))
              return (
                <motion.span
                  key={`particle-${burst}-${index}`}
                  className="absolute rounded-full"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    backgroundColor:
                      particleColors[index % particleColors.length],
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: [0, 1, 0.4],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: BURST_DURATION, ease: "easeOut" }}
                />
              )
            })}
          </span>
        )}
      </motion.span>

      {/* Static count (no roll animation for instant responsiveness) */}
      {displayCount !== undefined && showCount && (
        <span className="tabular-nums font-normal" aria-hidden="true">
          {formatCount(displayCount)}
        </span>
      )}
    </motion.button>
  )
}
