"use client";

import * as React from "react";
import { Blobatar as BlobatarRenderer } from "@blobatar/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User, BlobatarConfig } from "@/lib/types";
import { cn } from "@/lib/utils";
import "blobatar/motion.css";
import {
  idle,
  happy,
  sad,
  mad,
  surprised,
  wink,
  sleepy,
  smug,
  unsure,
  scared,
  love,
  shy,
  sick,
  thinking,
} from "blobatar/expression";

export const BLOBATAR_EXPRESSIONS = {
  idle,
  happy,
  sad,
  mad,
  surprised,
  wink,
  sleepy,
  smug,
  unsure,
  scared,
  love,
  shy,
  sick,
  thinking,
} as const;

export type ExpressionKey = keyof typeof BLOBATAR_EXPRESSIONS;

export interface UserAvatarProps extends React.ComponentProps<typeof Avatar> {
  user?:
    | Partial<User>
    | {
        _id?: string;
        id?: string;
        avatar?: string;
        avatarType?: "blobatar" | "upload";
        blobatar?: BlobatarConfig;
        fullName?: string;
        username?: string;
      }
    | null;
  /** Explicit fallback name if user._id is not available */
  fallbackName?: string;
  /** Whether to animate the blobatar ("always" | "hover" | false) */
  animate?: "always" | "hover" | false;
  /** Optional overrides for blobatar options (useful for live settings preview) */
  blobatarOverrides?: BlobatarConfig;
  /** Additional class names for inner blobatar */
  blobatarClassName?: string;
  /** Alt text for screen readers */
  alt?: string;
}

// Helper function to check if user has a real, valid uploaded avatar image.
// Discards empty strings, whitespace, and any legacy DiceBear / robot placeholder URLs.
export const isValidUploadedAvatar = (avatar?: string | null): boolean => {
  if (!avatar || typeof avatar !== "string") return false;
  const trimmed = avatar.trim();
  if (!trimmed) return false;
  if (trimmed.includes("dicebear") || trimmed.includes("api.dicebear")) return false;
  return true;
};

export function UserAvatar({
  user,
  fallbackName,
  animate = "always",
  blobatarOverrides,
  blobatarClassName,
  alt,
  className,
  ...props
}: UserAvatarProps) {
  // Derive stable Blobatar identity from user._id. Never use email.
  const identity = (
    user?._id ??
    (user as any)?.id ??
    fallbackName ??
    "user"
  ).toString();

  // If there is no real uploaded avatar image, Blobatar is ALWAYS used by default.
  // "upload" mode is only active when the user explicitly has avatarType === "upload" AND has a valid uploaded image URL.
  const hasValidUpload = isValidUploadedAvatar(user?.avatar);
  const effectiveAvatarType: "blobatar" | "upload" =
    user?.avatarType === "upload" && hasValidUpload ? "upload" : "blobatar";

  // Merge saved blobatar config with any interactive/local overrides
  const mergedBlobatar: BlobatarConfig = {
    ...(user?.blobatar || {}),
    ...(blobatarOverrides || {}),
  };

  const expressionObj = mergedBlobatar.expression
    ? BLOBATAR_EXPRESSIONS[mergedBlobatar.expression as ExpressionKey] || idle
    : undefined;

  const altText = alt || user?.fullName || user?.username || "User avatar";

  const renderBlobatar = () => (
    <BlobatarRenderer
      name={identity}
      hue={mergedBlobatar.hue}
      tone={mergedBlobatar.tone}
      traits={mergedBlobatar.traits as any}
      palette={mergedBlobatar.palette as any}
      expression={expressionObj}
      animate={animate ? animate : undefined}
      className={cn("size-full select-none", blobatarClassName)}
    />
  );

  // If user has chosen uploaded photo and a valid avatar URL exists
  if (effectiveAvatarType === "upload" && user?.avatar && hasValidUpload) {
    return (
      <Avatar className={className} {...props}>
        <AvatarImage
          src={user.avatar}
          alt={altText}
          className="aspect-square size-full rounded-full object-cover"
        />
        {/* Safe fallback if image fails to load: deterministic Blobatar from _id */}
        <AvatarFallback className="bg-transparent size-full flex items-center justify-center overflow-hidden rounded-full">
          {renderBlobatar()}
        </AvatarFallback>
      </Avatar>
    );
  }

  // Active avatar is Blobatar (default for all users without valid uploaded photo, or when blobatar is selected)
  return (
    <Avatar className={className} {...props}>
      <div className="size-full flex items-center justify-center overflow-hidden rounded-full">
        {renderBlobatar()}
      </div>
    </Avatar>
  );
}
