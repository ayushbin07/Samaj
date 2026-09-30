/**
 * Haptic feedback utility for Samaj PWA.
 * 
 * Uses the HTML5 Vibration API (navigator.vibrate) to provide tactile
 * feedback across the application. Safe for Next.js SSR and non-supporting devices.
 */

export type HapticPreset =
  | "tap"
  | "light"
  | "medium"
  | "heavy"
  | "longPress"
  | "toggle"
  | "save"
  | "success"
  | "error"
  | "warning"
  | "selection";

export type HapticPattern = number | number[];

/**
 * Predefined vibration patterns (in milliseconds).
 * - tap: 10ms (subtle tactile feedback, preserved default as requested)
 * - medium: 22ms
 * - heavy / longPress: 45ms (distinct sustained pulse for long press)
 * - toggle: [12, 40, 12]ms (crisp double pulse for toggles, switches)
 * - save / success: [15, 50, 25]ms (confirmation pulse sequence)
 * - error / warning: [30, 45, 30]ms (distinct warning buzz)
 * - selection: 8ms (delicate tick for tabs, segments)
 */
export const HAPTIC_PATTERNS: Record<HapticPreset, HapticPattern> = {
  tap: 10,
  light: 10,
  medium: 22,
  heavy: 45,
  longPress: 45,
  toggle: [12, 40, 12],
  save: [15, 50, 25],
  success: [15, 50, 25],
  error: [30, 45, 30],
  warning: [30, 45, 30],
  selection: 8,
};

/**
 * Resolves an input argument into a valid Vibration API pattern.
 */
function resolvePattern(input?: HapticPreset | HapticPattern | unknown): HapticPattern {
  if (typeof input === "string" && input in HAPTIC_PATTERNS) {
    return HAPTIC_PATTERNS[input as HapticPreset];
  }
  if (typeof input === "number" && !isNaN(input) && input > 0) {
    return input;
  }
  if (Array.isArray(input) && input.every((n) => typeof n === "number" && !isNaN(n))) {
    return input as number[];
  }
  // Safe default: 10ms subtle tap (handles React event objects and undefined)
  return HAPTIC_PATTERNS.tap;
}

/**
 * Checks whether the browser and current platform support the HTML5 Vibration API.
 */
export function isHapticSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    typeof navigator.vibrate === "function"
  );
}

/**
 * Triggers a haptic vibration pattern.
 * 
 * @param presetOrPattern Haptic preset ("tap", "toggle", "save", "longPress", etc.),
 *                        duration in ms, or pattern array. Defaults to subtle "tap" (10ms).
 * @returns boolean indicating whether the vibration was successfully accepted by the device.
 */
export function triggerHaptic(presetOrPattern: HapticPreset | HapticPattern | unknown = "tap"): boolean {
  if (!isHapticSupported()) {
    return false;
  }

  try {
    const pattern = resolvePattern(presetOrPattern);
    return navigator.vibrate(pattern as VibratePattern);
  } catch {
    // Gracefully ignore any browser security or platform permission errors
    return false;
  }
}

/**
 * Convenient semantic helpers for common system actions.
 */
export const haptics = {
  /** Subtle 10ms tap for standard buttons and navigation clicks */
  tap: () => triggerHaptic("tap"),

  /** Noticeable 22ms tap */
  medium: () => triggerHaptic("medium"),

  /** Heavy single vibration */
  heavy: () => triggerHaptic("heavy"),

  /** Sustained 45ms buzz for long-press activations */
  longPress: () => triggerHaptic("longPress"),

  /** Crisp double-tap pattern for switches, checkboxes, and toggles */
  toggle: () => triggerHaptic("toggle"),

  /** Confirmation sequence for saving, updating, bookmarking, and liking */
  save: () => triggerHaptic("save"),

  /** Positive confirmation sequence */
  success: () => triggerHaptic("success"),

  /** Warning or error buzz */
  error: () => triggerHaptic("error"),

  /** Light tick for selection changes (tabs, sliders) */
  selection: () => triggerHaptic("selection"),

  /** Custom duration or pattern */
  custom: (pattern: HapticPattern) => triggerHaptic(pattern),
};

export default triggerHaptic;
