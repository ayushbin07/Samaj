"use client";

import type * as React from "react";
import { UserAvatar, type UserAvatarProps, isValidUploadedAvatar } from "@/components/ui/user-avatar";

export type BlobatarProps = UserAvatarProps & {
  name?: string;
  src?: string;
  alt?: string;
  blobatar?: any;
};

export function Blobatar({ name, src, alt, blobatar, user, ...props }: BlobatarProps) {
  if (user) {
    return (
      <UserAvatar
        user={user}
        alt={alt}
        animate={blobatar?.animate ?? props.animate ?? "always"}
        blobatarOverrides={blobatar?.traits || blobatar?.hue || blobatar?.tone || blobatar?.palette || blobatar?.expression ? blobatar : undefined}
        {...props}
      />
    );
  }

  const hasValidSrc = isValidUploadedAvatar(src);
  const simulatedUser = {
    _id: name || "user",
    avatar: hasValidSrc ? src : undefined,
    avatarType: hasValidSrc ? ("upload" as const) : ("blobatar" as const),
    blobatar:
      blobatar?.traits || blobatar?.hue || blobatar?.tone || blobatar?.palette || blobatar?.expression
        ? blobatar
        : undefined,
  };

  return (
    <UserAvatar
      user={simulatedUser}
      fallbackName={name}
      alt={alt || name}
      animate={blobatar?.animate ?? props.animate ?? "always"}
      blobatarOverrides={blobatar}
      {...props}
    />
  );
}
