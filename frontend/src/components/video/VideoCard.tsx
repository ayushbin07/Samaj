"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Video, User } from "@/lib/types";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}:${remainingMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views: number): string {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

interface VideoCardProps {
  video: Video;
  layout?: "grid" | "horizontal";
}

export default function VideoCard({ video, layout = "grid" }: VideoCardProps) {
  const owner =
    typeof video.owner === "object"
      ? (video.owner as User)
      : {
          fullName: "Creator",
          username: "creator",
          avatar: "",
        };

  if (layout === "horizontal") {
    return (
      <div className="group flex gap-3.5 p-2 rounded-xl hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)] active:scale-[0.99] transition-all duration-200">
        {/* Thumbnail with nested radius */}
        <Link
          href={`/watch/${video._id}`}
          className="relative shrink-0 w-44 aspect-video rounded-lg overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border)] block"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
          {video.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/75 text-white/95 tracking-wider backdrop-blur-md border border-white/10">
              {formatDuration(video.duration)}
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <Link
            href={`/watch/${video._id}`}
            className="font-medium text-xs sm:text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug mb-1 -tracking-[0.01em]"
          >
            {video.title}
          </Link>
          <Link
            href={`/channel/${owner.username}`}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] truncate transition-colors"
          >
            {owner.fullName}
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)] mt-0.5">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group flex flex-col p-1.5 rounded-[1.65rem] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-hover)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-34px_rgba(43,28,14,0.72)] active:scale-[0.985]">
      {/* Thumbnail with nested radius */}
      <Link
        href={`/watch/${video._id}`}
        className="relative aspect-video w-full rounded-[1.3rem] overflow-hidden bg-[var(--color-surface-2)] block"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        {/* Play hover badge */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-11 h-11 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-foreground)] flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play size={18} className="fill-[var(--color-accent-foreground)] text-[var(--color-accent-foreground)] translate-x-0.5" />
          </div>
        </div>
        {video.duration > 0 && (
          <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-black/75 text-white/95 tracking-wider backdrop-blur-md border border-white/10">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      {/* Meta */}
      <div className="m-0.5 rounded-[1.25rem] bg-[var(--color-surface)] p-3.5 flex gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <Link
          href={`/channel/${owner.username}`}
          className="shrink-0 w-9 h-9 block rounded-full overflow-hidden mt-0.5 hover:opacity-85 active:scale-95 transition-all"
          aria-label={`Visit ${owner.fullName}'s channel`}
        >
          <UserAvatar user={owner} className="w-9 h-9 rounded-full" animate="always" />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/watch/${video._id}`}
            className="font-medium text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors line-clamp-2 leading-snug mb-1 -tracking-[0.015em]"
          >
            {video.title}
          </Link>
          <Link
            href={`/channel/${owner.username}`}
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors block truncate"
          >
            {owner.fullName}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)] mt-1">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
