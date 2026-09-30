"use client";

import * as React from "react";
import { haptics } from "./haptics";

export interface LongPressOptions {
  threshold?: number;
  onStart?: (e: React.TouchEvent | React.MouseEvent) => void;
  onFinish?: (e: React.TouchEvent | React.MouseEvent) => void;
  onCancel?: (e: React.TouchEvent | React.MouseEvent) => void;
  hapticFeedback?: boolean;
}

/**
 * Hook to handle long-press gestures with tactile haptic feedback.
 */
export function useLongPress(
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  {
    threshold = 450,
    onStart,
    onFinish,
    onCancel,
    hapticFeedback = true,
  }: LongPressOptions = {}
) {
  const isLongPressActive = React.useRef(false);
  const isTriggered = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = React.useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      onStart?.(event);
      isLongPressActive.current = true;
      isTriggered.current = false;

      timerRef.current = setTimeout(() => {
        if (isLongPressActive.current) {
          isTriggered.current = true;
          if (hapticFeedback) {
            haptics.longPress();
          }
          onLongPress(event);
        }
      }, threshold);
    },
    [onLongPress, threshold, onStart, hapticFeedback]
  );

  const clear = React.useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerFinish = true) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (shouldTriggerFinish && isTriggered.current) {
        onFinish?.(event);
      } else if (!isTriggered.current && isLongPressActive.current) {
        onCancel?.(event);
      }
      isLongPressActive.current = false;
    },
    [onFinish, onCancel]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
}
